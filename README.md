# Admin Django Helpers

Полезные помощники и утилиты для Django Admin с поддержкой глобального поиска.

## 🚀 Возможности

- **Глобальный поиск**: Легко добавьте функциональность глобального поиска в Django Admin
- **Миксины для моделей**: Удобные миксины для расширения функциональности моделей
- **Готовые действия**: Полезные действия для админ-панели
- **Контекстные процессоры**: Дополнительные контекстные процессоры для шаблонов
- **Шаблонные теги**: Набор полезных шаблонных тегов

## 📦 Установка
```bash
pip install admin-dj-helpers
```

## ⚙️ Быстрый старт

### 1. Добавьте приложение в settings.py

```python
INSTALLED_APPS = [
    'admin_dj_helpers', # обязательно первым в перед django.contrib.admin
    'admin_dj_helpers.global_search', # Для добавления глобального поиска
    'admin_dj_helpers.actions', # Для добавления действий
    'django.admin.contrib',
    '...',
]
```

### 2. Используйте GlobalSearchMixin в ваших моделях

```python 
from django.db import models 
from admin_helpers.global_search.mixin import GlobalSearchMixin

class Article(GlobalSearchMixin, models.Model): 
    title = models.CharField(max_length=200) 
    content = models.TextField() 
    author = models.CharField(max_length=100)
    
    # Настройка глобального поиска
    search_icon = 'fa-solid fa-newspaper'
    search_description = 'Статьи сайта'

    @classmethod
    def get_global_search_fields(cls, query_string: str):
        return [
            'title',
            'content',
            'author'
        ]
    
    def __str__(self):
        return self.title

    
```

### 3. Настройте контекстные процессоры

```python
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'admin_helpers.context_processors.settings', # Обязателен для работы поиска и действий
            ],
        },
    },
]
```

## 📚 Подробная документация

### GlobalSearchMixin

Миксин для добавления поддержки глобального поиска к вашим моделям.

#### Настройки класса:

- `search_icon` - иконка для отображения в результатах поиска (FontAwesome)
- `search_description` - описание модели для поиска
- `search_order_by` - поле для сортировки результатов
- `order_in_search` - порядок отображения в результатах


#### Обязательные методы:

```python 
@classmethod 
def get_global_search_fields(cls, query_string: str) -> List[str]: 
    """ Возвращает список полей для поиска """ 
    return ['field1', 'field2']
```

#### Опциональные методы:

```python 
@classmethod 
def get_search_item(cls, obj, request) -> Dict[str, str]: 
    """ Кастомизация элемента в результатах поиска """ 
    return { 
        'type': 'model', 
        'icon': cls.search_icon, 
        'title': str(obj), 
        'description': repr(obj), 
        'url': None, 
        'model_name': cls._meta.verbose_name 
    }
```

## 🔧 Требования

- Python >= 3.9
- Django >= 3.2

## 🤝 Поддерживаемые версии Django

- Django 3.2+
- Django 4.0+
- Django 4.1+
- Django 4.2+
- Django 5.0+
- Django 5.1+

## 📄 Лицензия

MIT License. Подробности в файле [LICENSE](LICENSE).

## 🐛 Сообщить об ошибке

Если вы нашли ошибку или у вас есть предложения по улучшению, пожалуйста, создайте issue в [GitHub репозитории](https://github.com/migelbd/admin-dj-helpers/issues).

## 📊 Статус разработки

Проект находится в стадии активной разработки (Alpha). API может изменяться.

---

Сделано с ❤️ для Django сообщества
