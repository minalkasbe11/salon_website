// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      links.style.display = links.classList.contains('open') ? 'flex' : '';
    });
  }

  // Booking page: time slot selection
  var slots = document.querySelectorAll('.slot:not(.disabled)');
  var selectedTimeEl = document.getElementById('summary-time');
  slots.forEach(function (slot) {
    slot.addEventListener('click', function () {
      slots.forEach(function (s) { s.classList.remove('selected'); });
      slot.classList.add('selected');
      if (selectedTimeEl) selectedTimeEl.textContent = slot.textContent.trim();
    });
  });

  // Booking page: live summary updates for service + stylist
  var serviceSelect = document.getElementById('service-select');
  var stylistSelect = document.getElementById('stylist-select');
  var summaryService = document.getElementById('summary-service');
  var summaryPrice = document.getElementById('summary-price');
  var summaryStylist = document.getElementById('summary-stylist');

  if (serviceSelect) {
    serviceSelect.addEventListener('change', function () {
      var opt = serviceSelect.options[serviceSelect.selectedIndex];
      if (summaryService) summaryService.textContent = opt.value ? opt.text.split(' — ')[0] : '—';
      if (summaryPrice) summaryPrice.textContent = opt.dataset.price ? '₹' + opt.dataset.price : '—';
    });
  }
  if (stylistSelect) {
    stylistSelect.addEventListener('change', function () {
      var opt = stylistSelect.options[stylistSelect.selectedIndex];
      if (summaryStylist) summaryStylist.textContent = opt.value ? opt.text : 'Any available';
    });
  }

  // Booking form submit — front-end only, no backend wired up yet
  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('This is a front-end template only — no booking has actually been submitted. Connect this form to your backend to make it functional.');
    });
  }

  // Contact form — same, front-end only
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('This is a front-end template only — connect this form to your backend to send messages.');
    });
  }
});
