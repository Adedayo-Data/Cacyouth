import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  uniqueCode: string;
  verified: boolean;
  verifiedAt?: string;
  registeredAt: string;
}

interface StaffSession {
  id: string;
  name: string;
  username: string;
  state: 'FCT' | 'NIGER' | 'KADUNA';
}

const STATE_LABELS: Record<string, string> = { FCT: 'FCT (Abuja)', NIGER: 'Niger State', KADUNA: 'Kaduna State' };

const STATE_THEME: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  FCT: {
    bg: 'from-blue-950 to-gray-950',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badge: 'bg-blue-900/50 text-blue-300',
  },
  NIGER: {
    bg: 'from-green-950 to-gray-950',
    text: 'text-green-400',
    border: 'border-green-500/30',
    badge: 'bg-green-900/50 text-green-300',
  },
  KADUNA: {
    bg: 'from-yellow-950 to-gray-950',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    badge: 'bg-yellow-900/50 text-yellow-300',
  },
};

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

const StaffPortal = () => {
  /* ── Auth ── */
  const [session, setSession] = useState<StaffSession | null>(() => {
    const saved = sessionStorage.getItem('cac_staff');
    return saved ? (JSON.parse(saved) as StaffSession) : null;
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  /* ── Data ── */
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  /* ── Login ── */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const q = query(collection(db, 'staff'), where('username', '==', username.trim()));
      const snap = await getDocs(q);
      if (snap.empty) { setLoginError('Invalid username or password.'); return; }
      const staffDoc = snap.docs[0];
      const staffData = staffDoc.data();
      if (staffData.password !== password) { setLoginError('Invalid username or password.'); return; }
      const sess: StaffSession = {
        id: staffDoc.id,
        name: staffData.name,
        username: staffData.username,
        state: staffData.state,
      };
      sessionStorage.setItem('cac_staff', JSON.stringify(sess));
      setSession(sess);
    } catch (err) {
      console.error(err);
      setLoginError('An error occurred. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cac_staff');
    setSession(null);
    setRegistrations([]);
  };

  /* ── Fetch registrations for this state ── */
  const fetchRegistrations = async (state: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'registrations'),
        where('state', '==', state),
        orderBy('registeredAt', 'desc')
      );
      const snap = await getDocs(q);
      setRegistrations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Registration)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (session) fetchRegistrations(session.state);
  }, [session]);

  /* ── Verify ── */
  const handleVerify = async (reg: Registration) => {
    setVerifying(reg.id);
    try {
      const ref = doc(db, 'registrations', reg.id);
      if (reg.verified) {
        await updateDoc(ref, { verified: false });
        setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, verified: false, verifiedAt: undefined } : r));
      } else {
        const verifiedAt = new Date().toISOString();
        await updateDoc(ref, { verified: true, verifiedAt });
        setRegistrations(prev => prev.map(r => r.id === reg.id ? { ...r, verified: true, verifiedAt } : r));
      }
    } catch (err) { console.error(err); }
    finally { setVerifying(null); }
  };

  const filtered = registrations.filter(r => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return r.name.toLowerCase().includes(s) || r.uniqueCode.toLowerCase().includes(s) || r.phone.includes(s);
  });

  const stats = {
    total: registrations.length,
    verified: registrations.filter(r => r.verified).length,
    pending: registrations.filter(r => !r.verified).length,
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

          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setLoginError(''); }}
                placeholder="Enter your username"
                autoComplete="username"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-12 text-base"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1">
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              {loginError && <p className="text-red-400 text-xs mt-1.5">{loginError}</p>}
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-4 bg-purple-100 hover:bg-purple-700 rounded-xl text-white font-bold transition-colors text-base active:scale-95 disabled:opacity-50"
            >
              {loggingIn ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Super Admin?{' '}
            <a href="/admin" className="text-purple-400 hover:text-purple-300 underline">Admin Console →</a>
          </p>
        </div>
      </div>
    );
  }

  const theme = STATE_THEME[session.state] ?? STATE_THEME.FCT;

  /* ════ STAFF DASHBOARD ════ */
  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} text-white`}>

      {/* ── Top bar ── */}
      <header className="bg-black/40 border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center gap-3 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/favicon.png" alt="CACYOF" className="h-9 w-9 shrink-0 object-contain" />
          <div className="min-w-0">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Verification Staff</p>
            <p className="text-white font-bold text-sm leading-tight truncate">{session.name}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <button
            onClick={() => fetchRegistrations(session.state)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-white/20 hover:border-purple-400 rounded-lg transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-900/50 hover:bg-red-900 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── State banner ── */}
        <div className={`border ${theme.border} rounded-2xl p-5 sm:p-7 text-center`}>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">
            2026 Youth Conference · Verification Portal
          </p>
          <h1 className={`text-3xl sm:text-5xl font-black uppercase tracking-wide ${theme.text}`}>
            {STATE_LABELS[session.state] ?? session.state}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            You can only verify registrants from this state.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: stats.total, cls: theme.text },
            { label: 'Verified', value: stats.verified, cls: 'text-emerald-400' },
            { label: 'Pending', value: stats.pending, cls: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.cls}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, code or phone…"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
        />

        <p className="text-gray-400 text-sm">
          Showing <span className="text-white font-semibold">{filtered.length}</span> registrant{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* ── Registrations ── */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading registrations…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {search ? 'No results found.' : 'No registrations for this state yet.'}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    {['#', 'Name', 'Code', 'Phone', 'Date', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold uppercase text-xs tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg, i) => (
                    <tr key={reg.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-white">{reg.name}</td>
                      <td className="px-4 py-3 font-mono font-black text-amber-400 tracking-widest text-sm">{reg.uniqueCode}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{reg.phone}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(reg.registeredAt).toLocaleDateString('en-NG')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${reg.verified ? 'bg-green-900/40 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                          {reg.verified ? '✓ Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleVerify(reg)}
                          disabled={verifying === reg.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${reg.verified ? 'bg-red-900/40 hover:bg-red-900/70 text-red-300' : 'bg-green-900/40 hover:bg-green-900/70 text-green-300'}`}
                        >
                          {verifying === reg.id ? '…' : reg.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((reg, i) => (
                <div key={reg.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-white text-sm">{reg.name}</p>
                    <span className="text-gray-500 text-xs shrink-0">#{i + 1}</span>
                  </div>

                  {/* Big code */}
                  <div className="bg-black/30 rounded-lg py-4 px-4 text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1.5">Admission Code</p>
                    <p className="font-mono font-black text-amber-400 text-3xl tracking-widest">{reg.uniqueCode}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 gap-2 flex-wrap">
                    <span>{reg.phone}</span>
                    <span>{new Date(reg.registeredAt).toLocaleDateString('en-NG')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-2 rounded-lg text-xs font-semibold ${reg.verified ? 'bg-green-900/40 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                      {reg.verified ? '✓ Verified' : 'Pending'}
                    </span>
                    <button
                      onClick={() => handleVerify(reg)}
                      disabled={verifying === reg.id}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${reg.verified ? 'bg-red-900/40 hover:bg-red-900/70 text-red-300' : 'bg-green-900/40 hover:bg-green-900/70 text-green-400'}`}
                    >
                      {verifying === reg.id ? '…' : reg.verified ? 'Unverify' : 'Mark as Verified'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StaffPortal;
