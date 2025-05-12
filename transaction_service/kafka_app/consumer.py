from confluent_kafka import Consumer, KafkaException
import json
import logging
from django.conf import settings
import threading

logger = logging.getLogger(__name__)

class KafkaConsumer:
    def __init__(self, topics, group_id, callback):
        self.topics = topics
        self.callback = callback
        self.running = False
        self.consumer = Consumer({
            'bootstrap.servers': settings.KAFKA_BOOTSTRAP_SERVERS,
            'group.id': group_id,
            'auto.offset.reset': 'earliest'
        })
        
    def start(self):
        """Start consuming messages in a separate thread"""
        self.running = True
        self.consumer.subscribe(self.topics)
        self.thread = threading.Thread(target=self._consume)
        self.thread.daemon = True
        self.thread.start()
        logger.info(f"Started Kafka consumer for topics: {self.topics}")
        
    def _consume(self):
        """Continuously poll for new messages"""
        try:
            while self.running:
                msg = self.consumer.poll(1.0)
                if msg is None:
                    continue
                    
                if msg.error():
                    logger.error(f"Consumer error: {msg.error()}")
                    continue
                    
                try:
                    # Parse the message value
                    value = json.loads(msg.value().decode('utf-8'))
                    logger.debug(f"Received message: {value}")
                    # Call the callback with the topic and message
                    self.callback(msg.topic(), value)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse message: {msg.value()}")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
        except Exception as e:
            logger.error(f"Consumer thread error: {e}")
        finally:
            self.consumer.close()
            
    def stop(self):
        """Stop the consumer"""
        self.running = False
        if hasattr(self, 'thread'):
            self.thread.join(timeout=5)
        logger.info("Stopping Kafka consumer")