import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';

export default function PaymentManagement() {
  const { user } = useAuth();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments/pending`);
      setPendingPayments(response.data.pending_payments);
    } catch (error) {
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    if (parseFloat(paymentAmount) > selectedBooking.balance_pending) {
      toast.error('Payment amount cannot exceed pending balance');
      return;
    }

    try {
      await axios.patch(`${API}/payments/${selectedBooking.created_at}/pay?amount=${paymentAmount}`);
      toast.success('Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedBooking(null);
      setPaymentAmount('');
      fetchPendingPayments();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.balance_pending, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="payment-management-page">
      <Header title="Payments" subtitle="Manage pending payments" />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Total Pending Card */}
        <div className="glassmorphism rounded-xl p-6 mb-6 border-l-4 border-yellow-400" data-testid="total-pending-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-1">Total Pending</p>
              <p className="text-3xl md:text-4xl font-heading font-bold text-yellow-400">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="text-yellow-400" size={32} />
            </div>
          </div>
        </div>

        {/* Pending Payments List */}
        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-heading font-bold uppercase mb-4 text-white">Pending Payments</h2>
          
          {pendingPayments.length > 0 ? (
            <div className="space-y-3">
              {pendingPayments.map((payment, index) => (
                <div
                  key={index}
                  className="bg-slate-900/30 rounded-lg p-4 border border-slate-800"
                  data-testid={`pending-payment-${index}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-white">{payment.customer_name}</p>
                      <p className="text-sm text-slate-400">{payment.customer_mobile}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {payment.date} at {payment.slot_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Total: ₹{payment.total_amount}</p>
                      <p className="text-sm text-accent">Paid: ₹{payment.advance_paid}</p>
                      <p className="font-heading font-bold text-yellow-400 text-lg mt-1">
                        Due: ₹{payment.balance_pending}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedBooking(payment);
                      setPaymentAmount(payment.balance_pending.toString());
                      setShowPaymentModal(true);
                    }}
                    data-testid={`record-payment-button-${index}`}
                    className="w-full py-2 px-4 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition-all text-sm"
                  >
                    Record Payment
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
              <p className="text-slate-400" data-testid="no-pending-message">No pending payments!</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="payment-modal">
          <div className="glassmorphism rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-heading font-bold uppercase mb-2 text-primary">Record Payment</h2>
            <p className="text-sm text-slate-400 mb-6">{selectedBooking.customer_name}</p>
            
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="text-white font-bold">₹{selectedBooking.total_amount}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Already Paid:</span>
                  <span className="text-accent font-bold">₹{selectedBooking.advance_paid}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-slate-700">
                  <span className="text-yellow-400 font-bold">Balance Due:</span>
                  <span className="text-yellow-400 font-heading font-bold">₹{selectedBooking.balance_pending}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider">Payment Amount</label>
                <input
                  type="number"
                  data-testid="payment-amount-input"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
                  required
                  min="1"
                  max={selectedBooking.balance_pending}
                  step="0.01"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="confirm-payment-button"
                  className="flex-1 py-2 px-4 bg-primary text-black font-bold uppercase tracking-wider rounded-lg hover:bg-accent transition-all"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedBooking(null);
                    setPaymentAmount('');
                  }}
                  data-testid="cancel-payment-button"
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