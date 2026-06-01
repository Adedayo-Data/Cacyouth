import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? '';

interface RegData {
  name: string;
  state: string;
  phone: string;
  uniqueCode: string;
  paymentStatus: string;
}

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const reference = searchParams.get('reference');
  const opayStatus = searchParams.get('status'); // SUCCESS | FAIL | CLOSE

  useEffect(() => {
    if (!reference) {
      setError('No payment reference found. Please contact the organiser.');
      return;
    }

    if (opayStatus === 'FAIL' || opayStatus === 'CLOSE') {
      setError('Payment was cancelled or failed. Please try again.');
      return;
    }

    let attempts = 0;
    const MAX = 12; // up to ~24 seconds of polling

    const poll = async () => {
      try {
        const res = await fetch(`${API}/api/payment/status/${reference}`);
        if (!res.ok) throw new Error();
        const data: RegData = await res.json();

        if (data.paymentStatus === 'success' || opayStatus === 'SUCCESS') {
          navigate('/conference/slip', {
            state: {
              name: data.name,
              state: data.state,
              phone: data.phone,
              uniqueCode: data.uniqueCode,
            },
          });
        } else if (data.paymentStatus === 'fail' || data.paymentStatus === 'close') {
          setError('Payment was not completed. Please try again.');
        } else if (attempts < MAX) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setError(
            `Payment could not be confirmed automatically. If you were charged, please contact us with reference: ${reference}`
          );
        }
      } catch {
        if (attempts < MAX) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          setError(`Could not verify payment. Please contact us with reference: ${reference}`);
        }
      }
    };

    poll();
  }, [reference, opayStatus, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-16 h-16 rounded-full bg-red-900/40 border border-red-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-white text-lg font-semibold text-center">Payment Issue</p>
        <p className="text-gray-400 text-sm text-center max-w-sm leading-relaxed">{error}</p>
        <button
          onClick={() => navigate('/conference')}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-colors active:scale-95"
        >
          Back to Registration
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-light flex flex-col items-center justify-center gap-5 px-4">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-white text-lg text-center">Verifying your payment…</p>
      <p className="text-gray-400 text-sm text-center">This should only take a moment</p>
    </div>
  );
};

export default PaymentReturn;
