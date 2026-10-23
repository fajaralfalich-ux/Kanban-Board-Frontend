import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import KanbanBoard from './components/KanbanBoard';
import JoinGroup from './pages/JoinGroup'; // Sesuaikan path ini jika filenya berada di folder components

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('kanban_user'));
  const [isRegistering, setIsRegistering] = useState(false);

  // 1. Jika URL browser mengakses /join, prioritaskan render halaman JoinGroup
  if (window.location.pathname.startsWith('/join')) {
    return <JoinGroup />;
  }

  // 2. Jika user sudah login, tampilkan Kanban Board
  if (user) {
    return <KanbanBoard />;
  }

  // 3. Jika user sedang ingin mendaftar, tampilkan halaman Register
  if (isRegistering) {
    return (
      <Register
        onRegisterSuccess={() => setIsRegistering(false)}
        onBackToLogin={() => setIsRegistering(false)}
      />
    );
  }

  // 4. Tampilan default adalah halaman Login
  return (
    <Login
      onLoginSuccess={(email) => setUser(email)}
      onSwitchToRegister={() => {
        console.log("Tombol Daftar diklik, berpindah ke register...");
        setIsRegistering(true);
      }}
    />
  );
}