const { Kafka } = require('kafkajs');

class KafkaProducer {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'todo-backend',
      brokers: [process.env.KAFKA_BROKER],
      retry: {
        initialRetryTime: 100,
        retries: 3
      },
      connectionTimeout: 3000,
      requestTimeout: 25000
    });
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000
    });
    this.connected = false;
  }

  async connect() {
    try {
      await this.producer.connect();
      this.connected = true;
      console.log('✅ Kafka producer connected');
    } catch (error) {
      console.error('❌ Kafka connection failed:', error.message);
      console.log('⚠️ Continuing without Kafka - events will not be published');
    }
  }

  async publishEvent(eventType, payload) {
    if (process.env.KAFKA_ENABLED === 'false') {
      return;
    }
    if (!this.connected) {
      console.warn('⚠️ Kafka not connected, skipping event:', eventType);
      return;
    }

    const message = {
      eventType,
      payload: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    };

    try {
      await this.producer.send({
        topic: process.env.KAFKA_TOPIC || 'todo-history-events',
        messages: [{
          key: payload.entityId || null,
          value: JSON.stringify(message)
        }]
      });
      console.log(`📤 Event published: ${eventType}`);
    } catch (error) {
      console.error('❌ Failed to publish event:', error.message);
    }
  }

  async publishSnapshotToKafka(snapshotId, snapshotJson) {
    if (process.env.KAFKA_ENABLED === 'false') {
      return;
    }
    if (!this.connected) {
      console.warn('⚠️ Kafka not connected, skipping snapshot');
      return;
    }

    try {
      await this.producer.send({
        topic: 'todo-snapshots',
        messages: [{
          key: snapshotId,
          value: snapshotJson
        }]
      });
      console.log(`📤 Snapshot published: ${snapshotId}`);
    } catch (error) {
      console.error('❌ Failed to publish snapshot:', error.message);
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}

module.exports = new KafkaProducer();