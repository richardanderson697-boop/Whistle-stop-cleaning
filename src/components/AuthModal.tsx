import React, { useState } from 'react';
import { User } from '../types';
import { X, Lock, Mail, Phone, User as UserIcon, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onLoginSuccess,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Password Recovery Fields
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetCodeSent, setResetCodeSent] = useState<boolean>(false);
  const [simulatedCode, setSimulatedCode] = useState<string>('');

  // Feedback State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Network error signing in.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Network error registering.');
    }
  };

  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setResetCodeSent(true);
        setSimulatedCode(data.simulatedCode || '123456');
        setMessage(`Security verification code sent to ${email} (Simulated code: ${data.simulatedCode})`);
      } else {
        setError(data.error || 'Password recovery request failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Error requesting password reset.');
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: resetCode, newPassword }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setMessage('Password updated successfully! Redirecting to Sign In...');
        setTimeout(() => {
          setMode('login');
          setResetCodeSent(false);
          setMessage('');
        }, 1500);
      } else {
        setError(data.error || 'Password reset failed. Invalid verification code.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Error resetting password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-stone-300 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-white">
              {mode === 'login' && 'Sign In to Your Account'}
              {mode === 'register' && 'Create Customer Account'}
              {mode === 'forgot' && 'Email Password Recovery'}
            </h2>
            <p className="text-xs text-stone-400">
              Whistle Stop Cleaning Portal
            </p>
          </div>

          <button onClick={onClose} className="p-2 text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="bg-stone-100 border-b border-stone-200 grid grid-cols-2 text-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-3 ${mode === 'login' ? 'bg-white text-stone-900 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-3 ${mode === 'register' ? 'bg-white text-stone-900 border-b-2 border-amber-500' : 'text-stone-500 hover:text-stone-900'}`}
            >
              New Customer Account
            </button>
          </div>
        )}

        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
              {message}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                    placeholder="e.g. sarah@example.com"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-stone-700 uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <strong>Quick Demo Sign-In Options:</strong>
                <div>• Administrator Email: <code className="text-amber-800 font-bold">admin@whistlestopcleaning.com</code></div>
                <div>• Customer Email: <code className="text-amber-800 font-bold">mchang@example.com</code></div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                  placeholder="e.g. sarah@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Phone Number (for SMS Confirmations)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                  placeholder="e.g. (555) 234-5678"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD RECOVERY FLOW */}
          {mode === 'forgot' && (
            <div>
              {!resetCodeSent ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <p className="text-xs text-stone-600">
                    Enter your registered email address below. We will send a security verification code to your email and SMS notification center.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                      placeholder="e.g. sarah@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md"
                  >
                    {isLoading ? 'Sending Code...' : 'Send Password Reset Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-900 font-bold"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    Enter the 6-digit verification code sent to <strong>{email}</strong>.
                    {simulatedCode && (
                      <div className="font-mono mt-1 font-extrabold text-amber-800">
                        Simulated Code: {simulatedCode}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      6-Digit Security Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-center text-lg tracking-widest font-bold"
                      placeholder="123456"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md"
                  >
                    {isLoading ? 'Updating Password...' : 'Reset & Save Password'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
