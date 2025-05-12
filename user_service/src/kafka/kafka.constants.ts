// Kafka topics
export enum KafkaTopics {
  USER_SERVICE = 'user_service_events',
  TRANSACTION_SERVICE = 'transaction_service_events',
}

// Message types
export enum MessageTypes {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
}
