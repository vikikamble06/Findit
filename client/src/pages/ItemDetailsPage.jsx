import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ITEM_STATUS_LABELS } from '../utils/constants';
import MatchCard from '../components/MatchCard';
import ClaimModal from '../components/ClaimModal';
import SafeHandoverModal from '../components/SafeHandoverModal';
import QrModal from '../components/QrModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Share2,
  Lock,
  ArrowLeft,
  Sparkles,
  Package,
  QrCode,
  UserCheck
} from 'lucide-react';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [item, setItem] = useState(null);
  const [userClaim, setUserClaim] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const [itemRes, matchesRes] = await Promise.all([
          itemsAPI.getItemById(id),
          itemsAPI.getItemMatches(id).catch(() => ({ data: { matches: [] } }))
        ]);

        if (itemRes.data.success) {
          setItem(itemRes.data.item);
          setUserClaim(itemRes.data.userClaim);
        } else {
          setError('Item not found');
        }

        if (matchesRes?.data?.success) {
          setMatches(matchesRes.data.matches || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading campus report details..." />;
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This item may have been removed or resolved.'}</p>
        <Link
          to="/browse"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  const isOwner = user && String(item.reporter?._id || item.reporter) === String(user._id);
  const isLost = item.type === 'lost';
  const statusInfo = ITEM_STATUS_LABELS[item.status] || ITEM_STATUS_LABELS.open;
  const hasImages = item.images && item.images.length > 0;

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to listings</span>
        </button>
      </div>

      {/* Main Item Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery or Styled Placeholder */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative aspect-square bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
            {hasImages ? (
              <img
                src={item.images[selectedImage] || item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-2">
                <Package className="w-20 h-20 stroke-[1.25] text-slate-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
                <span className="text-[11px] text-slate-400">No photo uploaded with report</span>
              </div>
            )}

            {/* Type badge overlay */}
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md ${
                  isLost ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isLost ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span>{isLost ? 'LOST ITEM' : 'FOUND ITEM'}</span>
              </span>
            </div>
          </div>

          {/* Image thumbnails if multiple */}
          {hasImages && item.images.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {item.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-indigo-600 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Campus Handover Assurance */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Campus Trust & Privacy Guarantee</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              FindIt mediates all communications securely. The reporter's email and phone number are hidden. Handover is completed only after physical identity check at verified campus security points.
            </p>
          </div>
        </div>

        {/* Right Column: Title, Metadata, Attributes, and Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {item.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Color: {item.color}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {item.title}
            </h1>

            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1 text-slate-700 font-medium">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <span>Reported by {item.reporter?.name || 'Campus Member'}</span>
              </div>
            </div>
          </div>

          {/* Approximate Location Card */}
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 flex items-start space-x-3 text-xs">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl flex-shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-indigo-950 block">Campus Location</span>
              <p className="font-semibold text-slate-800 mt-0.5">{item.campusZone}</p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{item.approximateLocation}</p>
              <span className="text-[10px] text-slate-400 mt-1 block italic">
                Approximate campus zone shown to protect valuable item details.
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Item Description
            </h3>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line shadow-sm">
              {item.description}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* If user already claimed */}
            {userClaim ? (
              <div className="flex-1 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl text-xs flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block">Your Claim is Under Review</span>
                  <p className="text-[11px] text-amber-800">
                    Status: <span className="capitalize font-semibold">{userClaim.status}</span>. You will receive an in-app notification once verified.
                  </p>
                </div>
              </div>
            ) : isOwner ? (
              <div className="flex-1 bg-slate-100 border border-slate-200 text-slate-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span className="font-medium">You submitted this campus report.</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
                  } else {
                    setClaimModalOpen(true);
                  }
                }}
                className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>{item.type === 'found' ? 'Claim This Item (Verify Ownership)' : 'Contact Reporter Securely'}</span>
              </button>
            )}

            {/* QR Notice Modal Button */}
            <button
              onClick={() => setQrModalOpen(true)}
              className="py-3.5 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
              title="Printable QR Code"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              <span>Campus QR Code</span>
            </button>

            {/* Handover Safety Guide Button */}
            <button
              onClick={() => setHandoverModalOpen(true)}
              className="py-3.5 px-4 border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-2xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safety Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Intelligent Similarity Matches Section */}
      <section className="pt-10 border-t border-slate-200 space-y-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {t('matched_items_title')} ({matches.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explainable recommendation candidates evaluated across category, keywords, color, zone, and date decay.
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No active matches found right now</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Our explainable matching engine continuously monitors new reports. You will receive an automated in-app alert as soon as a complementary item is reported.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onClaimSubmitted={(newClaim) => {
          setUserClaim(newClaim);
        }}
      />

      <SafeHandoverModal
        isOpen={handoverModalOpen}
        onClose={() => setHandoverModalOpen(false)}
      />

      <QrModal
        item={item}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
}
