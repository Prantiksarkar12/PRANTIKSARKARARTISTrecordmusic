import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Upload,
  Music,
  Tv,
  Users,
  FileText,
  Sparkles,
  ExternalLink,
  Mail,
  Info,
  Plus,
  Trash2,
  Copy,
  Check,
  PenTool,
  Image as ImageIcon,
  Calendar,
  Link as LinkIcon,
  Clock,
  Award,
} from 'lucide-react';
import { labelService, OFFICIAL_LABEL_EMAIL } from '../../services/labelInviteService';
import {
  LabelApplication,
  LabelApplicationStatus,
  LabelApplicationUrlEntry,
} from '../../types';
import { useRealtimeData } from '../../hooks/useRealtimeData';

export const OFFICIAL_LABEL_EMBLEM_URL =
  'https://images.openai.com/static-rsc-4/sWpwXzLP0fFECjf9yuA8yqkC0LGKaG5Tki_vuRnri-jjvf2Lq8Et7LuKC3K16a8C6sVSZlhvqk4GjJZwl5t4G8-3GEM327rYFnOutA7I6hNMAMVPPp3DOnLN5DJGmLG35nP35ENhaVopmAzklIGL504UOMRq7RH_j0U3VZjL7lA?purpose=inline';

interface RequestInvitationFormProps {
  onNavigate: (route: string) => void;
  prefillInvitationCode?: string;
}

const URL_ENTRY_TYPES: LabelApplicationUrlEntry['entry_type'][] = [
  'Artist profile',
  'Official track / release',
  'Album / EP',
  'Music video',
  'VEVO channel / video',
  'Studio / producer credit',
  'Portfolio / EPK',
  'Other',
];

function isValidHttpUrl(val: string): boolean {
  if (!val || !val.trim()) return false;
  try {
    const parsed = new URL(val.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const RequestInvitationForm: React.FC<RequestInvitationFormProps> = ({
  onNavigate,
  prefillInvitationCode,
}) => {
  const { currentUser } = useRealtimeData();
  const isAuthorizedReviewer =
    currentUser?.role === 'OWNER' ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.email?.toLowerCase() === 'prantiksarkarartist@gmail.com';

  // Emblem fallback state
  const [emblemLoadError, setEmblemLoadError] = useState(false);

  // 1. Applicant Details
  const [fullName, setFullName] = useState('');
  const [artistName, setArtistName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [professionalStatus, setProfessionalStatus] = useState<
    'Independent artist' | 'Currently signed to a label' | 'Artist and music producer' | 'Other'
  >('Independent artist');
  const [primaryGenre, setPrimaryGenre] = useState('Hip Hop / Rap');

  // 2. Profile Photo & Identity
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [profilePhotoUploadedData, setProfilePhotoUploadedData] = useState('');
  const [profilePhotoFileName, setProfilePhotoFileName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  // 3. Artist Eligibility
  const [eligibilityVerifiedBadge, setEligibilityVerifiedBadge] = useState(true);
  const [eligibilityBadgePlatform, setEligibilityBadgePlatform] = useState('Spotify for Artists');
  const [eligibilityBadgeUrl, setEligibilityBadgeUrl] = useState('');
  const [eligibilityTenReleases, setEligibilityTenReleases] = useState(false);

  // 4. Unlimited Artist, Release and Studio URLs + Artist Bio
  const [unlimitedUrls, setUnlimitedUrls] = useState<LabelApplicationUrlEntry[]>([
    {
      id: 'url_1',
      entry_type: 'Artist profile',
      platform_name: 'Spotify',
      title_or_name: '',
      url: '',
      verified_format: false,
    },
  ]);
  const [artistBio, setArtistBio] = useState('');

  // 5. Requested Service and Fees
  const [requestedAnnualPlan, setRequestedAnnualPlan] = useState(true);
  const [requestedVevoChannel, setRequestedVevoChannel] = useState(false);
  const [requestedVevoVideo, setRequestedVevoVideo] = useState(false);
  const [requestedVevoVideoCount, setRequestedVevoVideoCount] = useState(1);
  const [requestedAllServices, setRequestedAllServices] = useState(false);

  // 6. Applicant Signature
  const [signatureMode, setSignatureMode] = useState<'url' | 'upload' | 'draw'>('url');
  const [applicantSignatureUrl, setApplicantSignatureUrl] = useState('');
  const [applicantSignatureUploadedData, setApplicantSignatureUploadedData] = useState('');
  const [applicantSignatureFileName, setApplicantSignatureFileName] = useState('');
  const [applicantSignatureTypedName, setApplicantSignatureTypedName] = useState('');
  const [consentPrivacyProcessing, setConsentPrivacyProcessing] = useState(false);
  const [consentAccuracyRights, setConsentAccuracyRights] = useState(false);

  // Signature Drawing Pad Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 7. Label Representative — Internal Use Only
  const [repName, setRepName] = useState(
    isAuthorizedReviewer ? 'Prantik Sarkar — Founder & Managing Director' : ''
  );
  const [repSignatureUrl, setRepSignatureUrl] = useState('');
  const [repApplicationStatus, setRepApplicationStatus] =
    useState<LabelApplicationStatus>('SUBMITTED');

  // Optional Invitation Code
  const [invitationCode, setInvitationCode] = useState(prefillInvitationCode || '');

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<LabelApplication | null>(null);

  // Handle Profile Photo Upload (Validated JPG, PNG, WebP up to 5MB)
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid profile photo format. Please upload JPG, PNG, or WebP only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Profile photo file size exceeds 5 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhotoUploadedData(reader.result);
        setProfilePhotoFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Applicant Signature Upload (Validated PNG, JPG, WebP up to 2MB)
  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg('Invalid signature image format. Please upload PNG, JPG, or WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Signature image exceeds 2 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setApplicantSignatureUploadedData(reader.result);
        setApplicantSignatureFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Interactive Signature Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setApplicantSignatureUploadedData(canvas.toDataURL('image/png'));
      setApplicantSignatureFileName('Drawn Electronic Signature (PNG)');
    }
  };

  const clearSignatureCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setApplicantSignatureUploadedData('');
    setApplicantSignatureFileName('');
  };

  // Unlimited URLs Handlers
  const handleAddUrlEntry = (defaultType: LabelApplicationUrlEntry['entry_type'] = 'Artist profile') => {
    setUnlimitedUrls((prev) => [
      ...prev,
      {
        id: `url_${Date.now()}_${prev.length + 1}`,
        entry_type: defaultType,
        platform_name: '',
        title_or_name: '',
        url: '',
        verified_format: false,
      },
    ]);
  };

  const handleQuickAddTenReleaseSlots = () => {
    setEligibilityTenReleases(true);
    setUnlimitedUrls((prev) => {
      const needed = Math.max(0, 10 - prev.length);
      const additions: LabelApplicationUrlEntry[] = Array.from({ length: needed }, (_, idx) => ({
        id: `url_${Date.now()}_rel_${prev.length + idx + 1}`,
        entry_type: 'Official track / release',
        platform_name: 'Spotify / Apple Music / YouTube',
        title_or_name: `Official Release #${prev.length + idx + 1}`,
        url: '',
        verified_format: false,
      }));
      return [...prev, ...additions];
    });
  };

  const handleUpdateUrlEntry = (
    id: string,
    field: keyof LabelApplicationUrlEntry,
    value: string
  ) => {
    setUnlimitedUrls((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.verified_format = isValidHttpUrl(updated.url);
        return updated;
      })
    );
  };

  const handleRemoveUrlEntry = (id: string) => {
    if (unlimitedUrls.length <= 1) return;
    setUnlimitedUrls((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle "Request all services"
  const handleToggleAllServices = (checked: boolean) => {
    setRequestedAllServices(checked);
    if (checked) {
      setRequestedAnnualPlan(true);
      setRequestedVevoChannel(true);
      setRequestedVevoVideo(true);
    }
  };

  // Distinct valid URLs calculation for Section 3 & 4 verification
  const validDistinctUrls = Array.from(
    new Set(
      unlimitedUrls
        .filter((u) => isValidHttpUrl(u.url) && u.platform_name.trim() && u.title_or_name.trim())
        .map((u) => u.url.trim().toLowerCase())
    )
  );

  const distinctReleaseUrlsCount = Array.from(
    new Set(
      unlimitedUrls
        .filter(
          (u) =>
            (u.entry_type === 'Official track / release' ||
              u.entry_type === 'Album / EP' ||
              u.entry_type === 'Music video' ||
              u.entry_type === 'VEVO channel / video') &&
            isValidHttpUrl(u.url)
        )
        .map((u) => u.url.trim().toLowerCase())
    )
  ).length;

  // Proposed First-Year Fee Calculation (For transparency display only — no payment collected before approval)
  const joiningFeeInr = 1000;
  const annualPlanFeeInr = requestedAnnualPlan || requestedAllServices ? 1999 : 0;
  const vevoChannelFeeInr = requestedVevoChannel || requestedAllServices ? 5000 : 0;
  const vevoVideosFeeInr =
    requestedVevoVideo || requestedAllServices ? 3000 * Math.max(1, requestedVevoVideoCount) : 0;
  const estimatedFirstYearTotalInr =
    joiningFeeInr + annualPlanFeeInr + vevoChannelFeeInr + vevoVideosFeeInr;

  // Build Formatted Application Text for "Copy complete application" & "Open email invitation request"
  const buildFormattedApplicationDossierText = (): string => {
    const urlsFormatted = unlimitedUrls
      .map(
        (u, idx) =>
          `  ${idx + 1}. [${u.entry_type}] ${u.platform_name || 'N/A'} — ${u.title_or_name || 'N/A'}: ${u.url || 'N/A'}`
      )
      .join('\n');

    const servicesList: string[] = ['One-Time Joining Fee (₹1,000 — upon official approval)'];
    if (requestedAnnualPlan || requestedAllServices) {
      servicesList.push('Annual Label Plan (₹1,999/year)');
    }
    if (requestedVevoChannel || requestedAllServices) {
      servicesList.push('VEVO Channel Creation (Proposed ₹5,000)');
    }
    if (requestedVevoVideo || requestedAllServices) {
      servicesList.push(
        `VEVO Video Delivery (${requestedVevoVideoCount} video(s) × ₹3,000 = ₹${(
          requestedVevoVideoCount * 3000
        ).toLocaleString()})`
      );
    }

    return [
      '====================================================================',
      'PRANTIK SARKAR ARTIST RECORD — ARTIST APPLICATION & INVITATION REQUEST',
      'Access Policy: Email Invitation Request & Curatorial Review Only',
      '====================================================================',
      '',
      '1. APPLICANT DETAILS',
      `• Full Legal Name: ${fullName || 'N/A'}`,
      `• Artist / Stage Name: ${artistName || 'N/A'}`,
      `• Email Address: ${email || 'N/A'}`,
      `• Phone Number: ${phone || 'N/A'}`,
      `• Country / City: ${country || 'N/A'}${city ? `, ${city}` : ''}`,
      `• Date of Birth: ${dateOfBirth || 'N/A'}`,
      `• Professional Status: ${professionalStatus}`,
      `• Primary Genre: ${primaryGenre || 'N/A'}`,
      '',
      '2. PROFILE PHOTO & IDENTITY',
      `• Profile Photo URL: ${profilePhotoUrl || (profilePhotoFileName ? `[Uploaded: ${profilePhotoFileName}]` : 'N/A')}`,
      `• Contact / Billing Address: ${billingAddress || 'Not provided (Optional)'}`,
      '',
      '3. ARTIST ELIGIBILITY',
      `• Route A — Official DSP Verified Artist Badge: ${eligibilityVerifiedBadge ? `YES (${eligibilityBadgePlatform} — ${eligibilityBadgeUrl || 'URL in Section 4'})` : 'NO'}`,
      `• Route B — At Least 10 Officially Released Tracks: ${eligibilityTenReleases ? `YES (${validDistinctUrls.length} distinct verified URLs attached)` : 'NO'}`,
      '',
      `4. UNLIMITED ARTIST, RELEASE & STUDIO URLS (${unlimitedUrls.length} Entries)`,
      urlsFormatted,
      '',
      'ARTIST BIOGRAPHY:',
      artistBio || 'N/A',
      '',
      '5. REQUESTED SERVICES & PROPOSED FEES',
      `• Selected Services: ${servicesList.join(' | ')}`,
      `• Proposed First-Year Total (if approved): ₹${estimatedFirstYearTotalInr.toLocaleString()}`,
      `• Proposed Royalty Split: 85% Artist / 15% Label Commission`,
      '',
      '6. APPLICANT SIGNATURE & DECLARATIONS',
      `• Typed Name for Signature Record: ${applicantSignatureTypedName || fullName || 'N/A'}`,
      `• Signature Image / Record: ${applicantSignatureUrl || (applicantSignatureFileName ? `[Uploaded: ${applicantSignatureFileName}]` : 'Recorded electronically')}`,
      `• Privacy & Retention Consent: ${consentPrivacyProcessing ? 'ACCEPTED' : 'PENDING'}`,
      `• Accuracy, Rights & No-Guarantee Declaration: ${consentAccuracyRights ? 'ACCEPTED' : 'PENDING'}`,
      `• Signed Timestamp: ${new Date().toISOString()}`,
      '',
      '7. LABEL REPRESENTATIVE — INTERNAL USE ONLY',
      `• Authorized Representative: ${repName || 'Pending Label Review'}`,
      `• Application Status: ${repApplicationStatus}`,
      '====================================================================',
    ].join('\n');
  };

  const handleCopyApplicationText = async () => {
    const text = buildFormattedApplicationDossierText();
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3500);
    } catch {
      setErrorMsg('Unable to copy automatically. Please select and copy manually.');
    }
  };

  const handleOpenEmailRequest = () => {
    const subject = encodeURIComponent(
      `Artist Invitation Request — PRANTIK SARKAR ARTIST RECORD (${artistName || fullName || 'New Applicant'})`
    );
    const body = encodeURIComponent(buildFormattedApplicationDossierText());
    window.location.href = `mailto:${OFFICIAL_LABEL_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate Section 1
    if (!fullName.trim() || !artistName.trim() || !email.trim()) {
      setErrorMsg('Section 1: Full legal name, Artist / stage name, and Email address are required.');
      return;
    }

    if (confirmEmail.trim() && email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setErrorMsg('Section 1: Email address and Confirm email address must match.');
      return;
    }

    // Validate Section 3 Eligibility
    if (!eligibilityVerifiedBadge && !eligibilityTenReleases) {
      setErrorMsg(
        'Section 3: You must qualify through at least one route (Official DSP Verified Artist Badge OR at least 10 officially released tracks).'
      );
      return;
    }

    // Validate Section 4 URLs & Bio
    if (validDistinctUrls.length === 0) {
      setErrorMsg(
        'Section 4: Please provide at least one valid URL (starting with https:// or http://) with its platform and artist/release name.'
      );
      return;
    }

    // If qualifying ONLY via Route B (10 officially released tracks), verify at least 10 distinct URLs
    if (!eligibilityVerifiedBadge && eligibilityTenReleases && validDistinctUrls.length < 10) {
      setErrorMsg(
        `Section 4 (10-Release Route Verification): You selected the 10-release eligibility route, which requires at least 10 distinct valid release URLs. Currently verified: ${validDistinctUrls.length} of 10.`
      );
      return;
    }

    if (!artistBio.trim()) {
      setErrorMsg('Section 4: Artist biography is mandatory.');
      return;
    }

    // Validate Section 6 Applicant Signature & Consents
    if (!applicantSignatureTypedName.trim()) {
      setErrorMsg('Section 6: Please enter your typed full legal name for the signature record.');
      return;
    }

    if (!consentPrivacyProcessing || !consentAccuracyRights) {
      setErrorMsg(
        'Section 6: You must check both mandatory consent and accuracy declarations before submitting.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Extract primary streaming links from unlimitedUrls for backward compatibility
      const findUrlByPlatform = (keyword: string) =>
        unlimitedUrls.find((u) => u.platform_name.toLowerCase().includes(keyword))?.url || '';

      const docs = [];
      if (profilePhotoUploadedData || profilePhotoUrl) {
        docs.push({
          id: `doc_photo_${Date.now()}`,
          application_id: 'TEMP',
          document_type: 'photo' as const,
          file_name: profilePhotoFileName || 'Artist Profile Photo URL',
          file_url: profilePhotoUploadedData || profilePhotoUrl,
          access_level: 'PRIVATE' as const,
          uploaded_at: new Date().toISOString(),
        });
      }
      if (applicantSignatureUploadedData || applicantSignatureUrl) {
        docs.push({
          id: `doc_sig_${Date.now()}`,
          application_id: 'TEMP',
          document_type: 'signature' as const,
          file_name: applicantSignatureFileName || 'Applicant Signature Record',
          file_url: applicantSignatureUploadedData || applicantSignatureUrl,
          access_level: 'PRIVATE' as const,
          uploaded_at: new Date().toISOString(),
        });
      }

      const res = labelService.submitRequestInvitation({
        full_name: fullName.trim(),
        artist_name: artistName.trim(),
        email: email.trim().toLowerCase(),
        confirm_email: (confirmEmail || email).trim().toLowerCase(),
        phone: phone.trim(),
        country: country.trim() || 'India',
        city: city.trim() || country.trim() || 'India',
        date_of_birth: dateOfBirth,
        professional_status: professionalStatus,
        primary_genre: primaryGenre,
        profile_photo_url: profilePhotoUrl.trim(),
        profile_photo_uploaded_data: profilePhotoUploadedData || undefined,
        billing_address: billingAddress.trim(),
        eligibility_verified_badge: eligibilityVerifiedBadge,
        eligibility_badge_platform: eligibilityBadgePlatform,
        eligibility_badge_url: eligibilityBadgeUrl.trim(),
        eligibility_ten_releases: eligibilityTenReleases,
        unlimited_urls: unlimitedUrls.filter((u) => u.url.trim()),
        artist_bio: artistBio.trim(),
        music_type_description: `${professionalStatus} — ${primaryGenre}. ${artistBio.trim()}`,
        spotify_url: findUrlByPlatform('spotify') || eligibilityBadgeUrl,
        apple_music_url: findUrlByPlatform('apple'),
        youtube_url: findUrlByPlatform('youtube') || findUrlByPlatform('vevo'),
        amazon_music_url: findUrlByPlatform('amazon'),
        jiosaavn_url: findUrlByPlatform('saavn') || findUrlByPlatform('jio'),
        instagram_url: findUrlByPlatform('instagram'),
        requested_annual_plan: requestedAnnualPlan || requestedAllServices,
        requested_vevo_channel: requestedVevoChannel || requestedAllServices,
        requested_vevo_video: requestedVevoVideo || requestedAllServices,
        requested_vevo_video_count: requestedVevoVideoCount,
        requested_all_services: requestedAllServices,
        services_interest: {
          music_distribution: requestedAnnualPlan || requestedAllServices,
          video_distribution: requestedVevoVideo || requestedAllServices,
          vevo_services: requestedVevoChannel || requestedVevoVideo || requestedAllServices,
          video_channel_services: requestedVevoChannel || requestedAllServices,
          release_management: true,
          artist_support: true,
          other_services: false,
        },
        applicant_signature_url: applicantSignatureUrl.trim(),
        applicant_signature_uploaded_data: applicantSignatureUploadedData || undefined,
        applicant_signature_typed_name: applicantSignatureTypedName.trim(),
        applicant_signed_at: new Date().toISOString(),
        label_representative_name: isAuthorizedReviewer ? repName.trim() : undefined,
        label_representative_signature_url: isAuthorizedReviewer ? repSignatureUrl.trim() : undefined,
        label_representative_signed_at:
          isAuthorizedReviewer && repSignatureUrl.trim() ? new Date().toISOString() : undefined,
        application_status: isAuthorizedReviewer ? repApplicationStatus : 'SUBMITTED',
        was_invited: invitationCode.trim() ? 'Yes' : 'No',
        invitation_code: invitationCode.trim(),
        why_work_with_psar: artistBio.trim(),
        how_discovered: 'Official Website',
        uploaded_documents: docs,
        declaration_accurate: consentAccuracyRights,
        declaration_authority: consentAccuracyRights,
        declaration_no_agreement: consentAccuracyRights,
        declaration_additional_info: consentAccuracyRights,
        declaration_admin_review: consentPrivacyProcessing,
        declaration_terms: consentAccuracyRights,
        declaration_privacy: consentPrivacyProcessing,
        declaration_contact_consent: consentPrivacyProcessing,
      });

      if (res.success && res.application) {
        setSubmittedApp(res.application);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.error || 'Submission failed. Please verify all mandatory fields.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================
  // SUBMITTED SUCCESS VIEW
  // ========================================================
  if (submittedApp) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-[#0b0b12] border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              OFFICIAL APPLICATION DOSSIER REGISTERED
            </span>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
              Application Submitted for Review
            </h1>
            <p className="font-mono text-rose-400 font-bold text-lg">
              Application Reference ID: {submittedApp.id}
            </p>
          </div>

          <p className="text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Your complete 7-section artist application and invitation request has been recorded in the{' '}
            <strong className="text-white">PRANTIK SARKAR ARTIST RECORD</strong> review queue.
          </p>

          <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 text-xs text-zinc-400 max-w-lg mx-auto space-y-2.5 text-left font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-zinc-500">Applicant / Stage Name:</span>
              <span className="text-white font-bold">
                {submittedApp.full_name} ({submittedApp.artist_name})
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-zinc-500">Contact Email:</span>
              <span className="text-zinc-200">{submittedApp.email}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-zinc-500">Verified URL Records Saved:</span>
              <span className="text-emerald-400 font-bold">
                {submittedApp.unlimited_urls?.length || 1} URLs
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-zinc-500">Applicant Signature Record:</span>
              <span className="text-rose-300 font-bold">
                Signed by {submittedApp.applicant_signature_typed_name}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-zinc-500">Current Review Status:</span>
              <span className="text-amber-400 font-bold">{submittedApp.application_status}</span>
            </div>
            <div className="pt-1 text-[11px] text-zinc-400 font-sans leading-relaxed">
              <strong>Review Timeline:</strong> 1. Initial Review (3–5 business days) · 2. Verification Check (up to 7 business days) · 3. Final Decision / Invitation (within 14 business days). No payment is requested until official approval and written agreement terms are issued.
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyApplicationText}
              className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-rose-400" />}
              <span>{copySuccess ? 'Copied Complete Application!' : 'Copy Complete Application'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenEmailRequest}
              className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Open Email Invitation Request</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/label')}
              className="px-7 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-950/50 cursor-pointer"
            >
              Return to Record Label
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-2 sm:px-6 space-y-8">
      {/* ======================================================== */}
      {/* LUXURY 3D BLACK, RED & GOLD EMBLEM HEADER */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#130d14] via-[#0b0b10] to-[#08080c] border border-amber-500/30 p-6 sm:p-10 text-center space-y-5 shadow-2xl overflow-hidden">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-br from-amber-400 via-rose-600 to-amber-700 shadow-2xl shadow-rose-950/80 flex items-center justify-center overflow-hidden">
            {!emblemLoadError ? (
              <img
                src={OFFICIAL_LABEL_EMBLEM_URL}
                alt="PRANTIK SARKAR ARTIST RECORD — Luxury 3D Black & Red Gold Emblem"
                onError={() => setEmblemLoadError(true)}
                className="w-full h-full object-cover rounded-xl bg-black"
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-black via-zinc-950 to-rose-950 flex flex-col items-center justify-center border border-amber-400/40">
                <Award className="w-10 h-10 text-amber-400" />
                <span className="text-[9px] font-mono font-black text-amber-300 tracking-widest mt-1">
                  PSAR
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Application only — not automatic approval</span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight">
              PRANTIK SARKAR ARTIST RECORD
            </h1>

            <p className="text-xs sm:text-sm font-mono font-semibold text-rose-400 uppercase tracking-widest">
              Artist Registration · Invitation Request · Label Review
            </p>
          </div>
        </div>

        {/* Application Timeline & Eligibility Quick Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-left text-xs">
          <div className="p-3.5 bg-zinc-950/90 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-rose-400 font-bold">
              <span>STAGE 01</span>
              <span>3–5 BUSINESS DAYS</span>
            </div>
            <div className="font-bold text-white">1. Initial Review</div>
            <p className="text-[11px] text-zinc-400">
              Screening of applicant details, profile photo, and artist biography.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/90 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 font-bold">
              <span>STAGE 02</span>
              <span>UP TO 7 BUSINESS DAYS</span>
            </div>
            <div className="font-bold text-white">2. Verification Check</div>
            <p className="text-[11px] text-zinc-400">
              Audit of official DSP Verified Artist Badge or 10+ distinct official releases.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/90 rounded-xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 font-bold">
              <span>STAGE 03</span>
              <span>WITHIN 14 BUSINESS DAYS</span>
            </div>
            <div className="font-bold text-white">3. Final Decision / Invitation</div>
            <p className="text-[11px] text-zinc-400">
              Official invitation token, written contract, and label approval signature.
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/90 border border-red-500/50 text-red-200 text-xs rounded-2xl flex items-center gap-3 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPLETE 7-SECTION INTERACTIVE APPLICATION FORM */}
      {/* ======================================================== */}
      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* ======================================================== */}
        {/* SECTION 1: APPLICANT DETAILS */}
        {/* ======================================================== */}
        <section className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                SECTION 01 OF 07
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
                <Users className="w-5 h-5 text-rose-500" />
                <span>1. Applicant Details</span>
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              Fields marked with * are mandatory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                Full legal name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full legal name for contract records"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                Artist / stage name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Your official artist or stage name"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                Email address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!confirmEmail) setConfirmEmail(e.target.value);
                }}
                placeholder="artist@example.com"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                Country <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kolkata / Mumbai"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Date of birth</span>
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                Professional status
              </label>
              <select
                value={professionalStatus}
                onChange={(e) => setProfessionalStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              >
                <option value="Independent artist">Independent artist</option>
                <option value="Currently signed to a label">Currently signed to a label</option>
                <option value="Artist and music producer">Artist and music producer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">
                Primary Genre &amp; Style
              </label>
              <input
                type="text"
                value={primaryGenre}
                onChange={(e) => setPrimaryGenre(e.target.value)}
                placeholder="Hip Hop / Rap / Trap / R&B / Pop"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Optional Invitation Token Field */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs">Have an Official Invitation Token? (Optional)</div>
              <p className="text-[11px] text-zinc-400">
                If you already received an invitation code from {OFFICIAL_LABEL_EMAIL}, enter it here.
              </p>
            </div>
            <input
              type="text"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              placeholder="INV-SEC-XXXXXXXX"
              className="sm:w-64 px-3.5 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white font-mono text-xs"
            />
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: PROFILE PHOTO AND IDENTITY */}
        {/* ======================================================== */}
        <section className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                SECTION 02 OF 07
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
                <ImageIcon className="w-5 h-5 text-rose-500" />
                <span>2. Profile Photo and Identity</span>
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-mono text-zinc-300">
              Validated JPG, PNG or WebP (Max 5 MB) + URL Support
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">
                  Artist profile photo URL
                </label>
                <input
                  type="url"
                  value={profilePhotoUrl}
                  onChange={(e) => setProfilePhotoUrl(e.target.value)}
                  placeholder="https://example.com/artist-profile-photo.jpg"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Provide a direct image URL OR use the secure file upload control below (validates JPG, PNG, or WebP).
                </p>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">
                  Upload Validated Profile Photo (JPG, PNG, WebP — Max 5 MB)
                </label>
                <label className="flex items-center justify-between px-4 py-3 bg-zinc-950 hover:bg-zinc-900 border border-dashed border-white/20 hover:border-rose-500/50 rounded-xl cursor-pointer transition-colors">
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Upload className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-medium">
                      {profilePhotoFileName || 'Choose JPG, PNG, or WebP photo file...'}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                    Browse File
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">
                  Contact / billing address (optional)
                </label>
                <textarea
                  rows={2}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Street address, City, State / Province, Postal Code, Country (Optional)"
                  className="w-full p-3.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Live Profile Photo Preview */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-2">
              <div className="w-28 h-28 rounded-2xl bg-zinc-900 border border-white/15 overflow-hidden flex items-center justify-center">
                {profilePhotoUploadedData || profilePhotoUrl ? (
                  <img
                    src={profilePhotoUploadedData || profilePhotoUrl}
                    alt="Applicant Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-10 h-10 text-zinc-700" />
                )}
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">
                {profilePhotoUploadedData
                  ? 'Validated Upload Active'
                  : profilePhotoUrl
                  ? 'External Photo URL Active'
                  : 'Photo Preview'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-[11px] text-amber-200/90 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Identity &amp; Sensitive Document Protection Notice:</strong> Identity documents should be requested only when necessary for rights, contract, tax or identity verification. Do not send sensitive government ID documents through an unsecured public form.
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: ARTIST ELIGIBILITY */}
        {/* ======================================================== */}
        <section className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                SECTION 03 OF 07
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                <span>3. Artist Eligibility</span>
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-mono font-bold">
              MUST QUALIFY THROUGH AT LEAST ONE ROUTE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Route A */}
            <div
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                eligibilityVerifiedBadge
                  ? 'bg-rose-950/25 border-rose-500/50 shadow-lg'
                  : 'bg-zinc-950 border-white/10'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eligibilityVerifiedBadge}
                  onChange={(e) => setEligibilityVerifiedBadge(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <div className="space-y-1">
                  <div className="font-display font-bold text-sm text-white uppercase">
                    I have an eligible official artist verification badge
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Must be an <strong>official artist badge from major music DSPs</strong> such as{' '}
                    <strong>Spotify for Artists</strong>, <strong>Apple Music for Artists</strong>, or{' '}
                    <strong>YouTube Official Artist Channel (OAC)</strong> — <strong>NOT just a social media checkmark</strong>.
                  </p>
                </div>
              </label>

              {eligibilityVerifiedBadge && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div>
                    <label className="text-zinc-400 text-[11px] font-semibold block mb-1">
                      Verified Music Platform (DSP)
                    </label>
                    <select
                      value={eligibilityBadgePlatform}
                      onChange={(e) => setEligibilityBadgePlatform(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs"
                    >
                      <option value="Spotify for Artists">Spotify for Artists (Verified Badge)</option>
                      <option value="Apple Music for Artists">Apple Music for Artists</option>
                      <option value="YouTube Official Artist Channel (OAC)">YouTube Official Artist Channel (OAC ♪)</option>
                      <option value="Amazon Music for Artists">Amazon Music for Artists</option>
                      <option value="JioSaavn ArtistOne">JioSaavn ArtistOne Verified</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-[11px] font-semibold block mb-1">
                      Verified Artist Profile Link
                    </label>
                    <input
                      type="url"
                      value={eligibilityBadgeUrl}
                      onChange={(e) => setEligibilityBadgeUrl(e.target.value)}
                      placeholder="https://open.spotify.com/artist/..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Route B */}
            <div
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                eligibilityTenReleases
                  ? 'bg-emerald-950/25 border-emerald-500/50 shadow-lg'
                  : 'bg-zinc-950 border-white/10'
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eligibilityTenReleases}
                  onChange={(e) => setEligibilityTenReleases(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-1">
                  <div className="font-display font-bold text-sm text-white uppercase">
                    I have at least 10 officially released tracks
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Must have at least <strong>10 distinct official releases</strong> publicly live on recognized digital streaming platforms and attributable to your artist profile.
                  </p>
                </div>
              </label>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono">
                  <span className="text-zinc-400">Distinct Valid URLs in Sec 4: </span>
                  <strong
                    className={
                      validDistinctUrls.length >= 10 ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {validDistinctUrls.length} / 10
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAddTenReleaseSlots}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-mono font-bold cursor-pointer"
                >
                  + Prepare 10 Release Rows
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl text-[11px] text-zinc-400 leading-relaxed">
            <strong className="text-white">Proposed Admission Rule:</strong> Applicants must qualify through at least one route. Social-media verification alone (Instagram, X, or Facebook checkmarks) does not count as an official artist badge. All claims and release catalogs are subject to human A&amp;R review.
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: UNLIMITED ARTIST, RELEASE AND STUDIO URLS */}
        {/* ======================================================== */}
        <section className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                SECTION 04 OF 07
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
                <LinkIcon className="w-5 h-5 text-rose-500" />
                <span>4. Unlimited Artist, Release and Studio URLs</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Add one entry for each artist profile, track, album, music video, studio, portfolio or other relevant link.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-300">
                Total Links: <strong className="text-white">{unlimitedUrls.length}</strong> · Verified:{' '}
                <strong className="text-emerald-400">{validDistinctUrls.length}</strong>
              </span>
            </div>
          </div>

          {/* Dynamic Unlimited URL Entries */}
          <div className="space-y-4">
            {unlimitedUrls.map((entry, index) => {
              const urlValid = isValidHttpUrl(entry.url);
              return (
                <div
                  key={entry.id}
                  className="p-4 sm:p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-3 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30 font-mono font-bold text-[10px]">
                        Link {index + 1}
                      </span>
                      {entry.url.trim() && (
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                            urlValid
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-950 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {urlValid ? '✓ VALID URL RECORD' : 'INVALID URL (USE HTTPS://)'}
                        </span>
                      )}
                    </div>

                    {unlimitedUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUrlEntry(entry.id)}
                        className="text-zinc-500 hover:text-red-400 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="text-zinc-400 text-[11px] font-semibold block mb-1">
                        Entry type
                      </label>
                      <select
                        value={entry.entry_type}
                        onChange={(e) =>
                          handleUpdateUrlEntry(entry.id, 'entry_type', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs"
                      >
                        {URL_ENTRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-zinc-400 text-[11px] font-semibold block mb-1">
                        Platform / studio name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={entry.platform_name}
                        onChange={(e) =>
                          handleUpdateUrlEntry(entry.id, 'platform_name', e.target.value)
                        }
                        placeholder="e.g. Spotify, Apple Music, VEVO"
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-zinc-400 text-[11px] font-semibold block mb-1">
                        Artist / release / studio name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={entry.title_or_name}
                        onChange={(e) =>
                          handleUpdateUrlEntry(entry.id, 'title_or_name', e.target.value)
                        }
                        placeholder="Track, Album, or Profile Title"
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-zinc-400 text-[11px] font-semibold block mb-1">
                        URL <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={entry.url}
                        onChange={(e) => handleUpdateUrlEntry(entry.id, 'url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/15 rounded-xl text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleAddUrlEntry('Artist profile')}
              className="px-5 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add another URL</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddUrlEntry('Official track / release')}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-zinc-300 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Music className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Add Track / Release URL</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAddTenReleaseSlots}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-amber-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              + Add 10 Release Slots (Route B)
            </button>
          </div>

          <div className="p-3.5 bg-zinc-950 border border-white/10 rounded-xl text-[11px] text-zinc-400">
            For the 10-release route, the production backend verifies at least 10 distinct official releases ({distinctReleaseUrlsCount} release URLs currently formatted). Adding ten text fields alone does not establish eligibility.
          </div>

          {/* Artist Biography */}
          <div className="pt-2">
            <label className="text-zinc-200 font-bold text-sm block mb-1.5">
              Artist biography <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={artistBio}
              onChange={(e) => setArtistBio(e.target.value)}
              placeholder="Share your musical journey, notable releases, streaming milestones, sonic direction, and why you are applying to PRANTIK SARKAR ARTIST RECORD..."
              className="w-full p-4 bg-zinc-900 border border-white/15 rounded-2xl text-white text-xs leading-relaxed focus:outline-none focus:border-rose-500"
            />
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 5: REQUESTED SERVICE AND FEES */}
        {/* ======================================================== */}
        <section className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                SECTION 05 OF 07
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
                <Tv className="w-5 h-5 text-rose-500" />
                <span>5. Requested Service and Fees</span>
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
              NO PAYMENT UNTIL OFFICIAL APPROVAL &amp; WRITTEN TERMS
            </span>
          </div>

          {/* Interactive Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="p-4 bg-zinc-950 border border-white/10 hover:border-rose-500/40 rounded-2xl flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requestedAnnualPlan || requestedAllServices}
                onChange={(e) => setRequestedAnnualPlan(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600"
              />
              <div>
                <div className="font-bold text-white text-xs">
                  Annual label plan — ₹1,999/year
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Music distribution plan, release &amp; licensing requests, and email artist support.
                </p>
              </div>
            </label>

            <label className="p-4 bg-zinc-950 border border-white/10 hover:border-amber-500/40 rounded-2xl flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requestedVevoChannel || requestedAllServices}
                onChange={(e) => setRequestedVevoChannel(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-500"
              />
              <div>
                <div className="font-bold text-white text-xs">
                  VEVO channel creation — proposed ₹5,000
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Official ArtistVEVO channel setup and submission service, subject to partner access.
                </p>
              </div>
            </label>

            <div className="p-4 bg-zinc-950 border border-white/10 hover:border-amber-500/40 rounded-2xl flex items-start justify-between gap-3">
              <label className="flex items-start gap-3 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={requestedVevoVideo || requestedAllServices}
                  onChange={(e) => setRequestedVevoVideo(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500"
                />
                <div>
                  <div className="font-bold text-white text-xs">
                    VEVO video delivery — proposed ₹3,000 per video
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Charged separately per music video submitted for VEVO network delivery.
                  </p>
                </div>
              </label>
              {(requestedVevoVideo || requestedAllServices) && (
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-400">Videos:</span>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={requestedVevoVideoCount}
                    onChange={(e) =>
                      setRequestedVevoVideoCount(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="w-14 px-2 py-1 bg-zinc-900 border border-white/15 rounded-lg text-white font-mono text-xs text-center"
                  />
                </div>
              )}
            </div>

            <label className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requestedAllServices}
                onChange={(e) => handleToggleAllServices(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600"
              />
              <div>
                <div className="font-bold text-rose-300 text-xs uppercase">
                  Request all services
                </div>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Includes Joining Fee (₹1,000) + Annual Plan (₹1,999) + VEVO Channel (₹5,000) + VEVO Video Delivery (₹3,000).
                </p>
              </div>
            </label>
          </div>

          {/* Proposed Price List Cards */}
          <div className="space-y-3 pt-2">
            <h3 className="font-display font-bold text-xs text-zinc-300 uppercase tracking-wider">
              Proposed price list
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-1">
                <div className="text-[10px] text-zinc-400">One-time joining fee</div>
                <div className="font-display font-black text-xl text-white">₹1,000</div>
                <div className="text-[9px] font-mono text-amber-400">Non-refundable*</div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-1">
                <div className="text-[10px] text-zinc-400">Annual label plan</div>
                <div className="font-display font-black text-xl text-white">₹1,999/year</div>
                <div className="text-[9px] font-mono text-zinc-500">1st Yr w/ Join: ₹2,999</div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-1">
                <div className="text-[10px] text-zinc-400">VEVO channel creation</div>
                <div className="font-display font-black text-xl text-white">₹5,000</div>
                <div className="text-[9px] font-mono text-zinc-500">Per channel</div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl space-y-1">
                <div className="text-[10px] text-zinc-400">VEVO delivery per video</div>
                <div className="font-display font-black text-xl text-white">₹3,000</div>
                <div className="text-[9px] font-mono text-zinc-500">Per music video</div>
              </div>

              <div className="p-4 bg-zinc-950 border border-rose-500/30 rounded-2xl space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-zinc-400">Proposed label commission</div>
                <div className="font-display font-black text-xl text-rose-400">15%</div>
                <div className="text-[9px] font-mono text-emerald-400">85% Artist Share</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-[11px] text-zinc-400 leading-relaxed max-w-2xl">
              The joining fee is proposed as non-refundable only to the extent permitted by applicable law and disclosed terms. Fees are separate unless the written agreement says otherwise. VEVO access and pricing require confirmed partner availability.
            </div>
            <div className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-right shrink-0">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Estimated 1st-Year Total</div>
              <div className="font-mono font-black text-lg text-white">
                ₹{estimatedFirstYearTotalInr.toLocaleString()}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 6: APPLICANT SIGNATURE */}
        {/* ======================================================== */}
        <section className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                SECTION 06 OF 07
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
                <PenTool className="w-5 h-5 text-rose-500" />
                <span>6. Applicant Signature</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                The applicant must supply their own signature via image URL, validated signature upload, or signature pad, alongside their typed legal name.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-white/10">
              {[
                { id: 'url', label: 'Signature URL' },
                { id: 'upload', label: 'Upload File' },
                { id: 'draw', label: 'Draw Signature' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSignatureMode(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer transition-colors ${
                    signatureMode === tab.id
                      ? 'bg-rose-600 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {signatureMode === 'url' && (
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5">
                    Applicant signature image URL
                  </label>
                  <input
                    type="url"
                    value={applicantSignatureUrl}
                    onChange={(e) => setApplicantSignatureUrl(e.target.value)}
                    placeholder="https://example.com/my-signature.png"
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {signatureMode === 'upload' && (
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5">
                    Upload Applicant Signature Image (PNG, JPG, WebP — Max 2 MB)
                  </label>
                  <label className="flex items-center justify-between px-4 py-3 bg-zinc-950 hover:bg-zinc-900 border border-dashed border-white/20 hover:border-rose-500/50 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Upload className="w-4 h-4 text-rose-400" />
                      <span className="text-xs">
                        {applicantSignatureFileName || 'Select signature image file...'}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-rose-600/20 text-rose-300 text-[10px] font-mono font-bold">
                      Upload
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleSignatureFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {signatureMode === 'draw' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-300 font-semibold">
                      Draw Your Signature Below
                    </label>
                    <button
                      type="button"
                      onClick={clearSignatureCanvas}
                      className="text-[10px] font-mono text-rose-400 hover:underline cursor-pointer"
                    >
                      Clear Pad
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    className="w-full h-28 bg-zinc-950 border border-white/20 rounded-xl cursor-crosshair"
                  />
                </div>
              )}

              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">
                  Typed name for signature record <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={applicantSignatureTypedName}
                  onChange={(e) => setApplicantSignatureTypedName(e.target.value)}
                  placeholder="Type your full legal name matching Section 1"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/15 rounded-xl text-white font-serif italic text-sm focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Signature Record Preview Box */}
            <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl flex flex-col justify-between space-y-3">
              <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center justify-between">
                <span>APPLICANT SIGNATURE RECORD PREVIEW</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>

              <div className="min-h-[80px] flex items-center justify-center border-b border-white/10 py-2">
                {applicantSignatureUploadedData || applicantSignatureUrl ? (
                  <img
                    src={applicantSignatureUploadedData || applicantSignatureUrl}
                    alt="Applicant Signature"
                    className="max-h-20 object-contain"
                  />
                ) : applicantSignatureTypedName ? (
                  <span className="font-serif italic text-2xl text-rose-300 tracking-wide">
                    {applicantSignatureTypedName}
                  </span>
                ) : (
                  <span className="text-zinc-600 text-xs italic">
                    Awaiting applicant signature...
                  </span>
                )}
              </div>

              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Signed By: {applicantSignatureTypedName || fullName || '—'}</span>
                <span className="text-emerald-400">INDEPENDENT APPLICANT RECORD</span>
              </div>
            </div>
          </div>

          {/* Mandatory Consent Checkboxes */}
          <div className="p-5 bg-zinc-950 rounded-2xl border border-white/10 space-y-3.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentPrivacyProcessing}
                onChange={(e) => setConsentPrivacyProcessing(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-zinc-200 text-xs leading-relaxed">
                I consent to the processing of the information provided for application review and have read the applicable privacy and retention terms. <span className="text-rose-400">*</span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAccuracyRights}
                onChange={(e) => setConsentAccuracyRights(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-zinc-200 text-xs leading-relaxed">
                I confirm that my information and linked materials are accurate, I have the rights needed to submit them, and I understand that applying does not guarantee acceptance or distribution. <span className="text-rose-400">*</span>
              </span>
            </label>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: LABEL REPRESENTATIVE — INTERNAL USE ONLY */}
        {/* ======================================================== */}
        <section className="bg-[#0b0b12] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                SECTION 07 OF 07 • INTERNAL USE ONLY
              </span>
              <h2 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2 mt-0.5">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>7. Label Representative — Internal Use Only</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                To be completed by the label&apos;s authorized reviewer after approval. Status must be set by the authorized team through the backend.
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold border ${
                isAuthorizedReviewer
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-white/10'
              }`}
            >
              {isAuthorizedReviewer
                ? 'AUTHORIZED OWNER / ADMIN SESSION ACTIVE'
                : 'LOCKED FOR PUBLIC APPLICANTS'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-400 font-semibold block mb-1.5">
                Authorized representative name
              </label>
              <input
                type="text"
                disabled={!isAuthorizedReviewer}
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="Completed by authorized reviewer after approval"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-zinc-300 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1.5">
                Authorized representative signature image URL
              </label>
              <input
                type="url"
                disabled={!isAuthorizedReviewer}
                value={repSignatureUrl}
                onChange={(e) => setRepSignatureUrl(e.target.value)}
                placeholder="https://... (Internal Reviewer Only)"
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-zinc-300 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-semibold block mb-1.5">
                Application status
              </label>
              <select
                disabled={!isAuthorizedReviewer}
                value={repApplicationStatus}
                onChange={(e) => setRepApplicationStatus(e.target.value as LabelApplicationStatus)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-amber-300 font-mono text-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="SUBMITTED">Pending review (Submitted)</option>
                <option value="UNDER_REVIEW">Under verification review</option>
                <option value="APPROVED">Approved (Authorized Team)</option>
                <option value="WAITLISTED">Waitlisted (Capacity 40)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SUBMIT, COPY APPLICATION & OPEN EMAIL INVITATION ACTIONS */}
        {/* ======================================================== */}
        <div className="bg-[#0b0b12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyApplicationText}
                className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                {copySuccess ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-rose-400" />
                )}
                <span>{copySuccess ? 'Copied Complete Application!' : 'Copy complete application'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenEmailRequest}
                className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Open email invitation request</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xl shadow-rose-950/60 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Registering Application Dossier...'
                  : 'Submit Official Application Dossier'}
              </span>
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-white/10 pt-4">
            Submitting above stores your application dossier directly in the secure label review queue with audit logging and email confirmation. Copying creates formatted application text; opening email pre-fills an email to{' '}
            <strong className="text-white font-mono">{OFFICIAL_LABEL_EMAIL}</strong> (note: mailto links do not attach local files automatically).
          </p>

          {/* Important Implementation & Governance Requirements Box */}
          <div className="p-5 bg-zinc-950 border border-white/10 rounded-2xl space-y-3">
            <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Important Implementation &amp; Governance Architecture</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-zinc-400 leading-relaxed">
              <div>
                • <strong className="text-zinc-200">Real File Uploads:</strong> Profile photo and signature support validated JPG, PNG, and WebP uploads with strict size limits and private access controls alongside URL records.
              </div>
              <div>
                • <strong className="text-zinc-200">Unlimited URLs:</strong> Each URL entry is saved as a separate structured database record and validated for distinct URL formatting.
              </div>
              <div>
                • <strong className="text-zinc-200">Eligibility Review:</strong> Validates official DSP artist badges (Spotify for Artists / Apple Music for Artists) or at least 10 distinct official releases before approval.
              </div>
              <div>
                • <strong className="text-zinc-200">Payment Policy:</strong> Collected only after official approval and written terms; recorded from verified transaction events.
              </div>
              <div>
                • <strong className="text-zinc-200">Independent Signatures:</strong> Applicant and authorized label representative sign independently with audit timestamps.
              </div>
              <div>
                • <strong className="text-zinc-200">Privacy &amp; Retention:</strong> Identity information is restricted to authorized label reviewers with full erasure/retention procedures at{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/label/privacy')}
                  className="text-rose-400 hover:underline cursor-pointer"
                >
                  /label/privacy
                </button>
                .
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
