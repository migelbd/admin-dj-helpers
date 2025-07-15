import abc
from typing import List, Dict

from django.db import models


class GlobalSearchMixin:
    objects: models.Manager

    search_order_by = None
    order_in_search = None

    search_icon = 'fa-solid fa-circle'
    search_description = None

    @classmethod
    def get_model_info(cls):
        return {
            'id': cls._meta.model_name,
            'name': cls._meta.verbose_name,
            'icon': cls.search_icon,
            'description': cls.search_description or cls.__doc__ or '-'
        }

    @classmethod
    @abc.abstractmethod
    def get_global_search_fields(cls, query_string: str) -> List[str]:
        ...

    @classmethod
    def get_search_item(cls, obj, request) -> Dict[str, str]:
        return {
            'type': 'model',
            'icon': cls.search_icon,
            'title': str(obj),
            'description': repr(obj),
            'url': None,
            'model_name': cls._meta.verbose_name
        }
