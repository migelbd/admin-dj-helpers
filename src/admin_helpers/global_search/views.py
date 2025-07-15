from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .search_helper import search, get_available_models
import logging

logger = logging.getLogger(__name__)


@login_required
@csrf_exempt
def global_search(request):
    query = request.GET.get('query')
    if not query:
        return JsonResponse({'results': []})

    # Get the model parameter if provided
    model = request.GET.get('model')

    results = search(request, query, model=model)
    return JsonResponse({'results': results})


@login_required
@csrf_exempt
def get_global_search_models(request):
    results = []
    for model in get_available_models(request):
        results.append(model.get_model_info())

    return JsonResponse({'results': results})
