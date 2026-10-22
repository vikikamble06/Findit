import React from 'react';
import { Sparkles, Shield, Cpu, Layers, Heart, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Campus Innovation
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About FindIt — Smart Lost & Found
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Connecting college campuses with intelligent, explainable matching to reunite lost belongings quickly, safely, and transparently.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every day, students leave earphones, keys, water bottles, and ID cards in lecture halls, libraries, and canteens. Informal WhatsApp groups and notice boards are noisy, expose personal mobile numbers to strangers, and fail to match complementary reports efficiently.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Our Solution</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            FindIt provides a verified, privacy-preserving platform that structures reports and uses a 5-dimension similarity scoring engine to automatically recommend matching items while protecting personal identities.
          </p>
        </div>
      </div>

      {/* Matching Innovation Deep Dive */}
      <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-5 h-5" />
          <span>Core Algorithm Architecture</span>
        </div>

        <h2 className="text-2xl font-bold text-white">
          Explainable, Weighted Similarity Engine
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Rather than relying on black-box, paid AI APIs that can hallucinate or fail offline, FindIt deploys a robust, transparent multi-factor scoring model normalized to 100%:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2 text-center text-xs">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-xl font-extrabold text-indigo-400 block">30%</span>
            <span className="font-bold text-white text-[11px] block mt-1">Title & Text</span>
            <span className="text-[10px] text-slate-400">Jaccard token similarity with synonyms</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-xl font-extrabold text-indigo-400 block">25%</span>
            <span className="font-bold text-white text-[11px] block mt-1">Category</span>
            <span className="text-[10px] text-slate-400">Taxonomy hierarchy & cross-matches</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-xl font-extrabold text-indigo-400 block">20%</span>
            <span className="font-bold text-white text-[11px] block mt-1">Campus Zone</span>
            <span className="text-[10px] text-slate-400">Zone proximity adjacency matrix</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-xl font-extrabold text-indigo-400 block">15%</span>
            <span className="font-bold text-white text-[11px] block mt-1">Color</span>
            <span className="text-[10px] text-slate-400">Exact match & synonym mapping</span>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-xl font-extrabold text-indigo-400 block">10%</span>
            <span className="font-bold text-white text-[11px] block mt-1">Date Decay</span>
            <span className="text-[10px] text-slate-400">Configurable temporal decay curve</span>
          </div>
        </div>
      </div>
    </div>
  );
}
