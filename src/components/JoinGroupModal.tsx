import { useState } from 'react';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function JoinGroupModal({ isOpen, onClose, onSuccess }: JoinGroupModalProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tokenInput.trim()) {
      setError('Mohon masukkan Token atau Link Undangan.');
      return;
    }

    setIsLoading(true);

    try {
      const userToken = localStorage.getItem('kanban_token');

      // Jika user memasukkan URL lengkap, ekstrak parameter 'token='-nya lalu decode
      let cleanToken = tokenInput.trim();
      if (cleanToken.includes('token=')) {
        const urlParams = new URLSearchParams(cleanToken.split('?')[1]);
        const extracted = urlParams.get('token');
        if (extracted) cleanToken = decodeURIComponent(extracted);
      } else {
        cleanToken = decodeURIComponent(cleanToken);
      }

      // Mengirim request dengan metode POST ke endpoint /groups/join menggunakan body JSON { token }
      const response = await fetch(`http://192.168.70.196:3000/groups/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userToken ? `Bearer ${userToken}` : '',
        },
        body: JSON.stringify({ token: cleanToken }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert('🎉 Berhasil bergabung ke grup!');
        setTokenInput('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = Array.isArray(data.message) 
          ? data.message.join(', ') 
          : (data.message || 'Gagal bergabung ke grup.');
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Error joining group:', err);
      setError('Gagal terhubung ke server backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
          Gabung ke Grup
        </h3>

        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '12px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
              Token / Link Undangan Grup
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Masukkan Token UUID atau paste Link"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Memproses...' : 'Gabung'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}