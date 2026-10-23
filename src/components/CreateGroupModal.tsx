import React, { useState } from 'react';

interface CreateGroupModalProps {
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
}

const GROUPS_API_URL = 'http://localhost:3000/groups';

export default function CreateGroupModal({ onClose, onGroupCreated }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(GROUPS_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: groupName.trim(),
          maxMembers: Number(maxMembers),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const newGroupId = data._id || data.id || data.groupId;
        if (newGroupId) {
          onGroupCreated(newGroupId);
        } else {
          alert('Grup berhasil dibuat, tetapi ID grup tidak ditemukan dari server.');
        }
      } else {
        alert(`Gagal membuat grup: ${data.message || 'Terjadi kesalahan pada server'}`);
      }
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Gagal terhubung ke backend.');
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
          maxWidth: '440px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          boxSizing: 'border-box',
        }}
      >
        <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', color: '#0f172a' }}>
          Buat Grup Baru
        </h3>
        <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', margin: '0 0 20px 0' }}>
          Tentukan nama grup dan batas maksimum anggota untuk tim Anda.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              Nama Grup
            </label>
            <input
              type="text"
              placeholder="Contoh: Tim Developer..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>
              Batas Maksimum Anggota (Most people)
            </label>
            <input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              min={1}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
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
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
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
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Memproses...' : 'Buat Grup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}