from django.contrib import admin
from .models import ChatSession, Conversation, Message, FAQ, KnowledgeBase, UnansweredQuery

admin.site.register(ChatSession)
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(FAQ)
admin.site.register(KnowledgeBase)


@admin.register(UnansweredQuery)
class UnansweredQueryAdmin(admin.ModelAdmin):
    list_display = ['message', 'is_reviewed', 'created_at']
    list_editable = ['is_reviewed']
    list_filter = ['is_reviewed']
