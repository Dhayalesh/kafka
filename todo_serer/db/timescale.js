const { Pool } = require('pg');

// TimescaleDB connection pool
const pool = new Pool({
  host: process.env.TIMESCALE_HOST,
  port: process.env.TIMESCALE_PORT,
  database: process.env.TIMESCALE_DATABASE,
  user: process.env.TIMESCALE_USER,
  password: process.env.TIMESCALE_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize TimescaleDB tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create the event logs table with task references
    await client.query(`
      CREATE TABLE IF NOT EXISTS todo_event_logs (
        id SERIAL,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        event_type VARCHAR(50) NOT NULL,
        entity VARCHAR(50) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,

        -- Task relationship fields
        task_id VARCHAR(100),
        task_name VARCHAR(255),

        -- Event details
        changes TEXT,
        user_name VARCHAR(100),
        workspace VARCHAR(100),
        event_data JSONB,

        PRIMARY KEY (timestamp, id)
      );
    `);

    // Convert to hypertable (TimescaleDB specific)
    await client.query(`
      SELECT create_hypertable('todo_event_logs', 'timestamp',
        if_not_exists => TRUE,
        chunk_time_interval => INTERVAL '1 day'
      );
    `);

    // Create indexes for efficient querying
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_event_type ON todo_event_logs (event_type, timestamp DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_task_id ON todo_event_logs (task_id, timestamp DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_entity ON todo_event_logs (entity, entity_id, timestamp DESC);
    `);

    console.log('✓ TimescaleDB tables initialized with task relationships');
  } catch (error) {
    console.error('TimescaleDB initialization error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Insert event log with task relationship
async function insertEventLog(eventData) {
  const {
    eventType,
    entity,
    entityId,
    taskId,
    taskName,
    changes,
    user,
    workspace
  } = eventData;

  const query = `
    INSERT INTO todo_event_logs (
      event_type, entity, entity_id,
      task_id, task_name,
      changes, user_name, workspace, event_data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;

  const values = [
    eventType,
    entity,
    entityId,
    taskId || null,
    taskName || null,
    changes,
    user || 'system',
    workspace || 'default',
    JSON.stringify(eventData)
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting event log:', error.message);
    throw error;
  }
}

// Get all logs for a specific task
async function getTaskLogs(taskId, limit = 100) {
  const query = `
    SELECT
      id, timestamp, event_type, entity, entity_id,
      task_id, task_name,
      changes, user_name, workspace
    FROM todo_event_logs
    WHERE task_id = $1
    ORDER BY timestamp DESC
    LIMIT $2;
  `;

  try {
    const result = await pool.query(query, [taskId, limit]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching task logs:', error.message);
    throw error;
  }
}

// Get all tasks with their log counts
async function getTasksSummary() {
  const query = `
    SELECT
      task_id,
      task_name,
      COUNT(*) as log_count,
      MAX(timestamp) as last_activity
    FROM todo_event_logs
    WHERE task_id IS NOT NULL
    GROUP BY task_id, task_name
    ORDER BY last_activity DESC;
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error fetching tasks summary:', error.message);
    throw error;
  }
}

module.exports = {
  Pool: pool,
  initializeDatabase,
  insertEventLog,
  getTaskLogs,
  getTasksSummary
};
