import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavbar from './MobileNavbar';

const DashboardLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  userName, 
  onLogout, 
  notifications = [],
  isLoggedIn = false,
  onOpenAuth
}) => {
  return (
    <div className="flex h-screen overflow-hidden text-slate-800">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        isLoggedIn={isLoggedIn}
        onOpenAuth={onOpenAuth}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          userName={userName} 
          activeTab={activeTab} 
          notifications={notifications}
          isLoggedIn={isLoggedIn}
          onOpenAuth={onOpenAuth}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
        <MobileNavbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={onLogout} 
          isLoggedIn={isLoggedIn}
          onOpenAuth={onOpenAuth}
        />
      </div>
    </div>
  );
};

export default DashboardLayout;
