
import React, { useState } from 'react';
import TextAnalysis from './components/TextAnalysis';
import DraftGenerator from './components/DraftGenerator';
import History from './components/History';
import Profile from './components/Profile';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AuthLayout from './components/auth/AuthLayout';
import { useAuth } from './contexts/AuthContext';
import { WriteIcon, ReplyIcon, HistoryIcon, UserIcon, LogoutIcon } from './components/common/icons';
import Loader from './components/common/Loader';

type View = 'analyze' | 'draft' | 'history' | 'profile';

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('analyze');
  const { currentUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const renderViewContent = () => {
    switch (activeView) {
      case 'analyze': return <TextAnalysis />;
      case 'draft': return <DraftGenerator />;
      case 'history': return <History />;
      case 'profile': return <Profile />;
      default: return null;
    }
  };

  const NavLink = ({ view, label, icon }: { view: View; label: string; icon: React.ReactElement }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        activeView === view ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold text-white tracking-tight">AI Assistant</h1>
                    <nav className="hidden md:flex items-center space-x-2">
                        <NavLink view="analyze" label="Analyzer" icon={<WriteIcon />} />
                        <NavLink view="draft" label="Drafts" icon={<ReplyIcon />} />
                        <NavLink view="history" label="History" icon={<HistoryIcon />} />
                    </nav>
                </div>
                <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition p-2 rounded-full hover:bg-gray-700">
                        <UserIcon />
                        <span className="hidden sm:inline">{currentUser?.email}</span>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-50 animate-fade-in" onMouseLeave={() => setIsProfileOpen(false)}>
                            <button onClick={() => { setActiveView('profile'); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white">
                                <UserIcon /> Profile
                            </button>
                            <button onClick={logout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white">
                                <LogoutIcon /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile Navigation */}
            <nav className="md:hidden flex items-center justify-around py-2 border-t border-gray-700">
                <NavLink view="analyze" label="Analyzer" icon={<WriteIcon />} />
                <NavLink view="draft" label="Drafts" icon={<ReplyIcon />} />
                <NavLink view="history" label="History" icon={<HistoryIcon />} />
            </nav>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        {renderViewContent()}
      </main>
      
      <footer className="text-center py-4 text-gray-600 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

const AuthFlow: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const toggleView = () => setIsLoginView(!isLoginView);

    return (
        <AuthLayout>
            {isLoginView ? <Login onToggleView={toggleView} /> : <Signup onToggleView={toggleView} />}
        </AuthLayout>
    );
};

const App: React.FC = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader text="Initializing..." size={10}/>
            </div>
        );
    }
    
    return currentUser ? <MainApp /> : <AuthFlow />;
};

export default App;
