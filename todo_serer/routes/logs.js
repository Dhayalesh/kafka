const express = require('express');
const db = require('../db/timescale');
const router = express.Router();

// GET /logs/groups - Get all groups with their log counts and last activity
router.get('/groups', async (req, res) => {
  try {
    const groups = await db.getGroupsSummary();

    res.json({
      success: true,
      data: groups.map(group => ({
        groupId: group.group_id,
        groupName: group.group_name,
        logCount: parseInt(group.log_count),
        lastActivity: group.last_activity
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /logs/group/:groupId - Get all logs for a specific group (including all tasks under that group)
router.get('/group/:groupId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await db.getGroupLogs(req.params.groupId, limit);

    res.json({
      success: true,
      data: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        eventType: log.event_type,
        entity: log.entity,
        entityId: log.entity_id,
        groupId: log.group_id,
        groupName: log.group_name,
        taskId: log.task_id,
        taskName: log.task_name,
        changes: log.changes,
        user: log.user_name,
        workspace: log.workspace
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /logs/group/:groupId/tasks - Get summary of all tasks under a group with their log counts
router.get('/group/:groupId/tasks', async (req, res) => {
  try {
    const tasks = await db.getGroupTasksSummary(req.params.groupId);

    res.json({
      success: true,
      data: tasks.map(task => ({
        taskId: task.task_id,
        taskName: task.task_name,
        logCount: parseInt(task.log_count),
        lastActivity: task.last_activity
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

// GET /logs/task/:taskId - Get all logs for a specific task
router.get('/task/:taskId', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await db.getTaskLogs(req.params.taskId, limit);

    res.json({
      success: true,
      data: logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        eventType: log.event_type,
        entity: log.entity,
        entityId: log.entity_id,
        groupId: log.group_id,
        groupName: log.group_name,
        taskId: log.task_id,
        taskName: log.task_name,
        changes: log.changes,
        user: log.user_name,
        workspace: log.workspace
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
});

module.exports = router;