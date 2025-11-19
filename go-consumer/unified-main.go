package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"
	"todo-consumer/db"
	"todo-consumer/snapshot"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/joho/godotenv"
	"github.com/segmentio/kafka-go"
)

func main() {
	if err := godotenv.Load(".env"); err != nil {
		fmt.Println("⚠️ No .env file found, using system environment variables")
	}

	fmt.Println("🚀 Starting Unified Todo Consumer Service")
	fmt.Println("📋 Role: Events → TimescaleDB + Snapshots → S3")

	timescaleURI := "postgres://postgres:postgres@localhost:5432/todo_history"
	if err := db.Init(timescaleURI); err != nil {
		fmt.Println("❌ Failed to connect to TimescaleDB:", err)
		os.Exit(1)
	}

	// Start main consumer in goroutine
	go startMainConsumer()

	// Start snapshot processor in goroutine
	go startSnapshotProcessor()

	// Keep main thread alive
	select {}
}

func startMainConsumer() {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9092"},
		Topic:   "todo-history-events",
		GroupID: "todo-consumer-group-go",
	})

	fmt.Println("🚀 Main Consumer started on topic: todo-history-events")

	for {
		m, err := reader.ReadMessage(context.Background())
		if err != nil {
			fmt.Printf("❌ Read error: %v\n", err)
			time.Sleep(2 * time.Second)
			continue
		}

		var e Event
		if err := json.Unmarshal(m.Value, &e); err != nil {
			fmt.Printf("⚠️ JSON parse error: %v\n", err)
			continue
		}

		ts, err := time.Parse(time.RFC3339, e.Timestamp)
		if err != nil {
			ts = time.Now().UTC()
		}

		if e.EventType == "SNAPSHOT_TRIGGER" {
			fmt.Printf("📸 Snapshot trigger received: %s by %s\n", e.Payload.Changes, e.Payload.User)
			// Snapshot creation should be handled by Express.js, not Go consumer
			continue
		}

		taskId := e.Payload.TaskId
		taskName := e.Payload.TaskName

		if e.Payload.Entity == "Task" {
			taskId = e.Payload.EntityId
		}

		if err := db.InsertLog(
			e.EventType,
			e.Payload.Entity,
			e.Payload.EntityId,
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

		var displayMsg string
		if e.Payload.Changes != "" {
			displayMsg = e.Payload.Changes
		} else {
			displayMsg = fmt.Sprintf("%s operation on %s", e.EventType, e.Payload.Entity)
		}

		fmt.Printf("📝 [%s] %s - %s (Task: %s)\n",
			e.EventType,
			ts.Format("15:04:05"),
			displayMsg,
			taskName,
		)
	}
}

func startSnapshotProcessor() {
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: []string{"localhost:9092"},
		Topic:   "todo-snapshots",
		GroupID: "snapshot-processor-group",
	})

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_REGION")),
	})
	if err != nil {
		fmt.Printf("❌ AWS session error: %v\n", err)
		return
	}

	svc := s3.New(sess)
	bucketName := os.Getenv("S3_BUCKET_NAME")

	fmt.Printf("📦 Snapshot Processor started on topic: todo-snapshots\n")

	for {
		m, err := reader.ReadMessage(context.Background())
		if err != nil {
			fmt.Printf("❌ Snapshot read error: %v\n", err)
			time.Sleep(2 * time.Second)
			continue
		}

		snapshotID := string(m.Key)
		s3Key := fmt.Sprintf("snapshots/%s.json", snapshotID)

		_, err = svc.PutObject(&s3.PutObjectInput{
			Bucket:      aws.String(bucketName),
			Key:         aws.String(s3Key),
			Body:        bytes.NewReader(m.Value),
			ContentType: aws.String("application/json"),
		})

		if err != nil {
			fmt.Printf("❌ S3 upload error: %v\n", err)
			continue
		}

		s3Path := fmt.Sprintf("s3://%s/%s", bucketName, s3Key)
		fileSizeKB := len(m.Value) / 1024

		fmt.Printf("☁️ Uploaded snapshot: %s (%d KB) -> %s\n", snapshotID, fileSizeKB, s3Path)
	}
}

func handleSnapshotTrigger(payload Payload, ts time.Time) error {
	fmt.Printf("📸 Snapshot trigger: %s by %s\n", payload.Changes, payload.User)
	return snapshot.CreateSnapshot(payload.Changes, payload.User)
}

type Event struct {
	EventType string  `json:"eventType"`
	Payload   Payload `json:"payload"`
	Timestamp string  `json:"timestamp"`
}

type Payload struct {
	Entity    string `json:"entity"`
	EntityId  string `json:"entityId"`
	TaskId    string `json:"taskId,omitempty"`
	TaskName  string `json:"taskName,omitempty"`
	Changes   string `json:"changes"`
	User      string `json:"user"`
	Workspace string `json:"workspace"`
	Timestamp string `json:"timestamp"`
}