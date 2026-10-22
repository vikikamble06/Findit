import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Lock, Heart, MapPin, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Find<span className="text-indigo-400">It</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart lost and found network connecting college campus communities through explainable similarity matching and verified safe returns.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Security Aligned</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Quick Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  {t('nav_browse')}
                </Link>
              </li>
              <li>
                <Link to="/report?type=lost" className="hover:text-white transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report?type=found" className="hover:text-white transition-colors">
                  Report a Found Item
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  {t('nav_dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Safety & Trust</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/safety" className="hover:text-white transition-colors flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Campus Exchange Hubs</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Privacy by Design</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Matching Algorithm</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Designated Campus Hubs Notice */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 text-xs space-y-2">
            <span className="font-semibold text-white block">Safe Handover Protocol</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Always conduct item handovers at supervised campus locations such as the Central Security Desk, Library Front Office, or Dean of Student Affairs.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FindIt Campus Network. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-2 sm:mt-0">
            <span>Built with care for safer college campuses</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
