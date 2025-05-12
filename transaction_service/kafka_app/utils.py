import logging
import datetime

logger = logging.getLogger(__name__)

def handle_user_registered(data):
    """Process user_registered events"""
    try:
        # Use lazy import to avoid circular reference during Django startup
        from transaction.models import UserReference
        
        # Extract payload from structured message
        payload = data.get('payload', {})
        if not payload:
            # Fallback for direct messages without wrapper
            payload = data
            
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

def handle_user_updated(data):
    """Process user.updated events to update UserReference"""
    try:
        # Use lazy import to avoid circular reference during Django startup
        from transaction.models import UserReference
        
        payload = data.get('payload', {})
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

def handle_user_deleted(data):
    """Process user.deleted events to remove UserReference"""
    try:
        # Use lazy import to avoid circular reference during Django startup
        from transaction.models import UserReference
        
        payload = data.get('payload', {})
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

# Import UserMessageTypes inside function or use string constants
# to avoid possible circular imports with EVENT_HANDLERS
def get_event_handlers():
    """Return event handlers dictionary when needed to avoid circular imports"""
    from .constants import UserMessageTypes
    
    return {
        UserMessageTypes.USER_CREATED: handle_user_registered,
        UserMessageTypes.USER_UPDATED: handle_user_updated,
        UserMessageTypes.USER_DELETED: handle_user_deleted
    }

def event_router(topic, data):
    """Route events to the appropriate handler based on event type"""
    from .constants import UserMessageTypes
    
    event_type = data.get('type')
    event_handlers = get_event_handlers()
    
    if event_type in event_handlers:
        logger.info(f"Routing event type: {event_type} from topic: {topic}")
        event_handlers[event_type](data)
    else:
        logger.warning(f"No handler for event type: {event_type}")