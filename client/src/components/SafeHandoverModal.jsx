import React from 'react';
import { X, ShieldCheck, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SafeHandoverModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const campusHubs = [
    {
      name: 'Central Security Main Gate Booth',
      time: 'Open 24/7',
      desc: 'Security officers stationed on duty for supervised item return.'
    },
    {
      name: 'Central Library Circulation & Help Desk',
      time: 'Mon - Sat: 8:00 AM - 10:00 PM',
      desc: 'Ground floor desk with CCTV coverage and staff presence.'
    },
    {
      name: 'Dean of Student Affairs (Admin Block Ground Floor)',
      time: 'Mon - Fri: 9:00 AM - 5:00 PM',
      desc: 'Official campus administrative department for verified returns.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close safety guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-emerald-600 mb-2">
          <ShieldCheck className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider">Campus Handover Protocol</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 leading-snug">
          Safe Item Return Guidelines
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Follow these guidelines to ensure a secure, fraud-free item handover on campus.
        </p>

        {/* Supervised Spots */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Designated Campus Exchange Hubs
          </h4>
          <div className="space-y-2">
            {campusHubs.map((hub, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs flex items-start space-x-3"
              >
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">{hub.name}</h5>
                  <div className="flex items-center space-x-1 text-slate-500 text-[11px] mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{hub.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1">{hub.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Golden Rules */}
        <div className="mt-5 bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2 text-xs text-amber-900">
          <div className="flex items-center space-x-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Campus Safety Reminders</span>
          </div>
          <ul className="space-y-1.5 text-[11px] list-disc list-inside text-amber-800">
            <li>Never exchange items in secluded, poorly lit, or off-campus areas.</li>
            <li>Verify student ID cards or staff credentials in person before handing over belongings.</li>
            <li>Never pay any "finder's fee" or share bank OTPs / passwords.</li>
            <li>Report fraudulent claims immediately to campus security.</li>
          </ul>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            I Understand the Guidelines
          </button>
        </div>
      </div>
    </div>
  );
}
