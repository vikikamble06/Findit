import React from 'react';
import { X, QrCode, Download, Printer, Shield } from 'lucide-react';

export default function QrModal({ item, isOpen, onClose }) {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!item.qrCode) return;
    const link = document.createElement('a');
    link.href = item.qrCode;
    link.download = `FindIt-${item.type}-${item._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close QR dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          Campus Notice QR Code
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Print or share this public reference code for departmental notice boards.
        </p>

        {/* QR Image Box */}
        <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner">
          {item.qrCode ? (
            <img
              src={item.qrCode}
              alt={`QR Code for ${item.title}`}
              className="w-48 h-48 mx-auto object-contain rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
              Generating QR...
            </div>
          )}
          <div className="mt-2 text-center">
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {item.type} ITEM
            </span>
            <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{item.title}</p>
            <p className="text-[11px] text-slate-500">{item.campusZone}</p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 mb-4">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero personal contact details encoded</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
          <button
            onClick={handleDownload}
            className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Image</span>
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Poster</span>
          </button>
        </div>
      </div>
    </div>
  );
}
