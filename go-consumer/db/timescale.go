package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

// Init connects to TimescaleDB and ensures the table/hypertable exist.
func Init(uri string) error {
	var err error
	Pool, err = pgxpool.New(context.Background(), uri)
	if err != nil {
		return fmt.Errorf("TimescaleDB connection error: %w", err)
	}
	fmt.Println("✅ Connected to TimescaleDB")

	if err := ensureSchema(); err != nil {
		return fmt.Errorf("failed to ensure schema: %w", err)
	}
	return nil
}

// ensureSchema creates the table + hypertable if not already present.
func ensureSchema() error {
	schema := `
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

SELECT create_hypertable('todo_event_logs', 'timestamp',
  if_not_exists => TRUE,
  chunk_time_interval => INTERVAL '1 day'
);

CREATE INDEX IF NOT EXISTS idx_event_type ON todo_event_logs (event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_task_id ON todo_event_logs (task_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_entity ON todo_event_logs (entity, entity_id, timestamp DESC);
`
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Pool.Exec(ctx, schema)
	if err != nil {
		return fmt.Errorf("schema creation error: %w", err)
	}

	fmt.Println("🧩 TimescaleDB schema verified (todo_event_logs with task relationships ready)")
	return nil
}

// InsertLog inserts a log record into the hypertable with full event details
func InsertLog(eventType, entity, entityId, taskId, taskName, changes, user, workspace string, timestamp time.Time) error {
	query := `
		INSERT INTO todo_event_logs (
			event_type, entity, entity_id,
			task_id, task_name,
			changes, user_name, workspace, timestamp
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := Pool.Exec(
		context.Background(),
		query,
		eventType, entity, entityId,
		taskId, taskName,
		changes, user, workspace, timestamp.UTC(),
	)
	return err
}

// GetTaskLogs retrieves logs for a specific task
func GetTaskLogs(taskId string) ([]map[string]interface{}, error) {
	if Pool == nil {
		return []map[string]interface{}{}, fmt.Errorf("database not connected")
	}

	query := `
		SELECT
			id, timestamp, event_type, entity, entity_id,
			task_id, task_name,
			changes, user_name, workspace
		FROM todo_event_logs
		WHERE task_id = $1
		ORDER BY timestamp DESC
		LIMIT 100
	`

	rows, err := Pool.Query(context.Background(), query, taskId)
	if err != nil {
		return []map[string]interface{}{}, err
	}
	defer rows.Close()

	var logs []map[string]interface{}
	for rows.Next() {
		var (
			id                                  int
			timestamp                           time.Time
			eventType, entity, entityId         string
			taskId, taskName                    *string
			changes, userName, workspace        *string
		)

		if err := rows.Scan(
			&id, &timestamp, &eventType, &entity, &entityId,
			&taskId, &taskName,
			&changes, &userName, &workspace,
		); err != nil {
			continue
		}

		log := map[string]interface{}{
			"id":        id,
			"timestamp": timestamp,
			"eventType": eventType,
			"entity":    entity,
			"entityId":  entityId,
		}

		if taskId != nil {
			log["taskId"] = *taskId
		}
		if taskName != nil {
			log["taskName"] = *taskName
		}
		if changes != nil {
			log["changes"] = *changes
		}
		if userName != nil {
			log["user"] = *userName
		}
		if workspace != nil {
			log["workspace"] = *workspace
		}

		logs = append(logs, log)
	}
	return logs, nil
}

// GetTasksSummary retrieves all tasks with their log counts and last activity
func GetTasksSummary() ([]map[string]interface{}, error) {
	if Pool == nil {
		return []map[string]interface{}{}, fmt.Errorf("database not connected")
	}

	query := `
		SELECT
			task_id,
			task_name,
			COUNT(*) as log_count,
			MAX(timestamp) as last_activity
		FROM todo_event_logs
		WHERE task_id IS NOT NULL
		GROUP BY task_id, task_name
		ORDER BY last_activity DESC
	`

	rows, err := Pool.Query(context.Background(), query)
	if err != nil {
		return []map[string]interface{}{}, err
	}
	defer rows.Close()

	var summary []map[string]interface{}
	for rows.Next() {
		var taskId, taskName string
		var logCount int
		var lastActivity time.Time

		if err := rows.Scan(&taskId, &taskName, &logCount, &lastActivity); err != nil {
			continue
		}

		summary = append(summary, map[string]interface{}{
			"taskId":       taskId,
			"taskName":     taskName,
			"logCount":     logCount,
			"lastActivity": lastActivity,
		})
	}
	return summary, nil
}
