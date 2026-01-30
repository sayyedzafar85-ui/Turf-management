import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';
import { format } from 'date-fns';

export default function Reports() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/reports/daily?date=${selectedDate}`);
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchDailyReport();
    }
  }, [selectedDate]);

  const handleExportPDF = () => {
    toast.info('PDF export feature coming soon!');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="reports-page">
      <Header title="Reports" subtitle="Analytics & insights" />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Date Selector */}
        <div className="glassmorphism rounded-xl p-4 md:p-6 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3 uppercase tracking-wider">
            <Calendar className="inline mr-2" size={18} />
            Select Date
          </label>
          <div className="flex gap-3">
            <input
              type="date"
              data-testid="report-date-picker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none"
            />
            <button
              onClick={handleExportPDF}
              data-testid="export-pdf-button"
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Download size={18} />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : report ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
              <div className="glassmorphism rounded-xl p-4 md:p-6" data-testid="total-bookings-report-card">
                <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-2">Total Bookings</p>
                <p className="text-2xl md:text-4xl font-heading font-bold text-white">{report.total_bookings}</p>
              </div>

              <div className="glassmorphism rounded-xl p-4 md:p-6" data-testid="total-revenue-report-card">
                <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-2">Revenue</p>
                <p className="text-2xl md:text-4xl font-heading font-bold text-accent">₹{report.total_revenue?.toLocaleString()}</p>
              </div>

              <div className="glassmorphism rounded-xl p-4 md:p-6" data-testid="advance-collected-report-card">
                <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-2">Collected</p>
                <p className="text-2xl md:text-4xl font-heading font-bold text-primary">₹{report.total_advance_collected?.toLocaleString()}</p>
              </div>

              <div className="glassmorphism rounded-xl p-4 md:p-6" data-testid="pending-report-card">
                <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mb-2">Pending</p>
                <p className="text-2xl md:text-4xl font-heading font-bold text-yellow-400">₹{report.pending_amount?.toLocaleString()}</p>
              </div>
            </div>

            {/* Bookings List */}
            <div className="glassmorphism rounded-xl p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-heading font-bold uppercase mb-4 text-white flex items-center gap-2">
                <BarChart3 size={24} />
                Bookings Detail
              </h2>
              
              {report.bookings?.length > 0 ? (
                <div className="space-y-3">
                  {report.bookings.map((booking, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/30 rounded-lg p-4 border border-slate-800"
                      data-testid={`report-booking-${index}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-white">{booking.customer_name}</p>
                          <p className="text-sm text-slate-400">{booking.customer_mobile}</p>
                          <p className="text-xs text-slate-500 mt-1">Slot: {booking.slot_time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-heading font-bold text-white text-lg">₹{booking.total_amount}</p>
                          <p className="text-xs text-slate-400 mt-1">{booking.payment_mode}</p>
                          {booking.balance_pending > 0 && (
                            <span className="inline-block px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded mt-1">
                              Pending: ₹{booking.balance_pending}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8" data-testid="no-bookings-report-message">No bookings for this date</p>
              )}
            </div>
          </>
        ) : (
          <div className="glassmorphism rounded-xl p-12 text-center">
            <BarChart3 className="mx-auto text-slate-600 mb-3" size={48} />
            <p className="text-slate-400">Select a date to view report</p>
          </div>
        )}
      </div>

      <MobileNav role={user?.role} />
    </div>
  );
}