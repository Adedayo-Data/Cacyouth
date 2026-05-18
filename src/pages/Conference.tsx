import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateUniqueCode } from '../utils/codeGenerator';

// ── Update to your actual conference fee in Naira ──────────
const CONFERENCE_FEE = 3000;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FlutterwaveCheckout?: (config: any) => void; }
}

type SelectedState = 'FCT' | 'NIGER' | 'KADUNA';
type FormField = 'name' | 'email' | 'phone' | 'state';

interface FormData {
  name: string;
  email: string;
  phone: string;
  state: SelectedState | '';
}

const Conference = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', state: '' });
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (window.FlutterwaveCheckout) { setScriptReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, []);

  const validate = (): boolean => {
    const errs: Partial<Record<FormField, string>> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.state) errs.state = 'Please select your state';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleTestSkip = () => {
    if (!validate()) return;
    const uniqueCode = generateUniqueCode(form.state as SelectedState);
    navigate('/conference/slip', {
      state: { name: form.name, uniqueCode, state: form.state },
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    if (!scriptReady) {
      alert('Payment is loading. Please try again in a moment.');
      return;
    }

    const txRef = `CACYOUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    window.FlutterwaveCheckout?.({
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY ?? 'FLWPUBK_TEST-XXXX',
      tx_ref: txRef,
      amount: CONFERENCE_FEE,
      currency: 'NGN',
      payment_options: 'card,ussd,banktransfer',
      customer: { email: form.email, phone_number: form.phone, name: form.name },
      customizations: {
        title: 'CAC Youth Conference',
        description: 'Conference Registration Fee',
        logo: `${window.location.origin}/favicon.png`,
      },
      callback: async (response: { status: string; transaction_id: number; tx_ref: string }) => {
        if (response.status === 'successful') {
          setLoading(true);
          try {
            const uniqueCode = generateUniqueCode(form.state as SelectedState);
            await addDoc(collection(db, 'registrations'), {
              name: form.name,
              email: form.email,
              phone: form.phone,
              state: form.state,
              uniqueCode,
              paymentRef: String(response.transaction_id),
              txRef: response.tx_ref,
              amount: CONFERENCE_FEE,
              verified: false,
              registeredAt: new Date().toISOString(),
            });
            navigate('/conference/slip', {
              state: { name: form.name, uniqueCode, state: form.state },
            });
          } catch {
            alert(
              `Payment successful but registration could not be saved. ` +
              `Please contact the organiser with your payment ref: ${response.transaction_id}`
            );
            setLoading(false);
          }
        }
      },
      onclose: () => {},
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const fieldClass = (field: FormField) =>
    `w-full rounded-xl px-4 py-4 text-white placeholder-gray-500 bg-white/5 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base ${
      errors[field] ? 'border-red-500' : 'border-white/10'
    }`;

  return (
    <div className="min-h-screen bg-black-light">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-32 pb-12 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 to-transparent pointer-events-none" />
        <div className="absolute top-20 -left-10 w-48 h-48 md:w-72 md:h-72 bg-purple-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-10 w-56 h-56 md:w-80 md:h-80 bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-purple-400 uppercase tracking-widest text-xs font-semibold mb-3">
            CAC Youth Fellowship · Medaiyese Region
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
            Conference <br className="hidden sm:block" />Registration
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Fill in your details and complete payment to get your unique admission code.
          </p>
        </div>
      </section>

      {/* ── Form Card ── */}
      <section className="max-w-lg mx-auto px-4 pb-24">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-8">

          {/* Fee banner */}
          <div className="bg-purple-100/30 border border-purple-400/20 rounded-xl p-4 mb-7 text-center">
            <p className="text-purple-300 text-xs uppercase tracking-widest mb-1 font-semibold">
              Registration Fee
            </p>
            <p className="text-white text-4xl sm:text-5xl font-black">
              ₦{CONFERENCE_FEE.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Adebayo"
                autoComplete="name"
                className={fieldClass('name')}
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                autoComplete="email"
                inputMode="email"
                className={fieldClass('email')}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08012345678"
                autoComplete="tel"
                inputMode="tel"
                className={fieldClass('phone')}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                State
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className={`${fieldClass('state')} bg-black-light appearance-none`}
              >
                <option value="">Select your state</option>
                <option value="FCT">FCT (Abuja)</option>
                <option value="NIGER">Niger State</option>
                <option value="KADUNA">Kaduna State</option>
              </select>
              {errors.state && (
                <p className="text-red-400 text-xs mt-1.5">{errors.state}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-base sm:text-lg bg-purple-100 hover:bg-purple-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Saving your registration…' : `Pay ₦${CONFERENCE_FEE.toLocaleString()} & Register`}
            </button>

            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={handleTestSkip}
                className="w-full py-3 rounded-xl font-semibold text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 active:scale-95 transition-all duration-200 text-sm"
              >
                [DEV] Skip Payment — Preview Slip
              </button>
            )}
          </form>

          <p className="text-gray-500 text-xs text-center mt-5 leading-relaxed">
            Secured by Flutterwave · Your payment information is encrypted and safe.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Conference;
