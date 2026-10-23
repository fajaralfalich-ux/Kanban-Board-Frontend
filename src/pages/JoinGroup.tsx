import { useEffect, useState } from 'react';

export default function JoinGroup() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Sedang memproses bergabung ke grup...');

  useEffect(() => {
    const handleJoin = async () => {
      try {
        // 1. Ambil parameter token dari URL browser
        const searchParams = new URLSearchParams(window.location.search);
        let tokenParam = searchParams.get('token');

        // Jika tidak ada di query string, coba ekstrak dari path URL
        if (!tokenParam) {
          const pathParts = window.location.pathname.split('/');
          tokenParam = pathParts[pathParts.length - 1];
        }

        if (!tokenParam || tokenParam === 'join') {
          setStatus('error');
          setMessage('Token undangan tidak ditemukan di URL.');
          alert('Gagal bergabung: Token undangan tidak valid!');
          return;
        }

        // 2. Ambil JWT Token pengguna yang sedang login dari localStorage
        const authToken = localStorage.getItem('token') || localStorage.getItem('kanban_token') || localStorage.getItem('access_token');

        if (!authToken) {
          setStatus('error');
          setMessage('Anda belum login. Silakan login terlebih dahulu.');
          alert('Silakan login terlebih dahulu untuk bergabung ke grup!');
          window.location.href = '/';
          return;
        }

        console.log('Mengirim token ke backend:', tokenParam);

        // 3. Kirim request POST ke backend
        const response = await fetch('http://192.168.70.196:3000/groups/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken.replace(/^Bearer\s+/i, '')}`,
          },
          body: JSON.stringify({ token: tokenParam.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal bergabung ke grup: Token tidak valid atau sudah kedaluwarsa!');
        }

        // 4. Jika berhasil
        setStatus('success');
        setMessage(data.message || 'Berhasil bergabung dengan grup!');
        alert(data.message || 'Berhasil bergabung dengan grup!');
        
        // Redirect kembali ke papan Kanban utama setelah berhasil
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);

      } catch (err: any) {
        console.error('Error join group:', err);
        setStatus('error');
        setMessage(err.message || 'Gagal bergabung ke grup.');
        alert(err.message || 'Gagal bergabung ke grup: Token tidak valid atau sudah kedaluwarsa!');
      }
    };

    handleJoin();
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0f2b38',
      color: '#ffffff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#1d3e4e',
        padding: '2.5rem',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Gabung Grup Kanban</h2>
        <p style={{ color: status === 'error' ? '#ff6b6b' : status === 'success' ? '#51cf66' : '#cbd5e1' }}>
          {message}
        </p>
      </div>
    </div>
  );
}