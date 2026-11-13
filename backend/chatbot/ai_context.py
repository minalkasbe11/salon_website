"""Builds what the AI is allowed to know for each chat message.

Two parts:
- build_system_prompt(): instructions + salon-wide facts. Identical for every customer
  on a given day, so the AI service can reuse it between requests (much faster).
- build_question_facts(): facts only for this message — the current time, (for a
  logged-in customer) THEIR OWN bookings, and matching entries when lists are too long
  to send whole. Matching is simple word overlap: no extra packages needed.

Privacy: a customer's data is always looked up from request.user, never from what
they typed, so nobody can ask for someone else's bookings.
"""
import re
from datetime import datetime
from zoneinfo import ZoneInfo

from django.conf import settings

from core.models import Appointment, Service, ServiceCategory, Staff
from website.models import BusinessHours, Offer, SalonInformation

from .models import FAQ, KnowledgeBase

SALON_TZ = ZoneInfo(getattr(settings, 'SALON_TIME_ZONE', 'Asia/Kolkata'))

# Above these sizes the full list would not fit the model's context window, so only
# the entries matching the question are sent (see build_question_facts).
MAX_SERVICES_IN_PROMPT = 40
MAX_FAQS_IN_PROMPT = 12
MAX_KB_CHARS_IN_PROMPT = 2000

UPCOMING_STATUSES = ('pending', 'confirmed')
GENDER_LABEL = {'male': 'men', 'female': 'women', 'unisex': 'everyone'}


def salon_now():
    return datetime.now(SALON_TZ)


def format_price(price):
    price = float(price)
    return f"₹{int(price):,}" if price == int(price) else f"₹{price:,.2f}"


def _time(t):
    return t.strftime('%I:%M %p').lstrip('0') if t else '?'


def _short(text, limit):
    text = ' '.join((text or '').split())
    return text if len(text) <= limit else text[: limit - 1].rstrip() + '…'


def _active(qs):
    return qs.filter(is_active=True, is_delete=False)


# ---------- salon-wide facts (same for every customer) ----------

def _salon_info():
    info = _active(SalonInformation.objects).first()
    if not info:
        return "Maison Vera", ["Salon name: Maison Vera"]
    lines = [f"Salon name: {info.name}"]
    if info.tagline:
        lines.append(f"Tagline: {info.tagline}")
    if info.address:
        lines.append(f"Address: {_short(info.address, 200)}")
    if info.phone:
        lines.append(f"Phone: {info.phone}")
    if info.whatsapp_number:
        lines.append(f"WhatsApp: {info.whatsapp_number}")
    if info.email:
        lines.append(f"Email: {info.email}")
    return info.name, lines


def _hours():
    rows = list(_active(BusinessHours.objects).order_by('id'))
    if not rows:
        return ["Opening hours: not available, ask the customer to check the Contact page."]
    labels = dict(BusinessHours.DAY_CHOICES)
    lines = ["Opening hours:"]
    for h in rows:
        day = labels.get(h.day_of_week, h.day_of_week)
        lines.append(f"- {day}: Closed" if h.is_closed else f"- {day}: {_time(h.open_time)} to {_time(h.close_time)}")
    return lines


def _service_line(s, with_description):
    line = f"- {s.name} | {format_price(s.price)} | {s.duration_minutes} min | for {GENDER_LABEL.get(s.gender, 'everyone')}"
    if with_description and s.description:
        line += f" | {_short(s.description, 80)}"
    return line


def _all_services():
    return list(_active(Service.objects).select_related('category').order_by('category__display_order', 'category__name', 'name'))


def _services_section(services):
    if not services:
        return ["Services: none listed yet."]
    if len(services) > MAX_SERVICES_IN_PROMPT:
        cats = _active(ServiceCategory.objects)
        names = ', '.join(c.name for c in cats)
        return [f"Service categories: {names}.",
                "Matching services with prices are given in the facts for each question."]
    lines = ["Services (name | price | duration | for):"]
    with_description = len(services) <= 25
    current = None
    for s in services:
        if s.category.name != current:
            current = s.category.name
            lines.append(f"{current}:")
        lines.append(_service_line(s, with_description))
    return lines


def _offers(today):
    offers = _active(Offer.objects).filter(valid_from__lte=today, valid_until__gte=today).select_related('category')[:6]
    if not offers:
        return ["Current offers: none right now."]
    lines = ["Current offers:"]
    for o in offers:
        discount = f" ({o.discount_percentage}% off)" if o.discount_percentage else ""
        on = f" on {o.category.name}" if o.category else ""
        lines.append(f"- {o.title}{discount}{on}, valid until {o.valid_until:%d %b %Y}: {_short(o.description, 120)}")
    return lines


def _stylists():
    staff = _active(Staff.objects).select_related('user')[:10]
    if not staff:
        return ["Stylists: not listed."]
    lines = ["Stylists:"]
    for s in staff:
        name = s.user.get_full_name() or s.user.username
        lines.append(f"- {name}: {s.specialty or 'stylist'}, {s.experience_years} years experience")
    return lines


def _faqs_section(faqs):
    if not faqs or len(faqs) > MAX_FAQS_IN_PROMPT:
        return []
    lines = ["Frequently asked questions:"]
    lines += [f"- Q: {f.question}\n  A: {_short(f.answer, 300)}" for f in faqs]
    return lines


def _kb_fits(kb):
    return sum(len(_short(k.content, 400)) for k in kb) <= MAX_KB_CHARS_IN_PROMPT


def _kb_section(kb):
    if not kb or not _kb_fits(kb):
        return []
    return ["Salon notes:"] + [f"- {k.topic}: {_short(k.content, 400)}" for k in kb]


def build_system_prompt():
    today = salon_now().date()
    name, info_lines = _salon_info()
    services = _all_services()
    faqs = list(_active(FAQ.objects))
    kb = list(_active(KnowledgeBase.objects))

    instructions = f"""You are the {name} AI Salon Assistant, chatting with customers on the salon's website.

Rules:
- Help only with this salon, its services, bookings, and beauty, hair, skin, grooming and styling questions. For anything else, politely say you can only help with salon topics.
- For services, prices, durations, offers, hours, stylists, contact details and bookings, use ONLY the salon facts below and the facts given with the question. Never invent a service, price, offer, time, stylist or booking. If something is not in the facts, say you don't have that information and suggest calling or WhatsApping the salon.
- When the customer describes a need (dry hair, wedding, budget, an outfit), recommend at most 3 matching services from the list, each with price and duration, and say briefly why it fits.
- Style tips (makeup, hairstyle or nail colours that suit an outfit) may come from your general knowledge, but any service you recommend must be from the list.
- You cannot book, cancel or change appointments. For a new booking, tell the customer to use the Book Appointment page. To see or manage existing bookings, tell them to open My Appointments in their dashboard.
- Talk about bookings only using the customer's own booking facts given with the question. Never reveal anything about other customers. If the customer is not logged in and asks about their bookings, ask them to log in first.
- Do not give medical advice. For allergies, infections, heavy hair loss or other skin or scalp problems, suggest seeing a dermatologist.
- Keep replies short and friendly: a few sentences or a short list using "-". Plain text only: no tables, no ** or # symbols. Write prices with ₹.

Salon facts (today is {today:%A, %d %B %Y}):"""

    sections = [
        info_lines,
        _hours(),
        ["How to book: open the Book Appointment page, choose a service, choose a stylist or Any Available, "
         "pick a date and a free time slot from the live calendar, and confirm. The customer must be logged in to confirm."],
        _services_section(services),
        _offers(today),
        _stylists(),
        _faqs_section(faqs),
        _kb_section(kb),
    ]
    body = "\n\n".join("\n".join(s) for s in sections if s)
    return f"{instructions}\n\n{body}"


# ---------- facts only for this question ----------

_WORD = re.compile(r"[\w\u0900-\u097F]+")
_STOPWORDS = frozenset(
    "the and for are you your what which how much does have with this that from can get any about "
    "price cost kya hai hain mein kaise aahe kay ahe".split()
)


def _words(text):
    return {w for w in _WORD.findall((text or '').lower()) if len(w) > 2 and w not in _STOPWORDS}


def _best_overlap(message, items, text_of, top_n):
    """Items sharing the most words with the message, best first."""
    query = _words(message)
    if not query:
        return []
    scored = [(len(query & _words(text_of(item))), i) for i, item in enumerate(items)]
    scored = [(score, i) for score, i in scored if score > 0]
    scored.sort(key=lambda pair: (-pair[0], pair[1]))
    return [items[i] for _, i in scored[:top_n]]


def _matching_faqs_and_kb(message):
    lines = []
    faqs = list(_active(FAQ.objects))
    if len(faqs) > MAX_FAQS_IN_PROMPT:
        for f in _best_overlap(message, faqs, lambda f: f.question, 3):
            lines.append(f"FAQ: {f.question}\nAnswer: {_short(f.answer, 400)}")

    kb = list(_active(KnowledgeBase.objects))
    if kb and not _kb_fits(kb):
        for k in _best_overlap(message, kb, lambda k: f"{k.topic} {k.keywords}", 2):
            lines.append(f"Salon note about {k.topic}: {_short(k.content, 600)}")
    return lines


def _matching_services(message, services):
    if len(services) <= MAX_SERVICES_IN_PROMPT:
        return []  # already in the system prompt
    matches = _best_overlap(message, services, lambda s: f"{s.name} {s.category.name} {s.description}", 10)
    if not matches:
        return []
    return ["Services that may match the question:"] + [_service_line(s, True) for s in matches]


def _appointment_line(a):
    stylist = (a.staff.user.get_full_name() or a.staff.user.username) if a.staff else 'Any available stylist'
    return (f"- {a.appointment_date:%A, %d %B %Y}, {_time(a.start_time)} to {_time(a.end_time)}: "
            f"{a.service.name} with {stylist}, status {a.get_status_display()}, payment {a.get_payment_status_display()}")


def _customer_facts(user, now):
    if user is None:
        return ["The customer is a guest (not logged in). They have no booking information here. "
                "If they ask about their own bookings, ask them to log in first."]

    name = user.get_full_name() or user.username
    lines = [f"The customer is logged in as {name}. Loyalty points: {user.loyalty_points}."]
    mine = Appointment.objects.filter(customer=user, is_delete=False).select_related('service', 'staff__user')

    today = now.date()
    upcoming = [
        a for a in mine.filter(appointment_date__gte=today, status__in=UPCOMING_STATUSES).order_by('appointment_date', 'start_time')[:5]
        if a.appointment_date > today or a.end_time >= now.time()
    ]
    if upcoming:
        lines.append("Their upcoming bookings (earliest first):")
        lines += [_appointment_line(a) for a in upcoming]
    else:
        lines.append("They have no upcoming bookings.")

    past = mine.filter(status='completed').order_by('-appointment_date', '-start_time')[:3]
    if past:
        lines.append("Their recent completed visits:")
        lines += [_appointment_line(a) for a in past]
    return lines


def build_question_facts(message, user=None):
    now = salon_now()
    lines = [f"Current date and time: {now:%A, %d %B %Y, %I:%M %p}."]
    lines += _customer_facts(user, now)
    lines += _matching_services(message, _all_services())
    lines += _matching_faqs_and_kb(message)
    return "\n".join(lines)
