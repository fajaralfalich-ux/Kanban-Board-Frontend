import React, { useState } from 'react';

interface GroupMenuModalProps {
  onClose: () => void;
  onSelectCreate: () => void;
  onSelectJoin: (tokenOrId: string) => void;
}

const GROUPS_API_URL = 'http://localhost:3000/groups';

export default function GroupMenuModal({ onClose, onSelectCreate, onSelectJoin }: GroupMenuModalProps) {
  const [isJoiningMode, setIsJoiningMode] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('kanban_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    // Mendukung input berupa URL lengkap ataupun token/ID langsung
    let cleanToken = tokenInput.trim();
    if (cleanToken.includes('token=')) {
      const urlParams = new URLSearchParams(cleanToken.split('?')[1]);
      cleanToken = urlParams.get('token') || cleanToken;
    }

    setIsSubmitting(true);
    try {
      // Coba gabung via token invite link
      const res = await fetch(`${GROUPS_API_URL}/join-by-token`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ token: cleanToken }),
      });

      const data = await res.json();

      if (res.ok && (data.groupId || data._id || data.id)) {
        const joinedId = data.groupId || data._id || data.id;
        alert('🎉 Berhasil bergabung ke grup!');
        onSelectJoin(joinedId);
      } else {
        // Fallback coba join langsung via ID grup jika token gagal
        const resDirect = await fetch(`${GROUPS_API_URL}/${cleanToken}/join`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
        });
        const directData = await resDirect.json();
        if (resDirect.ok) {
          alert('🎉 Berhasil bergabung ke grup!');
          onSelectJoin(cleanToken);
        } else {
          alert(`Gagal bergabung: ${data.message || directData.message || 'Token/Link tidak valid'}`);
        }
      }
    } catch (err) {
      console.error('Error joining group:', err);
      alert('Gagal terhubung ke server backend!');
    } finally {
      setIsSubmitting(false);
    }
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
          background: '#ffffff',
          color: '#0f172a',
          padding: '28px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>
          Mode Grup Kanban
        </h3>
        <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 20px 0' }}>
          Kelola kolaborasi tim dengan membuat grup baru atau bergabung ke grup yang sudah ada.
        </p>

        {!isJoiningMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              type="button"
              onClick={onSelectCreate}
              style={{
                padding: '12px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ➕ Buat Grup Baru
            </button>

            <button
              type="button"
              onClick={() => setIsJoiningMode(true)}
              style={{
                padding: '12px',
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🔗 Gabung Grup via Link / Token
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Batal
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
                Masukkan Link / Token Undangan
              </label>
              <input
                type="text"
                placeholder="Contoh: http://.../join?token=uuid atau token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsJoiningMode(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? 'Memproses...' : 'Gabung'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}