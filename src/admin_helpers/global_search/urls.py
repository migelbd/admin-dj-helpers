from django.urls import path

from .views import global_search, get_global_search_models

app_name = 'global_search'
urlpatterns = [
    path('search', global_search, name='global_search'),
    path('get-search-models', get_global_search_models, name='get_global_search_models'),
]
