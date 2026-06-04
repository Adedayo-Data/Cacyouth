import { useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? '';
const inputCls = (err?: boolean) =>
  `w-full bg-white/5 border ${err ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base`;

interface Registration {
  id: string;
  name: string;
  phone?: string;
  state: string;
  dob?: string;
  dccZone?: string;
  uniqueCode: string;
  verified: boolean;
  verifiedAt?: string;
}

interface StaffSession {
  id: string;
  name: string;
  username: string;
  state: 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER';
  mustChangePassword?: boolean;
}

const STATE_LABELS: Record<string, string> = {
  FCT: 'FCT (Abuja)', NIGER: 'Niger State', KADUNA: 'Kaduna State', OTHER: 'Other States',
};

const STATE_THEME: Record<string, { bg: string; text: string; border: string }> = {
  FCT:    { bg: 'from-blue-950 to-gray-950',   text: 'text-blue-400',   border: 'border-blue-500/30' },
  NIGER:  { bg: 'from-green-950 to-gray-950',  text: 'text-green-400',  border: 'border-green-500/30' },
  KADUNA: { bg: 'from-yellow-950 to-gray-950', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  OTHER:  { bg: 'from-purple-950 to-gray-950', text: 'text-purple-400', border: 'border-purple-500/30' },
};

function calcAge(dob?: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const notYet = today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (notYet) age--;
  return age;
}

function ageCategory(age: number | null): { label: string; cls: string } {
  if (age === null) return { label: '—', cls: 'text-gray-400' };
  if (age < 18)  return { label: 'Teenager',   cls: 'text-blue-400' };
  if (age <= 25) return { label: 'Youth',       cls: 'text-green-400' };
  if (age <= 35) return { label: 'Young Adult', cls: 'text-yellow-400' };
  return             { label: 'Adult',          cls: 'text-orange-400' };
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

/* ── Verification Modal ─────────────────────────────────────────────────── */
const VerifyModal = ({
  reg, authHeader, onClose, onUpdated,
}: {
  reg: Registration;
  authHeader: Record<string, string>;
  onClose: () => void;
  onUpdated: (r: Registration) => void;
}) => {
  const [verifying, setVerifying] = useState(false);
  const age = calcAge(reg.dob);
  const cat = ageCategory(age);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API}/api/registrations/${reg.id}/verify`, {
        method: 'PATCH',
        headers: authHeader,
      });
      if (!res.ok) throw new Error();
      const updated: Registration = await res.json();
      onUpdated(updated);
    } catch { alert('Failed to update. Please try again.'); }
    finally { setVerifying(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-5">

        {/* Status banner */}
        <div className={`rounded-xl px-4 py-3 text-center text-sm font-bold ${
          reg.verified ? 'bg-green-900/40 text-green-400 border border-green-500/30' : 'bg-white/5 text-gray-400 border border-white/10'
        }`}>
          {reg.verified ? '✓ Already Verified' : '○ Not Yet Verified'}
        </div>

        {/* Details */}
        <div className="space-y-3">
          {[
            { label: 'Full Name',  value: reg.name },
            { label: 'Phone',      value: reg.phone },
            { label: 'State',      value: STATE_LABELS[reg.state] ?? reg.state },
          ].map(({ label, value }) => value ? (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="text-white font-semibold text-sm">{value}</span>
            </div>
          ) : null)}

          {/* Age & Category */}
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-gray-400 text-sm">Age</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{age !== null ? `${age} yrs` : '—'}</span>
              <span className={`px-2 py-0.5 rounded-md bg-white/5 text-xs font-semibold ${cat.cls}`}>{cat.label}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 text-sm">Reg. Code</span>
            <span className="text-amber-400 font-mono font-bold text-sm tracking-wider">{reg.uniqueCode}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-gray-300 border border-white/20 hover:border-white/40 transition-all text-sm"
          >
            Close
          </button>
          <button
            onClick={handleVerify}
            disabled={verifying}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 active:scale-95 ${
              reg.verified
                ? 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-500/30'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {verifying ? '…' : reg.verified ? 'Unverify' : '✓ Mark as Verified'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Code Lookup Panel ──────────────────────────────────────────────────── */
export const CodeLookup = ({
  prefix, authHeader, themeText,
}: {
  prefix: string;
  authHeader: Record<string, string>;
  themeText: string;
}) => {
  const [suffix, setSuffix] = useState('');
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState<Registration | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const fullCode = `${prefix}${suffix.toUpperCase()}`;

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!suffix.trim()) return;
    setLooking(true);
    setNotFound(false);
    setFound(null);
    setError('');
    try {
      const res = await fetch(`${API}/api/registrations/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ code: fullCode }),
      });
      if (res.status === 404) { setNotFound(true); return; }
      if (res.status === 403) { setError('This code belongs to a different state.'); return; }
      if (!res.ok) throw new Error();
      setFound(await res.json());
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLooking(false); }
  };

  return (
    <>
      <form onSubmit={handleLookup} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Enter Registration Code</label>
          <div className="flex items-center gap-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition-all">
            <span className={`px-4 py-4 font-mono font-bold text-sm shrink-0 border-r border-white/10 ${themeText}`}>
              {prefix}
            </span>
            <input
              type="text"
              value={suffix}
              onChange={e => { setSuffix(e.target.value.toUpperCase()); setNotFound(false); setError(''); }}
              placeholder="XXXXXX"
              maxLength={20}
              className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-600 font-mono font-bold text-sm focus:outline-none uppercase"
            />
          </div>
          {notFound && <p className="text-red-400 text-sm mt-2">No registration found for <span className="font-mono">{fullCode}</span></p>}
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={!suffix.trim() || looking}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {looking ? 'Looking up…' : 'Look Up'}
        </button>
      </form>

      {found && (
        <VerifyModal
          reg={found}
          authHeader={authHeader}
          onClose={() => { setFound(null); setSuffix(''); }}
          onUpdated={updated => setFound(updated)}
        />
      )}
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════════ */

const StaffPortal = () => {
  const [session, setSession] = useState<StaffSession | null>(() => {
    const saved = sessionStorage.getItem('cac_staff');
    return saved ? (JSON.parse(saved) as StaffSession) : null;
  });
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  /* Force password change */
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError]               = useState('');
  const [changingPwd, setChangingPwd]         = useState(false);
  const [showNewPwd, setShowNewPwd]           = useState(false);

  const handleLogin = async () => {
    setLoggingIn(true); setLoginError('');
    try {
      const res = await fetch(`${API}/api/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (res.status === 401) { setLoginError('Invalid username or password.'); return; }
      if (!res.ok) throw new Error();
      const sess: StaffSession = await res.json();
      sessionStorage.setItem('cac_staff', JSON.stringify(sess));
      setSession(sess);
    } catch { setLoginError('An error occurred. Please try again.'); }
    finally { setLoggingIn(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cac_staff');
    setSession(null);
  };

  const handleChangePassword = async () => {
    setPwdError('');
    if (newPassword.length < 8) { setPwdError('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { setPwdError('Passwords do not match'); return; }
    if (!session) return;
    setChangingPwd(true);
    try {
      const res = await fetch(`${API}/api/staff/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: session.username, currentPassword: password, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setPwdError(data.error || 'Failed to change password'); return; }
      const updated = { ...session, mustChangePassword: false };
      sessionStorage.setItem('cac_staff', JSON.stringify(updated));
      setSession(updated);
    } catch { setPwdError('An error occurred. Please try again.'); }
    finally { setChangingPwd(false); }
  };

  /* ════ LOGIN SCREEN ════ */
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/favicon.png" alt="CACYOF" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <h1 className="text-white text-2xl font-black">Staff Portal</h1>
            <p className="text-gray-400 text-sm mt-1">CACYOF 2026 Youth Conference</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Username</label>
              <input type="text" value={username} onChange={e => { setUsername(e.target.value); setLoginError(''); }}
                placeholder="Enter your username" autoComplete="username" className={inputCls()} />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="Enter your password" autoComplete="current-password"
                  className={inputCls()} style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              {loginError && <p className="text-red-400 text-xs mt-1.5">{loginError}</p>}
            </div>
            <button onClick={handleLogin} disabled={loggingIn}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-colors text-base active:scale-95 disabled:opacity-50">
              {loggingIn ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
          <p className="text-center mt-6 text-gray-500 text-sm">
            Super Admin? <a href="/admin" className="text-purple-400 hover:text-purple-300 underline">Admin Console →</a>
          </p>
        </div>
      </div>
    );
  }

  const theme = STATE_THEME[session.state] ?? STATE_THEME.FCT;
  const prefix = session.state === 'OTHER' ? 'MRY/' : `MRY/${session.state}/`;

  /* ════ FORCE PASSWORD CHANGE ════ */
  if (session.mustChangePassword) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/favicon.png" alt="CACYOF" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <h1 className="text-white text-2xl font-black">Set New Password</h1>
            <p className="text-gray-400 text-sm mt-2 leading-relaxed">
              Welcome, <span className="text-white font-semibold">{session.name}</span>!<br />
              Please set a new password before continuing.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">New Password</label>
              <div className="relative">
                <input type={showNewPwd ? 'text' : 'password'} value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwdError(''); }}
                  placeholder="At least 8 characters" className={inputCls(!!pwdError)} style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowNewPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
                  <EyeIcon open={showNewPwd} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Confirm Password</label>
              <input type="password" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setPwdError(''); }}
                placeholder="Repeat your new password" className={inputCls(!!pwdError)} />
              {pwdError && <p className="text-red-400 text-xs mt-1.5">{pwdError}</p>}
            </div>
            <button onClick={handleChangePassword} disabled={changingPwd}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-colors text-base active:scale-95 disabled:opacity-50">
              {changingPwd ? 'Saving…' : 'Save & Continue'}
            </button>
          </div>
          <button onClick={handleLogout} className="w-full mt-4 text-center text-gray-500 text-sm hover:text-gray-300 transition-colors">
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  /* ════ STAFF DASHBOARD ════ */
  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} text-white`}>
      <header className="bg-black/40 border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center gap-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/favicon.png" alt="CACYOF" className="h-9 w-9 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Verification Staff</p>
            <p className="text-white font-bold text-sm leading-tight truncate">{session.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-900/50 hover:bg-red-900 rounded-lg transition-colors">
          Logout
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* State banner */}
        <div className={`border ${theme.border} rounded-2xl p-5 text-center`}>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-semibold">
            2026 Youth Conference · Verification Portal
          </p>
          <h1 className={`text-3xl font-black uppercase tracking-wide ${theme.text}`}>
            {STATE_LABELS[session.state] ?? session.state}
          </h1>
        </div>

        {/* Code lookup */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-white font-bold text-base mb-5">Verify Attendee</h2>
          <CodeLookup
            prefix={prefix}
            authHeader={{ 'x-staff-id': session.id }}
            themeText={theme.text}
          />
        </div>

      </main>
    </div>
  );
};

export default StaffPortal;
