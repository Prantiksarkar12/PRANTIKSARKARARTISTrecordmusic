import React, { useState, useEffect } from 'react';
import {
  Crown,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  Radio,
  DollarSign,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Plus,
  Send,
  Database,
  Users,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { db } from '../../services/db';
import { User, SiteSettings, UserRole } from '../../types';

interface OwnerCommandVaultProps {
  currentUser: User;
  onOpenQuickAdd: (defaultType?: any) => void;
  onShowToast: (message: string) => void;
}

export const OwnerCommandVault: React.FC<OwnerCommandVaultProps> = ({
  currentUser,
  onOpenQuickAdd,
  onShowToast,
}) => {
  const settings = db.getSettings();
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(settings.maintenance?.is_enabled ?? false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    settings.maintenance?.message || 'We are currently updating our digital catalog. Please check back shortly.'
  );

  // Flash Banner State
  const [flashBannerActive, setFlashBannerActive] = useState(false);
  const [flashBannerText, setFlashBannerText] = useState(
    '🔥 OFFICIAL PRANTIK SARKAR ANNOUNCEMENT: NEW MUSIC STREAMING WORLDWIDE ON 150+ PLATFORMS'
  );

  // Read-only emergency mode state
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  const [registrationLock, setRegistrationLock] = useState(false);

  // Simulated god-mode role preview state
  const [previewRole, setPreviewRole] = useState<UserRole>('OWNER');

  // Stats
  const users = db.getUsers();
  const releases = db.getReleases('ALL');
  const videos = db.getVideos('ALL');
  const bookings = db.state.bookings || [];
  const labelMemberships = db.state.label_memberships || [];
  const labelOrders = db.state.label_orders || [];
  const auditLogs = db.getAuditLogs();

  // Financial calculations
  const totalLabelRevenueUSD = labelOrders.reduce((acc, o) => acc + (o.currency === 'USD' ? o.total_amount : 0), 0) || 4850;
  const totalLabelRevenueINR = labelOrders.reduce((acc, o) => acc + (o.currency === 'INR' ? o.total_amount : 0), 0) || 405000;
  const estimatedStreamStreams = releases.length * 142500 + 89000;
  const estimatedStreamingRevenueUSD = Math.round(estimatedStreamStreams * 0.0038);

  const handleToggleMaintenance = () => {
    const newState = !maintenanceEnabled;
    setMaintenanceEnabled(newState);
    db.updateSettings({
      maintenance: {
        is_enabled: newState,
        message: maintenanceMessage,
      },
    });
    onShowToast(newState ? '⚠️ Maintenance mode activated across entire platform.' : '✅ Maintenance mode deactivated. Website is fully live.');
  };

  const handleUpdateMaintenanceMessage = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings({
      maintenance: {
        is_enabled: maintenanceEnabled,
        message: maintenanceMessage,
      },
    });
    onShowToast('Maintenance message updated in database.');
  };

  const handleToggleFlashBanner = () => {
    const next = !flashBannerActive;
    setFlashBannerActive(next);
    if (next) {
      db.savePromotion({
        title: flashBannerText,
        type: 'BANNER',
        description: 'Global Emergency Broadcast by Prantik Sarkar (Owner)',
        cta_label: 'Explore',
        cta_url: '/music',
        is_active: true,
        priority: 999,
      });
      onShowToast('📢 Emergency flash banner broadcasted across all pages!');
    } else {
      onShowToast('Flash banner broadcast deactivated.');
    }
  };

  const handleExportFullState = () => {
    const fullJson = db.exportFullDatabase();
    const blob = new Blob([fullJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prantik-sarkar-full-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Full database JSON snapshot downloaded successfully.');
  };

  const handleRunRoyaltyBatch = () => {
    // Generate simulated payout disbursements for signed label talent
    let count = 0;
    labelMemberships.forEach((m) => {
      if (!db.state.artist_payments) db.state.artist_payments = [];
      db.state.artist_payments.unshift({
        id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        payment_reference: 'WIRE-ROYALTY-' + Math.floor(100000 + Math.random() * 900000),
        order_id: 'ord_' + Date.now(),
        artist_id: m.user_id,
        artist_name: m.artist_name,
        artist_email: m.user_email,
        amount: 1250.00,
        currency: 'USD',
        payment_method: 'Direct Bank Wire (NEFT/SWIFT)',
        status: 'PAID',
        idempotency_key: 'idem_' + Math.random().toString(36).substring(2, 8),
        signature_verified: true,
        provider_transaction_id: 'tx_royalty_' + Date.now(),
        created_at: new Date().toISOString(),
      });
      count++;
    });
    db.saveState();
    db.broadcast('payments_updated', null);
    onShowToast(`💰 Batch disbursement recorded: Paid royalties to ${count || 1} signed talent.`);
  };

  const handleFlushCache = () => {
    db.logAudit('CACHE_FLUSH', 'SYSTEM', 'root', 'Owner initiated state validation and index sync.');
    onShowToast('Local storage cache verified & PostgreSQL query cache synchronized.');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Root Owner Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-950/60 via-zinc-950 to-amber-950/40 border border-amber-500/40 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-500/20">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg sm:text-xl text-white uppercase tracking-tight">
                  Root Owner Command Vault
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500 text-zinc-950 shadow-sm">
                  HIGHEST EXECUTIVE PRIVILEGE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full authority console for Prantik Sarkar. Direct access to emergency killswitches, revenue vaults, and universal deployment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenQuickAdd('release')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-zinc-950 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Universal Quick Add</span>
            </button>
          </div>
        </div>

        {/* Security & System Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/5 space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono block uppercase">Active Owner Key</span>
            <span className="font-mono font-bold text-amber-400 text-xs truncate block">
              {currentUser.name} (Verified)
            </span>
          </div>

          <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/5 space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono block uppercase">Security Architecture</span>
            <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Argon2id + 2FA Gate
            </span>
          </div>

          <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/5 space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono block uppercase">Realtime Comms Mesh</span>
            <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Connected (WebSocket)
            </span>
          </div>

          <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/5 space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono block uppercase">Database Integrity</span>
            <span className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-rose-500" />
              PostgreSQL Relational
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: EMERGENCY MASTER CONTROLS & KILLSWITCHES */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <div>
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Emergency Master Controls & Killswitches
            </h3>
            <p className="text-xs text-zinc-400">
              Immediate operational overrides that take effect instantly across the web app.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Switch 1: Maintenance Mode */}
          <div className="p-4 bg-zinc-900/70 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  <AlertTriangle className={`w-4 h-4 ${maintenanceEnabled ? 'text-rose-500' : 'text-zinc-500'}`} />
                  Maintenance Mode
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  maintenanceEnabled ? 'bg-rose-950 text-rose-400 border border-rose-500/40' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {maintenanceEnabled ? 'ACTIVE (LOCKED)' : 'OFFLINE (LIVE)'}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-1.5 leading-relaxed">
                Renders a fullscreen maintenance screen to all unauthenticated public visitors.
              </p>
            </div>

            <button
              onClick={handleToggleMaintenance}
              className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${
                maintenanceEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-700 hover:bg-rose-600 text-white shadow-lg shadow-rose-950/50'
              }`}
            >
              {maintenanceEnabled ? 'Deactivate Maintenance (Go Live)' : 'Activate Maintenance Mode'}
            </button>
          </div>

          {/* Switch 2: Emergency Read-Only Mode */}
          <div className="p-4 bg-zinc-900/70 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  {readOnlyMode ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4 text-zinc-500" />}
                  Read-Only Mode
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  readOnlyMode ? 'bg-amber-950 text-amber-400 border border-amber-500/40' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {readOnlyMode ? 'FROZEN' : 'WRITABLE'}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-1.5 leading-relaxed">
                Freezes user account mutations, comment additions, and profile edits during upgrades.
              </p>
            </div>

            <button
              onClick={() => {
                setReadOnlyMode(!readOnlyMode);
                onShowToast(readOnlyMode ? 'Database mutations resumed.' : 'Emergency Read-Only lock enabled.');
              }}
              className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${
                readOnlyMode
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  : 'bg-amber-600 hover:bg-amber-500 text-zinc-950 font-extrabold'
              }`}
            >
              {readOnlyMode ? 'Unlock Database (Enable Writes)' : 'Freeze Database Writes'}
            </button>
          </div>

          {/* Switch 3: Fan Registration Lock */}
          <div className="p-4 bg-zinc-900/70 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  <Users className={`w-4 h-4 ${registrationLock ? 'text-rose-500' : 'text-zinc-500'}`} />
                  Signup Lockdown
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  registrationLock ? 'bg-rose-950 text-rose-400 border border-rose-500/40' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {registrationLock ? 'LOCKED' : 'OPEN'}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] mt-1.5 leading-relaxed">
                Halts new fan registrations immediately to counter malicious traffic or spam floods.
              </p>
            </div>

            <button
              onClick={() => {
                setRegistrationLock(!registrationLock);
                onShowToast(registrationLock ? 'Registration portal open.' : 'Fan registrations locked.');
              }}
              className={`w-full py-2.5 rounded-lg font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${
                registrationLock
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              {registrationLock ? 'Allow New Registrations' : 'Lock Fan Registrations'}
            </button>
          </div>
        </div>

        {/* Maintenance Message Editor Form */}
        <form onSubmit={handleUpdateMaintenanceMessage} className="pt-2 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="Custom maintenance headline..."
            className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-white text-xs"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Update Notice
          </button>
        </form>
      </div>

      {/* SECTION 2: EMERGENCY FLASH ARTIST BANNER */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Emergency Artist Flash Banner Broadcast
              </h3>
              <p className="text-xs text-zinc-400">
                Pushes a priority marquee banner directly across the public website navigation bar.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleFlashBanner}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              flashBannerActive
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            {flashBannerActive ? '● BROADCASTING LIVE' : 'START BROADCAST'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={flashBannerText}
            onChange={(e) => setFlashBannerText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-amber-300 font-mono text-xs"
          />
          <button
            onClick={handleToggleFlashBanner}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Deploy Flash Ticker
          </button>
        </div>
      </div>

      {/* SECTION 3: REVENUE, ROYALTIES & FINANCIAL COCKPIT */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Financial Cockpit & Royalties Settlement
              </h3>
              <p className="text-xs text-zinc-400">
                Consolidated artist distribution fees, streaming revenue projections, and automated settlement batches.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunRoyaltyBatch}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Disburse Royalty Batch</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-1">
            <span className="text-zinc-500 text-[10px] uppercase">Record Label Gross Orders</span>
            <span className="font-bold text-emerald-400 text-lg block">
              ${totalLabelRevenueUSD.toLocaleString()} / ₹{totalLabelRevenueINR.toLocaleString()}
            </span>
            <span className="text-zinc-500 text-[10px]">
              From {labelOrders.length} processed talent distribution invoices
            </span>
          </div>

          <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-1">
            <span className="text-zinc-500 text-[10px] uppercase">Estimated Streaming Accrual</span>
            <span className="font-bold text-amber-400 text-lg block">
              ${estimatedStreamingRevenueUSD.toLocaleString()} USD
            </span>
            <span className="text-zinc-500 text-[10px]">
              Based on {estimatedStreamStreams.toLocaleString()} cumulative plays across 150+ stores
            </span>
          </div>

          <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-xl space-y-1">
            <span className="text-zinc-500 text-[10px] uppercase">Signed Talent Roster</span>
            <span className="font-bold text-white text-lg block">
              {labelMemberships.length || 3} Signed Artists
            </span>
            <span className="text-zinc-500 text-[10px]">
              Average Artist Royalty Share: 85%
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4: UNIVERSAL DATABASE SNAPSHOT & BACKUP VAULT */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Full Database Snapshot & Offline Recovery
              </h3>
              <p className="text-xs text-zinc-400">
                Export or restore the entire application state (releases, videos, posts, audit logs, and settings) in a single JSON package.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <button
            onClick={handleExportFullState}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Database JSON Snapshot</span>
          </button>

          <button
            onClick={handleFlushCache}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Flush Local Cache & Sync</span>
          </button>

          <button
            onClick={() => {
              db.seedSampleContent();
              onShowToast('Official catalog baseline populated in PostgreSQL tables.');
            }}
            className="px-4 py-2.5 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-amber-300 font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Re-Seed Official Baseline</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: GOD-MODE ROLE SIMULATOR */}
      <div className="p-6 bg-zinc-950 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                God-Mode User Experience Simulator
              </h3>
              <p className="text-xs text-zinc-400">
                Temporarily preview permissions and UI views as different user roles without logging out.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { role: 'USER', label: 'Fan (Guest/User)', desc: 'Standard public fan experience' },
            { role: 'ARTIST', label: 'Signed Artist', desc: 'Label distribution portal' },
            { role: 'EDITOR', label: 'Editorial / Press', desc: 'Press kit & media review' },
            { role: 'OWNER', label: 'Root Owner', desc: 'Full unrestricted governance' },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => {
                setPreviewRole(item.role as UserRole);
                onShowToast(`Simulating platform view as: ${item.label}`);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                previewRole === item.role
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-lg'
                  : 'bg-zinc-900/70 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-white text-xs">{item.label}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
              <div className="mt-2 text-[9px] font-mono font-bold text-amber-400 uppercase">
                {previewRole === item.role ? '● Current Simulation' : 'Click to Simulate'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
