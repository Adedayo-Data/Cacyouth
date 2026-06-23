import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? '';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FlutterwaveCheckout?: (config: any) => void; }
}

interface VendorSlipState {
  name: string;
  businessName: string;
  category: string;
  phone?: string;
  uniqueCode: string;
  amount: number;
}

interface ResumeData {
  txRef: string;
  uniqueCode: string;
  amount: number;
}

const Row = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-gray-900 font-semibold text-sm text-right">{value}</span>
    </div>
  );
};

const VendorSlip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fetchedSlip, setFetchedSlip]   = useState<VendorSlipState | null>(null);
  const [loadingSlip, setLoadingSlip]   = useState(false);
  const [notFound, setNotFound]         = useState(false);

  const [input, setInput]         = useState('');
  const [checkStatus, setCheckStatus] = useState<'idle'|'checking'|'pending'|'not_found'|'error'>('idle');
  const [resumeData, setResumeData]   = useState<ResumeData | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [paying, setPaying]           = useState(false);

  useEffect(() => {
    if (window.FlutterwaveCheckout) { setScriptReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.async = true;
    s.onload = () => setScriptReady(true);
    document.head.appendChild(s);
  }, []);

  const routerSlip = location.state as VendorSlipState | null;
  const sessionSlip = (() => {
    try {
      const raw = sessionStorage.getItem('cac_vendor_slip');
      return raw ? (JSON.parse(raw) as VendorSlipState) : null;
    } catch { return null; }
  })();

  useEffect(() => {
    if (sessionSlip) sessionStorage.removeItem('cac_vendor_slip');
  }, []);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code || routerSlip || sessionSlip) return;
    setLoadingSlip(true);
    fetch(`${API}/api/vendors/by-code/${encodeURIComponent(code)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: VendorSlipState) => setFetchedSlip(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoadingSlip(false));
  }, []);

  const slip = routerSlip ?? sessionSlip ?? fetchedSlip;

  if (loadingSlip) {
    return (
      <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading your vendor slip…</p>
      </div>
    );
  }

  const handleCheck = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setCheckStatus('checking');
    setResumeData(null);
    try {
      const isEmail = val.includes('@');
      const res = await fetch(`${API}/api/vendors/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: val } : { phone: val }),
      });
      const data = await res.json();

      if (data.status === 'paid') {
        setCheckStatus('not_found'); // paid but no code lookup yet — prompt them to use code
      } else if (data.status === 'pending') {
        setResumeData(data as ResumeData);
        setCheckStatus('pending');
      } else {
        setCheckStatus('not_found');
      }
    } catch {
      setCheckStatus('error');
    }
  };

  const handleCompletePayment = () => {
    if (!resumeData || !window.FlutterwaveCheckout) return;
    setPaying(true);
    window.FlutterwaveCheckout({
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
      tx_ref: resumeData.txRef,
      amount: resumeData.amount,
      currency: 'NGN',
      payment_options: 'card,ussd,banktransfer',
      customer: {
        email: input.includes('@') ? input : '',
        phone_number: !input.includes('@') ? input : '',
        name: '',
      },
      customizations: {
        title: 'CAC Youth Conference — Vendor',
        description: 'Vendor Space Registration',
        logo: `${window.location.origin}/favicon.png`,
      },
      callback: (response: { status: string; tx_ref: string }) => {
        if (response.status === 'successful' || response.status === 'completed') {
          setTimeout(() => {
            window.location.href = `/vendor/slip?code=${encodeURIComponent(resumeData.uniqueCode)}`;
          }, 2000);
        }
      },
      onclose: () => { setPaying(false); },
    });
  };

  if (!slip) {
    return (
      <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-6 px-4 py-12">

        {checkStatus === 'pending' && resumeData ? (
          <div className="w-full max-w-xs flex flex-col gap-4">
            <div className="bg-amber-900/30 border border-amber-500/40 rounded-2xl p-6 text-center">
              <p className="text-3xl mb-3">⚠️</p>
              <h2 className="text-white font-bold text-lg mb-2">Payment Not Completed</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your vendor registration is saved but payment has not been completed.
              </p>
              <p className="text-amber-300 text-sm mt-3 font-semibold">
                Complete your payment to receive your vendor slip.
              </p>
            </div>
            <button onClick={handleCompletePayment} disabled={paying || !scriptReady}
              className="w-full py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors active:scale-95">
              {paying ? 'Opening Payment…' : `Pay ₦${resumeData.amount.toLocaleString()} & Get My Slip`}
            </button>
            <button onClick={() => { setCheckStatus('idle'); setResumeData(null); setInput(''); }}
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors text-center">
              ← Try different details
            </button>
          </div>

        ) : (
          <>
            <div className="text-center max-w-xs">
              <p className="text-white text-lg font-semibold mb-1">
                {notFound ? 'Vendor registration not found.' : 'Find your vendor slip'}
              </p>
              <p className="text-gray-400 text-sm">
                {notFound
                  ? 'The link may be incorrect. Enter your details below to try again.'
                  : 'Enter the email or phone number you registered with.'}
              </p>
            </div>

            <form onSubmit={handleCheck} className="w-full max-w-xs flex flex-col gap-3">
              <input
                type="text" value={input}
                onChange={e => { setInput(e.target.value); setCheckStatus('idle'); }}
                placeholder="Email or phone number"
                className="w-full rounded-xl px-4 py-3 text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              {checkStatus === 'not_found' && (
                <p className="text-amber-400 text-xs text-center">
                  No vendor registration found. Double-check and try again, or register below.
                </p>
              )}
              {checkStatus === 'error' && (
                <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>
              )}
              <button type="submit" disabled={checkStatus === 'checking' || !input.trim()}
                className="py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors">
                {checkStatus === 'checking' ? 'Checking…' : 'Find My Slip'}
              </button>
            </form>

            <button onClick={() => navigate('/conference')}
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
              {checkStatus === 'not_found' ? 'Register as Vendor →' : 'Go to Registration →'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media screen {
          .slip-page {
            background-color: #0D1B2A;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem 1rem;
          }
        }
        @media print {
          @page { margin: 8mm; size: A4; }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body { background: white !important; }
          .slip-page { background: white !important; min-height: auto !important; display: block !important; padding: 0 !important; }
          body * { visibility: hidden !important; }
          #slip-card, #slip-card * { visibility: visible !important; }
          #slip-card {
            position: fixed; top: 0; left: 0; right: 0;
            width: 100%; max-width: 500px; margin: 0 auto;
            box-shadow: none !important; border: 1px solid #e5e7eb !important; border-radius: 0 !important;
          }
        }
      `}</style>

      <div className="slip-page">
        <div id="slip-card" className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          <div className="bg-purple-700 px-6 py-5 text-center">
            <img src="/favicon.png" alt="CACYOF Logo" className="h-14 w-14 mx-auto mb-2 object-contain" />
            <h1 className="text-white font-black text-base sm:text-lg tracking-wide uppercase">
              Christ Apostolic Church
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm font-medium tracking-wider uppercase mt-0.5">
              Youth Fellowship · Medaiyese Region
            </p>
          </div>

          <div className="px-6 py-7">
            <div className="text-center mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
                2026 Youth Conference · Vendor Slip
              </p>
              <div className="mt-2 h-0.5 w-16 bg-purple-200 mx-auto rounded-full" />
            </div>

            <div className="mb-7">
              <Row label="Vendor Name"    value={slip.name} />
              <Row label="Business Name"  value={slip.businessName} />
              <Row label="Category"       value={slip.category} />
              <Row label="Phone"          value={slip.phone} />
              <Row label="Space Fee"      value={slip.amount ? `₦${slip.amount.toLocaleString()}` : undefined} />
            </div>

            <div className="bg-gray-50 border-2 border-dashed border-purple-200 rounded-2xl py-8 px-4 mb-6 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">
                Vendor ID
              </p>
              <p className="text-3xl sm:text-4xl font-black tracking-[0.12em] text-gray-900 font-mono break-all">
                {slip.uniqueCode}
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Present this code at the venue for vendor verification
              </p>
            </div>

            <p className="text-gray-400 text-xs text-center leading-relaxed">
              This slip is your proof of vendor registration. Keep it safe and present it upon arrival.
            </p>
          </div>

          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-gray-400 text-xs">mryc.online · Medaiyese Regional Youth Choir</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
          <button onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all duration-200 text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Slip
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 py-3.5 rounded-xl font-semibold text-gray-300 border border-white/20 hover:border-white/40 active:scale-95 transition-all duration-200 text-base">
            Back to Home
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4 max-w-sm">
          Screenshot or use the Print button to save your slip.
          <br />
          <span className="text-gray-600">Tip: disable "Headers and footers" in your browser print settings for a cleaner output.</span>
        </p>
      </div>
    </>
  );
};

export default VendorSlip;
