import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Shield,
  FileCheck,
  Package,
  Users,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Lock,
  ExternalLink,
  Loader2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('claims'); // 'claims', 'items', 'users', 'logs'
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal / action states
  const [reviewingClaimId, setReviewingClaimId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Always load stats
      const statsRes = await adminAPI.getDashboardStats();
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (activeTab === 'claims') {
        const claimsRes = await adminAPI.getAllClaims();
        if (claimsRes.data.success) {
          setClaims(claimsRes.data.claims || []);
        }
      } else if (activeTab === 'users') {
        const usersRes = await adminAPI.getAllUsers();
        if (usersRes.data.success) {
          setUsersList(usersRes.data.users || []);
        }
      } else if (activeTab === 'logs') {
        const logsRes = await adminAPI.getAuditLogs();
        if (logsRes.data.success) {
          setAuditLogs(logsRes.data.logs || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClaim = async (claimId, status) => {
    try {
      setProcessing(true);
      const res = await adminAPI.reviewClaim(claimId, {
        status,
        notes: reviewNotes.trim()
      });

      if (res.data.success) {
        setClaims((prev) =>
          prev.map((c) => (c._id === claimId ? { ...c, status, adminReview: { notes: reviewNotes } } : c))
        );
        setFeedbackMessage(`Claim ${status} successfully.`);
        setReviewingClaimId(null);
        setReviewNotes('');
        setTimeout(() => setFeedbackMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review claim');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change user status to "${newStatus}"?`)) return;

    try {
      const res = await adminAPI.updateUserStatus(userId, newStatus);
      if (res.data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
        setFeedbackMessage(`User account status updated to ${newStatus}.`);
        setTimeout(() => setFeedbackMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title & Overview Stats */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="flex items-center space-x-2 text-amber-400 mb-1 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-5 h-5 text-amber-400" />
          <span>Campus Authority Control Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          FindIt Administrator Panel
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Logged in as {user?.name} • Authorized to review private ownership proof, resolve reports, and moderate campus accounts.
        </p>

        {stats && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-extrabold text-white block">
                {stats.totalItems || 0}
              </span>
              <span className="text-[11px] text-slate-400">Total Items</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-extrabold text-rose-400 block">
                {stats.lostItems || 0}
              </span>
              <span className="text-[11px] text-slate-400">Lost Reports</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 block">
                {stats.foundItems || 0}
              </span>
              <span className="text-[11px] text-slate-400">Found Reports</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-extrabold text-amber-400 block">
                {stats.pendingClaims || 0}
              </span>
              <span className="text-[11px] text-slate-400">Pending Claims</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-400 block">
                {stats.resolvedItems || 0}
              </span>
              <span className="text-[11px] text-slate-400">Cases Resolved</span>
            </div>
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/60">
              <span className="text-xl sm:text-2xl font-extrabold text-teal-400 block">
                {stats.totalUsers || 0}
              </span>
              <span className="text-[11px] text-slate-400">Campus Users</span>
            </div>
          </div>
        )}
      </div>

      {feedbackMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-semibold animate-in fade-in">
          {feedbackMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'claims'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Claims Moderation ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Campus Users</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* Tab 1: Claims Moderation */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {loading ? (
            <LoadingSpinner message="Retrieving claims for verification..." />
          ) : claims.length === 0 ? (
            <EmptyState
              icon={FileCheck}
              title="No pending claims"
              description="All ownership claims have been reviewed."
            />
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim._id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
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
                        <span className="text-xs text-slate-400">
                          Filed {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1">
                        Claim for: {claim.item?.title || 'Campus Item'}
                      </h3>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-slate-900 block">
                        Claimant: {claim.claimant?.name}
                      </span>
                      <span className="text-slate-500 block">
                        {claim.claimant?.email} • ID: {claim.claimant?.studentId || 'N/A'}
                      </span>
                      <span className="text-slate-400 text-[11px] block">
                        Dept: {claim.claimant?.department || 'General'}
                      </span>
                    </div>
                  </div>

                  {/* Private Verification Answers Section */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center space-x-1.5 text-indigo-700 font-bold">
                      <Lock className="w-4 h-4" />
                      <span>Confidential Ownership Proof Answers</span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-800 block">
                        Distinguishing Marks / Identifying Features:
                      </span>
                      <p className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed font-mono text-[11px]">
                        {claim.verificationAnswers?.distinguishingMarks || 'None specified'}
                      </p>
                    </div>

                    {claim.verificationAnswers?.contentsOrDetails && (
                      <div className="space-y-1 pt-1">
                        <span className="font-semibold text-slate-800 block">
                          Contents / Model Specifics:
                        </span>
                        <p className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed font-mono text-[11px]">
                          {claim.verificationAnswers.contentsOrDetails}
                        </p>
                      </div>
                    )}

                    {claim.verificationAnswers?.additionalProof && (
                      <div className="space-y-1 pt-1">
                        <span className="font-semibold text-slate-800 block">
                          Additional Proof / Reference:
                        </span>
                        <p className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed font-mono text-[11px]">
                          {claim.verificationAnswers.additionalProof}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Review Actions */}
                  {reviewingClaimId === claim._id ? (
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                      <label className="block text-xs font-bold text-slate-800">
                        Administrative Review Decision Notes:
                      </label>
                      <textarea
                        rows={2}
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="e.g. Scratches verified against item in security custody; claimant presented valid student ID..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          disabled={processing}
                          onClick={() => handleReviewClaim(claim._id, 'approved')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm & Approve Return</span>
                        </button>
                        <button
                          disabled={processing}
                          onClick={() => handleReviewClaim(claim._id, 'rejected')}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject Claim</span>
                        </button>
                        <button
                          disabled={processing}
                          onClick={() => handleReviewClaim(claim._id, 'more-info-needed')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Request More Proof</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewingClaimId(null)}
                          className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        to={`/items/${claim.item?._id}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>View Public Listing</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => {
                          setReviewingClaimId(claim._id);
                          setReviewNotes('');
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                      >
                        Review / Decide Claim
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Campus Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Registered Campus Community</h3>
            <span className="text-xs text-slate-500">{usersList.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Student / Staff ID</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Account Status</th>
                  <th className="px-6 py-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-slate-500 text-[11px]">{u.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-mono text-[11px]">
                      {u.studentId || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.department || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id, u.status)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.status === 'active'
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Security Audit Trail */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Security & Administrative Actions Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamper-evident log of status decisions, claim approvals, and suspensions.
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No audit logs recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="p-4 text-xs flex items-start justify-between space-x-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono">
                        {log.action}
                      </span>
                      <span className="text-slate-600 font-medium">
                        Admin: {log.admin?.name || 'Administrator'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Target Resource: <span className="font-semibold">{log.targetResource?.resourceType}</span>
                    </p>
                    {log.details && (
                      <p className="text-slate-500 text-[10px] font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-100 max-w-xl">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
