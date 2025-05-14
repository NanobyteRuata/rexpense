import json
import logging
from confluent_kafka import Producer
from django.conf import settings

logger = logging.getLogger(__name__)

class KafkaProducer:
  def __init__(self):
    self.producer = Producer({
      'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
      'retries': 8,
      'retry.backoff.ms': 100,
      'message.timeout.ms': 30000
    })

  def emit_event(self, topic, payload):
    """Emit a JSON event to Kafka (no message type)"""
    try:
      message_str = json.dumps(payload)
      self.producer.produce(
        topic=topic,
        value=message_str.encode('utf-8')
      )
      self.producer.flush()
      logger.info(f"Produced event to {topic}: {message_str}")
    except Exception as e:
      logger.error(f"Failed to produce event: {e}")