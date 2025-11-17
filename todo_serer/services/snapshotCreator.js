const Group = require('../models/Group');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');
const kafkaProducer = require('../kafka/producer');

async function createAndSendSnapshot(triggerReason, user) {
  try {
    const now = new Date();
    const snapshotId = `snapshot_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}_${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}_${String(now.getMinutes()).padStart(2, '0')}_${String(now.getSeconds()).padStart(2, '0')}`;

    // Read all collections
    const [groups, tasks, comments, users] = await Promise.all([
      Group.find({}).lean(),
      Task.find({}).lean(),
      Comment.find({}).lean(),
      User.find({}).lean()
    ]);

    // Create snapshot object
    const snapshot = {
      snapshotId,
      createdAt: now.toISOString(),
      createdBy: user,
      data: {
        groups: groups || [],
        tasks: tasks || [],
        comments: comments || [],
        users: users || []
      },
      metadata: {
        counts: {
          groups: groups.length,
          tasks: tasks.length,
          comments: comments.length,
          users: users.length
        }
      }
    };

    // Send snapshot to Kafka topic
    await kafkaProducer.publishSnapshotToKafka(snapshotId, JSON.stringify(snapshot, null, 2));
    
    console.log(`📸 Snapshot created and sent to Kafka: ${snapshotId}`);
  } catch (error) {
    console.error('Error creating snapshot:', error);
  }
}

module.exports = { createAndSendSnapshot };