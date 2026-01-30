import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, TrendingUp } from 'lucide-react';
import { API } from '../App';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';

export default function CustomerRecords() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data.customers);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-8" data-testid="customer-records-page">
      <Header title="Customers" subtitle="Customer database & history" />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glassmorphism rounded-xl p-4 md:p-6" data-testid="total-customers-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="text-primary" size={24} />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">{customers.length}</p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Total Customers</p>
          </div>

          <div className="glassmorphism rounded-xl p-4 md:p-6" data-testid="total-visits-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="text-accent" size={24} />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-heading font-bold text-white">
              {customers.reduce((sum, c) => sum + c.visit_count, 0)}
            </p>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider mt-1">Total Visits</p>
          </div>
        </div>

        {/* Customers List */}
        <div className="glassmorphism rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-heading font-bold uppercase mb-4 text-white">All Customers</h2>
          
          {customers.length > 0 ? (
            <div className="space-y-3">
              {customers.map((customer, index) => (
                <div
                  key={index}
                  className="bg-slate-900/30 rounded-lg p-4 border border-slate-800"
                  data-testid={`customer-card-${index}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-white text-base md:text-lg">{customer.customer_name}</p>
                      <p className="text-sm text-slate-400">{customer.customer_mobile}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Last visit: {customer.last_booking_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-2">
                        <p className="text-xs font-bold text-primary uppercase">
                          {customer.visit_count} {customer.visit_count === 1 ? 'Visit' : 'Visits'}
                        </p>
                      </div>
                      <p className="text-sm text-slate-400">
                        Total Spent: <span className="text-accent font-bold">₹{customer.total_spent?.toLocaleString() || 0}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-600 mb-3" size={48} />
              <p className="text-slate-400" data-testid="no-customers-message">No customers yet</p>
            </div>
          )}
        </div>
      </div>

      <MobileNav role={user?.role} />
    </div>
  );
}