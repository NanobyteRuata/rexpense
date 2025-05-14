import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { KafkaTopics } from './kafka.constants';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Connect to Kafka when the module initializes
    await this.kafkaClient.connect();
  }

  /**
   * Emit a message to a Kafka topic with standardized format
   */
  async emitMessage<T>(message: T, topic: KafkaTopics): Promise<void> {
    try {
      await lastValueFrom(this.kafkaClient.emit(topic, message));
    } catch (error) {
      console.error(`Failed to emit message to topic ${topic}:`, error);
      throw error;
    }
  }
}
