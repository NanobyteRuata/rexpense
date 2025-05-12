from confluent_kafka import Producer
import json
import logging
import uuid
import datetime
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
        
    def emit_event(self, topic, event_type, payload):
        """Emit a standardized event to Kafka"""
        try:
            # Create standard message format
            message = {
                "message_id": str(uuid.uuid4()),
                "timestamp": datetime.datetime.now().isoformat(),
                "version": "1.0",
                "source": "transaction-service",
                "type": event_type,
                "payload": payload
            }
            
            # Convert to JSON string
            message_str = json.dumps(message)
            
            # Produce message
            self.producer.produce(
                topic=topic,
                value=message_str.encode('utf-8'),
                callback=self._delivery_report
            )
            
            # Flush to ensure delivery
            self.producer.flush()
            
            return True
        except Exception as e:
            logger.error(f"Error emitting event: {e}")
            return False
            
    def _delivery_report(self, err, msg):
        """Callback for message delivery reports"""
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        else:
            logger.debug(f"Message delivered to {msg.topic()} [{msg.partition()}]")

    def flush_with_timeout(self, timeout_seconds=5):
        """Flush with timeout to prevent blocking indefinitely"""
        result = self.producer.flush(timeout_seconds * 1000)
        if result > 0:
            logger.warning(f"{result} messages still pending after flush timeout")
        return result == 0
