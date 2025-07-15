from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class ActionsConfig(AppConfig):
    name = 'admin_helpers.actions'
    verbose_name = _('Actions')
    default_auto_field = 'django.db.models.AutoField'

