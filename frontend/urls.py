from django.urls import path
from .views import index

urlpatterns = [  # Cria endpoints
    path('', index),
    path('pedido', index),
    path('login', index),
    path('staff', index)
]