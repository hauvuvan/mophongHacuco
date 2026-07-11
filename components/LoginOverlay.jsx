import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';

export default function LoginOverlay() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const displayError = error;

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: window.location.origin });
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập bằng Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-muted)] p-4">
      <div
        className="w-full max-w-sm bg-[var(--color-card)] rounded-xl shadow-lg p-8 border border-[var(--color-border)] flex flex-col gap-6"
      >
        <div className="flex flex-col gap-1 mb-2 text-center">
          <span className="text-xs font-semibold tracking-widest text-[var(--color-primary)] uppercase mb-2">HACUCO</span>
          <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Chào mừng trở lại</h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">Hệ thống ước tính & mô phỏng điện mặt trời</p>
        </div>

        {displayError && <p className="text-xs text-[var(--color-destructive)] font-medium text-center">{displayError}</p>}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm font-semibold text-[var(--color-foreground)] transition-all duration-200 active:scale-95 hover:bg-[var(--color-accent)] hover:shadow-sm disabled:pointer-events-none disabled:opacity-60"
        >
          <GoogleIcon />
          Đăng nhập với Google
        </button>

        <p className="text-xs text-[var(--color-muted-foreground)] text-center mt-2">
          Hệ thống hiện chỉ hỗ trợ tài khoản Google nội bộ.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
