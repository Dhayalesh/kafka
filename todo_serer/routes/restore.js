const express = require('express');
const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');
const kafkaProducer = require('../kafka/producer');
const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// GET /restore/snapshots - List all snapshots from S3
router.get('/snapshots', async (req, res) => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    const s3Objects = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: 'snapshots/'
    }).promise();

    const snapshots = [];
    for (const obj of s3Objects.Contents || []) {
      if (obj.Key.endsWith('.json')) {
        const snapshotId = obj.Key.replace('snapshots/', '').replace('.json', '');
        snapshots.push({
          snapshotId,
          createdAt: obj.LastModified,
          fileSizeKB: Math.round(obj.Size / 1024),
          s3Key: obj.Key
        });
      }
    }

    snapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, snapshots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /restore/:snapshotId - Restore database to specific snapshot
router.post('/:snapshotId', async (req, res) => {
  try {
    const { snapshotId } = req.params;
    const { user = 'Admin' } = req.body;
    const bucketName = process.env.S3_BUCKET_NAME;
    const s3Key = `snapshots/${snapshotId}.json`;
    
    console.log(`Attempting to restore snapshot: ${snapshotId}`);
    console.log(`S3 Key: ${s3Key}`);
    console.log(`Bucket: ${bucketName}`);

    // Download snapshot from S3
    const s3Object = await s3.getObject({
      Bucket: bucketName,
      Key: s3Key
    }).promise();
    
    console.log(`Successfully downloaded snapshot from S3`);

    const snapshotData = JSON.parse(s3Object.Body.toString());
    console.log(`Restoring snapshot: ${snapshotId}`);
    console.log(`Snapshot from S3: ${snapshotData.snapshotId}`);
    
    // Verify we got the correct snapshot
    if (snapshotData.snapshotId !== snapshotId) {
      throw new Error(`Snapshot ID mismatch: requested ${snapshotId}, got ${snapshotData.snapshotId}`);
    }
    
    console.log('Snapshot data structure:', Object.keys(snapshotData));
    console.log('Data section:', Object.keys(snapshotData.data || {}));
    
    const { tasks, comments, users } = snapshotData.data || {};

    console.log('Arrays found:', {
      tasks: Array.isArray(tasks) ? tasks.length : 'not array',
      comments: Array.isArray(comments) ? comments.length : 'not array',
      users: Array.isArray(users) ? users.length : 'not array'
    });

    // Complete database replacement - clear everything first
    console.log('Completely clearing database...');
    await Task.collection.drop().catch(() => {});
    await Comment.collection.drop().catch(() => {});
    await User.collection.drop().catch(() => {});

    console.log('Inserting snapshot data...');
    // Insert snapshot data directly without triggering middleware
    if (Array.isArray(tasks)) {
      if (tasks.length > 0) await Task.collection.insertMany(tasks);
      console.log(`Inserted ${tasks.length} tasks`);
    }
    if (Array.isArray(comments)) {
      if (comments.length > 0) await Comment.collection.insertMany(comments);
      console.log(`Inserted ${comments.length} comments`);
    }
    if (Array.isArray(users)) {
      if (users.length > 0) await User.collection.insertMany(users);
      console.log(`Inserted ${users.length} users`);
    }
    console.log('Database completely replaced with snapshot data');

    res.json({
      success: true,
      message: 'Database restored successfully',
      snapshotId,
      restoredCounts: {
        tasks: Array.isArray(tasks) ? tasks.length : 0,
        comments: Array.isArray(comments) ? comments.length : 0,
        users: Array.isArray(users) ? users.length : 0
      }
    });

    // Note: No logging for restore operations to avoid interfering with snapshot data

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = router;