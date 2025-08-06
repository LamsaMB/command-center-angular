import { useState } from 'react';
import { Login } from '@/components/Login';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; password: string } | null>(null);

  const handleLogin = (credentials: { username: string; password: string }) => {
    // In a real app, you would validate credentials against a backend
    setUser(credentials);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};

export default Index;
