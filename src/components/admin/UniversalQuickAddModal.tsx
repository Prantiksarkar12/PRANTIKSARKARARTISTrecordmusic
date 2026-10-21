import React, { useState } from 'react';
import {
  X,
  Plus,
  Disc,
  Film,
  BookOpen,
  Newspaper,
  Calendar,
  Camera,
  Radio,
  Bell,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Key,
  Crown
} from 'lucide-react';
import { db } from '../../services/db';
import { labelService } from '../../services/labelInviteService';
import { ContentStatus, Release, Video, Post, PressArticle, EventItem, GalleryItem, PromotionItem } from '../../types';

export type QuickAddType =
  | 'release'
  | 'video'
  | 'post'
  | 'press'
  | 'event'
  | 'gallery'
  | 'promo'
  | 'notification'
  | 'vip_invite';

interface UniversalQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: QuickAddType;
  onSuccess?: (message: string) => void;
}

export const UniversalQuickAddModal: React.FC<UniversalQuickAddModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'release',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<QuickAddType>(defaultType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  // 1. Release
  const [releaseForm, setReleaseForm] = useState({
    title: '',
    type: 'Single' as Release['type'],
    release_date: new Date().toISOString().split('T')[0],
    artist: 'Prantik Sarkar',
    genre: 'Hip Hop / Rap',
    artwork_url: '',
    audio_preview_url: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    description: '',
    spotify_url: 'https://open.spotify.com',
    apple_music_url: 'https://music.apple.com',
    youtube_music_url: 'https://youtube.com',
    status: 'PUBLISHED' as ContentStatus,
    featured: false,
  });

  // 2. Video
  const [videoForm, setVideoForm] = useState({
    title: '',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'YouTube' as Video['platform'],
    thumbnail_url: '',
    director: 'Prantik Sarkar',
    duration: '3:45',
    description: '',
    published_date: new Date().toISOString().split('T')[0],
    status: 'PUBLISHED' as ContentStatus,
    featured: false,
  });

  // 3. Post
  const [postForm, setPostForm] = useState({
    title: '',
    category: 'Creative Note' as Post['category'],
    excerpt: '',
    content: '',
    cover_image: '',
    author: 'Prantik Sarkar',
    read_time: '3 min read',
    tags: 'Music, Production, Creative Journey',
    status: 'PUBLISHED' as ContentStatus,
    featured: false,
  });

  // 4. Press
  const [pressForm, setPressForm] = useState({
    publication: 'Rolling Stone India',
    title: '',
    coverage_type: 'Interview' as PressArticle['coverage_type'],
    external_url: 'https://rollingstoneindia.com',
    author_name: 'Editorial Staff',
    publication_date: new Date().toISOString().split('T')[0],
    excerpt: '',
    status: 'PUBLISHED' as ContentStatus,
    featured: false,
  });

  // 5. Event
  const [eventForm, setEventForm] = useState({
    title: '',
    venue: '',
    city: 'Kolkata',
    country: 'India',
    date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    time: '20:00',
    ticket_url: 'https://insider.in',
    ticket_status: 'Available' as EventItem['ticket_status'],
    description: '',
    status: 'PUBLISHED' as ContentStatus,
  });

  // 6. Gallery
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Stage Performance' as GalleryItem['category'],
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    caption: '',
    photographer_credit: 'Prantik Sarkar Visuals',
    featured: false,
  });

  // 7. Promo
  const [promoForm, setPromoForm] = useState({
    title: '',
    type: 'BANNER' as PromotionItem['type'],
    description: '',
    cta_label: 'Stream Now',
    cta_url: '/music',
    is_active: true,
    priority: 1,
  });

  // 8. Notification
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    audience: 'ALL',
    type: 'SYSTEM' as const,
  });

  // 9. VIP Invite
  const [vipForm, setVipForm] = useState({
    artist_name: '',
    email: '',
    custom_royalty_share: 85,
    personal_note: 'You are cordially invited to join Prantik Sarkar Records with direct distribution access.',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      if (activeTab === 'release') {
        if (!releaseForm.title.trim()) throw new Error('Please enter a release title.');
        const newRel = db.saveRelease({
          title: releaseForm.title.trim(),
          type: releaseForm.type,
          release_date: releaseForm.release_date,
          artist: releaseForm.artist,
          genre: releaseForm.genre,
          artwork_url: releaseForm.artwork_url.trim() || undefined,
          audio_preview_url: releaseForm.audio_preview_url.trim(),
          description: releaseForm.description.trim(),
          spotify_url: releaseForm.spotify_url.trim(),
          apple_music_url: releaseForm.apple_music_url.trim(),
          youtube_music_url: releaseForm.youtube_music_url.trim(),
          status: releaseForm.status,
          featured: releaseForm.featured,
        });
        const msg = `New Release "${newRel.title}" published instantly!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'video') {
        if (!videoForm.title.trim()) throw new Error('Please enter a video title.');
        const newVid = db.saveVideo({
          title: videoForm.title.trim(),
          video_url: videoForm.video_url.trim(),
          platform: videoForm.platform,
          thumbnail_url: videoForm.thumbnail_url.trim(),
          director: videoForm.director.trim(),
          duration: videoForm.duration.trim(),
          description: videoForm.description.trim(),
          published_date: videoForm.published_date,
          status: videoForm.status,
          featured: videoForm.featured,
        });
        const msg = `Video "${newVid.title}" added to visuals catalog!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'post') {
        if (!postForm.title.trim()) throw new Error('Please enter a post title.');
        const tagsArr = postForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
        const newPost = db.savePost({
          title: postForm.title.trim(),
          category: postForm.category,
          excerpt: postForm.excerpt.trim() || postForm.content.slice(0, 140),
          content: postForm.content.trim(),
          cover_image: postForm.cover_image.trim(),
          author: postForm.author.trim(),
          read_time: postForm.read_time.trim(),
          tags: tagsArr,
          status: postForm.status,
          featured: postForm.featured,
        });
        const msg = `Journal Article "${newPost.title}" published!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'press') {
        if (!pressForm.title.trim()) throw new Error('Please enter a press title.');
        const newPress = db.savePress({
          publication: pressForm.publication.trim(),
          title: pressForm.title.trim(),
          coverage_type: pressForm.coverage_type,
          external_url: pressForm.external_url.trim(),
          author_name: pressForm.author_name.trim(),
          publication_date: pressForm.publication_date,
          excerpt: pressForm.excerpt.trim(),
          status: pressForm.status,
          featured: pressForm.featured,
        });
        const msg = `Press feature "${newPress.title}" recorded!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'event') {
        if (!eventForm.title.trim() || !eventForm.venue.trim()) throw new Error('Please provide show title and venue.');
        const newEvt = db.saveEvent({
          title: eventForm.title.trim(),
          venue: eventForm.venue.trim(),
          city: eventForm.city.trim(),
          country: eventForm.country.trim(),
          date: eventForm.date,
          time: eventForm.time,
          ticket_url: eventForm.ticket_url.trim(),
          ticket_status: eventForm.ticket_status,
          description: eventForm.description.trim(),
          status: eventForm.status,
        });
        const msg = `Tour date "${newEvt.title}" added to tour calendar!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'gallery') {
        if (!galleryForm.title.trim()) throw new Error('Please enter a photo title.');
        const newGal = db.saveGalleryItem({
          title: galleryForm.title.trim(),
          category: galleryForm.category,
          image_url: galleryForm.image_url.trim(),
          caption: galleryForm.caption.trim(),
          photographer_credit: galleryForm.photographer_credit.trim(),
          featured: galleryForm.featured,
        });
        const msg = `Photo "${newGal.title}" added to official gallery!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'promo') {
        if (!promoForm.title.trim()) throw new Error('Please enter a promotion title.');
        const newPromo = db.savePromotion({
          title: promoForm.title.trim(),
          type: promoForm.type,
          description: promoForm.description.trim(),
          cta_label: promoForm.cta_label.trim(),
          cta_url: promoForm.cta_url.trim(),
          is_active: promoForm.is_active,
          priority: Number(promoForm.priority) || 1,
        });
        const msg = `Promotion banner "${newPromo.title}" saved and activated!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'notification') {
        if (!notifForm.title.trim() || !notifForm.message.trim()) throw new Error('Please provide notification title and message.');
        const users = db.getUsers();
        let count = 0;
        users.forEach((u) => {
          db.state.notifications.unshift({
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            user_id: u.id,
            title: notifForm.title.trim(),
            message: notifForm.message.trim(),
            type: notifForm.type,
            is_read: false,
            created_at: new Date().toISOString(),
          });
          count++;
        });
        db.saveState();
        db.broadcast('notification_sent', { count });
        const msg = `System notification dispatched to ${count} fan accounts!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      } else if (activeTab === 'vip_invite') {
        if (!vipForm.artist_name.trim() || !vipForm.email.trim()) throw new Error('Please enter artist name and email.');
        const inv = labelService.createInvitation({
          artist_name: vipForm.artist_name.trim(),
          email: vipForm.email.trim(),
          notes: `${vipForm.personal_note.trim()} [VIP Terms: ${vipForm.custom_royalty_share}% royalty share agreed]`,
          created_by: 'Owner (Prantik Sarkar)',
        });
        const msg = `VIP Label Invitation Token issued for ${inv.artist_name}!`;
        onSuccess?.(msg);
        setStatusMessage({ type: 'success', text: msg });
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred while saving.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems: { id: QuickAddType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'release', label: 'Music Release', icon: Disc },
    { id: 'video', label: 'Video / Cinema', icon: Film },
    { id: 'post', label: 'Journal Post', icon: BookOpen },
    { id: 'event', label: 'Tour Date', icon: Calendar },
    { id: 'press', label: 'Press Feature', icon: Newspaper },
    { id: 'gallery', label: 'Gallery Photo', icon: Camera },
    { id: 'promo', label: 'Promo Banner', icon: Radio },
    { id: 'notification', label: 'Broadcast Alert', icon: Bell },
    { id: 'vip_invite', label: 'VIP Artist Invite', icon: Crown },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        className="w-full max-w-3xl bg-[#0c0c12] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                Universal Quick Add
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  OWNER & ADMIN
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Instantly deploy new releases, videos, stories, tour dates, and announcements in real time.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-2 bg-zinc-950/60 border-b border-white/10 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setStatusMessage(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: RELEASE */}
          {activeTab === 'release' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Track / Project Title *</label>
                  <input
                    type="text"
                    required
                    value={releaseForm.title}
                    onChange={(e) => setReleaseForm({ ...releaseForm, title: e.target.value })}
                    placeholder="e.g. CYBER CYGNET (Single)"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Release Type</label>
                  <select
                    value={releaseForm.type}
                    onChange={(e) => setReleaseForm({ ...releaseForm, type: e.target.value as Release['type'] })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  >
                    <option value="Single">Single</option>
                    <option value="EP">EP (Extended Play)</option>
                    <option value="Album">Album</option>
                    <option value="Mixtape">Mixtape</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Release Date</label>
                  <input
                    type="date"
                    value={releaseForm.release_date}
                    onChange={(e) => setReleaseForm({ ...releaseForm, release_date: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Genre</label>
                  <input
                    type="text"
                    value={releaseForm.genre}
                    onChange={(e) => setReleaseForm({ ...releaseForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Artwork Image URL (Optional)</label>
                  <input
                    type="url"
                    value={releaseForm.artwork_url}
                    onChange={(e) => setReleaseForm({ ...releaseForm, artwork_url: e.target.value })}
                    placeholder="https://... (Leave blank for default dynamic artwork)"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Audio Preview URL (.mp3)</label>
                  <input
                    type="url"
                    value={releaseForm.audio_preview_url}
                    onChange={(e) => setReleaseForm({ ...releaseForm, audio_preview_url: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Description & Liner Notes</label>
                  <textarea
                    rows={2}
                    value={releaseForm.description}
                    onChange={(e) => setReleaseForm({ ...releaseForm, description: e.target.value })}
                    placeholder="Narrative backdrop, production credits, and lyrical themes..."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={releaseForm.featured}
                    onChange={(e) => setReleaseForm({ ...releaseForm, featured: e.target.checked })}
                    className="accent-rose-600 rounded"
                  />
                  <span className="text-zinc-300">Set as Featured Spotlight Release</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Video Title *</label>
                  <input
                    type="text"
                    required
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="e.g. NIGHT CYPHER (Official Music Video)"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">YouTube / Video URL *</label>
                  <input
                    type="url"
                    required
                    value={videoForm.video_url}
                    onChange={(e) => setVideoForm({ ...videoForm, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Director / Producer</label>
                  <input
                    type="text"
                    value={videoForm.director}
                    onChange={(e) => setVideoForm({ ...videoForm, director: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Duration (e.g. 3:45)</label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POST / JOURNAL */}
          {activeTab === 'post' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Article / Story Title *</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="e.g. The Architecture of Underground Cadence"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Category</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value as Post['category'] })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  >
                    <option value="Creative Note">Creative Note</option>
                    <option value="Behind The Scenes">Behind The Scenes</option>
                    <option value="News">News</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Release Story">Release Story</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={postForm.tags}
                    onChange={(e) => setPostForm({ ...postForm, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Story Excerpt</label>
                  <input
                    type="text"
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                    placeholder="Short summary for homepage and card previews..."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Full Content</label>
                  <textarea
                    rows={4}
                    required
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    placeholder="Write the full journal essay or announcement..."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TOUR EVENT */}
          {activeTab === 'event' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Show / Concert Title *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. Night Cypher Live in Kolkata"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.venue}
                    onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                    placeholder="e.g. Underground Studio Lounge"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">City</label>
                  <input
                    type="text"
                    value={eventForm.city}
                    onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Show Date</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Ticket Booking URL</label>
                  <input
                    type="url"
                    value={eventForm.ticket_url}
                    onChange={(e) => setEventForm({ ...eventForm, ticket_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRESS FEATURE */}
          {activeTab === 'press' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Publication Name *</label>
                  <input
                    type="text"
                    required
                    value={pressForm.publication}
                    onChange={(e) => setPressForm({ ...pressForm, publication: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Article Headline *</label>
                  <input
                    type="text"
                    required
                    value={pressForm.title}
                    onChange={(e) => setPressForm({ ...pressForm, title: e.target.value })}
                    placeholder="e.g. Prantik Sarkar: The New Vanguard of Underground Hip-Hop"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Coverage Type</label>
                  <select
                    value={pressForm.coverage_type}
                    onChange={(e) => setPressForm({ ...pressForm, coverage_type: e.target.value as PressArticle['coverage_type'] })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  >
                    <option value="Feature">Feature</option>
                    <option value="Interview">Interview</option>
                    <option value="Review">Review</option>
                    <option value="Cover Story">Cover Story</option>
                    <option value="News">News</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Article Link URL</label>
                  <input
                    type="url"
                    value={pressForm.external_url}
                    onChange={(e) => setPressForm({ ...pressForm, external_url: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Pull Quote / Excerpt</label>
                  <textarea
                    rows={2}
                    value={pressForm.excerpt}
                    onChange={(e) => setPressForm({ ...pressForm, excerpt: e.target.value })}
                    placeholder="Short highlighted quote from the review or interview..."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PHOTO GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Photo Title *</label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    placeholder="e.g. Stage Cypher — Kolkata Live"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">High-Res Image URL *</label>
                  <input
                    type="url"
                    required
                    value={galleryForm.image_url}
                    onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Photo Category</label>
                  <select
                    value={galleryForm.category}
                    onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value as GalleryItem['category'] })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  >
                    <option value="Stage Performance">Stage Performance</option>
                    <option value="Studio Session">Studio Session</option>
                    <option value="Portrait">Portrait</option>
                    <option value="Behind The Scenes">Behind The Scenes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Photographer Credit</label>
                  <input
                    type="text"
                    value={galleryForm.photographer_credit}
                    onChange={(e) => setGalleryForm({ ...galleryForm, photographer_credit: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROMO BANNER */}
          {activeTab === 'promo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Banner Headline *</label>
                  <input
                    type="text"
                    required
                    value={promoForm.title}
                    onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                    placeholder="e.g. NEW SINGLE 'CYBER CYPHER' STREAMING NOW"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Subtext / Description</label>
                  <input
                    type="text"
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                    placeholder="Available across 150+ international music platforms."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Button Label</label>
                  <input
                    type="text"
                    value={promoForm.cta_label}
                    onChange={(e) => setPromoForm({ ...promoForm, cta_label: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Target URL</label>
                  <input
                    type="text"
                    value={promoForm.cta_url}
                    onChange={(e) => setPromoForm({ ...promoForm, cta_url: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: BROADCAST NOTIFICATION */}
          {activeTab === 'notification' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1">
                <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
                  Real-Time Fan Dispatch
                </p>
                <p className="text-[11px] text-zinc-400">
                  This message will be injected directly into all registered fan notification centers.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Notification Title *</label>
                  <input
                    type="text"
                    required
                    value={notifForm.title}
                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    placeholder="e.g. VIP Pre-Sale Live for Kolkata Cypher"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Dispatch Message *</label>
                  <textarea
                    rows={3}
                    required
                    value={notifForm.message}
                    onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                    placeholder="Write the broadcast message that fans will see..."
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: VIP ARTIST INVITE */}
          {activeTab === 'vip_invite' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1">
                <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  Issue VIP Label Invitation Token
                </p>
                <p className="text-[11px] text-zinc-400">
                  Create a private one-click invitation token for signed artists with preferential royalty terms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Artist / Group Name *</label>
                  <input
                    type="text"
                    required
                    value={vipForm.artist_name}
                    onChange={(e) => setVipForm({ ...vipForm, artist_name: e.target.value })}
                    placeholder="e.g. Rhythmic Horizon"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Artist Email *</label>
                  <input
                    type="email"
                    required
                    value={vipForm.email}
                    onChange={(e) => setVipForm({ ...vipForm, email: e.target.value })}
                    placeholder="artist@labeltalent.com"
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">
                    Custom Royalty Payout Share ({vipForm.custom_royalty_share}%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="70"
                      max="100"
                      step="1"
                      value={vipForm.custom_royalty_share}
                      onChange={(e) => setVipForm({ ...vipForm, custom_royalty_share: Number(e.target.value) })}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {vipForm.custom_royalty_share}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-300 font-bold uppercase text-[10px]">Personal Invitation Note</label>
                  <textarea
                    rows={2}
                    value={vipForm.personal_note}
                    onChange={(e) => setVipForm({ ...vipForm, personal_note: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900/90 border border-white/10 rounded-lg text-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Action Bar */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-[11px] text-zinc-500 font-mono">
              Auto-persisted to live PostgreSQL & distributed in real time
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing...' : 'Deploy Now'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
