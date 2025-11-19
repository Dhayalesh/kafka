const express = require('express');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const kafkaProducer = require('../kafka/producer');
const { createAndSendSnapshot } = require('../services/snapshotCreator');
const router = express.Router();

// GET /tasks - Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().populate('comments');
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// POST /tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { name, description, startDate, endDate, user, workspace } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Task name is required', details: { field: 'name', value: name || '' } }
      });
    }

    const task = new Task({
      name,
      description,
      startDate,
      endDate
    });
    await task.save();

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
        taskName: name,
        changes: `Task "${name}" created with status "New"${details.length > 0 ? ', ' + details.join(', ') : ''}`,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('TASK_CREATED', user || 'system');
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

// GET /tasks/:taskId - Get a specific task with all its comments
router.get('/:taskId', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId }).populate('comments');
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found', details: { taskId: req.params.taskId } }
      });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// PUT /tasks/:taskId - Update task name, description, and dates
router.put('/:taskId', async (req, res) => {
  try {
    const { name, description, startDate, endDate, user, workspace } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Task name is required', details: { field: 'name', value: name || '' } }
      });
    }

    const oldTask = await Task.findOne({ _id: req.params.taskId });
    if (!oldTask) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found', details: { taskId: req.params.taskId } }
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId },
      { name, description, startDate, endDate },
      { new: true, runValidators: true }
    ).populate('comments');

    if (!task) {
      return res.status(500).json({
        success: false,
        error: { code: 'UPDATE_FAILED', message: 'Failed to update task', details: { taskId: req.params.taskId } }
      });
    }

    res.json({ success: true, data: task });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      const changes = [];
      if (oldTask.name !== name) {
        changes.push(`Task name changed from "${oldTask.name}" to "${name}"`);
      }
      if (oldTask.description !== description) {
        changes.push(`Task description changed from "${oldTask.description || 'empty'}" to "${description || 'empty'}"`);
      }
      if (oldTask.startDate !== startDate) {
        changes.push(`Start date changed from "${oldTask.startDate || 'empty'}" to "${startDate || 'empty'}"`);
      }
      if (oldTask.endDate !== endDate) {
        changes.push(`End date changed from "${oldTask.endDate || 'empty'}" to "${endDate || 'empty'}"`);
      }

      kafkaProducer.publishEvent('TASK_UPDATED', {
        entity: 'Task',
        entityId: task._id.toString(),
        taskName: name,
        changes: changes.join(', '),
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('TASK_UPDATED', user || 'system');
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// PUT /tasks/:taskId/status - Update task status
router.put('/:taskId/status', async (req, res) => {
  try {
    const { status, user, workspace } = req.body;
    const validStatuses = ['New', 'Backlog', 'In Progress', 'Completed', 'Approved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid status value', details: { field: 'status', value: status } }
      });
    }

    const oldTask = await Task.findOne({ _id: req.params.taskId });

    // Auto-set progress based on status
    let progress = oldTask.progress || 0;
    if (status === 'New' || status === 'Backlog') {
      progress = 0;
    } else if (status === 'Completed' || status === 'Approved') {
      progress = 100;
    }
    // For 'In Progress', keep current progress or set to previous value

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId },
      { status, progress },
      { new: true }
    ).populate('comments');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found', details: { taskId: req.params.taskId } }
      });
    }

    res.json({ success: true, data: task });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      const changes = `Task status changed from "${oldTask.status}" to "${status}"${oldTask.progress !== progress ? `, progress updated to ${progress}%` : ''}`;
      kafkaProducer.publishEvent('STATUS_CHANGED', {
        entity: 'Task',
        entityId: task._id.toString(),
        taskName: task.name,
        changes,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('STATUS_CHANGED', user || 'system');
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// PUT /tasks/:taskId/progress - Update task progress (for In Progress tasks)
router.put('/:taskId/progress', async (req, res) => {
  try {
    const { progress, user, workspace } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Progress must be a number between 0 and 100', details: { field: 'progress', value: progress } }
      });
    }

    const oldTask = await Task.findOne({ _id: req.params.taskId });
    if (!oldTask) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found', details: { taskId: req.params.taskId } }
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId },
      { progress },
      { new: true }
    ).populate('comments');

    res.json({ success: true, data: task });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      kafkaProducer.publishEvent('PROGRESS_UPDATED', {
        entity: 'Task',
        entityId: task._id.toString(),
        taskName: task.name,
        changes: `Task progress updated from ${oldTask.progress}% to ${progress}%`,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('PROGRESS_UPDATED', user || 'system');
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// DELETE /tasks/:taskId - Delete a task and all its comments
router.delete('/:taskId', async (req, res) => {
  try {
    const { user, workspace } = req.body;
    const task = await Task.findOne({ _id: req.params.taskId });
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found', details: { taskId: req.params.taskId } }
      });
    }

    // Delete all comments for this task
    await Comment.deleteMany({ taskId: req.params.taskId });
    // Delete the task
    await Task.findOneAndDelete({ _id: req.params.taskId });

    res.json({ success: true, message: 'Task deleted successfully' });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      kafkaProducer.publishEvent('TASK_DELETED', {
        entity: 'Task',
        entityId: req.params.taskId,
        taskName: task.name,
        changes: `Task "${task.name}" with status "${task.status}" was deleted`,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('TASK_DELETED', user || 'system');
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

// POST /tasks/:taskId/comments - Add a comment to a task
router.post('/:taskId/comments', async (req, res) => {
  try {
    const { text, user, workspace } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Comment text is required', details: { field: 'text', value: text || '' } }
      });
    }

    const task = await Task.findOne({ _id: req.params.taskId });
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found', details: { taskId: req.params.taskId } }
      });
    }

    const comment = new Comment({ taskId: req.params.taskId, text });
    await comment.save();

    task.comments.push(comment._id);
    await task.save();

    res.json({ success: true, data: comment });

    // Publish events to Kafka after successful response
    setImmediate(() => {
      kafkaProducer.publishEvent('COMMENT_ADDED', {
        entity: 'Comment',
        entityId: comment._id.toString(),
        taskId: task._id.toString(),
        taskName: task.name,
        changes: `Comment added to task "${task.name}": "${text}"`,
        user: user || 'system',
        workspace: workspace || 'default'
      });
      createAndSendSnapshot('COMMENT_ADDED', user || 'system');
    });
  } catch (error) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message } });
  }
});

// GET /tasks/:taskId/comments - Get all comments for a task
router.get('/:taskId/comments', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId });
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found', details: { taskId: req.params.taskId } }
      });
    }

    const comments = await Comment.find({ taskId: req.params.taskId });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;
