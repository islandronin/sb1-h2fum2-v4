import React from 'react';
import AuthPage from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialNetworksProvider } from './context/SocialNetworksContext';
import { TagsProvider } from './context/TagsContext';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <TagsProvider>
        <SocialNetworksProvider>
          <AppContent />
        </SocialNetworksProvider>
      </TagsProvider>
    </AuthProvider>
  );
}

export default App;