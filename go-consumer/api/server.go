package api

// =====================================================================
// NOTE: This API server is NO LONGER USED
// =====================================================================
// The history logs API functionality has been migrated to the Express.js
// backend (todo_serer/routes/logs.js) running on port 3001.
//
// The Go consumer now only handles:
// - Kafka message consumption
// - TimescaleDB insertions
//
// The Express.js backend provides the same REST API endpoints:
// - GET /api/logs/groups
// - GET /api/logs/group/:groupId
// - GET /api/logs/group/:groupId/tasks
// - GET /api/logs/task/:taskId
//
// Frontend now calls Express.js API (port 3001) instead of Go API (port 7250)
//
// This file is kept for reference only and may be deleted in the future.
// =====================================================================

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"todo-consumer/db"
)

// StartServer starts the HTTP API for logs and health checks.
// DEPRECATED: This function is no longer called from main.go
func StartServer() {
	// Routes
	http.HandleFunc("/api/logs/groups", getGroupsSummary)
	http.HandleFunc("/api/logs/group/", handleGroupRoutes)
	http.HandleFunc("/api/logs/task/", getTaskLogs)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	log.Println("🌐 Go API server started on :7250")

	// Start the HTTP server (non-blocking if called as a goroutine)
	if err := http.ListenAndServe(":7250", nil); err != nil {
		log.Fatalf("❌ Failed to start API server: %v", err)
	}
}

// getGroupsSummary handles GET requests for all groups summary
func getGroupsSummary(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	summary, err := db.GetGroupsSummary()
	if err != nil {
		log.Printf("❌ Error fetching groups summary: %v\n", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Error fetching groups: %v", err)})
		return
	}

	response := map[string]interface{}{
		"success": true,
		"data":    summary,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// handleGroupRoutes handles routes under /api/logs/group/
func handleGroupRoutes(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract path after /api/logs/group/
	path := strings.TrimPrefix(r.URL.Path, "/api/logs/group/")
	parts := strings.Split(path, "/")
	groupId := parts[0]

	if groupId == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Group ID required"})
		return
	}

	// Check if requesting tasks summary
	if len(parts) > 1 && parts[1] == "tasks" {
		getGroupTasksSummary(w, groupId)
		return
	}

	// Otherwise, return group logs
	getGroupLogsHandler(w, groupId)
}

// getGroupLogsHandler handles fetching logs for a specific group
func getGroupLogsHandler(w http.ResponseWriter, groupId string) {
	log.Printf("📥 Received logs request for groupId: %s\n", groupId)

	logs, err := db.GetGroupLogs(groupId)
	if err != nil {
		log.Printf("❌ Error fetching logs for group %s: %v\n", groupId, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Error fetching logs: %v", err)})
		return
	}

	response := map[string]interface{}{
		"success": true,
		"data":    logs,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// getGroupTasksSummary handles fetching tasks summary for a group
func getGroupTasksSummary(w http.ResponseWriter, groupId string) {
	log.Printf("📥 Received tasks summary request for groupId: %s\n", groupId)

	summary, err := db.GetGroupTasksSummary(groupId)
	if err != nil {
		log.Printf("❌ Error fetching tasks summary for group %s: %v\n", groupId, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Error fetching tasks: %v", err)})
		return
	}

	response := map[string]interface{}{
		"success": true,
		"data":    summary,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// getTaskLogs handles fetching logs for a specific task
func getTaskLogs(w http.ResponseWriter, r *http.Request) {
	setCORSHeaders(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/logs/task/")
	taskId := strings.Split(path, "/")[0]

	log.Printf("📥 Received logs request for taskId: %s\n", taskId)

	if taskId == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Task ID required"})
		return
	}

	logs, err := db.GetTaskLogs(taskId)
	if err != nil {
		log.Printf("❌ Error fetching logs for task %s: %v\n", taskId, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": fmt.Sprintf("Error fetching logs: %v", err)})
		return
	}

	response := map[string]interface{}{
		"success": true,
		"data":    logs,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// setCORSHeaders sets common CORS headers
func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
