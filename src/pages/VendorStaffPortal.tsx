import { useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? '';

const inputCls = (err?: boolean) =>
  `w-full bg-white/5 border ${err ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base`;

interface Vendor {
  id: string;
  name: string;
  businessName: string;
  category: string;
  phone?: string;
  email?: string;
  uniqueCode: string;
  amount: number;
  verified: boolean;
  verifiedAt?: string;
}

interface StaffSession {
  id: string;
  name: string;
  username: string;
  state: string;
  mustChangePassword?: boolean;
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

/* ── Verify Modal ───────────────────────────────────────────────────────────── */
const VendorVerifyModal = ({
  vendor, authHeader, onClose, onUpdated,
}: {
  vendor: Vendor;
  authHeader: Record<string, string>;
  onClose: () => void;
  onUpdated: (v: Vendor) => void;
}) => {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API}/api/vendors/${vendor.id}/verify`, {
        method: 'PATCH',
        headers: authHeader,
      });
      if (!res.ok) throw new Error();
      onUpdated(await res.json());
    } catch { alert('Failed to update. Please try again.'); }
    finally { setVerifying(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-5">

        <div className={`rounded-xl px-4 py-3 text-center text-sm font-bold ${
          vendor.verified
            ? 'bg-green-900/40 text-green-400 border border-green-500/30'
            : 'bg-white/5 text-gray-400 border border-white/10'
        }`}>
          {vendor.verified ? '✓ Already Verified' : '○ Not Yet Verified'}
        </div>

        <div className="space-y-3">
          {[
            { label: 'Vendor Name',   value: vendor.name },
            { label: 'Business Name', value: vendor.businessName },
            { label: 'Category',      value: vendor.category },
            { label: 'Phone',         value: vendor.phone },
            { label: 'Space Fee',     value: vendor.amount ? `₦${vendor.amount.toLocaleString()}` : undefined },
          ].map(({ label, value }) => value ? (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="text-white font-semibold text-sm text-right max-w-[55%]">{value}</span>
            </div>
          ) : null)}

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400 text-sm">Vendor ID</span>
            <span className="text-amber-400 font-mono font-bold text-sm tracking-wider">{vendor.uniqueCode}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-gray-300 border border-white/20 hover:border-white/40 transition-all text-sm">
            Close
          </button>
          <button onClick={handleVerify} disabled={verifying}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 active:scale-95 ${
              vendor.verified
                ? 'bg-red-900/40 hover:bg-red-900/60 text-red-300 border border-red-500/30'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}>
            {verifying ? '…' : vendor.verified ? 'Unverify' : '✓ Mark as Verified'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Code Lookup ─────────────────────────────────────────────────────────────*/
const VendorCodeLookup = ({ authHeader }: { authHeader: Record<string, string> }) => {
  const [suffix, setSuffix]     = useState('');
  const [looking, setLooking]   = useState(false);
  const [found, setFound]       = useState<Vendor | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError]       = useState('');

  const fullCode = `MRY/VND/${suffix.toUpperCase()}`;

  const handleLookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!suffix.trim()) return;
    setLooking(true);
    setNotFound(false);
    setFound(null);
    setError('');
    try {
      const res = await fetch(`${API}/api/vendors/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ code: fullCode }),
      });
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error();
      setFound(await res.json());
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLooking(false); }
  };

  return (
    <>
      <form onSubmit={handleLookup} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Enter Vendor Code</label>
          <div className="flex items-center gap-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition-all">
            <span className="px-4 py-4 font-mono font-bold text-sm shrink-0 border-r border-white/10 text-purple-400">
              MRY/VND/
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
          {notFound && <p className="text-red-400 text-sm mt-2">No vendor found for <span className="font-mono">{fullCode}</span></p>}
          {error   && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <button type="submit" disabled={!suffix.trim() || looking}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
          {looking ? 'Looking up…' : 'Look Up'}
        </button>
      </form>

      {found && (
        <VendorVerifyModal
          vendor={found}
          authHeader={authHeader}
          onClose={() => { setFound(null); setSuffix(''); }}
          onUpdated={updated => setFound(updated)}
        />
      )}
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════════════ */

const VendorStaffPortal = () => {
  const [session, setSession] = useState<StaffSession | null>(() => {
    const saved = sessionStorage.getItem('cac_vendor_staff');
    return saved ? (JSON.parse(saved) as StaffSession) : null;
  });
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [loggingIn, setLoggingIn]   = useState(false);

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
      sessionStorage.setItem('cac_vendor_staff', JSON.stringify(sess));
      setSession(sess);
    } catch { setLoginError('An error occurred. Please try again.'); }
    finally { setLoggingIn(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cac_vendor_staff');
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
      sessionStorage.setItem('cac_vendor_staff', JSON.stringify(updated));
      setSession(updated);
    } catch { setPwdError('An error occurred. Please try again.'); }
    finally { setChangingPwd(false); }
  };

  /* ── Login screen ── */
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/favicon.png" alt="CACYOF" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <h1 className="text-white text-2xl font-black">Vendor Portal</h1>
            <p className="text-gray-400 text-sm mt-1">CACYOF 2026 Conference — Vendor Verification</p>
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
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
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

  /* ── Force password change ── */
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
                <button type="button" onClick={() => setShowNewPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1">
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

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-gray-950 text-white">
      <header className="bg-black/40 border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center gap-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/favicon.png" alt="CACYOF" className="h-9 w-9 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Vendor Verification Staff</p>
            <p className="text-white font-bold text-sm leading-tight truncate">{session.name}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-900/50 hover:bg-red-900 rounded-lg transition-colors">
          Logout
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="border border-purple-500/30 rounded-2xl p-5 text-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1 font-semibold">
            2026 Youth Conference
          </p>
          <h1 className="text-3xl font-black uppercase tracking-wide text-purple-400">
            Vendor Check-In
          </h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-white font-bold text-base mb-5">Verify Vendor</h2>
          <VendorCodeLookup authHeader={{ 'x-staff-id': session.id }} />
        </div>
      </main>
    </div>
  );
};

export default VendorStaffPortal;
