const express = require('express');
const db = require('../db/timescale');
const router = express.Router();

// GET /logs - Get all tasks with their log counts and last activity
router.get('/', async (req, res) => {
  try {
    const tasks = await db.getTasksSummary();

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
