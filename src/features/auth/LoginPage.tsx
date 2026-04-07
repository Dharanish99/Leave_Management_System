import { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Users,
  Activity
} from 'lucide-react';
import { useLogin } from './useLogin';
import { QuickLogin } from './QuickLogin';
import { ForgotPasswordModal } from './ForgotPasswordModal';



// ═══════════════════════════════════════
// LOGIN PAGE COMPONENT
// ═══════════════════════════════════════
export function LoginPage() {
  const { form, serverError, shouldShake, isLoading, onSubmit, quickLogin } = useLogin();
  const { register, formState: { errors } } = form;
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <>
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ──────────────────────────────────────────────
           LEFT PANEL — Branding & Role Preview
           ────────────────────────────────────────────── */}
      <div className="hidden md:flex md:w-[55%] bg-ink-950 relative overflow-hidden flex-col justify-between p-10 lg:p-14">
        {/* Ambient Dark Background Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Main Ember Glow */}
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-ember-500/20 blur-[120px] rounded-full mix-blend-screen opacity-70" />
          {/* Secondary Soft Glow */}
          <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-warm-400/10 blur-[100px] rounded-full mix-blend-screen opacity-50" />
          
          {/* Subtle Accent Line */}
          <div className="absolute top-0 bottom-0 left-0 w-2 bg-ember-500 z-10" />
          
          {/* Subtle Grid Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] z-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Top — Logo */}
        <div className="relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-ember-500 flex items-center justify-center shadow-lg shadow-ember-500/20">
              <span className="text-white font-bold text-sm tracking-wide">LMS</span>
            </div>
            <div>
              <p className="text-white/90 font-semibold text-sm">Leave Management</p>
              <p className="text-white/40 text-xs">System</p>
            </div>
          </div>
        </div>

        {/* Center — Hero Typography & Floating Mockups */}
        <div className="relative z-20 flex-1 flex items-center mt-12 w-full">
          <div className="w-full flex justify-between items-center relative">
            
            {/* Left side: Typography */}
            <div className="max-w-[320px] lg:max-w-[360px]">
              <h1 className="font-serif text-[48px] lg:text-[56px] text-white leading-[1.1] mb-5 login-hero-text">
                Focus on teaching.<br />
                <span className="text-white/50">Leave the logistics</span><br />
                <span className="text-ember-400">to us.</span>
              </h1>
              <p className="text-white/60 text-base leading-relaxed opacity-0 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                A sophisticated, automated leave management experience crafted exclusively for Sri Eshwar College of Engineering.
              </p>
            </div>

            {/* Right side: Floating Mockup Cards */}
            <div className="relative w-[340px] h-[340px] hidden lg:block opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              
              {/* Mockup 1: Leave Approved (Top Right) */}
              <div className="absolute -top-4 -right-4 w-[240px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-float-slow">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-status-approved/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-status-approved" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Leave Approved</p>
                    <p className="text-white/40 text-xs mt-0.5">Your Medical Leave has been approved by the Principal.</p>
                  </div>
                </div>
              </div>

              {/* Mockup 2: Active Users (Center Left) */}
              <div className="absolute top-[40%] -left-8 w-[200px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-float-medium" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-ember-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-ember-400" />
                  </div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">Active Staff</p>
                </div>
                <p className="text-white font-serif text-3xl">124</p>
              </div>

              {/* Mockup 3: Quick Stats (Bottom Right) */}
              <div className="absolute bottom-4 right-8 w-[220px] bg-ink-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 shadow-2xl animate-float-fast" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs font-medium">Pending Requests</p>
                  <Activity className="w-4 h-4 text-warm-400" />
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-white font-serif text-2xl leading-none">12</p>
                  <p className="text-status-pending text-xs leading-relaxed">Needs review</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom — Footer */}
        <div className="relative z-20 mt-12 flex items-center gap-2 text-white/20 text-xs pb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Protected by institutional infrastructure</span>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
           RIGHT PANEL — Login Form
           ────────────────────────────────────────────── */}
      <div className="flex-1 bg-warm-50 flex flex-col min-h-screen md:min-h-0">
        {/* Top-right logo (desktop) */}
        <div className="hidden md:flex items-center justify-end p-6 lg:p-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-ember-500/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-ember-500" />
            </div>
            <div>
              <p className="text-text-primary font-semibold text-xs">Sri Eshwar</p>
              <p className="text-text-muted text-[10px]">College of Engineering</p>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-center pt-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ember-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-wide">LMS</span>
            </div>
            <div>
              <p className="text-text-primary font-semibold text-sm">Leave Management System</p>
              <p className="text-text-muted text-xs">Sri Eshwar College of Engineering</p>
            </div>
          </div>
        </div>

        {/* Form area — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-6 pb-8 md:pb-0">
          <div className="w-full max-w-[400px] login-form-enter">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-1.5">
                Sign in to your account
              </h2>
              <p className="text-sm text-text-muted">
                Enter your institutional credentials
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={onSubmit}
              noValidate
              className={shouldShake ? 'animate-shake' : ''}
            >
              {/* Server error banner */}
              {serverError && (
                <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-red-50 border border-red-200/60 rounded-lg text-sm text-status-rejected animate-slide-down">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{serverError}</span>
                </div>
              )}

              {/* Email field */}
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-text-primary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@school.edu"
                    {...register('email')}
                    className={`w-full h-12 pl-11 pr-4 rounded-lg border bg-surface-card text-text-primary
                               placeholder:text-text-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-ember-500/30 focus:border-ember-500
                               transition-all duration-200
                               ${errors.email ? 'border-status-rejected ring-1 ring-status-rejected/20' : 'border-surface-border'}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-status-rejected flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="mb-5">
                <label htmlFor="login-password" className="block text-sm font-medium text-text-primary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-muted pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register('password')}
                    className={`w-full h-12 pl-11 pr-11 rounded-lg border bg-surface-card text-text-primary
                               placeholder:text-text-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-ember-500/30 focus:border-ember-500
                               transition-all duration-200
                               ${errors.password ? 'border-status-rejected ring-1 ring-status-rejected/20' : 'border-surface-border'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-0.5"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-status-rejected flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 cursor-pointer group" htmlFor="remember-me">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 rounded border-surface-border text-ember-500
                               focus:ring-2 focus:ring-ember-500/20 focus:ring-offset-0
                               cursor-pointer accent-ember-500"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-ember-500 hover:text-ember-600 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg bg-ember-500 text-white font-medium text-sm
                           hover:bg-ember-600 active:scale-[0.98]
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100
                           transition-all duration-200 ease-in-out
                           flex items-center justify-center gap-2.5
                           shadow-ember hover:shadow-ember"
              >
                {isLoading ? (
                  <>
                    <span className="login-spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Quick Login (dev helper) */}
            <QuickLogin onSelect={quickLogin} isLoading={isLoading} />

            {/* Bottom security text */}
            <div className="flex items-center justify-center gap-1.5 mt-8 text-[11px] text-text-muted">
              <Shield className="w-3 h-3" />
              <span>Protected by institutional security</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}
