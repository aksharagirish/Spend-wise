import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  WalletCards,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signUp, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFriendlyErrorMessage = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        setIsOperationNotAllowed(true);
        return 'Email/Password sign-in is not yet enabled in your Firebase project. Follow the quick steps below to enable it, or use Google Sign-In.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please verify your credentials.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in window was closed before completing.';
      case 'auth/too-many-requests':
        return 'Access temporarily blocked due to many failed attempts. Please try again later.';
      default:
        return err?.message || 'Authentication failed. Please check your connection and try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccessMsg('Account created successfully! Welcome to SpendWise.');
      } else {
        await login(email, password);
        setSuccessMsg('Signed in successfully!');
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsOperationNotAllowed(false);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  const consoleAuthUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pt-2 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 text-white shadow-md shadow-indigo-500/25">
            <WalletCards className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-900">
            {isSignUp ? 'Create your SpendWise Account' : 'Sign in to SpendWise'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {isSignUp
              ? 'Store and sync your expenses securely in Cloud Firestore'
              : 'Access your cloud-synced financial transactions and analytics'}
          </p>
        </div>

        {/* Google Quick Sign-In Option */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">
                Or with email
              </span>
            </div>
          </div>
        </div>

        {/* Success or Error Banners */}
        {error && (
          <div className="mb-4 space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>

            {/* Explanatory Help Guide when operation-not-allowed occurs */}
            {isOperationNotAllowed && (
              <div className="mt-2 rounded-lg bg-white/90 p-2.5 border border-rose-200 text-slate-700 text-[11px] space-y-1.5">
                <p className="font-semibold text-slate-900">
                  How to enable Email/Password in Firebase:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600">
                  <li>Open the Firebase Console for project: <strong className="font-mono">{firebaseConfig.projectId}</strong></li>
                  <li>Navigate to <strong>Build &gt; Authentication &gt; Sign-in method</strong></li>
                  <li>Click <strong>Email/Password</strong> and toggle <strong>Enable</strong>, then click <strong>Save</strong></li>
                </ol>
                <a
                  href={consoleAuthUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-semibold text-purple-600 hover:text-purple-700 hover:underline pt-1"
                >
                  <span>Open Firebase Console Sign-in method</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:bg-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {isSignUp && (
              <p className="mt-1 text-[11px] text-slate-400">
                Minimum 6 characters.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Account with Email' : 'Sign In with Email'}</span>
            )}
          </button>
        </form>

        {/* Toggle between Login and Sign Up */}
        <div className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                  setIsOperationNotAllowed(false);
                }}
                className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                  setIsOperationNotAllowed(false);
                }}
                className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
