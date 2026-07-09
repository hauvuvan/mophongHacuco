import React, { useState, useEffect } from 'react';
import { attemptLogin, saveSession, DEFAULT_ADMIN_EMAIL, getUsers } from '../utils/auth';

export default function LoginOverlay({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Check if default admin has default password
    const users = getUsers();
    const hasDefault = users.some(u => u.email === DEFAULT_ADMIN_EMAIL && u.isDefault);
    setShowHint(hasDefault);
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const user = await attemptLogin(email, password);
      if (!user) {
        setError('Email hoặc mật khẩu không đúng.');
      } else {
        const session = { email: user.email, role: user.role };
        saveSession(session);
        onLoginSuccess(session);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="brand">
          <span className="eyebrow">HACUCO</span>
          <h1>Đăng nhập hệ thống</h1>
          <p className="login-subtitle">Ước tính & mô phỏng lắp pin mặt trời</p>
        </div>
        
        {showHint && (
          <div className="default-hint">
            <strong>Tài khoản mặc định:</strong><br />
            Email: hauvuvan26@gmail.com<br />
            Mật khẩu: <strong>Admin@2024</strong><br />
            <span style={{ color: 'var(--amber)', fontSize: '10.5px' }}>
              Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.
            </span>
          </div>
        )}

        <div className="field">
          <label htmlFor="loginEmail">Email</label>
          <input
            type="email"
            id="loginEmail"
            placeholder="email@example.com"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="loginPassword">Mật khẩu</label>
          <input
            type="password"
            id="loginPassword"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '11px' }}
        >
          {loading ? 'Đang kiểm tra…' : 'Đăng nhập'}
        </button>
        <p className="login-note">Liên hệ quản trị viên để được cấp tài khoản.</p>
      </form>
    </div>
  );
}
