import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { ITEM_STATUS_LABELS } from '../utils/constants';

export default function ItemCard({ item }) {
  if (!item) return null;

  const isLost = item.type === 'lost';
  const statusInfo = ITEM_STATUS_LABELS[item.status] || ITEM_STATUS_LABELS.open;
  const hasImage = item.images && item.images.length > 0;

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  return (
    <Link
      to={`/items/${item._id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden card-hover flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
    >
      {/* Item Image or Category Placeholder Header */}
      <div className="relative h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Package className="w-12 h-12 stroke-[1.25] text-slate-300 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-[11px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
              {item.category}
            </span>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
              isLost
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isLost ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
            <span>{isLost ? 'LOST' : 'FOUND'}</span>
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Item Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-500 mb-1">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>{item.category}</span>
            </span>
            <span>•</span>
            <span className="font-medium text-slate-600">{item.color}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Zone & Date Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1 text-slate-600 truncate mr-2" title={item.campusZone}>
            <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="truncate font-medium">{item.campusZone}</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 flex-shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
