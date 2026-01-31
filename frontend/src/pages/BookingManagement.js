import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';
import { format } from 'date-fns';

export default function BookingManagement() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_mobile: '',
    customer_email: '',
    total_amount: '',
    advance_paid: '',
    payment_mode: 'Cash',
  });

  useEffect(() => {
    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/slots/available?date=${selectedDate}`);
      setSlots(response.data.slots);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot) => {
    if (!slot.available) {
      toast.error('Slot already booked');
      return;
    }
    setSelectedSlot(slot);
    setFormData({ ...formData, total_amount: slot.price.toString() });
    setShowBookingForm(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    if (parseFloat(formData.advance_paid) > parseFloat(formData.total_amount)) {
      toast.error('Advance cannot be greater than total amount');
      return;
    }

    try {
      await axios.post(`${API}/bookings`, {
        date: selectedDate,
        slot_time: selectedSlot.time,
        customer_name: formData.customer_name,
        customer_mobile: formData.customer_mobile,
        customer_email: formData.customer_email,
        total_amount: parseFloat(formData.total_amount),
        advance_paid: parseFloat(formData.advance_paid),
        payment_mode: formData.payment_mode,
      });
      
      toast.success('Booking confirmed! Customer will receive confirmation message.');
      setShowBookingForm(false);
      setSelectedSlot(null);
      setFormData({
        customer_name: '',
        customer_mobile: '',
        customer_email: '',
        total_amount: '',
        advance_paid: '',
        payment_mode: 'Cash',
      });
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="booking-management-page">
      <Header title="Book Slot" subtitle="Select date and available slot" />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Date Selector */}
        <div className="glassmorphism rounded-xl p-4 md:p-6 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3 uppercase tracking-wider">
            <CalendarIcon className="inline mr-2" size={18} />
            Select Date
          </label>
          <input
            type="date"
            data-testid="date-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
          />
        </div>

        {/* Slots Grid */}
        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-heading font-bold uppercase mb-4 text-white flex items-center gap-2">
            <Clock size={24} />
            Available Slots
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
              {slots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.available}
                  data-testid={`slot-${slot.time}`}
                  className={`
                    p-3 md:p-4 rounded-lg font-bold text-xs md:text-sm uppercase tracking-wider transition-all slot-item
                    ${slot.available 
                      ? 'bg-green-500/10 text-green-400 border-2 border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 cursor-pointer' 
                      : 'bg-red-500/10 text-red-400 border-2 border-red-500/30 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  <div className="font-heading font-bold">{slot.time}</div>
                  <div className="text-[10px] mt-1">₹{slot.price}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400" data-testid="no-slots-message">No slots configured. Please set up turf settings first.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="booking-form-modal">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-heading font-bold uppercase mb-2 text-primary">New Booking</h2>
            <p className="text-sm text-slate-400 mb-6">{selectedDate} at {selectedSlot.time}</p>
            
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Customer Name</label>
                <input
                  type="text"
                  data-testid="customer-name-input"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  data-testid="customer-mobile-input"
                  value={formData.customer_mobile}
                  onChange={(e) => setFormData({ ...formData, customer_mobile: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Email (Optional)</label>
                <input
                  type="email"
                  data-testid="customer-email-input"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  placeholder="customer@example.com"
                />
                <p className="text-xs text-slate-500 mt-1">For booking confirmation via email</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Total Amount</label>
                <input
                  type="number"
                  data-testid="total-amount-input"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Advance Paid</label>
                <input
                  type="number"
                  data-testid="advance-paid-input"
                  value={formData.advance_paid}
                  onChange={(e) => setFormData({ ...formData, advance_paid: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Payment Mode</label>
                <select
                  data-testid="payment-mode-select"
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="confirm-booking-button"
                  className="flex-1 py-2 px-4 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all btn-primary"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedSlot(null);
                  }}
                  data-testid="cancel-booking-button"
                  className="flex-1 py-2 px-4 bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileNav role={user?.role} />
    </div>
  );
}