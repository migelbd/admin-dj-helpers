from .settings import APP_SETTINGS


def settings(request):
    return dict(
        admin_helpers_settings=APP_SETTINGS
    )