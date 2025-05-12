import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  KafkaCamelCaseDeserializer,
  KafkaSnakeCaseSerializer,
} from './kafka.serializer';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'user-service',
            brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'user-service-group',
            allowAutoTopicCreation: true,
          },
          producer: {
            retry: {
              initialRetryTime: 100, // ms
              retries: 8, // Number of retries
              maxRetryTime: 30000, // 30 seconds
            },
          },
          serializer: new KafkaSnakeCaseSerializer(),
          deserializer: new KafkaCamelCaseDeserializer(),
        },
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
