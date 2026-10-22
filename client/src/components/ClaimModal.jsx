import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { claimsAPI } from '../services/api';
import { X, ShieldAlert, CheckCircle2, Lock, Sparkles, Loader2 } from 'lucide-react';

export default function ClaimModal({ item, isOpen, onClose, onClaimSubmitted }) {
  if (!isOpen || !item) return null;

  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [contentsOrDetails, setContentsOrDetails] = useState('');
  const [additionalProof, setAdditionalProof] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (distinguishingMarks.trim().length < 5) {
      setError('Please provide distinguishing marks or proof of at least 5 characters.');
      return;
    }

    try {
      setLoading(true);
      const res = await claimsAPI.submitClaim({
        itemId: item._id,
        distinguishingMarks,
        contentsOrDetails,
        additionalProof
      });

      if (res.data.success) {
        setSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onClaimSubmitted) onClaimSubmitted(res.data.claim);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to submit claim. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close claim dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Claim Submitted for Verification!</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your private ownership answers have been forwarded to the Campus Security & Administration desk. You will be notified once reviewed.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-all text-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-2">
              <Lock className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Private Ownership Verification
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
              Claim "{item.title}"
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide unique characteristics or details that only the true owner would know.
            </p>

            {/* Privacy Guarantee Box */}
            <div className="my-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Privacy & Fraud Protection</span>
                Your answers are strictly confidential and reviewed only by authorized campus personnel. They will never be shown publicly or to other students.
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Distinguishing Marks or Features <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={distinguishingMarks}
                  onChange={(e) => setDistinguishingMarks(e.target.value)}
                  placeholder="e.g. Minor scratch on bottom-left corner, specific lockscreen wallpaper, custom sticker, keychain description..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Specific Contents or Model Details (Optional)
                </label>
                <input
                  type="text"
                  value={contentsOrDetails}
                  onChange={(e) => setContentsOrDetails(e.target.value)}
                  placeholder="e.g. Pair of blue notebooks and a scientific calculator inside..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Additional Proof (Optional)
                </label>
                <input
                  type="text"
                  value={additionalProof}
                  onChange={(e) => setAdditionalProof(e.target.value)}
                  placeholder="e.g. Serial number fragment, purchase date, invoice available upon request"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Submit Verification Claim</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
