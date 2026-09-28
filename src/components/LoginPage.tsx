import React, { useState } from 'react';
import VegapunkLogo from './VegapunkLogo';
import { Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onNavigateToSignUp: () => void;
  onNavigateToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignUp, onNavigateToHome }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsVerifying(true);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email || 'user@example.com');
  };

  const handleQuickLogin = (providerEmail: string) => {
    onLogin(providerEmail);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-slate-800 selection:bg-blue-100">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => (onNavigateToHome ? onNavigateToHome() : onLogin('user@example.com'))}
          title="Back to home"
        >
          <VegapunkLogo variant="full" size={32} />
        </div>
        <div className="flex items-center gap-4 text-sm">
          {onNavigateToHome && (
            <button
              onClick={onNavigateToHome}
              className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs"
            >
              ← Back to home
            </button>
          )}
          <div>
            <span className="text-slate-500 mr-2">Don't have an account?</span>
            <button
              onClick={onNavigateToSignUp}
              className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-10 transition-all">
          {!isVerifying ? (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 mb-2">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your credentials to access your Vegapunk workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      autoFocus
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  {error && <p className="text-xs text-rose-600 mt-1.5">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Continue with email</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>

              {/* Clean Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">or</span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user@example.com')}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('apple.user@icloud.com')}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.61 1.34-.56.64-1.05 1.69-.92 2.71 1 .08 2.01-.5 2.6-1.2" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('enterprise@vegapunk.ai')}
                  className="w-full flex items-center justify-center py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Use single sign-on (SSO)
                </button>
              </div>
            </>
          ) : (
            /* Verification Code Screen */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-2xl font-normal text-slate-900 mb-1">
                  Check your inbox
                </h2>
                <p className="text-xs text-slate-500">
                  We sent a temporary verification code to <span className="font-semibold text-slate-700">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Verification code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full text-center tracking-widest text-lg font-mono px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    (Tip: Enter any code or click verify to proceed)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify and launch workspace</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  className="w-full text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors"
                >
                  ← Use a different email
                </button>
              </form>
            </div>
          )}

          {/* Legal Footnote */}
          <div className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
            By continuing, you agree to Vegapunk's{' '}
            <a href="#" className="underline hover:text-slate-600">Consumer Terms</a> and{' '}
            <a href="#" className="underline hover:text-slate-600">Usage Policy</a>, and acknowledge their{' '}
            <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        Vegapunk AI · Neural Research & Synthesis Laboratory · All rights reserved
      </footer>
    </div>
  );
};

export default LoginPage;
