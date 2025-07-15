from datetime import timedelta
from typing import Literal

from django import template
from django.urls import reverse, NoReverseMatch
from django.utils.dateparse import parse_datetime

from admin_helpers.utils import pluralize, render_badge

register = template.Library()


@register.filter(name='qs_order')
def query_set_order(qs, ordering):
    try:
        ordering = ordering.split(',')
        return qs.order_by(*ordering)
    except Exception:
        return qs


@register.inclusion_tag('admin_helpers/copy_inline_btn.html', name='copy_inline_btn')
def insert_copy_inline_button(value, copy_value=None):
    return {'value': value, 'copy_value': copy_value}


@register.filter(name='repr_object')
def repr_object(obj):
    return repr(obj)


@register.filter(name='parse_datetime')
def parse_date_value(value):
    try:
        return parse_datetime(value)
    except Exception:
        return ''


@register.filter(name='str_split')
def split_string(value: str, sep=' '):
    return value.split(sep)


@register.filter(name='str_rsplit')
def rsplit_string(value: str, sep=' '):
    return value.rsplit(sep)


@register.simple_tag(name='url_safe')
def safe_url_reverse(view_name, *args, **kwargs):
    try:
        return reverse(view_name, args=args, kwargs=kwargs)
    except NoReverseMatch:
        return '#'


@register.filter
def format_time(value):
    """
    Форматирование времени из объекта timedelta в человеко-читаемом формате.
    Пример: "1 минута 51 секунда".
    """
    if not isinstance(value, timedelta):
        try:
            value = timedelta(seconds=int(value))
        except (ValueError, TypeError):
            return value

    total_seconds = int(value.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60

    # Формируем человеко-читаемое время
    parts = []
    if hours > 0:
        parts.append(f'{hours} {pluralize(hours, ('час', 'часа', 'часов'))}')
    if minutes > 0:
        parts.append(f'{minutes} {pluralize(minutes, ('минута', 'минуты', 'минут'))}')
    if seconds > 0 or (hours == 0 and minutes == 0):
        parts.append(f'{seconds} {pluralize(seconds, ('секунда', 'секунды', 'секунд'))}')

    return " ".join(parts)


@register.inclusion_tag('admin_helpers/badge.html', name='badge')
def insert_badge(
        value: str,
        level: Literal['info', 'success', 'warning', 'warning'] = 'info',
        large: bool = False,
        class_list: list[str] = None
):
    return render_badge(value, level, large, class_list=class_list, return_ctx=True)
