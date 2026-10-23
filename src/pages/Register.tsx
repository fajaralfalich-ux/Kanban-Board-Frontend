import React, { useState } from 'react';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onBackToLogin: () => void;
}

export default function Register({ onRegisterSuccess, onBackToLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Endpoint backend Anda
  const REGISTER_API_URL = 'http://192.168.70.196:3000/auth/register';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email) {
      setError('Mohon isi username dan alamat email.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(REGISTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert('🎉 Registrasi berhasil! Password otomatis telah dikirimkan ke email Anda (berisi tanggal hari pendaftaran). Silakan cek email untuk masuk.');
        onRegisterSuccess();
      } else {
        const errorMsg = Array.isArray(data.message) 
          ? data.message.join(', ') 
          : (data.message || 'Gagal melakukan pendaftaran.');
        setError(errorMsg);
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
        {/* PANEL KIRI */}
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
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🚀</div>
            <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 16px 0', lineHeight: '1.3' }}>
              Bergabung & Mulai Kelola Proyek.
            </h1>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              Buat akun baru. Password akan otomatis dikirimkan ke email Anda berdasarkan tanggal pendaftaran.
            </p>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '24px' }}>
            © 2026 Task Management System. All rights reserved.
          </div>
        </div>

        {/* PANEL KANAN (Form Register - Hanya Username & Email) */}
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
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
              Daftar Akun Baru
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Masukkan username dan email Anda.
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
                marginBottom: '14px',
                textAlign: 'center',
                border: '1px solid #fca5a5',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username Anda"
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

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '11px',
                backgroundColor: '#059669',
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
              {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#64748b' }}>
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onBackToLogin}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '12px' }}
            >
              Masuk di sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}