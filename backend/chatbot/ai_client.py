"""Calls the local AI service (FastAPI + Gemma).

The salon chatbot replies ONLY through this service. If it can't answer, AIUnavailable
is raised with a message that is safe to show the customer.
Uses only the Python standard library, so nothing extra needs installing.
"""
import json
import logging
import time
import urllib.error
import urllib.request

from django.conf import settings

from .ai_context import build_question_facts, build_system_prompt

logger = logging.getLogger(__name__)

MAX_HISTORY_CHARS = 2000  # per earlier message, keeps the prompt inside the model's context
STATUS_CACHE_SECONDS = 10

MESSAGES = {
    'not_connected': "AI assistant is not connected right now. Please try again later.",
    'loading': "AI assistant is starting up. Please try again in a minute.",
    'busy': "AI assistant is busy. Please try again in a moment.",
    'timeout': "AI assistant is taking too long. Please try again.",
    'too_long': "Your message is too long for the AI assistant. Please shorten it.",
    'disabled': "AI assistant is turned off right now.",
    'error': "AI assistant could not answer. Please try again.",
}


class AIUnavailable(Exception):
    def __init__(self, kind):
        self.kind = kind
        self.message = MESSAGES.get(kind, MESSAGES['error'])
        super().__init__(self.message)


def _config():
    cfg = getattr(settings, 'AI_SERVICE', {})
    return {
        'enabled': cfg.get('ENABLED', True),
        'url': cfg.get('URL', 'http://127.0.0.1:8001/api/v1').rstrip('/'),
        'api_key': cfg.get('API_KEY', ''),
        'timeout': float(cfg.get('TIMEOUT', 120)),
    }


def _headers(cfg):
    headers = {'Accept': 'application/json', 'X-User-Id': 'salon'}
    if cfg['api_key']:
        headers['X-API-Key'] = cfg['api_key']
    return headers


def _is_timeout(exc):
    return isinstance(exc, TimeoutError) or isinstance(getattr(exc, 'reason', None), TimeoutError)


def _error_kind(exc):
    """Map a urllib failure to one of the MESSAGES keys."""
    if isinstance(exc, urllib.error.HTTPError):
        detail = ''
        try:
            detail = str(json.loads(exc.read().decode('utf-8')).get('detail', ''))
        except Exception:
            pass
        logger.warning('AI service returned %s: %s', exc.code, detail)
        if exc.code == 503:
            return 'busy' if 'busy' in detail.lower() else 'loading'
        if exc.code == 413:
            return 'too_long'
        return 'error'
    if _is_timeout(exc):
        logger.warning('AI service timed out')
        return 'timeout'
    logger.warning('AI service not reachable: %s', exc)
    return 'not_connected'


def get_ai_reply(message, user=None, history=None):
    """Returns the AI's reply text, or raises AIUnavailable."""
    cfg = _config()
    if not cfg['enabled']:
        raise AIUnavailable('disabled')

    turns = []
    for h in history or []:
        role = h.get('sender')
        content = (h.get('content') or '').strip()
        if role in ('user', 'assistant') and content:
            turns.append({'role': role, 'content': content[:MAX_HISTORY_CHARS]})

    body = {
        'system_prompt': build_system_prompt(),
        'facts': build_question_facts(message, user),
        'history': turns[-20:],
        'message': message[:4000],
    }
    req = urllib.request.Request(
        cfg['url'] + '/generate',
        data=json.dumps(body, ensure_ascii=False).encode('utf-8'),
        headers={**_headers(cfg), 'Content-Type': 'application/json'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=cfg['timeout']) as resp:
            result = json.loads(resp.read().decode('utf-8'))
    except (urllib.error.URLError, OSError) as exc:  # HTTPError and timeouts are subclasses
        raise AIUnavailable(_error_kind(exc)) from exc
    except ValueError as exc:  # not JSON
        logger.warning('AI service sent an invalid response')
        raise AIUnavailable('error') from exc

    reply = (result.get('reply') or '').strip()
    if not reply:
        raise AIUnavailable('error')
    return reply


_status_cache = {'at': 0.0, 'value': None}


def get_ai_status():
    """{'connected': bool, 'state': ..., 'message': str}. Cached for a few seconds,
    since every open chat window asks for it."""
    now = time.monotonic()
    if _status_cache['value'] and now - _status_cache['at'] < STATUS_CACHE_SECONDS:
        return _status_cache['value']

    cfg = _config()
    if not cfg['enabled']:
        state = 'disabled'
    else:
        req = urllib.request.Request(cfg['url'] + '/health', headers=_headers(cfg), method='GET')
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                health = json.loads(resp.read().decode('utf-8'))
            state = 'connected' if health.get('model_ready') else 'loading'
        except Exception:
            state = 'not_connected'

    value = {
        'connected': state == 'connected',
        'state': state,
        'message': 'AI assistant is online.' if state == 'connected' else MESSAGES[state],
    }
    _status_cache.update(at=now, value=value)
    return value
