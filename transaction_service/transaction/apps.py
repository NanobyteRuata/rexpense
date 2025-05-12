from django.apps import AppConfig, apps
from django.db import connection
from django.db.utils import ProgrammingError

class TransactionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'transaction'

    def ready(self):
        try:
            self.create_default_categories()
        except ProgrammingError:
            pass

    def create_default_categories(self):
        Category = apps.get_model('transaction', 'Category')

        default_categories = [
            {'id': 1, 'name': 'Miscellaneous'},
            {'id': 2, 'name': 'Food'},
            {'id': 3, 'name': 'Transport'},
            {'id': 4, 'name': 'Accomodation'}
        ]

        created = False
        for category in default_categories:
            # Update existing category or create a new one
            obj, is_created = Category.objects.update_or_create(
                pk=category['id'],
                defaults={'user_id': None, 'name': category['name'], 'description': None}
            )
            
            if is_created:
                created = True

        # Reset the auto-increment sequence if necessary
        if created:
            with connection.cursor() as cursor:
                # Get the size of default_categories and add 1
                new_sequence_value = len(default_categories)

                # Get the current serial sequence value
                cursor.execute("""
                    SELECT last_value FROM pg_sequences 
                    WHERE schemaname = 'public' AND sequencename = 'transaction_category_id_seq';
                """)
                current_sequence = cursor.fetchone()[0] or 1  # fetch the current sequence value

                # If the sequence is less than the required value, reset it
                if current_sequence < new_sequence_value:
                    cursor.execute("""
                        SELECT setval(pg_get_serial_sequence('transaction_category', 'id'), 
                        %s);
                    """, [new_sequence_value])

