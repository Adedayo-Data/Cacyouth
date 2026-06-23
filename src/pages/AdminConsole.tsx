import { useState, useEffect, useRef } from 'react';
import { CodeLookup } from './StaffPortal';

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
  paymentStatus: string;
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

type TabType = 'registrations' | 'verify' | 'staff' | 'send-slip';
type StateFilter = 'ALL' | 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER';

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
  const [paymentFilter, setPaymentFilter] = useState<'paid' | 'all'>('all');
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<'FCT' | 'NIGER' | 'KADUNA' | 'OTHER' | ''>('');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number; checked: number; failed: number; message?: string } | null>(null);

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', state: '' as 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER' | '' });
  const [staffErrors, setStaffErrors] = useState<Partial<Record<'name' | 'email' | 'state', string>>>({});
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<string | null>(null);
  const [createdStaff, setCreatedStaff] = useState<{ username: string; emailSent: boolean } | null>(null);

  const [printTarget, setPrintTarget] = useState<StateFilter | null>(null);
  const printReady = useRef(false);

  // Send-slip tab state
  const [slipSearch, setSlipSearch] = useState('');
  const [sendingSlip, setSendingSlip] = useState<string | null>(null);
  const [slipEmailOverrides, setSlipEmailOverrides] = useState<Record<string, string>>({});
  const [slipSentMap, setSlipSentMap] = useState<Record<string, boolean>>({});
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ sent: number; failed: number; total: number; pct: number; done: boolean } | null>(null);
  const [slipMessage, setSlipMessage] = useState('');

  // Custom confirm modal
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

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

  /* ── Sync payments from Flutterwave ── */
  const handleSyncPayments = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(`${API}/api/payment/sync`, {
        method: 'POST',
        headers: adminHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setSyncResult(data);
      if (data.synced > 0) fetchRegistrations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Sync failed — check that FLW_SECRET_KEY is set in Railway');
    } finally {
      setSyncing(false);
    }
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

  /* ── Send slip (individual) ── */
  const handleSendSlip = async (reg: Registration) => {
    setSendingSlip(reg.id);
    const email = slipEmailOverrides[reg.id] ?? reg.email;
    try {
      const res = await fetch(`${API}/api/registrations/${reg.id}/send-slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({ email, message: slipMessage.trim() || undefined }),
      });
      if (!res.ok) throw new Error('Send failed');
      setSlipSentMap(prev => ({ ...prev, [reg.id]: true }));
    } catch (err) {
      console.error(err);
      alert('Failed to send slip. Check server logs.');
    } finally {
      setSendingSlip(null);
    }
  };

  /* ── Send slip (bulk) — SSE stream ── */
  const doBulkSend = async () => {
    setBulkSending(true);
    setBulkProgress(null);
    try {
      const res = await fetch(`${API}/api/registrations/bulk/send-slips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminHeaders },
        body: JSON.stringify({ message: slipMessage.trim() || undefined }),
      });
      if (!res.ok || !res.body) throw new Error('Failed to start bulk send');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          if (!chunk.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(chunk.slice(6));
            if (evt.type === 'start') {
              setBulkProgress({ sent: 0, failed: 0, total: evt.total, pct: 0, done: false });
            } else if (evt.type === 'progress') {
              setBulkProgress({ ...evt, done: false });
            } else if (evt.type === 'done') {
              setBulkProgress({ ...evt, pct: 100, done: true });
            }
          } catch { /* malformed chunk, skip */ }
        }
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Bulk send failed');
    } finally {
      setBulkSending(false);
    }
  };

  const handleBulkSendSlips = () => {
    setConfirmModal({
      message: `Send registration slips to all ${paidRegistrations.length} paid registrant${paidRegistrations.length !== 1 ? 's' : ''}? Each person will receive their slip at their registered email address.`,
      onConfirm: () => { setConfirmModal(null); doBulkSend(); },
    });
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
  // Accept both 'success' (our stored value) and 'successful' (raw Flutterwave value)
  // in case old records were written before the mapping was in place.
  const isPaid = (r: Registration) =>
    r.paymentStatus === 'success' || r.paymentStatus === 'successful';

  const paidRegistrations = registrations.filter(isPaid);

  const isOther = (state: string) => state !== 'FCT' && state !== 'NIGER' && state !== 'KADUNA';

  const draftRegistrations = registrations.filter(r => !isPaid(r));

  const filtered = (paymentFilter === 'paid' ? paidRegistrations : draftRegistrations)
    .filter(r => filter === 'ALL' || (filter === 'OTHER' ? isOther(r.state) : r.state === filter))
    .filter(r => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return r.name.toLowerCase().includes(s) || r.uniqueCode.toLowerCase().includes(s) || r.email.toLowerCase().includes(s) || r.phone.includes(s);
    });

  const printData = printTarget
    ? (printTarget === 'ALL'
        ? paidRegistrations
        : printTarget === 'OTHER'
          ? paidRegistrations.filter(r => isOther(r.state))
          : paidRegistrations.filter(r => r.state === printTarget))
    : [];
  const printLabel = printTarget === 'ALL' ? 'All States' : printTarget ? `${STATE_LABELS[printTarget]} State` : '';

  const stats = {
    allTotal: registrations.length,
    total: paidRegistrations.length,
    drafts: registrations.length - paidRegistrations.length,
    FCT: paidRegistrations.filter(r => r.state === 'FCT').length,
    NIGER: paidRegistrations.filter(r => r.state === 'NIGER').length,
    KADUNA: paidRegistrations.filter(r => r.state === 'KADUNA').length,
    OTHER: paidRegistrations.filter(r => r.state !== 'FCT' && r.state !== 'NIGER' && r.state !== 'KADUNA').length,
    verified: paidRegistrations.filter(r => r.verified).length,
  };

  /* ════ CONFIRM MODAL ════ */
  const ConfirmModal = confirmModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <p className="text-white text-sm font-semibold leading-relaxed mb-6">{confirmModal.message}</p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirmModal(null)}
            className="flex-1 py-3 rounded-xl border border-white/20 text-gray-300 hover:border-white/40 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmModal.onConfirm}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors active:scale-95"
          >
            Yes, Send
          </button>
        </div>
      </div>
    </div>
  ) : null;

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
      {ConfirmModal}
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
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <button
              onClick={handleSyncPayments}
              disabled={syncing}
              title="Verify all pending registrations against Flutterwave and mark paid ones as success"
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-emerald-600/50 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : '⟳ Sync Payments'}
            </button>
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
            {([['registrations', 'Registrations'], ['verify', 'Verify'], ['staff', 'Staff Accounts'], ['send-slip', 'Send Slip']] as [TabType, string][]).map(([tab, label]) => (
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

        <main className="w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">

          {/* Sync result banner — shown after syncing payments */}
          {syncResult && (
            <div className={`rounded-xl px-4 py-3 border text-sm flex items-center justify-between gap-3 ${syncResult.synced > 0 ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-gray-300'}`}>
              <span>
                {syncResult.message
                  ? syncResult.message
                  : `Synced ${syncResult.synced} payment${syncResult.synced !== 1 ? 's' : ''} from Flutterwave (checked ${syncResult.checked})`}
              </span>
              <button onClick={() => setSyncResult(null)} className="text-gray-500 hover:text-white text-xs shrink-0">✕</button>
            </div>
          )}

          {/* ════ REGISTRATIONS TAB ════ */}
          {activeTab === 'registrations' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { label: 'Total',    value: stats.allTotal, cls: 'text-white' },
                  { label: 'Paid',     value: stats.total,    cls: 'text-purple-400' },
                  { label: 'Drafts',   value: stats.drafts,   cls: 'text-gray-500' },
                  { label: 'FCT',      value: stats.FCT,      cls: 'text-blue-400' },
                  { label: 'Niger',    value: stats.NIGER,    cls: 'text-green-400' },
                  { label: 'Kaduna',   value: stats.KADUNA,   cls: 'text-yellow-400' },
                  { label: 'Others',   value: stats.OTHER,    cls: 'text-purple-400' },
                  { label: 'Verified', value: stats.verified, cls: 'text-emerald-400' },
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
                  {([['ALL', 'All States'], ['FCT', 'FCT Only'], ['NIGER', 'Niger Only'], ['KADUNA', 'Kaduna Only'], ['OTHER', 'Other States']] as [StateFilter, string][]).map(([target, label]) => (
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
                <div className="flex flex-wrap gap-2 items-center">
                  {(['ALL', 'FCT', 'NIGER', 'KADUNA', 'OTHER'] as StateFilter[]).map(f => (
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
                  <div className="ml-auto flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                    <button
                      onClick={() => setPaymentFilter('paid')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        paymentFilter === 'paid' ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Paid only
                    </button>
                    <button
                      onClick={() => setPaymentFilter('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        paymentFilter === 'all' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Show drafts
                    </button>
                  </div>
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
                  <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-white/5">
                        <tr>
                          {['#', 'Name', 'State', 'Code', 'Phone', 'Age', 'Date', 'Payment', 'Status', 'Action'].map(h => (
                            <th key={h} className="px-3 py-2.5 text-left text-gray-400 font-semibold uppercase text-xs tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((reg, i) => (
                          <tr key={reg.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-3 py-2.5 text-gray-500 text-xs w-8">{i + 1}</td>
                            <td className="px-3 py-2.5 max-w-[180px]">
                              <p className="font-semibold text-white text-xs truncate">{reg.name}</p>
                              <p className="text-gray-500 text-xs truncate">{reg.email}</p>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 text-xs font-bold">{STATE_LABELS[reg.state] ?? reg.state}</span>
                            </td>
                            <td className="px-3 py-2.5 font-mono font-bold text-amber-400 tracking-wide text-xs whitespace-nowrap">{reg.uniqueCode}</td>
                            <td className="px-3 py-2.5 text-gray-300 text-xs whitespace-nowrap">{reg.phone}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              {(() => {
                                const age = calcAge(reg.dob);
                                const cat = ageCategory(age);
                                return (
                                  <div className="flex flex-col gap-0">
                                    <span className="text-white text-xs font-bold">{age !== null ? `${age} yrs` : '—'}</span>
                                    <span className={`text-xs font-semibold ${cat.cls}`}>{cat.label}</span>
                                  </div>
                                );
                              })()}
                            </td>
                            <td className="px-3 py-2.5 text-gray-400 text-xs whitespace-nowrap">{new Date(reg.registeredAt).toLocaleDateString('en-NG')}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${isPaid(reg) ? 'bg-emerald-900/40 text-emerald-400' : 'bg-yellow-900/30 text-yellow-500'}`}>
                                {isPaid(reg) ? '✓ Paid' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${reg.verified ? 'bg-green-900/40 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                                {reg.verified ? '✓ Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <button
                                onClick={() => handleVerify(reg)}
                                disabled={verifying === reg.id}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${reg.verified ? 'bg-red-900/40 hover:bg-red-900/70 text-red-300' : 'bg-green-900/40 hover:bg-green-900/70 text-green-300'}`}
                              >
                                {verifying === reg.id ? '…' : reg.verified ? 'Unverify' : 'Verify'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${isPaid(reg) ? 'bg-emerald-900/40 text-emerald-400' : 'bg-yellow-900/30 text-yellow-500'}`}>
                            {isPaid(reg) ? '✓ Paid' : 'Draft'}
                          </span>
                          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${reg.verified ? 'bg-green-900/40 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                            {reg.verified ? '✓ Verified' : 'Unverified'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleVerify(reg)}
                          disabled={verifying === reg.id}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${reg.verified ? 'bg-red-900/40 hover:bg-red-900/70 text-red-300' : 'bg-green-900/40 hover:bg-green-900/70 text-green-300'}`}
                        >
                          {verifying === reg.id ? '…' : reg.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ════ VERIFY TAB ════ */}
          {activeTab === 'verify' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                <h2 className="text-white font-bold text-base mb-4">Select State</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {([
                    { v: 'FCT',    l: 'FCT',    sub: 'Abuja' },
                    { v: 'NIGER',  l: 'Niger',  sub: 'State' },
                    { v: 'KADUNA', l: 'Kaduna', sub: 'State' },
                    { v: 'OTHER',  l: 'Other',  sub: 'States' },
                  ] as const).map(({ v, l, sub }) => (
                    <button
                      key={v} type="button" onClick={() => setVerifyState(v)}
                      className={`py-4 rounded-xl border transition-all text-center flex flex-col items-center gap-1 ${
                        verifyState === v
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-400/40'
                      }`}
                    >
                      <span className="font-bold text-sm">{l}</span>
                      <span className="text-xs opacity-70">{sub}</span>
                    </button>
                  ))}
                </div>

                {verifyState && (
                  <>
                    <div className="border-t border-white/10 pt-5">
                      <h2 className="text-white font-bold text-base mb-5">Verify Attendee</h2>
                      <CodeLookup
                        key={verifyState}
                        prefix={verifyState === 'OTHER' ? 'MRY/' : `MRY/${verifyState}/`}
                        authHeader={{ 'x-admin-key': ADMIN_PASSWORD }}
                        themeText="text-purple-400"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
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
          {/* ════ SEND SLIP TAB ════ */}
          {activeTab === 'send-slip' && (
            <div className="space-y-6">

              {/* Optional custom message — shared by both bulk and individual sends */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                <h2 className="text-white font-bold text-base mb-1">Custom Message <span className="text-gray-500 font-normal text-sm">(optional)</span></h2>
                <p className="text-gray-400 text-sm mb-4">
                  Add a personal note from the organisers. It will appear as a highlighted box in every slip email you send from this page.
                </p>
                <textarea
                  value={slipMessage}
                  onChange={e => setSlipMessage(e.target.value)}
                  rows={4}
                  placeholder="e.g. Dear participant, we sincerely apologise for the delay in sending your slip. This is your valid registration slip — please keep it safe and present it at the venue. God bless you!"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm resize-none leading-relaxed"
                />
                {slipMessage.trim() && (
                  <p className="text-purple-400 text-xs mt-2">✓ Message will be included in all slips sent from this page.</p>
                )}
              </div>

              {/* Bulk send */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                <h2 className="text-white font-bold text-base mb-1">Send to All Registrants</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Fire off a registration slip email to every registrant who has an email address on file.
                </p>
                {/* Progress bar */}
                {bulkProgress && (
                  <div className="mb-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className={bulkProgress.done ? 'text-green-400' : 'text-purple-300'}>
                        {bulkProgress.done
                          ? `✓ Done — ${bulkProgress.sent} sent${bulkProgress.failed > 0 ? `, ${bulkProgress.failed} failed` : ''}`
                          : `Sending… ${bulkProgress.sent + bulkProgress.failed} / ${bulkProgress.total}`}
                      </span>
                      <span className={bulkProgress.done ? 'text-green-400' : 'text-purple-300'}>
                        {bulkProgress.pct}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${bulkProgress.done ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${bulkProgress.pct}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBulkSendSlips}
                  disabled={bulkSending || paidRegistrations.length === 0}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold text-sm transition-colors disabled:opacity-50 active:scale-95"
                >
                  {bulkSending ? 'Sending in progress…' : `Send Slip to All ${paidRegistrations.length} Paid Registrants`}
                </button>
              </div>

              {/* Individual search + send */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                <h2 className="text-white font-bold text-base mb-1">Send to a Specific Registrant</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Search by name. You can edit the email before sending in case the registered address is wrong.
                </p>
                <input
                  type="search"
                  value={slipSearch}
                  onChange={e => setSlipSearch(e.target.value)}
                  placeholder="Search by first name, last name, or full name…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm mb-4"
                />

                {slipSearch.trim().length < 2 ? (
                  <p className="text-gray-500 text-sm text-center py-6">Type at least 2 characters to search.</p>
                ) : (() => {
                  const q = slipSearch.trim().toLowerCase();
                  const matches = registrations.filter(r =>
                    r.name.toLowerCase().includes(q)
                  );
                  if (matches.length === 0) {
                    return <p className="text-gray-500 text-sm text-center py-6">No registrants found matching "{slipSearch}".</p>;
                  }
                  return (
                    <div className="space-y-3">
                      <p className="text-gray-400 text-xs mb-2">{matches.length} result{matches.length !== 1 ? 's' : ''}</p>
                      {matches.map(reg => {
                        const emailVal = slipEmailOverrides[reg.id] ?? reg.email;
                        const sent = slipSentMap[reg.id];
                        return (
                          <div key={reg.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div>
                                <p className="font-bold text-white text-sm">{reg.name}</p>
                                <p className="text-gray-400 text-xs mt-0.5 font-mono">{reg.uniqueCode}</p>
                              </div>
                              <span className="px-2 py-1 rounded-md bg-purple-950/60 text-purple-300 text-xs font-bold shrink-0">
                                {STATE_LABELS[reg.state] ?? reg.state}
                              </span>
                            </div>

                            {/* Editable email */}
                            <div className="mb-3">
                              <label className="block text-gray-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                                Send to Email
                              </label>
                              <input
                                type="email"
                                value={emailVal}
                                onChange={e => setSlipEmailOverrides(prev => ({ ...prev, [reg.id]: e.target.value }))}
                                className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                                placeholder="email@example.com"
                              />
                              {slipEmailOverrides[reg.id] && slipEmailOverrides[reg.id] !== reg.email && (
                                <p className="text-amber-400 text-xs mt-1">⚠ Using overridden email (registered: {reg.email})</p>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleSendSlip(reg)}
                                disabled={sendingSlip === reg.id || !emailVal.trim()}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-colors active:scale-95"
                              >
                                {sendingSlip === reg.id ? 'Sending…' : 'Send Slip'}
                              </button>
                              {sent && (
                                <span className="text-green-400 text-xs font-semibold shrink-0">✓ Sent</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default AdminConsole;
