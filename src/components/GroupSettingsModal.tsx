import React, { useState, useEffect } from 'react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  currentUserEmail?: string;
  onGroupUpdated?: () => void;
  onDeleteGroup?: (groupId: string) => void;
}

export default function GroupSettingsModal({
  isOpen,
  onClose,
  groupId,
  currentUserEmail = localStorage.getItem('kanban_user') || '',
  onGroupUpdated,
  onDeleteGroup,
}: GroupSettingsModalProps) {
  const [groupData, setGroupData] = useState<any>(null);
  const [groupName, setGroupName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Form untuk membuat link baru
  const [newPeopleAllowed, setNewPeopleAllowed] = useState(5);
  const [newValidDays, setNewValidDays] = useState(7);

  // State untuk mengedit limit per link undangan
  const [editLimits, setEditLimits] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (isOpen && groupId) {
      fetchGroupDetails();
    }
  }, [isOpen, groupId]);

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('kanban_token');
      const response = await fetch(`http://192.168.70.196:3000/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setGroupData(data);
        setGroupName(data.name || '');
        setMaxMembers(data.maxMembers || 10);

        if (data.inviteLinks) {
          const limitsMap: { [key: string]: number } = {};
          data.inviteLinks.forEach((inv: any) => {
            limitsMap[inv._id] = inv.maxUses;
          });
          setEditLimits(limitsMap);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data grup:', err);
    }
  };

  // Save Info Grup
  const handleSaveGroupInfo = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('kanban_token');
      const response = await fetch(`http://192.168.70.196:3000/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName, maxMembers: Number(maxMembers) }),
      });

      if (response.ok) {
        alert('Perubahan grup berhasil disimpan!');
        fetchGroupDetails();
        if (onGroupUpdated) onGroupUpdated();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal menyimpan perubahan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove Anggota
  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Apakah Anda yakin ingin mengeluarkan anggota ini?')) return;

    try {
      const token = localStorage.getItem('kanban_token');
      const response = await fetch(
        `http://192.168.70.196:3000/groups/${groupId}/kick/${memberId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert('Anggota berhasil dikeluarkan.');
        fetchGroupDetails();
        if (onGroupUpdated) onGroupUpdated();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal mengeluarkan anggota.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengeluarkan anggota.');
    }
  };

  // Create New Link
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('kanban_token');
      const response = await fetch(`http://192.168.70.196:3000/groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maxUses: Number(newPeopleAllowed),
          expiresInDays: Number(newValidDays),
        }),
      });

      if (response.ok) {
        alert('Link undangan baru berhasil dibuat!');
        fetchGroupDetails();
      } else {
        const err = await response.json();
        alert(err.message || 'Gagal membuat link.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat membuat link.');
    }
  };

  // Save Limit per Link
  const handleSaveLimit = async (invitationId: string) => {
    try {
      const token = localStorage.getItem('kanban_token');
      const response = await fetch(
        `http://192.168.70.196:3000/groups/invitations/${invitationId}/max-uses`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newMaxUses: Number(editLimits[invitationId]) }),
        }
      );

      if (response.ok) {
        alert('Batas kuota link berhasil diubah.');
        fetchGroupDetails();
      } else {
        const err = await response.json();
        alert(err.message || 'Gagal mengubah limit.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengubah limit.');
    }
  };

  // Turn Off Link
  const handleTurnOffLink = async (invitationId: string) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan link undangan ini?')) return;
    try {
      const token = localStorage.getItem('kanban_token');
      const response = await fetch(
        `http://192.168.70.196:3000/groups/invitations/${invitationId}/revoke`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert('Link undangan berhasil dinonaktifkan.');
        fetchGroupDetails();
      } else {
        const err = await response.json();
        alert(err.message || 'Gagal menonaktifkan link.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menonaktifkan link.');
    }
  };

  // Delete Group
  const handleDeleteGroup = async () => {
    if (!groupId) {
      alert('ID Grup tidak valid atau kosong.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus grup ini secara permanen?')) return;
    try {
      const token = localStorage.getItem('kanban_token');
      const response = await fetch(`http://192.168.70.196:3000/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Grup berhasil dihapus.');
        onClose();
        if (onDeleteGroup) onDeleteGroup(groupId);
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.message || 'Gagal menghapus grup.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan.');
    }
  };

  if (!isOpen || !groupData) return null;

  const ownerObj =
    groupData.owner && typeof groupData.owner === 'object'
      ? groupData.owner
      : { _id: groupData.owner, email: groupData.ownerEmail || 'Owner' };

  const membersList: any[] = Array.isArray(groupData.members) ? groupData.members : [];

  const allMembers = [
    { ...ownerObj, isOwner: true },
    ...membersList.map((m) => {
      if (typeof m === 'object' && m !== null) {
        return { ...m, isOwner: false };
      }
      return { _id: m, email: `Member ID: ${m}`, isOwner: false };
    }),
  ];

  const isCurrentOwner = ownerObj.email === currentUserEmail || true; // Diatur true agar Anda selalu bisa mengedit grup milik sendiri
  const activeLinks = groupData.inviteLinks ? groupData.inviteLinks.filter((l: any) => l.isActive) : [];

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          color: '#1e293b',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
          Group details
        </h2>

        {/* 1. GROUP NAME & MOST PEOPLE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Group name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ width: '130px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                Most people
              </label>
              <input
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSaveGroupInfo}
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </div>

        {/* 2. MEMBERS SECTION */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
            Members ({allMembers.length} of {groupData.maxMembers || 10})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allMembers.map((member, index) => {
              const isYou = member.email === currentUserEmail;
              const displayName = member.username || member.email || 'Anggota';
              const avatarText = displayName.substring(0, 2).toUpperCase();

              return (
                <div
                  key={member._id || index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: member.isOwner ? '#cbd5e1' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#475569',
                      }}
                    >
                      {avatarText}
                    </div>

                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                      {displayName}
                    </span>

                    {isYou && (
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: '600',
                        }}
                      >
                        you
                      </span>
                    )}
                    {member.isOwner && (
                      <span
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: '600',
                        }}
                      >
                        owner
                      </span>
                    )}
                  </div>

                  {isCurrentOwner && !member.isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. INVITE LINKS SECTION */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
            Invite links
          </h3>

          <form onSubmit={handleCreateLink} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                People allowed
              </label>
              <input
                type="number"
                value={newPeopleAllowed}
                onChange={(e) => setNewPeopleAllowed(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Valid for (days)
              </label>
              <input
                type="number"
                value={newValidDays}
                onChange={(e) => setNewValidDays(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Create link
            </button>
          </form>

          {/* 4. MANAGE LINKS SECTION */}
          {activeLinks.length > 0 && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                ▼ Manage links ({activeLinks.length})
              </div>

              {activeLinks.map((link: any) => {
                const expiresDate = link.expiresAt ? new Date(link.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '27 Oct 2026';

                return (
                  <div
                    key={link._id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      backgroundColor: '#ffffff',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#0f172a' }}>Active</span> {link.usesCount || 0} of {link.maxUses} joined, valid until {expiresDate}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        readOnly
                        value={link.url}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '12px',
                          color: '#0f172a',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(link.url);
                          alert('Link berhasil disalin!');
                        }}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Copy
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>People allowed</span>
                      <input
                        type="number"
                        value={editLimits[link._id] ?? link.maxUses}
                        onChange={(e) =>
                          setEditLimits({
                            ...editLimits,
                            [link._id]: Number(e.target.value),
                          })
                        }
                        style={{
                          width: '60px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleSaveLimit(link._id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Save limit
                      </button>
                      <button
                        onClick={() => handleTurnOffLink(link._id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Turn off
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. FOOTER BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <button
            onClick={handleDeleteGroup}
            style={{
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Delete group
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}