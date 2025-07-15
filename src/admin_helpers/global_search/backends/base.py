from abc import ABC, abstractmethod
from typing import Generator, Type, TypeAlias, List, Dict, Any

from ..mixin import GlobalSearchMixin

SearchResult: TypeAlias = List[Dict[str, Any]]


class BaseSearchBackend(ABC):

    def __init__(self):
        self.request = None

    @abstractmethod
    def get_all_available_models(self, model_name: str | None = None): ...

    @abstractmethod
    def check_perm(self, model, user) -> bool: ...

    @abstractmethod
    def get_available_models(self, request, model_name: str | None = None) -> Generator[Type[GlobalSearchMixin], None, None]: ...

    def handle(self, query_string: str):
        return query_string

    @abstractmethod
    def search(self, request, query_string: str, model: str = None, limit: int = 10) -> SearchResult: ...

    def __call__(self, request, query_string: str, model: str = None, limit: int = 10) -> SearchResult:
        self.request = request
        query_string = self.handle(query_string)
        if not query_string or len(query_string.strip()) < 3:
            return []
        return self.search(request, query_string, model, limit)
