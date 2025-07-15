from typing import Type, List

from django.apps import apps

from .backends.base import SearchResult
from .mixin import GlobalSearchMixin


def switch_layout(value: str) -> str:
    # Сопоставление символов русской и английской раскладки
    ru = 'ёйцукенгшщзхъфывапролджэячсмитьбю.'
    en = '`qwertyuiop[]asdfghjkl;\'zxcvbnm,./'
    table = {}

    # Рус -> Англ
    for r, e in zip(ru, en):
        table[r] = e
        table[r.upper()] = e.upper()
    # Англ -> Рус
    for r, e in zip(ru, en):
        table[e] = r
        table[e.upper()] = r.upper()

    # Перекладываем строку
    return ''.join([table.get(char, char) for char in value])


def search_pages(request, query: str):
    from django.contrib import admin
    pages = []
    switched_query = switch_layout(query).strip().lower()

    for app in admin.site.get_app_list(request):
        if not app['has_module_perms']:
            continue
        for model in app['models']:
            name = model['name']
            if query.strip().lower() not in name.lower() and switched_query not in name.lower():
                continue
            model_cls = model['model']
            pages.append({
                'type': 'page',
                'icon': getattr(model_cls, 'search_icon', 'fa-solid fa-square'),
                'title': name,
                'description': '',
                'url': model['admin_url'],
                'model_name': str(app.get('name', app['app_label'])).upper(),
            })
    return pages


def search(request, query: str, model: str = None, limit: int = 10) -> SearchResult:
    app_conf = apps.get_app_config('global_search')
    backend_class = app_conf.search_backend
    results = [
        *search_pages(request, query),
    ]
    if backend_class:
        backend = backend_class()
        results.extend(backend(request, query, model=model, limit=limit))
    return results

def get_available_models(request) -> List[Type[GlobalSearchMixin]]:
    app_conf = apps.get_app_config('global_search')
    backend_class = app_conf.search_backend
    if backend_class:
        backend = backend_class()
        return list(backend.get_available_models(request))
    return []