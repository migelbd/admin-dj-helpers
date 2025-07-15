from django.apps import AppConfig
from django.conf import settings
from django.utils.module_loading import import_string
from django.utils.translation import gettext_lazy as _


class GlobalSearchConfig(AppConfig):
    name = 'admin_helpers.global_search'
    verbose_name = _('Global Search')
    default_auto_field = 'django.db.models.AutoField'

    @property
    def search_backend(self):
        backend_class = getattr(
            settings,
            'DAH_GLOBAL_SEARCH_BACKEND',
            'admin_helpers.global_search.backends.model.ModelSearchBackend'
        )

        try:
            backend = import_string(backend_class)
        except ImportError:
            return None

        return backend
