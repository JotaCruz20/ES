from .views import FinishRequest, AddImageIndex, GetItems, StartRequest, GetPedidos, GetPrice, Login, CreateUser
from django.urls import path

urlpatterns = [  # Adiciona endpoints aos ips
    path('finishRequest', FinishRequest.as_view()),
    path('items', GetItems.as_view()),
    path('addPhoto', StartRequest.as_view()),
    path('getPedidos/<token>', GetPedidos.as_view()),
    path('getPrice', GetPrice.as_view()),
    path('login', Login.as_view()),
    path('createUser', CreateUser.as_view()),
    path('trainPhotos', AddImageIndex.as_view())
]
