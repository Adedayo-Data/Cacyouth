import { useState, useEffect } from 'react';
import { generateUniqueCode } from '../utils/codeGenerator';

const API = import.meta.env.VITE_API_URL ?? '';

const CONFERENCE_FEE = 3100;
const PLATFORM_FEE   = 200;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FlutterwaveCheckout?: (config: any) => void; }
}

// ── Participant ───────────────────────────────────────────────────────────────

type SelectedState = 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER';

const ZONES_BY_STATE: Record<Exclude<SelectedState, 'OTHER'>, string[]> = {
  FCT: [
    'FCC DCC', 'ADCC DCC', 'NYANYA DCC', 'GWAGWALADA DCC', 'KUJE DCC',
    'L/WATER DCC', 'KUBWA DCC', 'BWARI ZONE', 'LUGBE DCC', 'PRINCE OF PEACE ZONE',
    'KWALI ZONE', 'MERCY ZONE', 'MARABA ZONE', 'MAPAPE ZONE', 'OKEIYIN ZONE',
    'CHRIST THE KING DCC', 'KARU DCC', 'MIRACLE DCC', 'DUTSE DCC', 'GLORY ZONE',
    'ALL SAINT DCC', 'PRAISE DCC DCC', 'DAGIRI ZONE', 'TRUTH AND POWER ZONE',
    'ADO ZONE', 'FULFILMENT ZONE', 'LIFE ZONE', 'PASALI ZONE',
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
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
  'Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Ogun','Ondo',
  'Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
];

interface FormData {
  firstName: string; middleName: string; lastName: string; dob: string;
  dccZone: string; assemblyName: string; denomination: string; gender: string;
  phone: string; email: string; state: SelectedState | ''; status: string;
  occupation: string; qualification: string;
}
type FormField = keyof FormData;

const emptyForm: FormData = {
  firstName:'', middleName:'', lastName:'', dob:'', dccZone:'', assemblyName:'',
  denomination:'', gender:'', phone:'', email:'', state:'', status:'',
  occupation:'', qualification:'',
};

const STEP_META = [
  { label:'Personal', title:'Tell Us About You',     subtitle:'Basic personal details' },
  { label:'Church',   title:'Church / Denomination', subtitle:'State & DCC / Zone' },
  { label:'Contact',  title:'Contact & Background',  subtitle:'How to reach you' },
];

// ── Vendor ────────────────────────────────────────────────────────────────────

interface VendorCategory { name: string; fee: number; mryOnly?: boolean; }

const VENDOR_CATEGORIES: { group: string; items: VendorCategory[] }[] = [
  {
    group: 'General Vendors',
    items: [
      { name: 'Food and Beverages',                    fee: 50000 },
      { name: 'Snacks, Pastries & Small Chops',        fee: 50000 },
      { name: 'Drinks, Juice, Coffee & Smoothies',     fee: 50000 },
      { name: 'Fashion and Apparel',                   fee: 25000 },
      { name: 'Beauty and Cosmetics',                  fee: 25000 },
      { name: 'Electronics and Gadgets',               fee: 25000 },
      { name: 'Stationery and Books',                  fee: 25000 },
    ],
  },
  {
    group: 'Tech & Media',
    items: [
      { name: 'Photographers & Videographers',         fee: 25000 },
      { name: 'Phone Charging Stations & Power Bank',  fee: 15000 },
      { name: 'Live Streaming Crew',                   fee: 0, mryOnly: true },
    ],
  },
];

interface VendorForm {
  firstName: string; lastName: string; businessName: string;
  phone: string; email: string; category: string;
}
type VendorField = keyof VendorForm;

const emptyVendor: VendorForm = {
  firstName:'', lastName:'', businessName:'', phone:'', email:'', category:'',
};

const VENDOR_STEP_META = [
  { label:'Details',  title:'Your Details',    subtitle:'Seller & business info' },
  { label:'Category', title:'Vendor Category', subtitle:'Select your space type' },
];

// ─────────────────────────────────────────────────────────────────────────────

const Conference = () => {
  const [activeType, setActiveType] = useState<'participant' | 'vendor'>('participant');
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (window.FlutterwaveCheckout) { setScriptReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.async = true;
    s.onload = () => setScriptReady(true);
    document.head.appendChild(s);
  }, []);

  // ── Style helpers ─────────────────────────────────────────────────────────
  const inputCls = (err: boolean) =>
    `w-full rounded-xl px-4 py-4 text-white placeholder-gray-500 bg-white/5 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base ${
      err ? 'border-red-500' : 'border-white/10'
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

  // ── Participant state ─────────────────────────────────────────────────────
  const [step, setStep]         = useState(1);
  const [form, setForm]         = useState<FormData>(emptyForm);
  const [errors, setErrors]     = useState<Partial<Record<FormField, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'dccZone') {
      setForm(p => ({ ...p, dccZone: value, assemblyName: '' }));
      setErrors(p => ({ ...p, dccZone: undefined, assemblyName: undefined }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
      setErrors(p => ({ ...p, [name]: undefined }));
    }
  };

  const pick = (field: FormField, value: string) => {
    if (field === 'state') {
      setForm(p => ({ ...p, state: value as SelectedState, dccZone:'', assemblyName:'', denomination:'' }));
      setErrors(p => ({ ...p, state:undefined, dccZone:undefined, assemblyName:undefined, denomination:undefined }));
    } else {
      setForm(p => ({ ...p, [field]: value }));
      setErrors(p => ({ ...p, [field]: undefined }));
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
      if (!form.state)          errs.state   = 'Please select your state';
      if (!form.dccZone.trim()) errs.dccZone = form.state === 'OTHER' ? 'Please select your state' : 'DCC / Zone is required';
      if (form.state === 'OTHER' && !form.denomination.trim()) errs.denomination = 'Please enter your church / denomination';
    }
    if (s === 3) {
      if (!form.phone.trim())      errs.phone         = 'Phone number is required';
      if (!form.email.trim())      errs.email         = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
      if (!form.occupation.trim()) errs.occupation    = 'Occupation is required';
      if (!form.qualification)     errs.qualification = 'Please select your qualification';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep(step)) setStep(s => s + 1); };
  const handleBack = () => { setStep(s => s - 1); setErrors({}); };

  const fullName     = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');
  const stateForCode = form.state === 'OTHER' ? form.dccZone.toUpperCase() : (form.state as string);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!scriptReady) { alert('Payment is still loading. Please try again in a moment.'); return; }

    const uniqueCode = generateUniqueCode(stateForCode);
    const txRef = `CACYOUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    setSubmitting(true);
    let preSaved = false;
    try {
      const res = await fetch(`${API}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, name: fullName, uniqueCode,
          assemblyName: form.assemblyName || null,
          txRef, amount: CONFERENCE_FEE, paymentStatus: 'pending',
        }),
      });
      preSaved = res.ok;
      if (!res.ok) console.warn('Pre-save failed:', res.status);
    } catch (err) { console.warn('Pre-save network error:', err); }
    setSubmitting(false);

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
        console.log('FLW callback response:', JSON.stringify(response));
        if (response.status === 'successful' || response.status === 'completed') {
          sessionStorage.setItem('cac_slip', JSON.stringify({
            name: fullName, state: form.state, dccZone: form.dccZone, phone: form.phone, uniqueCode,
          }));
          if (!preSaved) {
            fetch(`${API}/api/registrations`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...form, name: fullName, uniqueCode,
                assemblyName: form.assemblyName || null,
                txRef: response.tx_ref, amount: CONFERENCE_FEE,
              }),
            }).catch(err => console.error('Registration save error:', err));
          }
          setTimeout(() => { window.location.href = '/conference/slip'; }, 2000);
        }
      },
      onclose: () => {
        if (sessionStorage.getItem('cac_slip')) window.location.href = '/conference/slip';
      },
    });
  };

  // ── Vendor state ──────────────────────────────────────────────────────────
  const [vendorStep, setVendorStep]           = useState(1);
  const [vendorForm, setVendorForm]           = useState<VendorForm>(emptyVendor);
  const [vendorErrors, setVendorErrors]       = useState<Partial<Record<VendorField, string>>>({});
  const [vendorSubmitting, setVendorSubmitting] = useState(false);
  const [mryAlert, setMryAlert]               = useState(false);

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVendorForm(p => ({ ...p, [name]: value }));
    setVendorErrors(p => ({ ...p, [name]: undefined }));
  };

  const pickCategory = (name: string, mryOnly?: boolean) => {
    if (mryOnly) { setMryAlert(true); return; }
    setMryAlert(false);
    setVendorForm(p => ({ ...p, category: name }));
    setVendorErrors(p => ({ ...p, category: undefined }));
  };

  const validateVendorStep = (s: number): boolean => {
    const errs: Partial<Record<VendorField, string>> = {};
    if (s === 1) {
      if (!vendorForm.firstName.trim())    errs.firstName    = 'First name is required';
      if (!vendorForm.lastName.trim())     errs.lastName     = 'Last name is required';
      if (!vendorForm.businessName.trim()) errs.businessName = 'Business name is required';
      if (!vendorForm.phone.trim())        errs.phone        = 'Phone number is required';
      if (!vendorForm.email.trim())        errs.email        = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(vendorForm.email)) errs.email = 'Enter a valid email';
    }
    if (s === 2) {
      if (!vendorForm.category) errs.category = 'Please select a vendor category';
    }
    setVendorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleVendorNext = () => { if (validateVendorStep(vendorStep)) setVendorStep(s => s + 1); };
  const handleVendorBack = () => { setVendorStep(s => s - 1); setVendorErrors({}); setMryAlert(false); };

  const selectedCat  = VENDOR_CATEGORIES.flatMap(g => g.items).find(i => i.name === vendorForm.category);
  const vendorTotal  = selectedCat ? selectedCat.fee + PLATFORM_FEE : 0;
  const vendorName   = [vendorForm.firstName, vendorForm.lastName].filter(Boolean).join(' ');

  const handleVendorSubmit = async () => {
    if (!validateVendorStep(2)) return;
    if (!scriptReady) { alert('Payment is still loading. Please try again in a moment.'); return; }

    const uniqueCode = generateUniqueCode('VND');
    const txRef = `CACVENDOR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    setVendorSubmitting(true);
    let preSaved = false;
    try {
      const res = await fetch(`${API}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: vendorForm.firstName, lastName: vendorForm.lastName,
          name: vendorName, businessName: vendorForm.businessName,
          phone: vendorForm.phone, email: vendorForm.email,
          category: vendorForm.category, uniqueCode, txRef, amount: vendorTotal,
        }),
      });
      preSaved = res.ok;
      if (!res.ok) console.warn('Vendor pre-save failed:', res.status);
    } catch (err) { console.warn('Vendor pre-save error:', err); }
    setVendorSubmitting(false);

    window.FlutterwaveCheckout?.({
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: vendorTotal,
      currency: 'NGN',
      payment_options: 'card,ussd,banktransfer',
      customer: { email: vendorForm.email, phone_number: vendorForm.phone, name: vendorName },
      customizations: {
        title: 'CAC Youth Conference — Vendor',
        description: `2026 Vendor Space: ${vendorForm.category}`,
        logo: `${window.location.origin}/favicon.png`,
      },
      callback: (response: { status: string; tx_ref: string }) => {
        if (response.status === 'successful' || response.status === 'completed') {
          sessionStorage.setItem('cac_vendor_slip', JSON.stringify({
            name: vendorName, businessName: vendorForm.businessName,
            category: vendorForm.category, phone: vendorForm.phone,
            uniqueCode, amount: vendorTotal,
          }));
          if (!preSaved) {
            fetch(`${API}/api/vendors`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstName: vendorForm.firstName, lastName: vendorForm.lastName,
                name: vendorName, businessName: vendorForm.businessName,
                phone: vendorForm.phone, email: vendorForm.email,
                category: vendorForm.category, uniqueCode, txRef: response.tx_ref, amount: vendorTotal,
              }),
            }).catch(err => console.error('Vendor save error:', err));
          }
          setTimeout(() => { window.location.href = '/vendor/slip'; }, 2000);
        }
      },
      onclose: () => {
        if (sessionStorage.getItem('cac_vendor_slip')) window.location.href = '/vendor/slip';
      },
    });
  };

  // ── Render participant steps ───────────────────────────────────────────────
  const renderParticipantStep = () => {
    if (step === 1) return (
      <div className="space-y-5">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">First Name</label>
          <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
            placeholder="e.g. John" autoComplete="given-name" className={inputCls(!!errors.firstName)} />
          {errors.firstName && <p className="text-red-400 text-xs mt-1.5">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            Middle Name <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input type="text" name="middleName" value={form.middleName} onChange={handleChange}
            placeholder="e.g. Emeka" autoComplete="additional-name" className={inputCls(false)} />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Last Name</label>
          <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
            placeholder="e.g. Adebayo" autoComplete="family-name" className={inputCls(!!errors.lastName)} />
          {errors.lastName && <p className="text-red-400 text-xs mt-1.5">{errors.lastName}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Date of Birth</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} className={inputCls(!!errors.dob)} />
          {errors.dob && <p className="text-red-400 text-xs mt-1.5">{errors.dob}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Gender</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => pick('gender','Male')}   className={pill(form.gender==='Male')}>Male</button>
            <button type="button" onClick={() => pick('gender','Female')} className={pill(form.gender==='Female')}>Female</button>
          </div>
          {errors.gender && <p className="text-red-400 text-xs mt-1.5">{errors.gender}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Marital Status</label>
          <div className="flex gap-3">
            {['Single','Married','Widowed'].map(s => (
              <button key={s} type="button" onClick={() => pick('status',s)} className={pill(form.status===s)}>{s}</button>
            ))}
          </div>
          {errors.status && <p className="text-red-400 text-xs mt-1.5">{errors.status}</p>}
        </div>
      </div>
    );

    if (step === 2) return (
      <div className="space-y-5">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-3">State</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { v:'FCT',    l:'FCT',    sub:'Abuja' },
              { v:'NIGER',  l:'Niger',  sub:'State' },
              { v:'KADUNA', l:'Kaduna', sub:'State' },
              { v:'OTHER',  l:'Other',  sub:'State' },
            ] as const).map(({ v, l, sub }) => (
              <button key={v} type="button" onClick={() => pick('state', v)}
                className={`py-4 rounded-xl border transition-all duration-200 text-center cursor-pointer flex flex-col items-center gap-1 ${
                  form.state === v
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-400/40 hover:text-gray-200'
                }`}>
                <span className="font-bold text-sm">{l}</span>
                <span className="text-xs opacity-70">{sub}</span>
              </button>
            ))}
          </div>
          {errors.state && <p className="text-red-400 text-xs mt-1.5">{errors.state}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">
            {form.state === 'OTHER' ? 'Please select your state' : 'DCC / Zone'}
          </label>
          {form.state === 'OTHER' ? (
            <select name="dccZone" value={form.dccZone} onChange={handleChange}
              className={`w-full rounded-xl px-4 py-4 bg-gray-950 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base appearance-none cursor-pointer text-white ${
                errors.dccZone ? 'border-red-500' : 'border-white/10'
              }`}>
              <option value="">— Select your state —</option>
              {OTHER_STATES.map(s => <option key={s} value={s}>{s} State</option>)}
            </select>
          ) : (
            <select name="dccZone" value={form.dccZone} onChange={handleChange} disabled={!form.state}
              className={`w-full rounded-xl px-4 py-4 bg-gray-950 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-base appearance-none ${
                errors.dccZone ? 'border-red-500' : 'border-white/10'
              } ${!form.state ? 'text-gray-600 cursor-not-allowed' : 'text-white cursor-pointer'}`}>
              <option value="">{form.state ? '— Select your DCC / Zone —' : '— Select a state first —'}</option>
              {form.state && ZONES_BY_STATE[form.state as Exclude<SelectedState,'OTHER'>].map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          )}
          {errors.dccZone && <p className="text-red-400 text-xs mt-1.5">{errors.dccZone}</p>}
        </div>

        {form.state !== 'OTHER' && form.dccZone && (
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Assembly / District Name</label>
            <input type="text" name="assemblyName" value={form.assemblyName} onChange={handleChange}
              placeholder="e.g. CAC Bethel Assembly, Victory District" className={inputCls(!!errors.assemblyName)} />
            {errors.assemblyName && <p className="text-red-400 text-xs mt-1.5">{errors.assemblyName}</p>}
          </div>
        )}
        {form.state === 'OTHER' && (
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Church / Denomination</label>
            <input type="text" name="denomination" value={form.denomination} onChange={handleChange}
              placeholder="e.g. CAC Bethel Assembly, RCCG Grace Parish" className={inputCls(!!errors.denomination)} />
            {errors.denomination && <p className="text-red-400 text-xs mt-1.5">{errors.denomination}</p>}
          </div>
        )}
      </div>
    );

    if (step === 3) return (
      <div className="space-y-5">
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Phone Number</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange}
            placeholder="08012345678" autoComplete="tel" inputMode="tel" className={inputCls(!!errors.phone)} />
          {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="john@example.com" autoComplete="email" inputMode="email" className={inputCls(!!errors.email)} />
          {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Occupation</label>
          <input type="text" name="occupation" value={form.occupation} onChange={handleChange}
            placeholder="e.g. Teacher, Engineer, Student" className={inputCls(!!errors.occupation)} />
          {errors.occupation && <p className="text-red-400 text-xs mt-1.5">{errors.occupation}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-3">Qualification</label>
          <div className="space-y-2">
            {[
              { v:'Undergraduate', sub:'Currently in school' },
              { v:'Graduate',      sub:"Bachelor's degree" },
              { v:'Postgraduate',  sub:"Master's / PhD" },
              { v:'Other',         sub:'Secondary / Vocational' },
            ].map(({ v, sub }) => (
              <button key={v} type="button" onClick={() => pick('qualification', v)} className={cardPill(form.qualification===v)}>
                <span>{v}</span>
                <span className={`text-xs font-normal ${form.qualification===v ? 'text-purple-200' : 'text-gray-500'}`}>{sub}</span>
              </button>
            ))}
          </div>
          {errors.qualification && <p className="text-red-400 text-xs mt-1.5">{errors.qualification}</p>}
        </div>
      </div>
    );
  };

  // ── Render vendor steps ────────────────────────────────────────────────────
  const renderVendorStep = () => {
    if (vendorStep === 1) return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">First Name</label>
            <input type="text" name="firstName" value={vendorForm.firstName} onChange={handleVendorChange}
              placeholder="e.g. John" autoComplete="given-name" className={inputCls(!!vendorErrors.firstName)} />
            {vendorErrors.firstName && <p className="text-red-400 text-xs mt-1.5">{vendorErrors.firstName}</p>}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">Last Name</label>
            <input type="text" name="lastName" value={vendorForm.lastName} onChange={handleVendorChange}
              placeholder="e.g. Adebayo" autoComplete="family-name" className={inputCls(!!vendorErrors.lastName)} />
            {vendorErrors.lastName && <p className="text-red-400 text-xs mt-1.5">{vendorErrors.lastName}</p>}
          </div>
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Business / Brand Name</label>
          <input type="text" name="businessName" value={vendorForm.businessName} onChange={handleVendorChange}
            placeholder="e.g. Grace Bakes, Tech Hub NG" className={inputCls(!!vendorErrors.businessName)} />
          {vendorErrors.businessName && <p className="text-red-400 text-xs mt-1.5">{vendorErrors.businessName}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Phone Number</label>
          <input type="tel" name="phone" value={vendorForm.phone} onChange={handleVendorChange}
            placeholder="08012345678" autoComplete="tel" inputMode="tel" className={inputCls(!!vendorErrors.phone)} />
          {vendorErrors.phone && <p className="text-red-400 text-xs mt-1.5">{vendorErrors.phone}</p>}
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-semibold mb-2">Email Address</label>
          <input type="email" name="email" value={vendorForm.email} onChange={handleVendorChange}
            placeholder="business@example.com" autoComplete="email" inputMode="email" className={inputCls(!!vendorErrors.email)} />
          {vendorErrors.email && <p className="text-red-400 text-xs mt-1.5">{vendorErrors.email}</p>}
        </div>
      </div>
    );

    if (vendorStep === 2) return (
      <div className="space-y-6">
        {VENDOR_CATEGORIES.map(group => (
          <div key={group.group}>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-3">{group.group}</p>
            <div className="space-y-2">
              {group.items.map(item => {
                if (item.mryOnly) {
                  return (
                    <button key={item.name} type="button" onClick={() => pickCategory(item.name, true)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm border border-white/10 bg-white/5 text-gray-500 hover:border-amber-500/40 hover:text-amber-400 transition-all duration-200 cursor-pointer text-left w-full">
                      <span>{item.name}</span>
                      <span className="text-xs font-semibold text-amber-500/80 bg-amber-950/60 px-2 py-1 rounded-lg">MRY Media Only</span>
                    </button>
                  );
                }
                const active = vendorForm.category === item.name;
                const total  = item.fee + PLATFORM_FEE;
                return (
                  <button key={item.name} type="button" onClick={() => pickCategory(item.name)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer text-left w-full ${
                      active
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-purple-400/40 hover:text-gray-200'
                    }`}>
                    <span>{item.name}</span>
                    <span className={`text-xs font-bold ${active ? 'text-purple-200' : 'text-gray-500'}`}>
                      ₦{total.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {mryAlert && (
          <div className="bg-amber-900/30 border border-amber-500/40 rounded-xl px-4 py-3 text-sm text-amber-300 leading-relaxed">
            <strong>Live Streaming Crew</strong> is reserved for <strong>MRY Media</strong> only.
            Please contact the admin to enquire about this space.
          </div>
        )}

        {vendorErrors.category && (
          <p className="text-red-400 text-xs">{vendorErrors.category}</p>
        )}

        {vendorForm.category && !mryAlert && (
          <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl px-4 py-3 text-center">
            <p className="text-purple-300 text-xs uppercase tracking-widest mb-1 font-semibold">Space Fee</p>
            <p className="text-white text-3xl font-black">₦{vendorTotal.toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  };

  // ── Step indicator ─────────────────────────────────────────────────────────
  const isParticipant = activeType === 'participant';
  const steps         = isParticipant ? STEP_META : VENDOR_STEP_META;
  const currentStep   = isParticipant ? step : vendorStep;
  const currentMeta   = steps[currentStep - 1];
  const totalSteps    = steps.length;

  return (
    <div className="min-h-screen bg-black-light">

      {/* Hero */}
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

        {/* Type switcher */}
        <div className="flex gap-2 mb-6 bg-white/5 border border-white/10 rounded-2xl p-1.5">
          <button
            type="button"
            onClick={() => setActiveType('participant')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              isParticipant
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Participant
          </button>
          <button
            type="button"
            onClick={() => setActiveType('vendor')}
            className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              !isParticipant
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Vendor
          </button>
        </div>

        {/* Already registered */}
        <div className="mb-5 text-center">
          <a
            href={isParticipant ? '/conference/slip' : '/vendor/slip'}
            className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Already registered? Get your slip
          </a>
        </div>

        {/* Fee banner */}
        <div className="bg-purple-900/40 border border-purple-500/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-purple-300 text-xs uppercase tracking-widest mb-1 font-semibold">
            {isParticipant ? 'Registration Fee' : 'Space Fee (from)'}
          </p>
          <p className="text-white text-4xl sm:text-5xl font-black">
            {isParticipant ? `₦${CONFERENCE_FEE.toLocaleString()}` : `₦${(15000 + PLATFORM_FEE).toLocaleString()}`}
          </p>
          {!isParticipant && (
            <p className="text-purple-400 text-xs mt-1">Varies by category</p>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8 px-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  i + 1 < currentStep  ? 'bg-purple-600 border-purple-600 text-white' :
                  i + 1 === currentStep ? 'bg-purple-600/20 border-purple-500 text-purple-300' :
                                          'bg-white/5 border-white/15 text-gray-600'
                }`}>
                  {i + 1 < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium transition-colors duration-300 ${
                  i + 1 === currentStep ? 'text-purple-300' : i + 1 < currentStep ? 'text-purple-500' : 'text-gray-600'
                }`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-5 transition-all duration-500 ${
                  i + 1 < currentStep ? 'bg-purple-600' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-8">

          <div className="mb-6 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                {currentStep}
              </div>
              <div>
                <h2 className="text-white text-lg font-black leading-tight">{currentMeta.title}</h2>
                <p className="text-gray-500 text-xs mt-0.5">{currentMeta.subtitle}</p>
              </div>
            </div>
          </div>

          {isParticipant ? renderParticipantStep() : renderVendorStep()}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button type="button"
                onClick={isParticipant ? handleBack : handleVendorBack}
                className="flex-1 py-4 rounded-xl font-bold text-gray-300 border border-white/20 hover:border-white/40 active:scale-95 transition-all duration-200">
                ← Back
              </button>
            )}
            {currentStep < totalSteps ? (
              <button type="button"
                onClick={isParticipant ? handleNext : handleVendorNext}
                className="flex-1 py-4 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all duration-200">
                Continue →
              </button>
            ) : (
              <button type="button"
                onClick={isParticipant ? handleSubmit : handleVendorSubmit}
                disabled={isParticipant ? submitting : (vendorSubmitting || !vendorForm.category)}
                className="flex-1 py-4 rounded-xl font-bold text-white text-base sm:text-lg bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                {isParticipant
                  ? (submitting ? 'Saving…' : `Pay ₦${CONFERENCE_FEE.toLocaleString()} & Register`)
                  : (vendorSubmitting
                      ? 'Saving…'
                      : vendorForm.category
                        ? `Pay ₦${vendorTotal.toLocaleString()} & Register`
                        : 'Select a Category Above')}
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
