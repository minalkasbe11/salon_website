import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../api/services';
import { getStaff } from '../api/staff';
import { getAvailableSlots, createAppointment } from '../api/appointments';
import FormField, { inputClass } from '../components/FormField';

const todayISO = () => new Date().toISOString().slice(0, 10);
const formatPrice = (price) => `₹${Number(price).toLocaleString('en-IN')}`;

export default function Booking() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');

  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState('');

  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getServices().then(setServices).catch(() => setServices([]));
  }, []);

  // Service changed — reset stylist/slot choice, load stylists who offer it
  useEffect(() => {
    setStaffId('');
    setSelectedSlot('');
    if (!serviceId) {
      setStaffList([]);
      return;
    }
    getStaff(serviceId).then(setStaffList).catch(() => setStaffList([]));
  }, [serviceId]);

  // Service, date, or stylist changed — reload the slot grid
  useEffect(() => {
    setSelectedSlot('');
    if (!serviceId || !date) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    getAvailableSlots({ service: serviceId, date, staff: staffId || undefined })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [serviceId, date, staffId]);

  const selectedService = services.find((s) => String(s.id) === String(serviceId));
  const selectedStaff = staffList.find((s) => String(s.id) === String(staffId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createAppointment({
        service: serviceId,
        staff: staffId || undefined,
        appointment_date: date,
        start_time: selectedSlot,
        notes,
      });
      navigate('/dashboard/appointments', { state: { justBooked: true } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || 'Something went wrong. Please try again.');
      // the slot we thought was free may have just been taken — refresh the grid
      getAvailableSlots({ service: serviceId, date, staff: staffId || undefined }).then(setSlots).catch(() => {});
      setSelectedSlot('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="py-14 border-b border-ink/[0.14]">
        <div className="container">
          <span className="eyebrow">Reserve Your Chair</span>
          <h1>Book an Appointment</h1>
          <p className="text-ink-soft text-[1.05rem]">
            Pick a service, choose a stylist or let us auto-assign, then select a time. Payment is at the salon.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid lg:grid-cols-[1fr_340px] gap-12">
          <form onSubmit={handleSubmit}>
            <FormField label="Service">
              <select required className={inputClass} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.duration_minutes} min
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Stylist">
              <select
                className={inputClass}
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                disabled={!serviceId}
              >
                <option value="">Any Available (Auto-assign)</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.specialty}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Date">
              <input
                type="date" required min={todayISO()} className={inputClass}
                value={date} onChange={(e) => setDate(e.target.value)}
              />
            </FormField>

            <FormField label="Available Time Slots">
              {!serviceId && <p className="text-ink-soft text-sm">Pick a service first.</p>}
              {serviceId && slotsLoading && <p className="text-ink-soft text-sm">Loading slots…</p>}
              {serviceId && !slotsLoading && slots.length === 0 && (
                <p className="text-ink-soft text-sm">No slots available on this date — try another day.</p>
              )}
              {slots.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-2">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`border py-2.5 px-1.5 text-center font-mono text-[0.8rem] rounded-brand transition-colors
                        ${!slot.available ? 'opacity-35 line-through cursor-not-allowed border-ink/[0.14]' : 'cursor-pointer border-ink/[0.14] hover:border-rose-deep'}
                        ${selectedSlot === slot.time ? 'bg-ink text-paper border-ink' : 'bg-paper'}`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </FormField>

            <FormField label="Notes (optional)">
              <textarea
                rows={3} className={inputClass} placeholder="Any special request for your stylist"
                value={notes} onChange={(e) => setNotes(e.target.value)}
              />
            </FormField>

            {error && <p className="text-rose-deep text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={!selectedSlot || submitting}
              className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </form>

          <aside className="border border-ink/[0.14] bg-paper-dim p-6.5 self-start sticky top-24">
            <h3 className="mb-4.5">Booking Summary</h3>
            <div className="flex justify-between font-mono text-[0.85rem] py-2.5 border-b border-dashed border-ink/[0.14]">
              <span>Service</span><span>{selectedService?.name || '—'}</span>
            </div>
            <div className="flex justify-between font-mono text-[0.85rem] py-2.5 border-b border-dashed border-ink/[0.14]">
              <span>Stylist</span><span>{selectedStaff?.name || (staffId ? '—' : 'Any available')}</span>
            </div>
            <div className="flex justify-between font-mono text-[0.85rem] py-2.5 border-b border-dashed border-ink/[0.14]">
              <span>Time</span><span>{selectedSlot || '—'}</span>
            </div>
            <div className="flex justify-between font-mono text-[0.85rem] py-2.5 border-b border-dashed border-ink/[0.14]">
              <span>Est. Price</span><span>{selectedService ? formatPrice(selectedService.price) : '—'}</span>
            </div>
            <div className="flex justify-between font-mono text-[0.85rem] py-2.5">
              <span>Payment</span><span>Pay at Salon</span>
            </div>
            <p className="text-ink-soft text-[0.8rem] mt-4 mb-0">
              You'll receive a confirmation once your booking is placed. Payment is collected in-studio after your service.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
