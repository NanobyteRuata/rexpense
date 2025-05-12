import { toSnakeCase } from '../core/utils/to-snake-case';
import { toCamelCase } from '../core/utils/to-camel-case';
import { KafkaMessage, SerializedKafkaMessage } from './kafka.models';

export class KafkaSnakeCaseSerializer {
  serialize(message: KafkaMessage<object>): SerializedKafkaMessage {
    const snakeCaseValue = toSnakeCase(message);
    return {
      // In Kafka, null keys mean the message will be randomly distributed across partitions
      key: null,
      value: JSON.stringify(snakeCaseValue),
    };
  }
}

export class KafkaCamelCaseDeserializer {
  deserialize(message: SerializedKafkaMessage): any {
    if (!message || !message.value) {
      return null;
    }

    // Transform to camelCase after receiving from Kafka
    const rawValue = message.value.toString();
    const parsedValue = JSON.parse(rawValue) as
      | object
      | null
      | undefined
      | string
      | number
      | boolean;
    return toCamelCase(parsedValue);
  }
}
