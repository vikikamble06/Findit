import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, Calendar, Check, AlertCircle } from 'lucide-react';

export default function MatchCard({ match }) {
  if (!match || !match.matchedItem) return null;

  const item = match.matchedItem;
  const score = match.similarityScore || 0;
  const breakdown = match.scoreBreakdown || {};

  // Badge and bar styling based on confidence score
  let scoreBadge = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bar: 'bg-emerald-500',
    label: 'High Similarity Match'
  };

  if (score < 75) {
    scoreBadge = {
      bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      bar: 'bg-indigo-500',
      label: 'Possible Match Candidate'
    };
  }

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm card-hover flex flex-col justify-between space-y-4">
      {/* Header with Similarity Score & Category */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${scoreBadge.bg}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{score}% Match</span>
            </span>
            <span className="text-xs font-medium text-slate-500 capitalize">
              ({match.matchCategory} similarity)
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {item.type}
          </span>
        </div>

        {/* Item Title & Core Attributes */}
        <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
          {item.title}
        </h4>

        <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
          <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {item.category}
          </span>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{item.campusZone}</span>
          </div>
          {formattedDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>

        {/* Algorithm Match Explanation */}
        <div className="mt-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
          <span className="font-semibold text-slate-900 block mb-1 flex items-center space-x-1">
            <span>Why this was recommended:</span>
          </span>
          <p>{match.explanation}</p>
        </div>

        {/* Score Breakdown Bars */}
        <div className="mt-3 grid grid-cols-5 gap-1.5 text-[10px] text-slate-500 text-center font-medium">
          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-slate-400">Category</span>
            <span className="font-bold text-slate-800">{breakdown.categoryScore || 0}%</span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-slate-400">Text</span>
            <span className="font-bold text-slate-800">{breakdown.textScore || 0}%</span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-slate-400">Color</span>
            <span className="font-bold text-slate-800">{breakdown.colorScore || 0}%</span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-slate-400">Zone</span>
            <span className="font-bold text-slate-800">{breakdown.locationScore || 0}%</span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-slate-400">Date</span>
            <span className="font-bold text-slate-800">{breakdown.dateScore || 0}%</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 italic">
          Recommendation only • Verified by Admin
        </span>
        <Link
          to={`/items/${item._id}`}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <span>View Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
