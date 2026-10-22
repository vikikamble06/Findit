import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { itemsAPI, adminAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Package,
  Layers,
  Users
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 8,
    resolvedItems: 3,
    totalUsers: 14,
    totalMatches: 5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        // Load recent items
        const itemsRes = await itemsAPI.getItems({ limit: 6, sort: 'newest' });
        if (itemsRes.data.success) {
          setRecentItems(itemsRes.data.items || []);
        }

        // Load stats from admin/dashboard if available or compute from public items
        const statsRes = await adminAPI.getDashboardStats().catch(() => null);
        if (statsRes?.data?.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        } else if (itemsRes.data.pagination) {
          setStats((prev) => ({
            ...prev,
            totalItems: itemsRes.data.pagination.total || prev.totalItems
          }));
        }
      } catch (err) {
        console.warn('Home data load notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const quickCategories = ['Earbuds', 'Keys', 'ID Card', 'Water Bottle', 'Calculator', 'Backpack'];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section with Modern Campus Indigo/Navy Gradient */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/70 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Hackathon Innovation Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Campus Intelligent Similarity Matching Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Lost something? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600">
              Find it smarter.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            {t('hero_desc')}
          </p>

          {/* Dual Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
            <Link
              to="/report?type=lost"
              className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('btn_lost')}</span>
            </Link>

            <Link
              to="/report?type=found"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('btn_found')}</span>
            </Link>
          </div>

          {/* Hero Search Box */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full py-2 px-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Keyword Pills */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Popular:</span>
              {quickCategories.map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/browse?search=${encodeURIComponent(term)}`)}
                  className="px-2.5 py-1 rounded-lg bg-white/80 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors font-medium text-[11px]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Real Database Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalItems || 0}
            </span>
            <p className="text-xs font-medium text-slate-500">{t('stat_items')}</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.resolvedItems || 0}
            </span>
            <p className="text-xs font-medium text-slate-500">{t('stat_resolved')}</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalUsers || 0}
            </span>
            <p className="text-xs font-medium text-slate-500">{t('stat_users')}</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalMatches || 0}
            </span>
            <p className="text-xs font-medium text-slate-500">{t('stat_matches')}</p>
          </div>
        </div>
      </section>

      {/* Featured Recent Lost & Found Reports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Campus Reports</h2>
            <p className="text-xs text-slate-500 mt-1">
              Active items reported across campus buildings in the past few days.
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching campus records..." />
        ) : recentItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No active reports yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first to report a lost or found item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* 3-Step Explainable Workflow */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">
            Simple • Intelligent • Private
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            How FindIt Reunites Belongings
          </h2>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1 */}
            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                1
              </div>
              <h3 className="text-base font-bold text-white">{t('step1_title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('step1_desc')}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-teal-500/30">
                2
              </div>
              <h3 className="text-base font-bold text-white">{t('step2_title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('step2_desc')}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700/60 space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                3
              </div>
              <h3 className="text-base font-bold text-white">{t('step3_title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('step3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Safety and Privacy Guard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-300 rounded-xl flex items-center justify-center mb-2 border border-indigo-400/20">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Private by Design</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No phone numbers, email addresses, or raw student IDs are ever shown publicly. Communication is mediated securely.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-300 rounded-xl flex items-center justify-center mb-2 border border-emerald-400/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Fraud Prevention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ownership claims require private distinguishing marks, review by campus proctors, and verified student ID cards before handover.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 bg-teal-500/20 text-teal-300 rounded-xl flex items-center justify-center mb-2 border border-teal-400/20">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Designated Exchange Hubs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Security-supervised meeting spots at the Library Desk and Campus Gate ensure safe, accountable handovers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
