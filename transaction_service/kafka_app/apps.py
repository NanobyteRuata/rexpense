from django.apps import AppConfig
from django.conf import settings
import logging
import importlib
import sys
from .constants import KafkaTopics

logger = logging.getLogger(__name__)

class KafkaAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'kafka_app'
    
    def ready(self):
        # Don't start the consumer during Django's auto-reload cycle
        import os
        if os.environ.get('RUN_MAIN') != 'true':
            try:
                # Import from local app modules by explicit path
                sys.path.insert(0, settings.BASE_DIR)
                from .consumer import KafkaConsumer
                from .utils import event_router
                import atexit
                
                # Start the consumer with topics to subscribe
                self.consumer = KafkaConsumer(
                    topics=[KafkaTopics.USER_CREATED, KafkaTopics.USER_UPDATED, KafkaTopics.USER_DELETED], 
                    group_id='transaction-service',
                    callback=event_router
                )
                self.consumer.start()
                logger.info("Kafka consumer started successfully")
                def shutdown_consumer():
                    self.consumer.stop()
                atexit.register(shutdown_consumer)
            except Exception as e:
                logger.error(f"Failed to start Kafka consumer: {e}")
                import traceback
                logger.error(traceback.format_exc())