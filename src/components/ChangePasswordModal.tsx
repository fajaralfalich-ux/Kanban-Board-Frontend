import React, { useState } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPassword?: string;
}

export default function ChangePasswordModal({ isOpen, onClose, currentPassword }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (currentPassword && oldPassword !== currentPassword) {
      setErrorMessage('Password lama / sementara yang Anda masukkan tidak sesuai. Silakan periksa kembali!');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password baru minimal harus 6 karakter.');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[^a-zA-Z0-9]/.test(newPassword);

    if (!hasLetter || !hasNumber || !hasSymbol) {
      setErrorMessage('Password baru wajib mengandung kombinasi huruf, angka, dan simbol!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setSuccessMessage('🎉 Password berhasil diperbarui!');
      setIsLoading(false);

      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMessage('');
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1400,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '25px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          color: '#1e293b',
          boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔒</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>Ubah Password Baru</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4', marginBottom: '16px' }}>
          Masukkan password lama. Password baru wajib mengandung **huruf, angka, dan simbol**.
        </p>

        {errorMessage && (
          <div style={{ padding: '10px 12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '11px', marginBottom: '14px', border: '1px solid #fca5a5', textAlign: 'center', fontWeight: 'bold' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ padding: '10px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '11px', marginBottom: '14px', border: '1px solid #86efac', textAlign: 'center', fontWeight: 'bold' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Input Password Lama */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
              Password Lama / Sementara
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type={showOldPassword ? 'text' : 'password'}
                placeholder="Masukkan password lama..."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                }}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{
                  padding: '0 12px',
                  backgroundColor: '#e2e8f0',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {showOldPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Input Password Baru */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
              Password Baru
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Masukkan password baru..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  padding: '0 12px',
                  backgroundColor: '#e2e8f0',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {showNewPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Input Konfirmasi Password Baru */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
              Konfirmasi Password Baru
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password baru..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  padding: '0 12px',
                  backgroundColor: '#e2e8f0',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {showConfirmPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#64748b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: '#047857',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Memproses...' : 'Simpan Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}