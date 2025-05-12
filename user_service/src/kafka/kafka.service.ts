import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { KafkaMessage } from './kafka.models';
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
  async emitMessage<T>(
    type: string,
    payload: T,
    topic: KafkaTopics = KafkaTopics.USER_SERVICE,
  ): Promise<void> {
    try {
      const message: KafkaMessage<T> = {
        messageId: uuidv4(),
        timestamp: new Date().toISOString(),
        version: '1.0', // Message schema version
        source: 'user-service',
        type,
        payload,
      };

      // Using emit() instead of send() as per project requirements
      await lastValueFrom(this.kafkaClient.emit(topic, message));
    } catch (error) {
      console.error(`Failed to emit message to topic ${topic}:`, error);
      throw error;
    }
  }
}
