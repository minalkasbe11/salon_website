from django.urls import path
from rest_framework.routers import DefaultRouter
from .api import AIStatusView, ChatMessageView, ConversationViewSet

router = DefaultRouter()
router.register('conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('message/', ChatMessageView.as_view(), name='chat-message'),
    path('status/', AIStatusView.as_view(), name='chat-ai-status'),
] + router.urls
