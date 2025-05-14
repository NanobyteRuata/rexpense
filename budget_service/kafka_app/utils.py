import logging
import datetime
from .constants import KafkaTopics

logger = logging.getLogger(__name__)

def handle_user_registered(payload):
    """Process user_registered events"""
    try:
        # Use lazy import to avoid circular reference during Django startup
        from budget_app.models import UserReference
            
        user_id = payload.get('id')
        email = payload.get('email')
        name = payload.get('name')
        is_admin = payload.get('is_admin', False)
        
        logger.info(f"Received user.registered event: user_id={user_id}, email={email}")
        
        # Create UserReference if it doesn't exist
        user_ref, created = UserReference.objects.update_or_create(
            id=user_id,
            defaults={
                'email': email,
                'name': name,
                'is_admin': is_admin
            }
        )
        
        if created:
            logger.info(f"Created new UserReference for user_id={user_id}")
        else:
            logger.info(f"Updated existing UserReference for user_id={user_id}")
            
    except Exception as e:
        logger.error(f"Error handling user.registered event: {e}")

def handle_user_updated(payload):
    """Process user.updated events to update UserReference"""
    try:
        # Use lazy import to avoid circular reference during Django startup
        from budget_app.models import UserReference

        user_id = payload.get('id')
        email = payload.get('email')
        name = payload.get('name')
        is_admin = payload.get('is_admin', False)
        
        logger.info(f"Received user.updated event for user_id={user_id}")
        
        # Update UserReference if it exists
        user_ref, created = UserReference.objects.update_or_create(
            id=user_id,
            defaults={
                'email': email,
                'name': name,
                'is_admin': is_admin
            }
        )
        
        if created:
            logger.info(f"Created UserReference during update for user_id={user_id}")
        else:
            logger.info(f"Updated UserReference for user_id={user_id}")
            
    except Exception as e:
        logger.error(f"Error handling user.updated event: {e}")

def handle_user_deleted(payload):
    """Process user.deleted events to remove UserReference"""
    try:
        # Use lazy import to avoid circular reference during Django startup
        from budget_app.models import UserReference

        user_id = payload.get('id')
        
        logger.info(f"Received user.deleted event for user_id={user_id}")
        
        # Delete UserReference if it exists
        try:
            user_ref = UserReference.objects.get(id=user_id)
            user_ref.delete()
            logger.info(f"Deleted UserReference for user_id={user_id}")
        except UserReference.DoesNotExist:
            logger.warning(f"UserReference not found for user_id={user_id} during delete")
            
    except Exception as e:
        logger.error(f"Error handling user.deleted event: {e}")

def get_event_handlers():
    return {
        KafkaTopics.USER_CREATED: handle_user_registered,
        KafkaTopics.USER_UPDATED: handle_user_updated,
        KafkaTopics.USER_DELETED: handle_user_deleted
    }

def event_router(topic, data):
    if topic == KafkaTopics.USER_CREATED:
        handle_user_registered(data)
    elif topic == KafkaTopics.USER_UPDATED:
        handle_user_updated(data)
    elif topic == KafkaTopics.USER_DELETED:
        handle_user_deleted(data)
    else:
        logger.warning(f"No handler for topic: {topic}")