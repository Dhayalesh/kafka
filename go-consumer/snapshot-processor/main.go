package main

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/joho/godotenv"
	"github.com/segmentio/kafka-go"
)

func main() {
	if err := godotenv.Load("../.env"); err != nil {
		fmt.Println("⚠️ No .env file found, using system environment variables")
	}

	fmt.Println("📦 Starting Snapshot Processor Service")
	fmt.Println("📋 Role: Consume snapshot JSON → Upload to S3")

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

	fmt.Printf("🚀 Snapshot Processor started on topic: todo-snapshots\n")

	for {
		m, err := reader.ReadMessage(context.Background())
		if err != nil {
			fmt.Printf("❌ Read error: %v\n", err)
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