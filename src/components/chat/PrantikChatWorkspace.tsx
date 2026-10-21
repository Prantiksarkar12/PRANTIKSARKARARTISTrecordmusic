import React, { useState } from 'react';
import { User, ChatAttachment } from '../../types';
import { usePrantikChat } from '../../hooks/usePrantikChat';
import { ChatSidebar } from './ChatSidebar';
import { ChatActiveView } from './ChatActiveView';
import { ChatContextPanel } from './ChatContextPanel';
import { NewConversationModal } from './NewConversationModal';
import { ReportChatModal } from './ReportChatModal';
import { ChatAttachmentViewerModal } from './ChatAttachmentViewerModal';
import { MessageSquare, ShieldAlert, Sparkles, Plus, UserCheck, Radio, Clock } from 'lucide-react';
import { HumanAvailability } from '../../types';

interface PrantikChatWorkspaceProps {
  currentUser: User;
  initialConversationId?: string;
  onNavigateHome?: () => void;
  fullHeight?: boolean;
}

export const PrantikChatWorkspace: React.FC<PrantikChatWorkspaceProps> = ({
  currentUser,
  initialConversationId,
  onNavigateHome,
  fullHeight = true,
}) => {
  const {
    conversations,
    filteredConversations,
    selectedConversationId,
    setSelectedConversationId,
    activeConversation,
    messages,
    filterTab,
    setFilterTab,
    searchQuery,
    setSearchQuery,
    isTyping,
    unreadTotal,
    sendMessage,
    markActiveAsRead,
    addReaction,
    deleteMessage,
    editMessage,
    togglePin,
    toggleArchive,
    toggleMute,
    deleteLocally,
    startDirectChat,
    startGroupChat,
    startLabelChat,
    blockUser,
    unblockUser,
    report,
    takeoverChat,
    returnToAi,
    closeConversation,
    sendTypingIndicator,
    isAiGenerating,
    operatorPresences,
    chatSettings,
    updateOperatorPresence,
  } = usePrantikChat(currentUser, initialConversationId);

  const isOperator = ['OWNER', 'SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role);
  const myPresence = operatorPresences.find((op) => op.operator_id === currentUser.id);

  // UI state
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    conversationId: string;
    messageId?: string;
    reportedUserId?: string;
    reportedUserName?: string;
  }>({
    isOpen: false,
    conversationId: '',
  });
  const [viewerAttachment, setViewerAttachment] = useState<ChatAttachment | null>(null);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Verified Human Operator Live Console Bar */}
      {isOperator && (
        <div className="px-4 py-2 bg-gradient-to-r from-zinc-950 via-[#0e0e13] to-zinc-950 border border-white/10 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                myPresence?.availability === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                myPresence?.availability === 'ONLINE' ? 'bg-emerald-500' : myPresence?.availability === 'BUSY' ? 'bg-red-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className="font-bold uppercase tracking-wider text-zinc-300 font-mono text-[11px]">
              Operator Status:
            </span>
            <div className="inline-flex rounded-lg bg-zinc-900 p-0.5 border border-white/10">
              {(['ONLINE', 'AWAY', 'BUSY', 'OFFLINE'] as HumanAvailability[]).map((status) => (
                <button
                  key={status}
                  onClick={() => updateOperatorPresence(status)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    (myPresence?.availability || 'ONLINE') === status
                      ? status === 'ONLINE'
                        ? 'bg-emerald-600 text-white shadow'
                        : status === 'BUSY'
                        ? 'bg-red-600 text-white shadow'
                        : status === 'AWAY'
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-zinc-700 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Human Response Window: <strong className="text-amber-300 font-bold">{chatSettings?.human_response_timeout_seconds || 120}s</strong>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Real-time Server Authoritative
            </span>
          </div>
        </div>
      )}

      <div
        className={`w-full bg-[#070709] text-zinc-100 flex overflow-hidden border border-white/10 rounded-2xl shadow-2xl relative ${
          fullHeight ? 'h-[calc(100vh-8.5rem)] min-h-[580px]' : 'h-[680px]'
        }`}
      >
        {/* 1. LEFT PANE: Conversations Sidebar */}
        <div
          className={`w-full md:w-80 lg:w-92 shrink-0 h-full ${
            selectedConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ChatSidebar
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={(id) => {
              setSelectedConversationId(id);
              // On mobile, selecting a conversation shows active view
            }}
            currentUser={currentUser}
            filterTab={filterTab}
            onFilterChange={setFilterTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            unreadTotal={unreadTotal}
            onOpenNewChatModal={() => setShowNewChatModal(true)}
            onTogglePin={togglePin}
            onToggleArchive={toggleArchive}
            onToggleMute={toggleMute}
            onDeleteLocally={deleteLocally}
          />
        </div>

        {/* 2. CENTER PANE: Active Conversation View or Empty State */}
        <div
          className={`flex-1 h-full min-w-0 ${
            !selectedConversationId ? 'hidden md:flex' : 'flex'
          } flex-col`}
        >
          {activeConversation ? (
            <ChatActiveView
              conversation={activeConversation}
              messages={messages}
              currentUser={currentUser}
              onBackMobile={() => setSelectedConversationId(null)}
              onSendMessage={sendMessage}
              onMarkAsRead={markActiveAsRead}
              onAddReaction={addReaction}
              onDeleteMessage={deleteMessage}
              onEditMessage={editMessage}
              onTogglePin={() => togglePin(activeConversation.id)}
              onToggleMute={() => toggleMute(activeConversation.id)}
              onToggleArchive={() => toggleArchive(activeConversation.id)}
              onToggleInfoPanel={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
              isInfoPanelOpen={isInfoPanelOpen}
              onOpenReportModal={(msgId, rUserId, rUserName) => {
                setReportModalData({
                  isOpen: true,
                  conversationId: activeConversation.id,
                  messageId: msgId,
                  reportedUserId: rUserId,
                  reportedUserName: rUserName,
                });
              }}
              onOpenAttachmentViewer={(att) => setViewerAttachment(att)}
              isTyping={isTyping}
              isAiGenerating={isAiGenerating}
              onTakeoverChat={() => takeoverChat(activeConversation.id)}
              onReturnToAi={() => returnToAi(activeConversation.id)}
              onCloseConversation={() => closeConversation(activeConversation.id)}
              onTypingChange={(typing) => sendTypingIndicator(activeConversation.id, typing)}
              operatorPresences={operatorPresences}
            />
          ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-zinc-950/40">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-rose-500 shadow-2xl">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase tracking-tight">
                PRANTIK CHAT Console
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                Select an active conversation on the left, or open a new direct chat, group, or artist label hotline.
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Thread</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. RIGHT PANE: Context & Profile Panel (Collapsible) */}
      {isInfoPanelOpen && activeConversation && (
        <div className="hidden lg:block h-full shrink-0">
          <ChatContextPanel
            conversation={activeConversation}
            messages={messages}
            currentUser={currentUser}
            onClose={() => setIsInfoPanelOpen(false)}
            onTogglePin={() => togglePin(activeConversation.id)}
            onToggleMute={() => toggleMute(activeConversation.id)}
            onToggleArchive={() => toggleArchive(activeConversation.id)}
            onDeleteLocally={() => {
              deleteLocally(activeConversation.id);
              setIsInfoPanelOpen(false);
            }}
            onBlockUser={blockUser}
            onUnblockUser={unblockUser}
            onOpenReportModal={() => {
              setReportModalData({
                isOpen: true,
                conversationId: activeConversation.id,
              });
            }}
            onOpenAttachmentViewer={(att) => setViewerAttachment(att)}
          />
        </div>
      )}

      {/* Modals */}
      <NewConversationModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        currentUser={currentUser}
        onStartDirect={startDirectChat}
        onStartGroup={startGroupChat}
        onStartLabel={startLabelChat}
      />

      <ReportChatModal
        isOpen={reportModalData.isOpen}
        onClose={() => setReportModalData({ isOpen: false, conversationId: '' })}
        conversationId={reportModalData.conversationId}
        reportedUserId={reportModalData.reportedUserId}
        reportedUserName={reportModalData.reportedUserName}
        reportedMessageId={reportModalData.messageId}
        onSubmitReport={(convId, reason, details, rUserId, rMsgId) => {
          report(convId, reason, details, rUserId, rMsgId);
        }}
      />

      <ChatAttachmentViewerModal
        attachment={viewerAttachment}
        onClose={() => setViewerAttachment(null)}
      />
      </div>
    </div>
  );
};
