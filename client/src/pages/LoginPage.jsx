import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate(redirectPath);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log In to FindIt
          </h1>
          <p className="text-xs text-slate-500">
            Access your campus reports, matches, and notifications.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Card */}
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center space-x-1.5 text-indigo-900 font-bold">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Hackathon Quick-Fill Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@campus.edu', 'AdminPass123!')}
              className="py-1.5 px-2 bg-white border border-indigo-200 hover:bg-indigo-100 rounded-lg text-[11px] font-semibold text-indigo-950 text-left transition-colors"
            >
              👑 Campus Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('aarav.sharma@campus.edu', 'StudentPass123!')}
              className="py-1.5 px-2 bg-white border border-indigo-200 hover:bg-indigo-100 rounded-lg text-[11px] font-semibold text-indigo-950 text-left transition-colors"
            >
              🎓 Aarav (Student)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('riya.patel@campus.edu', 'StudentPass123!')}
              className="py-1.5 px-2 bg-white border border-indigo-200 hover:bg-indigo-100 rounded-lg text-[11px] font-semibold text-indigo-950 text-left transition-colors"
            >
              🎓 Riya (Student)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('ananya.deshmukh@campus.edu', 'StudentPass123!')}
              className="py-1.5 px-2 bg-white border border-indigo-200 hover:bg-indigo-100 rounded-lg text-[11px] font-semibold text-indigo-950 text-left transition-colors"
            >
              🎓 Ananya (Student)
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Campus Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@campus.edu"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-800">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
