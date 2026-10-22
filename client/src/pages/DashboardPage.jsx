import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemsAPI, claimsAPI, notificationsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import MatchCard from '../components/MatchCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Package,
  Sparkles,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Bell
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [itemsRes, claimsRes] = await Promise.all([
          itemsAPI.getItems({ reporter: user?._id }),
          claimsAPI.getMyClaims().catch(() => ({ data: { claims: [] } }))
        ]);

        const itemsList = itemsRes?.data?.items || [];
        setMyItems(itemsList);
        setMyClaims(claimsRes?.data?.claims || []);

        // Load matches for each user item
        const matchesPromises = itemsList.map((i) =>
          itemsAPI.getItemMatches(i._id).catch(() => ({ data: { matches: [] } }))
        );
        const matchResults = await Promise.all(matchesPromises);

        const combined = [];
        matchResults.forEach((res) => {
          if (res?.data?.matches) {
            combined.push(...res.data.matches);
          }
        });

        // Deduplicate matches by ID and sort by similarityScore descending
        const uniqueMatches = Array.from(
          new Map(combined.map((m) => [m._id, m])).values()
        ).sort((a, b) => b.similarityScore - a.similarityScore);

        setAllMatches(uniqueMatches);
      } catch (err) {
        console.error('Failed to load dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner message="Assembling your campus dashboard..." />;
  }

  const lostCount = myItems.filter((i) => i.type === 'lost').length;
  const foundCount = myItems.filter((i) => i.type === 'found').length;
  const pendingClaimsCount = myClaims.filter((c) => c.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            Campus Member Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-lg">
            {user?.department || 'College Campus'} • Student ID: {user?.studentId || 'Verified Member'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/report?type=lost"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/report?type=found"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">My Lost Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{lostCount}</p>
          <span className="text-[11px] text-slate-400">Awaiting return</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">My Found Reports</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{foundCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Safe in campus custody</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Similarity Matches</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{allMatches.length}</p>
          <span className="text-[11px] text-slate-400">Calculated suggestions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Submitted Claims</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{myClaims.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">
            {pendingClaimsCount} under review
          </span>
        </div>
      </div>

      {/* Top Similarity Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Suggested Matches for Your Items ({allMatches.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Ranked by algorithm score</span>
        </div>

        {allMatches.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No similarity matches found yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              As soon as a complementary campus report is filed with matching features, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMatches.slice(0, 6).map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* Claims Tracker & Recent Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Claims Tracker */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">My Ownership Claims</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">{myClaims.length} total</span>
          </div>

          {myClaims.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              You haven't submitted any ownership claims yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-3">
              {myClaims.map((claim) => (
                <div key={claim._id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/items/${claim.item?._id}`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1"
                      >
                        {claim.item?.title || 'Claimed Item'}
                      </Link>
                      <span className="text-[11px] text-slate-400">
                        Submitted {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        claim.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  {claim.adminReview?.notes && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800 block">Admin Note:</span>
                      {claim.adminReview.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Reports Summary */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">My Active Reports</h3>
            </div>
            <Link
              to="/my-reports"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center space-x-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              You haven't reported any lost or found items yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myItems.slice(0, 4).map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
