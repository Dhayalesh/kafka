// =====================================================================
// NOTE: This Kafka consumer is NO LONGER USED
// =====================================================================
// The Go consumer (go-consumer/kafka/consumer.go) handles:
// - Consuming Kafka messages
// - Writing logs to TimescaleDB
//
// The Express backend (this service) only:
// - Publishes events to Kafka (via producer.js)
// - Provides REST API to read logs from TimescaleDB (via routes/logs.js)
//
// This file is kept for reference only and may be deleted in the future.
// =====================================================================

const { Kafka } = require('kafkajs');
const timescaleDb = require('../db/timescale');

class KafkaConsumer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'todo-consumer',
      brokers: [process.env.KAFKA_BROKER],
      retry: {
        initialRetryTime: 100,
        retries: 3
      },
      connectionTimeout: 3000,
      requestTimeout: 25000
    });

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_CONSUMER_GROUP || 'todo-logs-consumer',
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });

    this.connected = false;
  }

  async connect() {
    try {
      // Initialize TimescaleDB first
      await timescaleDb.initializeDatabase();

      // Connect Kafka consumer
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: process.env.KAFKA_TOPIC || 'todo-history-events',
        fromBeginning: false
      });

      this.connected = true;
      console.log('✅ Kafka consumer connected and subscribed to topic');

      // Start consuming messages
      await this.startConsuming();
    } catch (error) {
      console.error('❌ Kafka consumer connection failed:', error.message);
      console.log('⚠️ Continuing without Kafka consumer - events will not be logged to TimescaleDB');
    }
  }

  async startConsuming() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventMessage = JSON.parse(message.value.toString());
          const { eventType, payload } = eventMessage;

          // Extract group and task information from the payload
          const eventData = {
            eventType,
            entity: payload.entity || 'Unknown',
            entityId: payload.entityId || message.key?.toString() || 'unknown',
            groupId: null,
            groupName: payload.groupName || null,
            taskId: null,
            taskName: payload.taskName || null,
            changes: payload.changes || '',
            user: payload.user || 'system',
            workspace: payload.workspace || 'default'
          };

          // Determine groupId and taskId based on entity type and event
          if (payload.entity === 'Group') {
            eventData.groupId = payload.entityId;
          } else if (payload.entity === 'Task') {
            eventData.taskId = payload.entityId;
            // For task events, we need to get the groupId from somewhere
            // It should be included in the payload from the producer
            eventData.groupId = payload.groupId || null;
          } else if (payload.entity === 'Comment') {
            // Comments are related to tasks
            eventData.taskId = payload.taskId || null;
            eventData.groupId = payload.groupId || null;
          }

          // Save to TimescaleDB
          await timescaleDb.insertEventLog(eventData);

          console.log(`📥 Event logged to TimescaleDB: ${eventType} for ${eventData.entity}`);
        } catch (error) {
          console.error('❌ Error processing message:', error.message);
          console.error('Message:', message.value.toString());
        }
      }
    });
  }

  async disconnect() {
    if (this.connected) {
      await this.consumer.disconnect();
      this.connected = false;
      console.log('Kafka consumer disconnected');
    }
  }
}

module.exports = new KafkaConsumer();
