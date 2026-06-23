import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? '';
const CONFERENCE_FEE = 3100;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FlutterwaveCheckout?: (config: any) => void; }
}

interface SlipState {
  name: string;
  uniqueCode: string;
  state: string;
  phone?: string;
  dccZone?: string;
}

interface ResumeData {
  txRef: string;
  uniqueCode: string;
  amount: number;
}

const STATE_LABELS: Record<string, string> = {
  FCT: 'FCT — Abuja',
  NIGER: 'Niger State',
  KADUNA: 'Kaduna State',
};

function resolveState(slip: SlipState): string {
  if (slip.state === 'OTHER' && slip.dccZone) return `${slip.dccZone} State`;
  return STATE_LABELS[slip.state] ?? slip.state;
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

const ConferenceSlip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fetchedSlip, setFetchedSlip] = useState<SlipState | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [input, setInput] = useState('');
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'resent' | 'pending' | 'not_found' | 'error'>('idle');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [paying, setPaying] = useState(false);

  // Load Flutterwave script for payment resumption
  useEffect(() => {
    if (window.FlutterwaveCheckout) { setScriptReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.async = true;
    s.onload = () => setScriptReady(true);
    document.head.appendChild(s);
  }, []);

  const routerSlip = location.state as SlipState | null;
  const sessionSlip = (() => {
    try {
      const raw = sessionStorage.getItem('cac_slip');
      return raw ? (JSON.parse(raw) as SlipState) : null;
    } catch { return null; }
  })();

  useEffect(() => {
    if (sessionSlip) sessionStorage.removeItem('cac_slip');
  }, []);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code || routerSlip || sessionSlip) return;
    setLoadingSlip(true);
    fetch(`${API}/api/registrations/by-code/${encodeURIComponent(code)}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: SlipState) => setFetchedSlip(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoadingSlip(false));
  }, []);

  const slip = routerSlip ?? sessionSlip ?? fetchedSlip;

  if (loadingSlip) {
    return (
      <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading your registration slip…</p>
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
      const res = await fetch(`${API}/api/registrations/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: val } : { phone: val }),
      });
      const data = await res.json();

      if (data.status === 'paid') {
        // Trigger resend in background then show confirmation
        fetch(`${API}/api/registrations/resend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isEmail ? { email: val } : { phone: val }),
        }).catch(() => {});
        setCheckStatus('resent');
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
      amount: resumeData.amount ?? CONFERENCE_FEE,
      currency: 'NGN',
      payment_options: 'card,ussd,banktransfer',
      customer: {
        email: input.includes('@') ? input : '',
        phone_number: !input.includes('@') ? input : '',
        name: '',
      },
      customizations: {
        title: 'CAC Youth Conference',
        description: '2026 Conference Registration Fee',
        logo: `${window.location.origin}/favicon.png`,
      },
      callback: (response: { status: string; transaction_id: number; tx_ref: string }) => {
        if (response.status === 'successful' || response.status === 'completed') {
          setTimeout(() => {
            window.location.href = `/conference/slip?code=${encodeURIComponent(resumeData.uniqueCode)}`;
          }, 2000);
        }
      },
      onclose: () => {
        setPaying(false);
      },
    });
  };

  if (!slip) {
    return (
      <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-6 px-4 py-12">

        {/* ── Unpaid / pending state ── */}
        {checkStatus === 'pending' && resumeData ? (
          <div className="w-full max-w-xs flex flex-col gap-4">
            <div className="bg-amber-900/30 border border-amber-500/40 rounded-2xl p-6 text-center">
              <p className="text-3xl mb-3">⚠️</p>
              <h2 className="text-white font-bold text-lg mb-2">Payment Not Completed</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your registration details are saved but your payment has not been made yet.
              </p>
              <p className="text-amber-300 text-sm mt-3 font-semibold">
                Complete your payment to receive your registration slip.
              </p>
            </div>
            <button
              onClick={handleCompletePayment}
              disabled={paying || !scriptReady}
              className="w-full py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors active:scale-95"
            >
              {paying ? 'Opening Payment…' : `Pay ₦${(resumeData.amount ?? CONFERENCE_FEE).toLocaleString()} & Get My Slip`}
            </button>
            <button
              onClick={() => { setCheckStatus('idle'); setResumeData(null); setInput(''); }}
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors text-center"
            >
              ← Try different details
            </button>
          </div>

        ) : checkStatus === 'resent' ? (
          /* ── Slip resent ── */
          <div className="w-full max-w-xs text-center flex flex-col gap-4">
            <div className="bg-green-900/30 border border-green-500/40 rounded-2xl p-6">
              <p className="text-3xl mb-3">✓</p>
              <p className="text-green-400 font-semibold text-sm">
                Your registration slip has been resent to your email address.
              </p>
              <p className="text-gray-400 text-xs mt-2">Check your inbox (and spam folder).</p>
            </div>
            <button
              onClick={() => { setCheckStatus('idle'); setInput(''); }}
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
            >
              ← Try again
            </button>
          </div>

        ) : (
          /* ── Default lookup form ── */
          <>
            <div className="text-center max-w-xs">
              <p className="text-white text-lg font-semibold mb-1">
                {notFound ? 'Registration not found.' : 'Find your registration'}
              </p>
              <p className="text-gray-400 text-sm">
                {notFound
                  ? 'The link may be incorrect. Enter your details below to try again.'
                  : 'Enter the email or phone number you used when registering.'}
              </p>
            </div>

            <form onSubmit={handleCheck} className="w-full max-w-xs flex flex-col gap-3">
              <input
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setCheckStatus('idle'); }}
                placeholder="Email or phone number"
                className="w-full rounded-xl px-4 py-3 text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              {checkStatus === 'not_found' && (
                <p className="text-amber-400 text-xs text-center">
                  No registration found with those details. Double-check and try again, or register below.
                </p>
              )}
              {checkStatus === 'error' && (
                <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={checkStatus === 'checking' || !input.trim()}
                className="py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors"
              >
                {checkStatus === 'checking' ? 'Checking…' : 'Find My Registration'}
              </button>
            </form>

            <button
              onClick={() => navigate('/conference')}
              className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
            >
              {checkStatus === 'not_found' ? 'Register now →' : 'Go to Registration →'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── Screen layout ── */
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

        /* ── Print: slip card only, with colours ── */
        @media print {
          @page {
            margin: 8mm;
            size: A4;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            background: white !important;
          }

          .slip-page {
            background: white !important;
            min-height: auto !important;
            display: block !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          #slip-card,
          #slip-card * {
            visibility: visible !important;
          }

          #slip-card {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 0 !important;
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
                2026 Youth Conference · Registration Slip
              </p>
              <div className="mt-2 h-0.5 w-16 bg-purple-200 mx-auto rounded-full" />
            </div>

            <div className="mb-7">
              <Row label="Full Name" value={slip.name} />
              <Row label="State"     value={resolveState(slip)} />
              <Row label="Phone"     value={slip.phone} />
            </div>

            <div className="bg-gray-50 border-2 border-dashed border-purple-200 rounded-2xl py-8 px-4 mb-6 text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">
                Registration ID
              </p>
              <p className="text-3xl sm:text-4xl font-black tracking-[0.12em] text-gray-900 font-mono break-all">
                {slip.uniqueCode}
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Present this code at the venue for verification
              </p>
            </div>

            <p className="text-gray-400 text-xs text-center leading-relaxed">
              This slip is your proof of registration. Keep it safe and present it upon arrival.
            </p>
          </div>

          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-gray-400 text-xs">mryc.online · Medaiyese Regional Youth Choir</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all duration-200 text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Slip
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3.5 rounded-xl font-semibold text-gray-300 border border-white/20 hover:border-white/40 active:scale-95 transition-all duration-200 text-base"
          >
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

export default ConferenceSlip;
