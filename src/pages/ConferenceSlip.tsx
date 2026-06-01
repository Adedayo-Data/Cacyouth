import { useLocation, useNavigate } from 'react-router-dom';

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

  const slip = location.state as SlipState | null;

  if (!slip) {
    return (
      <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-5 px-4">
        <p className="text-white text-lg text-center">
          No registration data found. Please complete registration first.
        </p>
        <button
          onClick={() => navigate('/conference')}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-colors"
        >
          Go to Registration
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

        /* ── Print: show ONLY the slip card ── */
        @media print {
          /* Hide everything on the page */
          body * { visibility: hidden; }
          /* Then reveal only the slip card and its children */
          #slip-card, #slip-card * { visibility: visible; }
          /* Position the slip at the top-left so it fills the page */
          #slip-card {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
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

        {/* Action buttons — below the slip, hidden when printing */}
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
          Screenshot this page or use the Print button to save your slip.
        </p>
      </div>
    </>
  );
};

export default ConferenceSlip;
