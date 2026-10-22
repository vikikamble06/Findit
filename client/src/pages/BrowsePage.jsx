import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, CAMPUS_ZONES, COLORS } from '../utils/constants';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  PackageSearch
} from 'lucide-react';

export default function BrowsePage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [campusZone, setCampusZone] = useState(searchParams.get('campusZone') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state to URL params and fetch
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (category) params.category = category;
    if (campusZone) params.campusZone = campusZone;
    if (color) params.color = color;
    if (sort !== 'newest') params.sort = sort;
    if (page > 1) params.page = String(page);

    setSearchParams(params, { replace: true });
    loadItems(params);
  }, [search, type, category, campusZone, color, sort, page]);

  const loadItems = async (params) => {
    try {
      setLoading(true);
      const res = await itemsAPI.getItems({
        ...params,
        limit: 12,
      });

      if (res.data.success) {
        setItems(res.data.items || []);
        setPagination(res.data.pagination || { total: 0, pages: 1, page: 1 });
      }
    } catch (err) {
      console.error('Failed to load items:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setType('');
    setCategory('');
    setCampusZone('');
    setColor('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || type || category || campusZone || color);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('browse_title')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">{t('browse_subtitle')}</p>
      </div>

      {/* Main Search & Quick Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by keywords (e.g. calculator, blue bottle, student card)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Toggle Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => {
                setType('');
                setPage(1);
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === '' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('filter_all')}
            </button>
            <button
              onClick={() => {
                setType('lost');
                setPage(1);
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'lost' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              {t('filter_lost')}
            </button>
            <button
              onClick={() => {
                setType('found');
                setPage(1);
              }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'found' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              {t('filter_found')}
            </button>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="sm:hidden w-full py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Detailed Dropdown Filters (Category, Zone, Color, Sort) */}
        <div className={`grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 ${mobileFilterOpen ? 'block' : 'hidden sm:grid'}`}>
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('filter_category')}</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Campus Zone Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('filter_zone')}</label>
            <select
              value={campusZone}
              onChange={(e) => {
                setCampusZone(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Campus Zones</option>
              {CAMPUS_ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Color Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">{t('filter_color')}</label>
            <select
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Colors</option>
              {COLORS.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="oldest">{t('sort_oldest')}</option>
              <option value="date_desc">Report Date (Recent First)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              Showing results for active criteria ({pagination.total} matching)
            </span>
            <button
              onClick={clearAllFilters}
              className="text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('filter_clear')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Directory Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering campus listings..." />
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={t('no_items_found')}
          description={t('no_items_desc')}
          actionLabel={hasActiveFilters ? t('filter_clear') : undefined}
          onAction={hasActiveFilters ? clearAllFilters : undefined}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total reports)
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
