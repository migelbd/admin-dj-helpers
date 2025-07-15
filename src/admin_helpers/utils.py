import asyncio
import contextlib
import math
import time
from functools import partial
from typing import Literal

from django.db import connection
from django.template.loader import render_to_string


def pluralize(number, titles):
    """
    Возвращает форму слова в зависимости от числа.
    :param number: Число, для которого определяется форма слова
    :param titles: Список из трех форм слова: для 1, для 2, для 5
    :return: Строка с правильной формой слова
    """
    cases = [2, 0, 1, 1, 1, 2]
    if 4 < number % 100 < 20:
        index = 2
    else:
        index = cases[min(number % 10, 5)]
    return titles[index]


pluralize_days = partial(pluralize, titles=('день', 'дня', 'дней'))


def convert_size(size_bytes):  # pragma: no cover
    """Конвертирует размер"""
    if size_bytes == 0:
        return "0 B"
    size_name = ("B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB")
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    return "%s %s" % (s, size_name[i])


@contextlib.contextmanager
def suppress_autotime(model, fields):  # pragma: no cover
    _original_values = {}
    for field in model._meta.local_fields:
        if field.name in fields:
            _original_values[field.name] = {
                'auto_now': field.auto_now,
                'auto_now_add': field.auto_now_add,
            }
            field.auto_now = False
            field.auto_now_add = False
    try:
        yield
    finally:
        for field in model._meta.local_fields:
            if field.name in fields:
                field.auto_now = _original_values[field.name]['auto_now']
                field.auto_now_add = _original_values[field.name]['auto_now_add']


def execute_raw_sql(sql_query):
    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        columns = [col[0] for col in cursor.description]
        results = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]
    return results


def measure_time(func):
    if asyncio.iscoroutinefunction(func):
        async def wrapper(*args, **kwargs):
            start_time = time.time()  # Записываем время начала
            result = await func(*args, **kwargs)
            end_time = time.time()  # Записываем время окончания
            elapsed_time = end_time - start_time
            print(f"Функция '{func.__name__}' выполнилась за {elapsed_time:.6f} секунд.")
            return result
    else:
        def wrapper(*args, **kwargs):
            start_time = time.time()  # Записываем время начала
            result = func(*args, **kwargs)
            end_time = time.time()  # Записываем время окончания
            elapsed_time = end_time - start_time
            print(f"Функция '{func.__name__}' выполнилась за {elapsed_time:.6f} секунд.")
            return result
    return wrapper


def is_valid_uuid(value: str) -> bool:
    try:
        from uuid import UUID
        UUID(value)
        return True
    except ValueError:
        return False


def is_has_kwargs(func) -> bool:
    import inspect
    sig = inspect.signature(func)
    return any(sig.kind == inspect.Parameter.VAR_KEYWORD for sig in sig.parameters.values())


def uuid_to_color(uuid_str: str, as_rgba: bool = False, opacity: float = 1.0) -> str:
    """
    Преобразует UUID в цвет в формате HEX (#RRGGBB).

    Функция принимает строку UUID и возвращает соответствующий цвет в формате HEX.
    Это полезно для визуального различения объектов на основе их UUID.

    Args:
        uuid_str (str): Строка UUID для преобразования в цвет.
        as_rgba (bool):
        opacity (float):

    Returns:
        str: Цвет в формате HEX (#RRGGBB).
    """
    # Проверяем, является ли строка валидным UUID
    if not is_valid_uuid(uuid_str):
        # Если строка не является валидным UUID, возвращаем дефолтный цвет
        return "#000000"

    # Импортируем UUID для работы с UUID
    from uuid import UUID

    # Преобразуем строку в объект UUID
    uuid_obj = UUID(uuid_str)

    # Получаем байты UUID и берем первые 3 байта для RGB
    uuid_bytes = uuid_obj.bytes

    # Используем первые 3 байта для создания цвета
    r = uuid_bytes[0]
    g = uuid_bytes[1]
    b = uuid_bytes[2]
    if as_rgba:
        return f"rgba({r}, {g}, {b}, {opacity})"
    # Формируем HEX-строку цвета
    color_hex = f"#{r:02x}{g:02x}{b:02x}"

    return color_hex


def render_badge(
        value: str,
        level: Literal['info', 'success', 'warning', 'warning'] = 'info',
        large: bool = False,
        class_list: list[str] = None,
        return_ctx: bool = False,
):
    class_list = class_list or []
    if large:
        class_list.append('large')
    ctx = {
        'value': value,
        'level': level,
        'class_list': class_list
    }
    if return_ctx:
        return ctx
    return render_to_string('admin_helpers/badge.html', ctx)