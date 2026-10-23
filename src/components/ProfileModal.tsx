import React, { useState } from 'react';

interface ProfileModalProps {
  currentUser?: string;
  userAvatar?: string;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUserAvatar: (newAvatar: string) => void;
}

export default function ProfileModal({
  currentUser,
  userAvatar,
  onClose,
  onLogout,
  onUpdateUserAvatar,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  // State untuk form Edit Profile dengan nilai awal dari localStorage
  const [firstName, setFirstName] = useState(localStorage.getItem('kanban_first_name') || 'Fajar');
  const [lastName, setLastName] = useState(localStorage.getItem('kanban_last_name') || 'Alfalich');
  const [username, setUsername] = useState(localStorage.getItem('kanban_username') || '@fajaralf');
  const [phone, setPhone] = useState(localStorage.getItem('kanban_phone') || '+62 812 3456 7890');
  const [birth, setBirth] = useState(localStorage.getItem('kanban_birth') || '2003-07-29');
  const [gender, setGender] = useState(localStorage.getItem('kanban_gender') || 'Male');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simpan semua data ke localStorage
    localStorage.setItem('kanban_first_name', firstName);
    localStorage.setItem('kanban_last_name', lastName);
    localStorage.setItem('kanban_username', username);
    localStorage.setItem('kanban_phone', phone);
    localStorage.setItem('kanban_birth', birth);
    localStorage.setItem('kanban_gender', gender);

    alert('✨ Profil berhasil disimpan!');
    setActiveTab('view');
  };

  // Style standar agar input berlatar putih terang dan teks hitam pekat
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '500',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ================= TAMPILAN UTAMA: MY PROFILE ================= */}
        {activeTab === 'view' && (
          <div>
            {/* Header Modal */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#0f172a' }}
              >
                ✕
              </button>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>My Profile</h3>
              <div style={{ width: '20px' }} />
            </div>

            {/* Info Kartu Profil */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 24px 16px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '12px' }}>
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="Avatar"
                    style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: 'bold',
                    }}
                  >
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    border: '2px solid #fff',
                  }}
                  title="Ganti Foto"
                >
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          onUpdateUserAvatar(result);
                          localStorage.setItem('kanban_user_avatar', result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                {firstName} {lastName}
              </h4>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>
                {username}
              </p>
              <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#94a3b8' }}>
                {currentUser || 'user@gmail.com'}
              </p>

              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 24px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                Edit Profile
              </button>
            </div>

            {/* Menu Log Out Saja */}
            <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
              <MenuItem 
                icon="🚪" 
                label="Log Out" 
                textColor="#dc2626" 
                onClick={() => {
                  onClose();
                  onLogout();
                }} 
              />
            </div>

            <div style={{ textAlign: 'center', padding: '12px', fontSize: '11px', color: '#94a3b8' }}>
              App Version 2.3
            </div>
          </div>
        )}

        {/* ================= TAMPILAN KEDUA: EDIT PROFILE FORM ================= */}
        {activeTab === 'edit' && (
          <div>
            {/* Header Form */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#0f172a' }}
              >
                ←
              </button>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Edit Profile</h3>
              <div style={{ width: '20px' }} />
            </div>

            {/* Avatar Preview di Edit Form */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 10px' }}>
              <div style={{ position: 'relative', width: '76px', height: '76px' }}>
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '76px', height: '76px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 'bold' }}>
                    {firstName.charAt(0)}
                  </div>
                )}
                <label style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2563eb', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px', border: '2px solid #fff' }}>
                  ✎
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          onUpdateUserAvatar(result);
                          localStorage.setItem('kanban_user_avatar', result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Form Input Edit Profile */}
            <form onSubmit={handleSaveProfile} style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  disabled
                  value={currentUser || ''}
                  style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#94a3b8' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Birth</label>
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tombol Batal & Simpan dengan warna teks tombol Batal yang jelas */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '10px', 
                    border: '1px solid #cbd5e1', 
                    backgroundColor: '#f8fafc', 
                    color: '#334155', // Teks tombol Batal diperjelas menjadi abu-abu gelap
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ 
                    flex: 1, 
                    padding: '12px', 
                    borderRadius: '10px', 
                    border: 'none', 
                    backgroundColor: '#1e3a8a', 
                    color: '#ffffff', 
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, textColor = '#0f172a', onClick }: { icon: string; label: string; textColor?: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '14px', fontWeight: '500', color: textColor }}>{label}</span>
      </div>
      <span style={{ fontSize: '14px', color: '#94a3b8' }}>›</span>
    </div>
  );
}