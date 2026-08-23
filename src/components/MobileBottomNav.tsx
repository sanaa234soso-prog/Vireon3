import React from 'react';
import { Home, Compass, Plus, MessageSquare, User as UserIcon, LayoutDashboard, LogIn } from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  activeView: string;
  currentUser: User | null;
  isAuthenticated: boolean;
  onNavigate: (view: string) => void;
  onNavigateDashboard: () => void;
  onOpenCreate: () => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  currentUser,
  isAuthenticated,
  onNavigate,
  onNavigateDashboard,
  onOpenCreate,
  unreadCount = 0
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#070A12]/95 backdrop-blur-md border-t border-[#1E293B] px-3 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeView === 'home' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        {/* Explore / Marketplace */}
        <button
          onClick={() => onNavigate('marketplace')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeView === 'marketplace' || activeView === 'creators' || activeView === 'services' || activeView === 'campaigns' || activeView === 'jobs'
              ? 'text-purple-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </button>

        {/* Create (Centered Action Button) */}
        <button
          onClick={onOpenCreate}
          className="flex items-center justify-center w-10 h-10 -mt-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50 transition-transform active:scale-95"
          title="Create New"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Messages */}
        <button
          onClick={() => onNavigate('messages')}
          className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeView === 'messages' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
            )}
          </div>
          <span>Messages</span>
        </button>

        {/* Profile / Dashboard */}
        <button
          onClick={onNavigateDashboard}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeView === 'dashboard' || activeView === 'seller' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAuthenticated && currentUser ? (
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'}
              alt={currentUser.fullName}
              className={`w-5 h-5 rounded-full object-cover border ${
                activeView === 'dashboard' || activeView === 'seller' ? 'border-purple-400' : 'border-[#1E293B]'
              }`}
            />
          ) : (
            <LogIn className="w-5 h-5" />
          )}
          <span>{isAuthenticated ? 'Dashboard' : 'Login'}</span>
        </button>

      </div>
    </div>
  );
};
