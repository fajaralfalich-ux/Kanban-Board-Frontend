import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
  onSwitchToRegister?: () => void;
}

export default function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Menggunakan IP lokal agar bisa diakses dari HP dan Laptop dalam satu jaringan
  const LOGIN_API_URL = 'http://192.168.70.196:3000/auth/login';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Mohon masukkan email dan password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const token = data.access_token || data.token;
        if (token) {
          localStorage.setItem('kanban_token', token);
        }
        localStorage.setItem('kanban_user', email);
        onLoginSuccess(email);
      } else {
        setError(data.message || 'Email tidak terdaftar atau password salah.');
      }
    } catch (err) {
      console.error('Gagal terhubung ke backend:', err);
      setError('Gagal terhubung ke server backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '900px',
          display: 'flex',
          overflow: 'hidden',
          minHeight: '560px',
        }}
      >
        {/* PANEL KIRI (Desain Asli) */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
            color: '#ffffff',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📌</div>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.3' }}>
              Kelola Tugas & Proyek Lebih Efisien.
            </h1>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              Platform manajemen tugas personal dan kolaborasi tim berbasis web dengan integrasi backend yang handal.
            </p>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '24px' }}>
            © 2026 Task Management System. All rights reserved.
          </div>
        </div>

        {/* PANEL KANAN (Form Login) */}
        <div
          style={{
            flex: 1,
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
              Masuk ke Akun
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Silakan masukkan kredensial Anda untuk melanjutkan.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                marginBottom: '16px',
                textAlign: 'center',
                border: '1px solid #fca5a5',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#0f172a',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '11px',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            >
              {isLoading ? 'Menghubungkan...' : 'Masuk'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0,
                fontSize: '12px',
              }}
            >
              Daftar di sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}