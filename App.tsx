import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Conversations from './components/Conversations';
import Meetings from './components/Meetings';

type View = 'overview' | 'conversations' | 'meetings';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>('overview');

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  const navigate = (view: View) => {
    setActiveView(view);
    // Close sidebar on navigation in mobile view
    if (isSidebarOpen) {
        toggleSidebar();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 flex">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        activeView={activeView}
        navigate={navigate}
      />
      <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300 ease-in-out">
        {/* Header for mobile view */}
        <header className="lg:hidden flex items-center justify-between h-16 bg-slate-800/70 backdrop-blur-sm px-6 border-b border-slate-700/50 sticky top-0 z-20">
            <h1 className="text-lg font-bold text-white tracking-wider">
              <span className="text-blue-400">Voice</span>Agent
            </h1>
          <button onClick={toggleSidebar} className="p-2 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        {activeView === 'overview' && <Dashboard />}
        {activeView === 'conversations' && <Conversations />}
        {activeView === 'meetings' && <Meetings />}
      </div>
    </div>
  );
};

export default App;