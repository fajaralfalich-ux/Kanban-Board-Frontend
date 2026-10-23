import { useState, useRef, useEffect } from 'react';

export interface HeaderProps {
  userEmail?: string;
  userName?: string;
  currentUser?: string;
  userAvatar?: string;
  userProfilePic?: string;
  boardMode?: string;
  currentGroupId?: string;
  onSwitchMode?: (mode: any) => void;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onOpenGroupMenu?: () => void;
  onOpenGroupSettings?: () => void;
  onUpdateUserAvatar?: (newAvatar: string) => void;
}

export default function Header({
  userEmail,
  userName,
  currentUser,
  userAvatar,
  userProfilePic,
  onLogout,
  onOpenProfile,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown jika mengklik di luar area menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mengambil username dari localStorage jika ada, atau fallback ke prop/email
  const savedUsername = localStorage.getItem('kanban_username');
  const savedFirstName = localStorage.getItem('kanban_first_name');
  const savedLastName = localStorage.getItem('kanban_last_name');

  let formattedName = userName || currentUser || userEmail || 'User';
  if (savedFirstName) {
    formattedName = `${savedFirstName} ${savedLastName || ''}`.trim();
  } else if (savedUsername) {
    formattedName = savedUsername;
  }

  const displayAvatar = userProfilePic || userAvatar;

  return (
    <header
      style={{
        width: '100%',
        height: '64px',
        backgroundColor: 'transparent',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 9999,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} ref={dropdownRef}>
        
        {/* ========================================================= */}
        {/* USERNAME / NAMA DI SAMPING KIRI FOTO PROFIL              */}
        {/* ========================================================= */}
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '0.3px',
            marginRight: '2px',
          }}
        >
          {formattedName}
        </span>

        {/* ========================================================= */}
        {/* FOTO PROFIL (STATIS / TIDAK BISA DIKLIK)                  */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Profile"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255, 255, 255, 0.5)',
              }}
            />
          ) : (
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '15px',
                border: '2px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              {formattedName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TOMBOL TITIK TIGA (DROPDOWN MENU PROFIL & KELUAR)         */}
        {/* ========================================================= */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen((prev) => !prev);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '22px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Menu"
          >
            ⋮
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                width: '160px',
                padding: '6px 0',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10000,
                border: '1px solid #e2e8f0',
              }}
            >
              {/* Menu Profil */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                  if (onOpenProfile) {
                    onOpenProfile();
                  }
                }}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '15px' }}>⚙️</span> Profil
              </button>

              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '2px 12px' }} />

              {/* Menu Keluar */}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                  onLogout();
                }}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontSize: '15px' }}>🚪</span> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}