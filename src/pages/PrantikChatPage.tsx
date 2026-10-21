import React, { useState } from 'react';
import { User } from '../types';
import { PrantikChatWorkspace } from '../components/chat/PrantikChatWorkspace';
import { AuthModal } from '../components/auth/AuthModal';
import { MessageSquare, ArrowLeft, Shield, Sparkles, LogIn } from 'lucide-react';
import { db } from '../services/db';

interface PrantikChatPageProps {
  currentUser: User | null;
  onBackToSite: () => void;
  onNavigateToDashboard?: () => void;
}

export const PrantikChatPage: React.FC<PrantikChatPageProps> = ({
  currentUser,
  onBackToSite,
  onNavigateToDashboard,
}) => {
  const [authOpen, setAuthOpen] = useState(false);

  // If no authenticated user, provide a guest session so any visitor can use PRANTIK CHAT
  const activeUser: User = currentUser || {
    id: 'guest_visitor',
    name: 'Guest Fan',
    email: 'guest@prantiksarkar.com',
    role: 'USER',
    avatar_url: undefined,
    is_active: true,
    two_factor_enabled: false,
    notification_preferences: {
      new_releases: true,
      new_videos: true,
      new_articles: true,
      press_updates: false,
      events: true,
      booking_updates: false,
      messages: true,
      marketing_updates: false,
    },
    privacy_settings: {
      profile_visibility: 'PUBLIC',
      allow_activity_logging: true,
      newsletter_opt_in: false,
      show_online_status: true,
      show_last_seen: true,
      show_read_receipts: true,
      show_typing_status: true,
      allow_direct_messages: 'everyone',
    },
    created_at: new Date().toISOString(),
  };

  return (
    <div className="pt-20 pb-12 min-h-screen bg-[#070709] text-zinc-100 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
        {/* Top Header Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/80 border border-white/10 rounded-2xl px-5 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-base sm:text-lg text-white uppercase tracking-tight">
                  PRANTIK CHAT
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
                  REAL-TIME HUMAN + AI
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Direct hotline to Admin, Press, Support, Creator teams & PRANTIK AI with 2-minute response priority.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!currentUser ? (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-900/40 flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Sync</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-white font-bold">{currentUser.name}</span>
                <span className="text-rose-400 text-[10px]">({currentUser.role})</span>
              </div>
            )}
          </div>
        </div>

        {/* PRANTIK CHAT Workspace */}
        <div className="flex-1 w-full">
          <PrantikChatWorkspace
            currentUser={activeUser}
            fullHeight={true}
            onNavigateHome={onBackToSite}
          />
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          window.location.reload();
        }}
        onNavigateToDashboard={() => onNavigateToDashboard?.()}
      />
    </div>
  );
};
