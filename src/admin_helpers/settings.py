from django.conf import settings


IS_GLOBAL_SEARCH_ENABLED = 'admin_helpers.global_search' in settings.INSTALLED_APPS
IS_OBJECT_ACTION_ENABLED = 'admin_helpers.actions' in settings.INSTALLED_APPS



APP_SETTINGS = {
    'IS_GLOBAL_SEARCH_ENABLED': IS_GLOBAL_SEARCH_ENABLED,
    'IS_OBJECT_ACTION_ENABLED': IS_OBJECT_ACTION_ENABLED,
}