import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from .models import ChatSession, Conversation, Message
from .serializers import ConversationSerializer, ConversationDetailSerializer
from .ai_client import AIUnavailable, get_ai_reply, get_ai_status


def make_title(message):
    title = message.strip().splitlines()[0]
    return title[:60] + ('…' if len(title) > 60 else '')


HISTORY_LIMIT = 8


def sanitize_history(raw):
    """Guests have no server-side conversation, so their recent turns arrive from the
    client on every request — treat that input as untrusted (shape + length only)."""
    if not isinstance(raw, list):
        return []
    cleaned = []
    for item in raw[-HISTORY_LIMIT:]:
        if not isinstance(item, dict):
            continue
        sender, content = item.get('sender'), item.get('content')
        if sender not in ('user', 'assistant') or not isinstance(content, str):
            continue
        cleaned.append({'sender': sender, 'content': content[:500]})
    return cleaned


class ChatMessageView(APIView):
    """The core chat endpoint — works for guests (no persistence) and logged-in
    users (saved as a Conversation, so it shows up in Conversation History)."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]  # runs model inference — worth guarding from spam

    def post(self, request):
        message = (request.data.get('message') or '').strip()
        if not message:
            return Response({'detail': 'message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user.is_authenticated else None

        conversation_id = request.data.get('conversation_id')
        conversation = None
        if user and conversation_id:
            conversation = Conversation.objects.filter(id=conversation_id, user=user).first()

        if conversation:
            # The DB is the source of truth once a conversation exists — no need to
            # trust client-supplied history for a logged-in user.
            recent = list(conversation.messages.order_by('-created_at')[:HISTORY_LIMIT])
            history = [{'sender': m.sender, 'content': m.content} for m in reversed(recent)]
        else:
            history = sanitize_history(request.data.get('history'))

        # Replies come only from the local AI model. If it can't answer, nothing is saved
        # and the customer gets a clear message (not connected / busy / too slow).
        try:
            reply = get_ai_reply(message, user=user, history=history)
        except AIUnavailable as exc:
            return Response(
                {'detail': exc.message, 'code': exc.kind},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not user:
            return Response({'conversation_id': None, 'reply': reply})

        if not conversation:
            session = ChatSession.objects.create(user=user, session_key=str(uuid.uuid4()))
            conversation = Conversation.objects.create(session=session, user=user, title=make_title(message))

        Message.objects.create(conversation=conversation, sender='user', content=message)
        Message.objects.create(conversation=conversation, sender='assistant', content=reply, metadata={'source': 'ai'})
        conversation.save(update_fields=['updated_at'])  # bump to top of "recent" ordering

        return Response({'conversation_id': conversation.id, 'reply': reply, 'title': conversation.title})


class AIStatusView(APIView):
    """Lets the chat widget show whether the AI assistant is connected."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(get_ai_status())


class ConversationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user, is_delete=False)

    def get_serializer_class(self):
        return ConversationDetailSerializer if self.action == 'retrieve' else ConversationSerializer
