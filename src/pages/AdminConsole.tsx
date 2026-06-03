import { useState, useEffect, useRef } from 'react';

const API = import.meta.env.VITE_API_URL ?? '';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  dob?: string;
  uniqueCode: string;
  paymentRef: string;
  amount: number;
  verified: boolean;
  verifiedAt?: string;
  registeredAt: string;
}

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
  if (age === null) return { label: '—', cls: 'text-gray-500' };
  if (age < 18)  return { label: 'Teenager',    cls: 'text-blue-400' };
  if (age <= 25) return { label: 'Youth',        cls: 'text-green-400' };
  if (age <= 35) return { label: 'Young Adult',  cls: 'text-yellow-400' };
  return           { label: 'Adult',             cls: 'text-orange-400' };
}

interface StaffMember {
  id: string;
  name: string;
  email?: string;
  username: string;
  state: 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER';
  createdAt: string;
}

type TabType = 'registrations' | 'staff';
type StateFilter = 'ALL' | 'FCT' | 'NIGER' | 'KADUNA';

const STATE_LABELS: Record<string, string> = { FCT: 'FCT', NIGER: 'Niger', KADUNA: 'Kaduna', OTHER: 'Other States' };
const STATE_COLORS: Record<string, string> = {
  FCT: 'text-blue-400',
  NIGER: 'text-green-400',
  KADUNA: 'text-yellow-400',
  OTHER: 'text-purple-400',
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

const PrintReport = ({ data, stateLabel }: { data: Registration[]; stateLabel: string }) => (
  <div className="print-only">
    <div className="print-header">
      <h1>CHRIST APOSTOLIC CHURCH YOUTH FELLOWSHIP</h1>
      <h2>Medaiyese Region — 2026 Youth Conference</h2>
      <h3>{stateLabel} Registrations</h3>
      <p>Printed: {new Date().toLocaleString('en-NG')}&nbsp;&nbsp;|&nbsp;&nbsp;Total: {data.length}</p>
    </div>
    <table className="print-table">
      <thead>
        <tr>
          <th>#</th><th>Full Name</th><th>Phone</th><th>Email</th><th>Code</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((r, i) => (
          <tr key={r.id}>
            <td>{i + 1}</td>
            <td>{r.name}</td>
            <td>{r.phone}</td>
            <td>{r.email}</td>
            <td className="print-code">{r.uniqueCode}</td>
            <td>{r.verified ? '✓ Verified' : 'Pending'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const AdminConsole = () => {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('cac_admin') === 'true'
  );
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('registrations');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [filter, setFilter] = useState<StateFilter>('ALL');
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', state: '' as 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER' | '' });
  const [staffErrors, setStaffErrors] = useState<Partial<Record<'name' | 'email' | 'state', string>>>({});
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<{ username: string; emailSent: boolean } | null>(null);

  const [printTarget, setPrintTarget] = useState<StateFilter | null>(null);
  const printReady = useRef(false);

  const adminHeaders = { 'x-admin-key': ADMIN_PASSWORD };

  /* ── Auth ── */
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('cac_admin', 'true');
      setAuthenticated(true);
    } else {
      setLoginError('Incorrect password. Try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cac_admin');
    setAuthenticated(false);
    setPassword('');
    setRegistrations([]);
    setStaff([]);
  };

  /* ── Fetch registrations ── */
  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const res = await fetch(`${API}/api/registrations`, { headers: adminHeaders });
      if (!res.ok) throw new Error('Fetch failed');
      setRegistrations(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoadingRegs(false); }
  };

  /* ── Fetch staff ── */
  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch(`${API}/api/staff`, { headers: adminHeaders });
      if (!res.ok) throw new Error('Fetch failed');
      setStaff(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoadingStaff(false); }
  };

  useEffect(() => {
    if (authenticated) { fetchRegistrations(); fetchStaff(); }
  }, [authenticated]);

  /* ── Verify / unverify ── */
  const handleVerify = async (reg: Registration) => {
    setVerifying(reg.id);
    try {
      const res = await fetch(`${API}/api/registrations/${reg.id}/verify`, {
        method: 'PATCH',
        headers: adminHeaders,
      });
      if (!res.ok) throw new Error('Verify failed');
      const updated: Registration = await res.json();
      setRegistrations(prev => prev.map(r => r.id === reg.id ? updated : r));
    } catch (err) { console.error(err); }
    finally { setVerifying(null); }
  };

  /* ── Create staff ── */
  const handleCreateStaff = async () => {
    const errs: Partial<Record<'name' | 'email' | 'state', string>> = {};
    if (!staffForm.name.trim()) errs.name = 'Name is required';
    if (!staffForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(staffForm.email)) errs.email = 'Enter a valid email';
    if (!staffForm.state) errs.state = 'State is required';
    setStaffErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCreatingStaff(true);
    setCreatedStaff(null);
    try {
      const res = await fetch(`${API}/api/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({ name: staffForm.name, email: staffForm.email, state: staffForm.state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setStaff(prev => [data, ...prev]);
      setCreatedStaff({ username: data.username, emailSent: data.emailSent });
      setStaffForm({ name: '', email: '', state: '' });
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to create staff account');
    } finally { setCreatingStaff(false); }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Remove this staff account?')) return;
    setDeletingStaff(id);
    try {
      await fetch(`${API}/api/staff/${id}`, { method: 'DELETE', headers: adminHeaders });
      setStaff(prev => prev.filter(s => s.id !== id));
    } catch (err) { console.error(err); }
    finally { setDeletingStaff(null); }
  };

  /* ── Print ── */
  const handlePrint = (target: StateFilter) => {
    setPrintTarget(target);
    printReady.current = true;
  };

  useEffect(() => {
    if (printTarget && printReady.current) {
      const t = setTimeout(() => {
        window.print();
        printReady.current = false;
        window.onafterprint = () => setPrintTarget(null);
      }, 100);
      return () => clearTimeout(t);
    }
  }, [printTarget]);

  /* ── Derived data ── */
  const filtered = registrations
    .filter(r => filter === 'ALL' || r.state === filter)
    .filter(r => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return r.name.toLowerCase().includes(s) || r.uniqueCode.toLowerCase().includes(s) || r.email.toLowerCase().includes(s) || r.phone.includes(s);
    });

  const printData = printTarget
    ? (printTarget === 'ALL' ? registrations : registrations.filter(r => r.state === printTarget))
    : [];
  const printLabel = printTarget === 'ALL' ? 'All States' : printTarget ? `${STATE_LABELS[printTarget]} State` : '';

  const stats = {
    total: registrations.length,
    FCT: registrations.filter(r => r.state === 'FCT').length,
    NIGER: registrations.filter(r => r.state === 'NIGER').length,
    KADUNA: registrations.filter(r => r.state === 'KADUNA').length,
    verified: registrations.filter(r => r.verified).length,
  };

  /* ════ LOGIN SCREEN ════ */
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src="/favicon.png" alt="CACYOF" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <h1 className="text-white text-2xl font-black">Super Admin Console</h1>
            <p className="text-gray-400 text-sm mt-1">CACYOF 2026 Youth Conference</p>
          </div>
          <form onSubmit={e => { e.preventDefault(); handleLogin(); }} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">Admin Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="Enter admin password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-12 text-base"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1">
                  <EyeIcon open={showPwd} />
                </button>
              </div>
              {loginError && <p className="text-red-400 text-xs mt-1.5">{loginError}</p>}
            </div>
            <button type="submit" className="w-full py-4 bg-purple-100 hover:bg-purple-700 rounded-xl text-white font-bold transition-colors text-base active:scale-95">
              Enter Console
            </button>
          </form>
          <p className="text-center mt-6 text-gray-500 text-sm">
            Verification staff?{' '}
            <a href="/staff" className="text-purple-400 hover:text-purple-300 underline">Staff Portal →</a>
          </p>
        </div>
      </div>
    );
  }

  /* ════ DASHBOARD ════ */
  return (
    <>
      <style>{`
        @media screen { .print-only { display: none !important; } }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; color: black; font-family: Arial, sans-serif; }
          .print-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-header h1 { font-size: 14px; font-weight: bold; margin: 0 0 4px; }
          .print-header h2 { font-size: 12px; font-weight: normal; margin: 0 0 4px; }
          .print-header h3 { font-size: 16px; font-weight: bold; margin: 0 0 6px; text-transform: uppercase; }
          .print-header p { font-size: 10px; color: #555; margin: 0; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table th { background: #333; color: white; padding: 6px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
          .print-table td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; }
          .print-table tr:nth-child(even) td { background: #f9f9f9; }
          .print-code { font-weight: bold; font-family: monospace; letter-spacing: 2px; }
        }
      `}</style>

      {printTarget && <PrintReport data={printData} stateLabel={printLabel} />}

      <div className="no-print min-h-screen bg-gray-950 text-white">

        <header className="bg-black/50 border-b border-white/10 px-4 sm:px-6 py-4 flex justify-between items-center gap-3 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/favicon.png" alt="CACYOF" className="h-9 w-9 shrink-0 object-contain" />
            <div className="min-w-0">
              <h1 className="font-black text-base leading-none">Super Admin Console</h1>
              <p className="text-gray-400 text-xs mt-0.5 hidden sm:block">2026 Youth Conference Management</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={fetchRegistrations} className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-white/20 hover:border-purple-400 rounded-lg transition-colors">
              Refresh
            </button>
            <button onClick={handleLogout} className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-900/50 hover:bg-red-900 rounded-lg transition-colors">
              Logout
            </button>
          </div>
        </header>

        <div className="border-b border-white/10 px-4 sm:px-6">
          <div className="flex gap-0 max-w-7xl mx-auto">
            {([['registrations', 'Registrations'], ['staff', 'Staff Accounts']] as [TabType, string][]).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab ? 'border-purple-400 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {label}
                {tab === 'staff' && staff.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-purple-900/60 text-purple-300 text-xs rounded-md">{staff.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

          {/* ════ REGISTRATIONS TAB ════ */}
          {activeTab === 'registrations' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Total',   value: stats.total,   cls: 'text-purple-400' },
                  { label: 'FCT',     value: stats.FCT,     cls: 'text-blue-400' },
                  { label: 'Niger',   value: stats.NIGER,   cls: 'text-green-400' },
                  { label: 'Kaduna',  value: stats.KADUNA,  cls: 'text-yellow-400' },
                  { label: 'Verified',value: stats.verified, cls: 'text-emerald-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`text-3xl font-black ${s.cls}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold">Print Registrations by State</p>
                <div className="flex flex-wrap gap-2">
                  {([['ALL', 'All States'], ['FCT', 'FCT Only'], ['NIGER', 'Niger Only'], ['KADUNA', 'Kaduna Only']] as [StateFilter, string][]).map(([target, label]) => (
                    <button
                      key={target}
                      onClick={() => handlePrint(target)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-purple-900/20 rounded-lg text-sm font-semibold text-gray-300 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, code, email or phone…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  {(['ALL', 'FCT', 'NIGER', 'KADUNA'] as StateFilter[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        filter === f ? 'bg-purple-100 text-white' : 'bg-white/5 border border-white/10 text-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {f === 'ALL' ? 'All States' : STATE_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-gray-400 text-sm">
                Showing <span className="text-white font-semibold">{filtered.length}</span> registrant{filtered.length !== 1 ? 's' : ''}
              </p>

              {loadingRegs ? (
                <div className="text-center py-20 text-gray-400">Loading registrations…</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">No registrations found.</div>
              ) : (
                <>
                  <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5">
                        <tr>
                          {['#', 'Name', 'State', 'Code', 'Phone', 'Age', 'Date', 'Status', 'Action'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold uppercase text-xs tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((reg, i) => (
                          <tr key={reg.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-gray-500 text-xs">{i + 1}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-white">{reg.name}</p>
                              <p className="text-gray-400 text-xs">{reg.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded-md bg-purple-950/60 text-purple-300 text-xs font-bold">{STATE_LABELS[reg.state] ?? reg.state}</span>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-amber-400 tracking-widest text-sm">{reg.uniqueCode}</td>
                            <td className="px-4 py-3 text-gray-300 text-sm">{reg.phone}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {(() => {
                                const age = calcAge(reg.dob);
                                const cat = ageCategory(age);
                                return (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-white text-xs font-bold">{age !== null ? `${age} yrs` : '—'}</span>
                                    <span className={`text-xs font-semibold ${cat.cls}`}>{cat.label}</span>
                                  </div>
                                );
                              })()}
                            </td>
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

                  <div className="md:hidden space-y-3">
                    {filtered.map((reg, i) => (
                      <div key={reg.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm leading-tight">{reg.name}</p>
                            <p className="text-gray-400 text-xs mt-0.5 truncate">{reg.email}</p>
                          </div>
                          <span className="text-gray-500 text-xs shrink-0">#{i + 1}</span>
                        </div>
                        <div className="bg-black/30 rounded-lg py-3 px-4 text-center">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Code</p>
                          <p className="font-mono font-black text-amber-400 text-2xl tracking-widest">{reg.uniqueCode}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                          <span className="px-2 py-1 rounded-md bg-purple-950/60 text-purple-300 font-bold">{STATE_LABELS[reg.state] ?? reg.state}</span>
                          <span className="text-gray-400">{reg.phone}</span>
                          <span className="text-gray-500">{new Date(reg.registeredAt).toLocaleDateString('en-NG')}</span>
                        </div>
                        {(() => {
                          const age = calcAge(reg.dob);
                          const cat = ageCategory(age);
                          return age !== null ? (
                            <div className="flex items-center gap-2">
                              <span className="text-white text-xs font-bold">{age} yrs</span>
                              <span className={`px-2 py-0.5 rounded-md bg-white/5 text-xs font-semibold ${cat.cls}`}>{cat.label}</span>
                            </div>
                          ) : null;
                        })()}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${reg.verified ? 'bg-green-900/40 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                            {reg.verified ? '✓ Verified' : 'Pending'}
                          </span>
                          <button
                            onClick={() => handleVerify(reg)}
                            disabled={verifying === reg.id}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${reg.verified ? 'bg-red-900/40 hover:bg-red-900/70 text-red-300' : 'bg-green-900/40 hover:bg-green-900/70 text-green-300'}`}
                          >
                            {verifying === reg.id ? '…' : reg.verified ? 'Unverify' : 'Verify'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ════ STAFF ACCOUNTS TAB ════ */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                <h2 className="text-white font-bold text-base mb-5">Create Staff Account</h2>
                <form onSubmit={e => { e.preventDefault(); handleCreateStaff(); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={staffForm.name}
                      onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. John Adebayo"
                      className={`w-full bg-white/5 border ${staffErrors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm`}
                    />
                    {staffErrors.name && <p className="text-red-400 text-xs mt-1">{staffErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={staffForm.email}
                      onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="staff@example.com"
                      className={`w-full bg-white/5 border ${staffErrors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm`}
                    />
                    {staffErrors.email && <p className="text-red-400 text-xs mt-1">{staffErrors.email}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">Assigned State</label>
                    <select
                      value={staffForm.state}
                      onChange={e => setStaffForm(p => ({ ...p, state: e.target.value as 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER' | '' }))}
                      className={`w-full bg-gray-950 border ${staffErrors.state ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm`}
                    >
                      <option value="">— Select state —</option>
                      <option value="FCT">FCT (Abuja)</option>
                      <option value="NIGER">Niger State</option>
                      <option value="KADUNA">Kaduna State</option>
                      <option value="OTHER">Other States</option>
                    </select>
                    {staffErrors.state && <p className="text-red-400 text-xs mt-1">{staffErrors.state}</p>}
                    {staffForm.state === 'OTHER' && (
                      <p className="text-gray-500 text-xs mt-1.5">This staff member will verify all registrants from states outside FCT, Niger and Kaduna.</p>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    {createdStaff && (
                      <div className={`rounded-xl p-4 border ${createdStaff.emailSent ? 'bg-green-900/20 border-green-500/30' : 'bg-amber-900/20 border-amber-500/30'}`}>
                        <p className={`text-sm font-semibold mb-1 ${createdStaff.emailSent ? 'text-green-400' : 'text-amber-400'}`}>
                          {createdStaff.emailSent ? '✓ Staff account created & email sent!' : '⚠ Account created but email failed to send'}
                        </p>
                        <p className="text-gray-300 text-xs">Username: <span className="font-mono font-bold text-white">{createdStaff.username}</span></p>
                        {!createdStaff.emailSent && <p className="text-amber-300 text-xs mt-1">Check that RESEND_API_KEY is set in Railway and the sender domain is verified.</p>}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleCreateStaff}
                      disabled={creatingStaff}
                      className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-colors disabled:opacity-50 text-sm active:scale-95"
                    >
                      {creatingStaff ? 'Creating & sending email…' : 'Create Staff Account'}
                    </button>
                    <p className="text-gray-500 text-xs">A username and password will be auto-generated and emailed to the staff member.</p>
                  </div>
                </form>
              </div>

              <div>
                <h2 className="text-white font-bold text-base mb-4">
                  Staff Accounts <span className="text-gray-400 font-normal text-sm">({staff.length})</span>
                </h2>

                {loadingStaff ? (
                  <p className="text-gray-400 text-sm">Loading staff…</p>
                ) : staff.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400 text-sm">
                    No staff accounts yet. Create one above.
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full text-sm">
                        <thead className="bg-white/5">
                          <tr>
                            {['#', 'Name', 'Email', 'Username', 'State', 'Created', 'Action'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold uppercase text-xs tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {staff.map((s, i) => (
                            <tr key={s.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-4 py-3 text-gray-500 text-xs">{i + 1}</td>
                              <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                              <td className="px-4 py-3 text-gray-400 text-xs">{s.email ?? '—'}</td>
                              <td className="px-4 py-3 text-gray-300 font-mono text-xs">{s.username}</td>
                              <td className="px-4 py-3">
                                <span className={`font-bold text-sm ${STATE_COLORS[s.state] ?? 'text-gray-300'}`}>
                                  {STATE_LABELS[s.state] ?? s.state}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400 text-xs">{new Date(s.createdAt).toLocaleDateString('en-NG')}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleDeleteStaff(s.id)}
                                  disabled={deletingStaff === s.id}
                                  className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                >
                                  {deletingStaff === s.id ? '…' : 'Remove'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="md:hidden space-y-3">
                      {staff.map(s => (
                        <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-bold text-white text-sm">{s.name}</p>
                              <p className="text-gray-400 text-xs font-mono mt-0.5">@{s.username}</p>
                            </div>
                            <span className={`font-black text-sm ${STATE_COLORS[s.state] ?? 'text-gray-300'}`}>
                              {STATE_LABELS[s.state] ?? s.state}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs">{new Date(s.createdAt).toLocaleDateString('en-NG')}</span>
                            <button
                              onClick={() => handleDeleteStaff(s.id)}
                              disabled={deletingStaff === s.id}
                              className="px-4 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {deletingStaff === s.id ? '…' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminConsole;
