import React from 'react';
import { Lock, EyeOff, Shield, Database, FileText } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Student Data Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Design
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          FindIt is built with Privacy by Design at its foundation. We collect minimal data and protect your identity.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-indigo-600" />
            <span>1. Zero Public Exposure of Personal Contacts</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your personal phone number, personal email address, and home address are never published in report listings. All communications and notifications occur securely through in-app channels.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>2. Confidential Ownership Proof</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            When submitting a claim, distinguishing features and secret answers are accessible only to authorized campus administrators and the item reporter during verification. They are never indexed or exposed to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>3. No Live GPS Tracking</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not require or track live user geolocation. Items are categorized by coarse campus zones (e.g. Central Library, Science Quad) to preserve spatial safety.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>4. Right to Deletion & Withdrawal</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students retain full ownership over their reports and can withdraw or mark their listings as resolved at any time. When a report is deleted, all associated match suggestions and claims are permanently purged.
          </p>
        </section>
      </div>
    </div>
  );
}
