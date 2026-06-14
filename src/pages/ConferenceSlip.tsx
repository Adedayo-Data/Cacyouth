import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? '';

interface SlipState {
  name: string;
  uniqueCode: string;
  state: string;
  phone?: string;
  dccZone?: string;
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

  const [resendInput, setResendInput] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // After a Flutterwave payment, a full-page redirect brings us here with no
  // React Router state — fall back to sessionStorage set by the callback.
  const routerSlip = location.state as SlipState | null;
  const sessionSlip = (() => {
    try {
      const raw = sessionStorage.getItem('cac_slip');
      return raw ? (JSON.parse(raw) as SlipState) : null;
    } catch { return null; }
  })();

  // Clear sessionStorage once we've read it so it doesn't linger
  useEffect(() => {
    if (sessionSlip) sessionStorage.removeItem('cac_slip');
  }, []);

  // When arriving via email link (?code=...) fetch slip data from server
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

  const handleResend = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const val = resendInput.trim();
    if (!val) return;
    setResendState('sending');
    try {
      const isEmail = val.includes('@');
      await fetch(`${API}/api/registrations/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: val } : { phone: val }),
      });
      setResendState('sent');
    } catch {
      setResendState('error');
    }
  };

  if (!slip) {
    return (
      <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-white text-lg text-center">
          {notFound
            ? 'Registration not found. Please check the link in your email.'
            : 'No registration data found.'}
        </p>

        {resendState === 'sent' ? (
          <p className="text-green-400 text-sm text-center max-w-xs">
            If we have your details on file, the slip has been resent to your email.
          </p>
        ) : (
          <form onSubmit={handleResend} className="w-full max-w-xs flex flex-col gap-3">
            <p className="text-gray-400 text-sm text-center">
              Paid but lost your slip? Enter the email or phone number used during registration.
              If you registered multiple people, all their slips will arrive in one email.
            </p>
            <input
              type="text"
              value={resendInput}
              onChange={e => setResendInput(e.target.value)}
              placeholder="Email or phone number"
              className="w-full rounded-xl px-4 py-3 text-white bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            {resendState === 'error' && (
              <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={resendState === 'sending'}
              className="py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors"
            >
              {resendState === 'sending' ? 'Sending…' : 'Resend My Slip'}
            </button>
          </form>
        )}

        <button
          onClick={() => navigate('/conference')}
          className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
        >
          Go to Registration →
        </button>
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

          /* Force background colours to print (fixes Chrome stripping them) */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* White page, no dark background */
          html, body {
            background: white !important;
          }

          /* Remove the dark navy from the page wrapper (fixes Safari) */
          .slip-page {
            background: white !important;
            min-height: auto !important;
            display: block !important;
            padding: 0 !important;
          }

          /* Hide EVERYTHING with the visibility trick */
          body * {
            visibility: hidden !important;
          }

          /* Then reveal only the slip card and everything inside it */
          #slip-card,
          #slip-card * {
            visibility: visible !important;
          }

          /* Position the card at the top so it fills the printed page */
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

        {/* ── Registration Slip ── */}
        <div id="slip-card" className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Header band */}
          <div className="bg-purple-700 px-6 py-5 text-center">
            <img src="/favicon.png" alt="CACYOF Logo" className="h-14 w-14 mx-auto mb-2 object-contain" />
            <h1 className="text-white font-black text-base sm:text-lg tracking-wide uppercase">
              Christ Apostolic Church
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm font-medium tracking-wider uppercase mt-0.5">
              Youth Fellowship · Medaiyese Region
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-7">

            <div className="text-center mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">
                2026 Youth Conference · Registration Slip
              </p>
              <div className="mt-2 h-0.5 w-16 bg-purple-200 mx-auto rounded-full" />
            </div>

            {/* Registrant details */}
            <div className="mb-7">
              <Row label="Full Name" value={slip.name} />
              <Row label="State"     value={resolveState(slip)} />
              <Row label="Phone"     value={slip.phone} />
            </div>

            {/* Admission code */}
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

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 text-center">
            <p className="text-gray-400 text-xs">mryc.online · Medaiyese Regional Youth Choir</p>
          </div>
        </div>

        {/* Action buttons — below the slip, never printed */}
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
