from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class GlobalSearchConfig(AppConfig):
    name = 'django_admin_helpers.global_search'
    verbose_name = _('Global Search')
    default_auto_field = 'django.db.models.AutoField'

