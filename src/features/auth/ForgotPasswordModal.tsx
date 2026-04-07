import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      setStatus('success');
      setMessage(res.message || 'Password has been reset to the default. Please login with the default password.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setStatus('idle');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        style={{ animationDuration: '0.2s' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-surface-border bg-surface-muted/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-ember-500/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-ember-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Reset Password</h2>
              <p className="text-sm text-text-muted">Get back into your account</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">Password Reset Successful</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-1">
                Your password has been reset to the default:
              </p>
              <p className="text-lg font-mono font-bold text-ember-500 bg-ember-500/5 border border-ember-500/20 rounded-lg py-2 px-4 inline-block my-3">
                Test@1234
              </p>
              <p className="text-xs text-text-muted">
                Please login with this password and change it from your Profile page.
              </p>
              <button
                onClick={handleClose}
                className="mt-5 w-full py-2.5 rounded-xl bg-ember-500 hover:bg-ember-600 text-white font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          ) : status === 'error' ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">Something Went Wrong</h3>
              <p className="text-sm text-text-secondary mb-4">{message}</p>
              <button
                onClick={() => { setStatus('idle'); setMessage(''); }}
                className="w-full py-2.5 rounded-xl bg-ember-500 hover:bg-ember-600 text-white font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                Enter your registered institutional email address. We'll reset your password to the default so you can login again.
              </p>

              {/* Email Input */}
              <div className="relative mb-5">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-text-primary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@school.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500 transition-all text-sm"
                    autoFocus
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-surface-border text-text-secondary hover:bg-surface-muted font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-ember-500 hover:bg-ember-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {status === 'idle' && (
          <div className="px-6 py-3 border-t border-surface-border bg-surface-muted/20">
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
