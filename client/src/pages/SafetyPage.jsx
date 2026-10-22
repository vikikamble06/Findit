import React from 'react';
import { ShieldCheck, MapPin, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function SafetyPage() {
  const hubs = [
    {
      title: 'Central Security Main Gate Booth',
      hours: 'Open 24 Hours / 7 Days a week',
      desc: 'Uniformed security staff present. Safe custody locker available for high-value items.'
    },
    {
      title: 'Central Library Circulation & Help Desk',
      hours: 'Monday – Saturday: 8:00 AM – 10:00 PM',
      desc: 'Ground floor main lobby with active CCTV coverage and campus staff.'
    },
    {
      title: 'Dean of Student Affairs Office (Admin Block)',
      hours: 'Monday – Friday: 9:00 AM – 5:00 PM',
      desc: 'Administrative desk equipped to verify official student ID documents.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Campus Protocol
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Campus Handover & Safety Guidelines
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Ensuring every item return is safe, respectful, and verified without putting students at risk.
        </p>
      </div>

      {/* Safety Golden Rules */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>The Four Golden Handover Rules</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1">
            <h3 className="font-bold text-slate-900">1. Always Meet in Supervised Campus Areas</h3>
            <p className="text-slate-600 leading-relaxed">
              Never agree to meet in isolated, poorly lit, or off-campus spots. Always utilize one of the designated campus exchange hubs.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1">
            <h3 className="font-bold text-slate-900">2. Inspect Physical Student ID Cards</h3>
            <p className="text-slate-600 leading-relaxed">
              Verify the claimant's college identity card in person. Make sure the name matches the verified approval slip from administration.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1">
            <h3 className="font-bold text-slate-900">3. Zero Financial Demands or OTPs</h3>
            <p className="text-slate-600 leading-relaxed">
              Never pay any fee, reward ransom, or provide banking OTPs. FindIt is a 100% free campus service.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1">
            <h3 className="font-bold text-slate-900">4. Report Suspicious Claims Promptly</h3>
            <p className="text-slate-600 leading-relaxed">
              If someone makes false claims or behaves suspiciously, alert the Campus Security Office or Dean of Student Affairs immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Designated Hubs */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Official Campus Exchange Hubs</h2>
        <div className="space-y-3">
          {hubs.map((h, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-start space-x-4 text-xs"
            >
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">{h.title}</h3>
                <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{h.hours}</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
