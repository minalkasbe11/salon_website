from django.db import migrations

# Every table in the schema — the whole database was created as latin1, which
# silently corrupts any non-ASCII character (₹, accented names, emoji) on save.
# Django's connection is already configured for utf8mb4 (settings.py DATABASES
# OPTIONS); this migration brings the actual tables in line with that.
TABLES = [
    'appointment', 'auth_group', 'auth_group_permissions', 'auth_permission',
    'business_hours', 'chat_session', 'conversation', 'django_admin_log',
    'django_content_type', 'django_migrations', 'django_session', 'faq',
    'gallery', 'knowledge_base', 'message', 'notification', 'offer',
    'salon_information', 'service', 'service_category', 'staff',
    'staff_availability', 'staff_services', 'testimonial', 'unanswered_query',
    'user', 'user_groups', 'user_user_permissions',
]


def convert_to_utf8mb4(apps, schema_editor):
    if schema_editor.connection.vendor != 'mysql':
        return  # PostgreSQL (and others) are already UTF-8; this fix is MySQL-only
    db_name = schema_editor.connection.settings_dict['NAME']
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(f"ALTER DATABASE `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        for table in TABLES:
            cursor.execute(f"ALTER TABLE `{table}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")


def convert_to_latin1(apps, schema_editor):
    if schema_editor.connection.vendor != 'mysql':
        return  # PostgreSQL (and others) are already UTF-8; this fix is MySQL-only
    db_name = schema_editor.connection.settings_dict['NAME']
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(f"ALTER DATABASE `{db_name}` CHARACTER SET latin1 COLLATE latin1_swedish_ci")
        for table in TABLES:
            cursor.execute(f"ALTER TABLE `{table}` CONVERT TO CHARACTER SET latin1 COLLATE latin1_swedish_ci")


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_appointment'),
        ('website', '0001_initial'),
        ('chatbot', '0002_unansweredquery'),
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(convert_to_utf8mb4, reverse_code=convert_to_latin1),
    ]
