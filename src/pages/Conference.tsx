import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateUniqueCode } from '../utils/codeGenerator';

const API = import.meta.env.VITE_API_URL ?? '';

const CONFERENCE_FEE = 3000;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FlutterwaveCheckout?: (config: any) => void; }
}

type SelectedState = 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER';

const ZONES_BY_STATE: Record<Exclude<SelectedState, 'OTHER'>, string[]> = {
  FCT: [
    'FCC DCC', 'ADCC DCC', 'NYANYA DCC', 'GWAGWALADA DCC', 'KUJE DCC',
    'L/WATER DCC', 'KUBWA DCC', 'BWARI ZONE', 'LUGBE DCC', 'PRINCE OF PEACE ZONE',
    'KWALI ZONE', 'MERCY ZONE', 'MARABA ZONE', 'MAPAPE ZONE', 'OKEIYIN ZONE',
    'CHRIST THE KING DCC', 'KARU DCC', 'MIRACLE DCC', 'DUTSE DCC', 'GLORY ZONE',
    'ALL SAINT DCC', 'PRAISE DCC DCC', 'DAGIRI ZONE', 'TRUTH AND POWER ZONE',
    'ADO ZONE', 'FULFILMENT ZONE', 'NEW LIFE ZONE', 'PASALI ZONE',
    'POSSIBILITY ZONE', 'SALVATION ZONE', 'ZUBA ZONE',
  ],
  NIGER: [
    'SULEJA DCC', 'TUNGA DCC', 'GAURAKA DCC', 'BIDA DCC',
    'NIGER DCC', 'KWAMBA DCC', 'KONTAGORA ZONE', 'MANDALA ZONE',
  ],
  KADUNA: [
    'KAWO DCC', 'KAKURI DCC', 'SAMARU ZONE', 'KOSEUNTI ZONE',
    'ZION ZONE', 'KAFANCHAN ZONE', 'KADUNA DCC', 'TUNDUNWADA DCC', 'ZARIA DCC',
  ],
};

const OTHER_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  dccZone: string;
  gender: string;
  phone: string;
  email: string;
  state: SelectedState | '';
  status: string;
  occupation: string;
  qualification: string;
}

type FormField = keyof FormData;

const empty: FormData = {
  firstName: '', middleName: '', lastName: '', dob: '', dccZone: '', gender: '',
  phone: '', email: '', state: '', status: '', occupation: '', qualification: '',
};

const STEP_META = [
  { label: 'Personal',  title: 'Tell Us About You',    subtitle: 'Basic personal details' },
  { label: 'Church',    title: 'Church / Denomination',  subtitle: 'State & DCC / Zone' },
  { label: 'Contact',   title: 'Contact & Background',  subtitle: 'How to reach you' },
];

const Conference = () => {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState<FormData>(empty);
  const [errors, setErrors]   = useState<Partial<Record<FormField, string>>>({});
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (window.FlutterwaveCheckout) { setScriptReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.async = true;
    s.onload = () => setScriptReady(true);
    document.head.appendChild(s);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const pick = (field: FormField, value: string) => {
    if (field === 'state') {
      setForm(prev => ({ ...prev, state: value as SelectedState, dccZone: '' }));
      setErrors(prev => ({ ...prev, state: undefined, dccZone: undefined }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (s: number): boolean => {
    const errs: Partial<Record<FormField, string>> = {};
    if (s === 1) {
      if (!form.firstName.trim()) errs.firstName = 'First name is required';
      if (!form.lastName.trim())  errs.lastName  = 'Last name is required';
      if (!form.dob.trim())       errs.dob       = 'Date of birth is required';
      if (!form.gender)           errs.gender    = 'Please select your gender';
      if (!form.status)           errs.status    = 'Please select your status';
    }
    if (s === 2) {
      if (!form.state)            errs.state   = 'Please select your state';
      if (!form.dccZone.trim())   errs.dccZone = form.state === 'OTHER'
        ? 'Please select your state'
        : 'DCC / Zone is required';
    }
    if (s === 3) {
      if (!form.phone.trim())        errs.phone         = 'Phone number is required';
      if (!form.email.trim())        errs.email         = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.occupation.trim())   errs.occupation    = 'Occupation is required';
      if (!form.qualification)       errs.qualification = 'Please select your qualification';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep(step)) setStep(s => s + 1); };
  const handleBack = () => { setStep(s => s - 1); setErrors({}); };

  const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');

  const stateForCode = form.state === 'OTHER'
    ? form.dccZone.toUpperCase()
    : (form.state as string);

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    if (!scriptReady) { alert('Payment is still loading. Please try again in a moment.'); return; }

    const uniqueCode = generateUniqueCode(stateForCode);
    const txRef = `CACYOUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Store slip data so onclose can navigate after the popup fully closes
    let slipData: { name: string; state: string; dccZone: string; phone: string; uniqueCode: string } | null = null;

    window.FlutterwaveCheckout?.({
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: CONFERENCE_FEE,
      currency: 'NGN',
      payment_options: 'card,ussd,banktransfer',
      customer: { email: form.email, phone_number: form.phone, name: fullName },
      customizations: {
        title: 'CAC Youth Conference',
        description: '2026 Conference Registration Fee',
        logo: `${window.location.origin}/favicon.png`,
      },
      callback: (response: { status: string; transaction_id: number; tx_ref: string }) => {
        if (response.status === 'successful') {
          const slip = {
            name: fullName, state: form.state,
            dccZone: form.dccZone, phone: form.phone, uniqueCode,
          };

          // Persist slip data so the slip page can read it after the redirect
          sessionStorage.setItem('cac_slip', JSON.stringify(slip));

          // Save registration to DB in the background
          fetch(`${API}/api/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...form, name: fullName, uniqueCode,
              paymentRef: String(response.transaction_id),
              txRef: response.tx_ref, amount: CONFERENCE_FEE,
              paymentStatus: 'success',
            }),
          })
            .then(r => { if (!r.ok) console.error('Registration save failed:', r.status); })
            .catch(err => console.error('Registration save error:', err));

          // After 2 s the full-page redirect kills the Flutterwave popup automatically
          // — no manual X click needed
          setTimeout(() => { window.location.href = '/conference/slip'; }, 2000);
        }
      },
      onclose: () => {},
    });
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputCls = (f: FormField) =>
    `w-full rounded-xl px-4 py-4 text-white placeholder-gray-500 bg-white/5 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base ${
      errors[f] ? 'border-red-500' : 'border-white/10'
    }`;

  const pill = (active: boolean) =>
    `flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200 text-center cursor-pointer ${
      active
        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-400/40 hover:text-gray-200'
    }`;

  const cardPill = (active: boolean) =>
    `flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer text-left w-full ${
      active
        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-400/40 hover:text-gray-200'
    }`;

  // ── Step content ─────────────────────────────────────────────────────────────
  const renderStep = () => {
    if (step === 1) return (
      <div className="space-y-5">
        {/* First Name */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">First Name</label>
          <input
            type="text" name="firstName" value={form.firstName} onChange={handleChange}
            placeholder="e.g. John" autoComplete="given-name"
            className={inputCls('firstName')}
          />
          {errors.firstName && <p className="text-red-400 text-xs mt-1.5">{errors.firstName}</p>}
        </div>

        {/* Middle Name */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Middle Name <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="text" name="middleName" value={form.middleName} onChange={handleChange}
            placeholder="e.g. Emeka" autoComplete="additional-name"
            className={inputCls('middleName')}
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Last Name</label>
          <input
            type="text" name="lastName" value={form.lastName} onChange={handleChange}
            placeholder="e.g. Adebayo" autoComplete="family-name"
            className={inputCls('lastName')}
          />
          {errors.lastName && <p className="text-red-400 text-xs mt-1.5">{errors.lastName}</p>}
        </div>

        {/* DOB */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Date of Birth</label>
          <input
            type="date" name="dob" value={form.dob} onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={inputCls('dob')}
          />
          {errors.dob && <p className="text-red-400 text-xs mt-1.5">{errors.dob}</p>}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Gender</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => pick('gender', 'Male')}  className={pill(form.gender === 'Male')}>Male</button>
            <button type="button" onClick={() => pick('gender', 'Female')} className={pill(form.gender === 'Female')}>Female</button>
          </div>
          {errors.gender && <p className="text-red-400 text-xs mt-1.5">{errors.gender}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Marital Status</label>
          <div className="flex gap-3">
            {['Single', 'Married', 'Widowed'].map(s => (
              <button key={s} type="button" onClick={() => pick('status', s)} className={pill(form.status === s)}>{s}</button>
            ))}
          </div>
          {errors.status && <p className="text-red-400 text-xs mt-1.5">{errors.status}</p>}
        </div>
      </div>
    );

    if (step === 2) return (
      <div className="space-y-5">
        {/* State — card-style tiles, FIRST */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-3">State</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: 'FCT',    l: 'FCT',    sub: 'Abuja' },
              { v: 'NIGER',  l: 'Niger',  sub: 'State' },
              { v: 'KADUNA', l: 'Kaduna', sub: 'State' },
              { v: 'OTHER',  l: 'Other',  sub: 'State' },
            ] as const).map(({ v, l, sub }) => (
              <button
                key={v} type="button" onClick={() => pick('state', v)}
                className={`py-4 rounded-xl border transition-all duration-200 text-center cursor-pointer flex flex-col items-center gap-1 ${
                  form.state === v
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-400/40 hover:text-gray-200'
                }`}
              >
                <span className="font-bold text-sm">{l}</span>
                <span className="text-xs opacity-70">{sub}</span>
              </button>
            ))}
          </div>
          {errors.state && <p className="text-red-400 text-xs mt-1.5">{errors.state}</p>}
        </div>

        {/* DCC / Zone — changes based on selected state */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            {form.state === 'OTHER' ? 'Please select your state' : 'DCC / Zone'}
          </label>
          {form.state === 'OTHER' ? (
            <select
              name="dccZone" value={form.dccZone} onChange={handleChange}
              className={`w-full rounded-xl px-4 py-4 bg-gray-950 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base appearance-none cursor-pointer text-white ${
                errors.dccZone ? 'border-red-500' : 'border-white/10'
              }`}
            >
              <option value="">— Select your state —</option>
              {OTHER_STATES.map(s => (
                <option key={s} value={s}>{s} State</option>
              ))}
            </select>
          ) : (
            <select
              name="dccZone" value={form.dccZone} onChange={handleChange}
              disabled={!form.state}
              className={`w-full rounded-xl px-4 py-4 bg-gray-950 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base appearance-none ${
                errors.dccZone ? 'border-red-500' : 'border-white/10'
              } ${!form.state ? 'text-gray-600 cursor-not-allowed' : 'text-white cursor-pointer'}`}
            >
              <option value="">
                {form.state ? '— Select your DCC / Zone —' : '— Select a state first —'}
              </option>
              {form.state && ZONES_BY_STATE[form.state as Exclude<SelectedState, 'OTHER'>].map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          )}
          {errors.dccZone && <p className="text-red-400 text-xs mt-1.5">{errors.dccZone}</p>}
        </div>
      </div>
    );

    if (step === 3) return (
      <div className="space-y-5">
        {/* Phone */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Phone Number</label>
          <input
            type="tel" name="phone" value={form.phone} onChange={handleChange}
            placeholder="08012345678" autoComplete="tel" inputMode="tel"
            className={inputCls('phone')}
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
          <input
            type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="john@example.com" autoComplete="email" inputMode="email"
            className={inputCls('email')}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Occupation</label>
          <input
            type="text" name="occupation" value={form.occupation} onChange={handleChange}
            placeholder="e.g. Teacher, Engineer, Student"
            className={inputCls('occupation')}
          />
          {errors.occupation && <p className="text-red-400 text-xs mt-1.5">{errors.occupation}</p>}
        </div>

        {/* Qualification */}
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-3">Qualification</label>
          <div className="space-y-2">
            {[
              { v: 'Undergraduate', sub: 'Currently in school' },
              { v: 'Graduate',      sub: "Bachelor's degree" },
              { v: 'Postgraduate',  sub: "Master's / PhD" },
              { v: 'Other',         sub: 'Secondary / Vocational' },
            ].map(({ v, sub }) => (
              <button key={v} type="button" onClick={() => pick('qualification', v)} className={cardPill(form.qualification === v)}>
                <span>{v}</span>
                <span className={`text-xs font-normal ${form.qualification === v ? 'text-purple-200' : 'text-gray-500'}`}>{sub}</span>
              </button>
            ))}
          </div>
          {errors.qualification && <p className="text-red-400 text-xs mt-1.5">{errors.qualification}</p>}
        </div>
      </div>
    );
  };

  const current = STEP_META[step - 1];

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
            Conference<br className="hidden sm:block" /> Registration
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Fill in your details and complete payment to receive your unique admission code.
          </p>
        </div>
      </section>

      <section className="max-w-lg mx-auto px-4 pb-24">

        {/* Fee banner */}
        <div className="bg-purple-900/40 border border-purple-500/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-purple-300 text-xs uppercase tracking-widest mb-1 font-semibold">Registration Fee</p>
          <p className="text-white text-4xl sm:text-5xl font-black">₦{CONFERENCE_FEE.toLocaleString()}</p>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center mb-8 px-2">
          {STEP_META.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  i + 1 < step  ? 'bg-purple-600 border-purple-600 text-white' :
                  i + 1 === step ? 'bg-purple-600/20 border-purple-500 text-purple-300' :
                                   'bg-white/5 border-white/15 text-gray-600'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  i + 1 === step ? 'text-purple-300' : i + 1 < step ? 'text-purple-500' : 'text-gray-600'
                }`}>{s.label}</span>
              </div>
              {i < STEP_META.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-5 transition-all duration-500 ${
                  i + 1 < step ? 'bg-purple-600' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Form card ── */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-8">

          {/* Step header */}
          <div className="mb-6 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                {step}
              </div>
              <div>
                <h2 className="text-white text-lg font-black leading-tight">{current.title}</h2>
                <p className="text-gray-500 text-xs mt-0.5">{current.subtitle}</p>
              </div>
            </div>
          </div>

          {renderStep()}

          {/* ── Navigation buttons ── */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button" onClick={handleBack}
                className="flex-1 py-4 rounded-xl font-bold text-gray-300 border border-white/20 hover:border-white/40 active:scale-95 transition-all duration-200"
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button" onClick={handleNext}
                className="flex-1 py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all duration-200"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 py-4 rounded-xl font-bold text-white text-base sm:text-lg bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving your registration…' : `Pay ₦${CONFERENCE_FEE.toLocaleString()} & Register`}
              </button>
            )}
          </div>

        </div>

        <p className="text-gray-600 text-xs text-center mt-5 leading-relaxed">
          Secured by Flutterwave · Your payment information is encrypted and safe.
        </p>
      </section>
    </div>
  );
};

export default Conference;
