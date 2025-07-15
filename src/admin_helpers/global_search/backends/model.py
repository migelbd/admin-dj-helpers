import contextlib
import logging
from typing import Generator, Type, Any, Dict

from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Model, QuerySet
from django.urls import NoReverseMatch

from .base import BaseSearchBackend, SearchResult
from ..mixin import GlobalSearchMixin

logger = logging.getLogger(__name__)


def get_global_search_options() -> Dict[str, Any]:
    return {
        'exclude': []
    }


class ModelSearchBackend(BaseSearchBackend):

    def get_all_available_models(self, model_name: str | None = None):
        models = apps.get_models(include_auto_created=False)
        available_models = []
        for model in models:
            if model_name and model._meta.model_name != model_name:
                continue
            if issubclass(model, GlobalSearchMixin) and not self.is_exclude_from_search(model):
                available_models.append(model)
        return sorted(available_models, key=lambda x: x.order_in_search or 999)

    def check_perm(self, model, user) -> bool:
        return user.has_perm(f'{model._meta.app_label}.view_{model._meta.model_name}')

    def get_available_models(self, request, model_name: str | None = None) -> Generator[
        Type[GlobalSearchMixin], None, None]:
        for model in self.get_all_available_models(model_name):
            if self.check_perm(model, request.user):  # noqa
                yield model  # noqa

    def search(self, request, query_string: str, model: str = None, limit: int = 10) -> SearchResult:
        results = []

        for m in self.get_available_models(request, model):
            try:
                results.extend(self.search_results(m, query_string, limit))
            except Exception as e:
                logger.error(f"Error searching model {m._meta.model_name}: {e}")

        return results

    @staticmethod
    def is_exclude_from_search(model: Type[GlobalSearchMixin]) -> bool:
        options = get_global_search_options()
        exclude_list = list(map(lambda x: str(x).lower(), options.get('exclude', [])))
        full_model_name = f'{model._meta.app_label}.{model._meta.model_name}'
        return (full_model_name in exclude_list) or (model._meta.app_label in exclude_list)

    @classmethod
    def get_global_search_results(cls, model: Type[GlobalSearchMixin], query_string: str) -> QuerySet[Any]:
        query = cls.get_query_orm(model, query_string)
        if query is None:
            return model.objects.none()
        qs = model.objects.using('default')

        with contextlib.suppress(ValidationError):
            qs = qs.filter(query)
            if model.search_order_by:
                qs = qs.order_by(model.search_order_by)
            return qs.distinct()
        return model.objects.none()

    def search_results(self, model: Type[GlobalSearchMixin], query_string: str, limit: int = 10):
        for obj in self.get_global_search_results(model, query_string)[:limit]:
            item = model.get_search_item(obj, self.request)
            if item.get('url') is None:
                item['url'] = self.get_item_url(obj)
            yield item

    @classmethod
    def _get_field_modificator(cls, field_name: str) -> str:
        def get_field_name(name: str, char: str) -> str | None:
            if name.startswith(char):
                return name[1:]
            return None

        if name := get_field_name(field_name, '='):
            return f'{name}__iexact'
        if name := get_field_name(field_name, '~'):
            return f'{name}__icontains'
        return field_name

    @classmethod
    def get_query_orm(cls, model: Type[GlobalSearchMixin], query_string: str):
        query = None
        if not query_string:
            return query
        with contextlib.suppress(ValidationError):
            for field in model.get_global_search_fields(query_string):
                field_modificator = cls._get_field_modificator(field)
                if query is None:
                    query = models.Q(**{field_modificator: query_string})
                else:
                    query |= models.Q(**{field_modificator: query_string})

        return query

    @staticmethod
    def get_item_url(obj: GlobalSearchMixin) -> str:
        try:
            from django.urls import reverse
            _meta = obj._meta
            app_label = _meta.app_label
            model_name = _meta.model_name
            return reverse(f'admin:{app_label}_{model_name}_change', args=(obj.pk,))
        except NoReverseMatch:
            return '#'
