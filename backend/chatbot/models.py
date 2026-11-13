
from django.db import models
from core.models import BaseModel, User


class ChatSession(BaseModel):
    """Technical container for a chat visit — works for guests (user=null) and logged-in customers alike."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='chat_sessions')
    session_key = models.CharField(max_length=64, unique=True)

    def __str__(self):
        return f"Session {self.session_key} ({self.user or 'guest'})"

    class Meta:
        db_table = 'chat_session'
        ordering = ['-created_at']


class Conversation(BaseModel):
    """Titled, resumable thread shown in 'Conversation History' — always owned by a logged-in user."""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='conversations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=150, default='New Chat')

    def __str__(self):
        return f"{self.title} - {self.user}"

    class Meta:
        db_table = 'conversation'
        ordering = ['-updated_at']


class Message(BaseModel):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.sender}: {self.content[:40]}"

    class Meta:
        db_table = 'message'
        ordering = ['created_at']


class FAQ(BaseModel):
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('booking', 'Booking'),
        ('pricing', 'Pricing'),
        ('policy', 'Policy'),
        ('membership', 'Membership'),
        ('timings', 'Timings'),
    ]

    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    display_order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.question

    class Meta:
        db_table = 'faq'
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
        ordering = ['category', 'display_order']


class UnansweredQuery(BaseModel):
    """Logs every message the assistant couldn't confidently answer (hit FALLBACK),
    so the salon owner can spot real gaps and add FAQ/KnowledgeBase content over time —
    the chatbot's content improves from real usage, without any model training involved."""
    message = models.TextField()
    is_reviewed = models.BooleanField(default=False, help_text="Mark true once you've added content covering this.")

    def __str__(self):
        return self.message[:60]

    class Meta:
        db_table = 'unanswered_query'
        verbose_name_plural = 'Unanswered Queries'
        ordering = ['is_reviewed', '-created_at']


class KnowledgeBase(BaseModel):
    topic = models.CharField(max_length=150)
    content = models.TextField()
    keywords = models.CharField(max_length=255, blank=True, help_text="Comma-separated keywords for simple retrieval matching")

    def __str__(self):
        return self.topic

    class Meta:
        db_table = 'knowledge_base'
        verbose_name_plural = 'Knowledge Base'
        ordering = ['topic']
