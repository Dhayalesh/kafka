package main

import (
	"fmt"
	"os"
	"todo-consumer/db"
	"todo-consumer/kafka"

	"github.com/joho/godotenv"
)

// =====================================================================
// Go Consumer Service - Kafka to TimescaleDB
// =====================================================================
// This service handles:
// - Consuming events from Kafka topic 'todo-history-events'
// - Writing event logs to TimescaleDB
//
// Architecture:
// 1. Express backend (todo_serer) - Publishes events to Kafka
// 2. This Go consumer - Consumes from Kafka, writes to TimescaleDB
// 3. Express backend - Provides REST API to read logs from TimescaleDB
// =====================================================================

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(".env"); err != nil {
		fmt.Println("⚠️ No .env file found, using system environment variables")
	}

	fmt.Println("🚀 Starting Go Kafka Consumer Service")
	fmt.Println("📋 Role: Consume Kafka events → Write to TimescaleDB")

	// Connection string for TimescaleDB (Docker)
	timescaleURI := "postgres://postgres:postgres@localhost:5432/todo_history"

	if err := db.Init(timescaleURI); err != nil {
		fmt.Println("❌ Failed to connect to TimescaleDB:", err)
		os.Exit(1)
	}

	// Start consuming from Kafka and writing to TimescaleDB
	// Note: History logs API is provided by Express.js backend on port 3001
	fmt.Println("📡 Connecting to Kafka broker...")
	kafka.StartConsumer()
}
