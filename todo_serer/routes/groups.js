const express = require('express');
const Group = require('../models/Group');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const kafkaProducer = require('../kafka/producer');
const { createAndSendSnapshot } = require('../services/snapshotCreator');
const router = express.Router();

// GET /groups - Get all groups with task counts
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('tasks');
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// POST /groups - Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, discussion, user, workspace } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Group name is required', details: { field: 'name', value: name || '' } }
      });
    }
    const group = new Group({ name, discussion });
    await group.save();

    res.json({ success: true, data: group });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      kafkaProducer.publishEvent('GROUP_CREATED', {
        entity: 'Group',
        entityId: group._id.toString(),
        groupName: name,
        changes: `Group "${name}" created with discussion: "${discussion || 'empty'}"`,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      // Create and send snapshot directly
      createAndSendSnapshot('GROUP_CREATED', user || 'system');
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

// GET /groups/:groupId - Get a specific group with all its tasks
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate({
      path: 'tasks',
      populate: { path: 'comments' }
    });
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Group not found', details: { groupId: req.params.groupId } }
      });
    }
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// PUT /groups/:groupId - Update group name and description
router.put('/:groupId', async (req, res) => {
  try {
    const { name, discussion, user, workspace } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Group name is required', details: { field: 'name', value: name || '' } }
      });
    }

    const oldGroup = await Group.findById(req.params.groupId);
    const group = await Group.findByIdAndUpdate(
      req.params.groupId,
      { name, discussion },
      { new: true }
    ).populate('tasks');

    if (!group) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Group not found', details: { groupId: req.params.groupId } }
      });
    }

    res.json({ success: true, data: group });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      const changes = [];
      if (oldGroup.name !== name) {
        changes.push(`Group name changed from "${oldGroup.name}" to "${name}"`);
      }
      if (oldGroup.discussion !== discussion) {
        changes.push(`Group discussion changed from "${oldGroup.discussion || 'empty'}" to "${discussion || 'empty'}"`);
      }

      kafkaProducer.publishEvent('GROUP_UPDATED', {
        entity: 'Group',
        entityId: group._id.toString(),
        groupName: name,
        changes: changes.join(', '),
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('GROUP_UPDATED', user || 'system');
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// DELETE /groups/:groupId - Delete a group and all its tasks
router.delete('/:groupId', async (req, res) => {
  try {
    const { user, workspace } = req.body;
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Group not found', details: { groupId: req.params.groupId } }
      });
    }

    // Delete all comments for tasks in this group
    await Comment.deleteMany({ taskId: { $in: group.tasks } });
    // Delete all tasks in this group
    await Task.deleteMany({ groupId: req.params.groupId });
    // Delete the group
    await Group.findByIdAndDelete(req.params.groupId);

    res.json({ success: true, message: 'Group deleted successfully' });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      kafkaProducer.publishEvent('GROUP_DELETED', {
        entity: 'Group',
        entityId: req.params.groupId,
        groupName: group.name,
        changes: `Group "${group.name}" was deleted`,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('GROUP_DELETED', user || 'system');
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// POST /groups/:groupId/tasks - Create a new task in a group
router.post('/:groupId/tasks', async (req, res) => {
  try {
    const { name, description, startDate, endDate, user, workspace } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Task name is required', details: { field: 'name', value: name || '' } }
      });
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Group not found', details: { groupId: req.params.groupId } }
      });
    }

    const task = new Task({
      groupId: req.params.groupId,
      name,
      description,
      startDate,
      endDate
    });
    await task.save();

    group.tasks.push(task._id);
    await group.save();

    res.json({ success: true, data: task });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      const details = [];
      if (description) details.push(`description: "${description}"`);
      if (startDate) details.push(`start date: "${startDate}"`);
      if (endDate) details.push(`end date: "${endDate}"`);

      kafkaProducer.publishEvent('TASK_CREATED', {
        entity: 'Task',
        entityId: task._id.toString(),
        groupId: req.params.groupId,
        groupName: group.name,
        taskName: name,
        changes: `Task "${name}" created in group "${group.name}" with status "New"${details.length > 0 ? ', ' + details.join(', ') : ''}`,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('TASK_CREATED', user || 'system');
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

module.exports = router;