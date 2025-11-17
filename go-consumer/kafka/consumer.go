package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"todo-consumer/db"

	"github.com/segmentio/kafka-go"
)

// Event matches the structure produced by Express (Producer)
type Event struct {
	EventType string  `json:"eventType"`
	Payload   Payload `json:"payload"`
	Timestamp string  `json:"timestamp"`
}

type Payload struct {
	Entity    string `json:"entity"`
	EntityId  string `json:"entityId"`
	GroupId   string `json:"groupId,omitempty"`
	GroupName string `json:"groupName,omitempty"`
	TaskId    string `json:"taskId,omitempty"`
	TaskName  string `json:"taskName,omitempty"`
	Changes   string `json:"changes"`
	User      string `json:"user"`
	Workspace string `json:"workspace"`
	Timestamp string `json:"timestamp"`
}

func StartConsumer() {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9092"},
		Topic:   "todo-history-events",
		GroupID: "todo-consumer-group-go",
	})

	fmt.Println("🚀 Go Kafka Consumer started on topic: todo-history-events")

	for {
		m, err := reader.ReadMessage(context.Background())
		if err != nil {
			fmt.Printf("❌ Read error: %v\n", err)
			time.Sleep(2 * time.Second)
			continue
		}

		var e Event
		if err := json.Unmarshal(m.Value, &e); err != nil {
			fmt.Printf("⚠️  JSON parse error: %v\n", err)
			continue
		}

		// Parse ISO timestamp or fallback to now
		ts, err := time.Parse(time.RFC3339, e.Timestamp)
		if err != nil {
			ts = time.Now().UTC()
		}

		// Extract group and task IDs from the payload (now properly sent by Node.js)
		groupId := e.Payload.GroupId
		groupName := e.Payload.GroupName
		taskId := e.Payload.TaskId
		taskName := e.Payload.TaskName

		// For Group entities, the groupId is the entityId itself
		if e.Payload.Entity == "Group" {
			groupId = e.Payload.EntityId
		}

		// For Task entities, taskId is the entityId
		if e.Payload.Entity == "Task" {
			taskId = e.Payload.EntityId
		}

		// Handle snapshot triggers
		if e.EventType == "SNAPSHOT_TRIGGER" {
			if err := handleSnapshotTrigger(e.Payload, ts); err != nil {
				fmt.Printf("❌ Snapshot error: %v\n", err)
			}
			continue
		}

		// Save to Timescale with proper group and task references
		if err := db.InsertLog(
			e.EventType,
			e.Payload.Entity,
			e.Payload.EntityId,
			groupId,
			groupName,
			taskId,
			taskName,
			e.Payload.Changes,
			e.Payload.User,
			e.Payload.Workspace,
			ts,
		); err != nil {
			fmt.Printf("❌ DB insert error: %v\n", err)
			continue
		}

		// Display formatted message
		var displayMsg string
		if e.Payload.Changes != "" {
			displayMsg = e.Payload.Changes
		} else {
			displayMsg = fmt.Sprintf("%s operation on %s", e.EventType, e.Payload.Entity)
		}

		fmt.Printf("📝 [%s] %s - %s (Group: %s, Task: %s)\n",
			e.EventType,
			ts.Format("15:04:05"),
			displayMsg,
			groupName,
			taskName,
		)
	}
}
