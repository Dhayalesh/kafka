package kafka

import (
	"fmt"
	"time"

	"todo-consumer/snapshot"
)

func handleSnapshotTrigger(payload Payload, ts time.Time) error {
	fmt.Printf("📸 Snapshot trigger: %s by %s\n", payload.Changes, payload.User)
	
	return snapshot.CreateSnapshot(payload.Changes, payload.User)
}