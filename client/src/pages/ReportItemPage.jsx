import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { itemsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, CAMPUS_ZONES, COLORS } from '../utils/constants';
import {
  PlusCircle,
  UploadCloud,
  X,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';

export default function ReportItemPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialType = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [color, setColor] = useState('Black');
  const [campusZone, setCampusZone] = useState('Central Library');
  const [approximateLocation, setApproximateLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  // Image files & previews
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 4) {
      setError('You can upload a maximum of 4 photos per report.');
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (description.trim().length < 5) {
      setError('Description must be at least 5 characters.');
      return;
    }
    if (approximateLocation.trim().length < 3) {
      setError('Please provide approximate campus location details.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('color', color);
      formData.append('campusZone', campusZone);
      formData.append('approximateLocation', approximateLocation.trim());
      formData.append('date', date);
      formData.append('description', description.trim());

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await itemsAPI.createItem(formData);
      if (res.data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Navigate to the item details page
        navigate(`/items/${res.data.item._id}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to submit report. Please check inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <PlusCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Campus Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('report_title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{t('report_desc')}</p>
        </div>

        {/* Type Selector (Lost vs Found) */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('lost')}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              type === 'lost'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>I Lost an Item</span>
          </button>
          <button
            type="button"
            onClick={() => setType('found')}
            className={`py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              type === 'found'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>I Found an Item</span>
          </button>
        </div>

        {/* Privacy Guard Notice */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">Privacy Protection Notice</span>
            {t('privacy_notice')} If uploading photos of identity cards or wallet items, please blur or cover names, card numbers, and sensitive details before submission.
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Item Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Black BoAt Airdopes Wireless Earbuds, Blue Milton Steel Bottle..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Color Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Primary Color <span className="text-rose-500">*</span>
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {COLORS.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Campus Zone & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Campus Zone <span className="text-rose-500">*</span>
              </label>
              <select
                value={campusZone}
                onChange={(e) => setCampusZone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CAMPUS_ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
              </input>
            </div>
          </div>

          {/* Specific Location Details */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Approximate Location Details <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={approximateLocation}
              onChange={(e) => setApproximateLocation(e.target.value)}
              placeholder="e.g. 2nd Floor Silent Study Section Table 14, Canteen corner booth..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide key identifying terms, brand, condition, or context without revealing private contact details..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Item Photos (Optional, max 4 photos, 5MB each)
            </label>

            {/* Drag & drop upload area */}
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                Click to browse or drag & drop photos
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                JPEG, PNG, WEBP, or GIF (up to 4 photos)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={selectedFiles.length >= 4}
                className="hidden"
              />
            </label>

            {/* Image Preview List */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-rose-600 text-white rounded-lg transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md transition-all flex items-center justify-center space-x-2 ${
                type === 'lost'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              } disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Publishing & Calculating Matches...</span>
                </>
              ) : (
                <span>Submit {type === 'lost' ? 'Lost' : 'Found'} Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
