// Interface for standard message format
export interface KafkaMessage<T> {
  messageId: string;
  timestamp: string;
  version: string;
  source: string;
  type: string;
  payload: T;
}

export interface SerializedKafkaMessage {
  key: null;
  value: string;
}
