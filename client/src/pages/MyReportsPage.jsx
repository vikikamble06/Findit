import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemsAPI } from '../services/api';
import { ITEM_STATUS_LABELS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Package,
  PlusCircle,
  Sparkles,
  CheckCircle,
  Trash2,
  Calendar,
  MapPin,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export default function MyReportsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    loadMyReports();
  }, [user]);

  const loadMyReports = async () => {
    try {
      setLoading(true);
      const res = await itemsAPI.getItems({ reporter: user?._id });
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load reports:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (itemId) => {
    try {
      const res = await itemsAPI.updateItem(itemId, { status: 'resolved' });
      if (res.data.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === itemId ? { ...i, status: 'resolved' } : i))
        );
        setActionMessage('Item marked as resolved! 🎉');
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve report');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to withdraw/delete this report?')) return;

    try {
      const res = await itemsAPI.deleteItem(itemId);
      if (res.data.success) {
        setItems((prev) => prev.filter((i) => i._id !== itemId));
        setActionMessage('Report withdrawn successfully.');
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report');
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manage My Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status, mark items as resolved, and review calculated matches for reports you created.
          </p>
        </div>

        <Link
          to="/report"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Campus Report</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-semibold animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilterType('lost')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'lost' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-rose-600'
          }`}
        >
          Lost Items ({items.filter((i) => i.type === 'lost').length})
        </button>
        <button
          onClick={() => setFilterType('found')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterType === 'found' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
          }`}
        >
          Found Items ({items.filter((i) => i.type === 'found').length})
        </button>
      </div>

      {/* Reports List */}
      {loading ? (
        <LoadingSpinner message="Loading your reports..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No reports in this category"
          description="You don't have any matching reports right now."
          actionLabel="File a New Report"
          onAction={() => window.location.assign('/report')}
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const statusInfo = ITEM_STATUS_LABELS[item.status] || ITEM_STATUS_LABELS.open;
            const isLost = item.type === 'lost';
            const hasImage = item.images && item.images.length > 0;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 card-hover"
              >
                {/* Left Info with Thumbnail */}
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {hasImage ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{item.category}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.campusZone}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to={`/items/${item._id}`}
                    className="flex-1 md:flex-none px-3.5 py-2 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View & Matches</span>
                  </Link>

                  {item.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(item._id)}
                      className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      title="Mark as successfully returned / found"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Withdraw / Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
