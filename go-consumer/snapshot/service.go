package snapshot

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"
	"todo-consumer/db"

	"github.com/segmentio/kafka-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SnapshotData struct {
	SnapshotID string    `json:"snapshotId"`
	CreatedAt  time.Time `json:"createdAt"`
	CreatedBy  string    `json:"createdBy"`
	Data       struct {
		Groups   []bson.M `json:"groups"`
		Tasks    []bson.M `json:"tasks"`
		Comments []bson.M `json:"comments"`
		Users    []bson.M `json:"users"`
	} `json:"data"`
	Metadata struct {
		Counts struct {
			Groups   int `json:"groups"`
			Tasks    int `json:"tasks"`
			Comments int `json:"comments"`
			Users    int `json:"users"`
		} `json:"counts"`
	} `json:"metadata"`
}

func CreateSnapshot(triggerReason, user string) error {
	now := time.Now()
	snapshotID := fmt.Sprintf("snapshot_%d_%02d_%02d_%02d_%02d_%02d",
		now.Year(), now.Month(), now.Day(), now.Hour(), now.Minute(), now.Second())

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017/todo_manager"
	}
	fmt.Printf("Connecting to MongoDB: %s\n", mongoURI)

	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI(mongoURI))
	if err != nil {
		return fmt.Errorf("MongoDB connection failed: %v", err)
	}
	defer client.Disconnect(context.Background())

	database := client.Database("todo_manager")
	
	// List collections to debug
	collections, err := database.ListCollectionNames(context.Background(), bson.M{})
	if err == nil {
		fmt.Printf("Available collections: %v\n", collections)
	}

	var snapshot SnapshotData
	snapshot.SnapshotID = snapshotID
	snapshot.CreatedAt = now
	snapshot.CreatedBy = user

	// Initialize slices to avoid null values
	snapshot.Data.Groups = make([]bson.M, 0)
	snapshot.Data.Tasks = make([]bson.M, 0)
	snapshot.Data.Comments = make([]bson.M, 0)
	snapshot.Data.Users = make([]bson.M, 0)

	groupsCursor, err := database.Collection("groups").Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	var groups []bson.M
	if err = groupsCursor.All(context.Background(), &groups); err != nil {
		return err
	}
	if groups != nil {
		snapshot.Data.Groups = groups
	}
	fmt.Printf("Found %d groups\n", len(snapshot.Data.Groups))

	tasksCursor, err := database.Collection("tasks").Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	var tasks []bson.M
	if err = tasksCursor.All(context.Background(), &tasks); err != nil {
		return err
	}
	if tasks != nil {
		snapshot.Data.Tasks = tasks
	}
	fmt.Printf("Found %d tasks\n", len(snapshot.Data.Tasks))

	commentsCursor, err := database.Collection("comments").Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	var comments []bson.M
	if err = commentsCursor.All(context.Background(), &comments); err != nil {
		return err
	}
	if comments != nil {
		snapshot.Data.Comments = comments
	}
	fmt.Printf("Found %d comments\n", len(snapshot.Data.Comments))

	usersCursor, err := database.Collection("users").Find(context.Background(), bson.M{})
	if err != nil {
		return err
	}
	var users []bson.M
	if err = usersCursor.All(context.Background(), &users); err != nil {
		return err
	}
	if users != nil {
		snapshot.Data.Users = users
	}
	fmt.Printf("Found %d users\n", len(snapshot.Data.Users))

	// Check if database has any meaningful data
	totalRecords := len(snapshot.Data.Groups) + len(snapshot.Data.Tasks) + len(snapshot.Data.Comments)
	fmt.Printf("Total records found: %d\n", totalRecords)
	if totalRecords == 0 {
		fmt.Printf("⚠️ Skipping snapshot - database is empty\n")
		return fmt.Errorf("database is empty, no snapshot created")
	}

	snapshot.Metadata.Counts.Groups = len(snapshot.Data.Groups)
	snapshot.Metadata.Counts.Tasks = len(snapshot.Data.Tasks)
	snapshot.Metadata.Counts.Comments = len(snapshot.Data.Comments)
	snapshot.Metadata.Counts.Users = len(snapshot.Data.Users)

	jsonData, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return err
	}

	// Publish snapshot JSON to separate Kafka topic
	if err := publishSnapshotToKafka(snapshotID, jsonData); err != nil {
		return fmt.Errorf("failed to publish snapshot to Kafka: %v", err)
	}

	fileSizeKB := len(jsonData) / 1024

	changes := fmt.Sprintf("Snapshot created with %d groups, %d tasks, %d comments, %d users - Reference: %s",
		snapshot.Metadata.Counts.Groups,
		snapshot.Metadata.Counts.Tasks,
		snapshot.Metadata.Counts.Comments,
		snapshot.Metadata.Counts.Users,
		snapshotID)

	err = db.InsertLog(
		"SNAPSHOT_CREATED",
		"SYSTEM",
		snapshotID,
		"",
		"",
		"",
		"",
		changes,
		user,
		"system",
		now,
	)

	if err != nil {
		return err
	}

	fmt.Printf("📸 Snapshot created: %s (%d KB) -> Kafka topic\n", snapshotID, fileSizeKB)
	return nil
}

func publishSnapshotToKafka(snapshotID string, jsonData []byte) error {
	writer := kafka.NewWriter(kafka.WriterConfig{
		Brokers: []string{"localhost:9092"},
		Topic:   "todo-snapshots",
	})
	defer writer.Close()

	message := kafka.Message{
		Key:   []byte(snapshotID),
		Value: jsonData,
	}

	return writer.WriteMessages(context.Background(), message)
}