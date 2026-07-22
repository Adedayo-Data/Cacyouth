import { useState, useEffect, useRef } from 'react';
import { generateUniqueCode } from '../utils/codeGenerator';
import { ZONES_BY_STATE, OTHER_STATES, CONFERENCE_FEE, type SelectedState } from '../utils/conferenceData';

const API = import.meta.env.VITE_API_URL ?? '';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { FlutterwaveCheckout?: (config: any) => void; }
}

interface FormData {
  firstName: string; middleName: string; lastName: string; dob: string;
  dccZone: string; assemblyName: string; denomination: string; gender: string;
  phone: string; email: string; state: SelectedState | ''; status: string;
  occupation: string; qualification: string;
}
type FormField = keyof FormData;

const emptyForm: FormData = {
  firstName: '', middleName: '', lastName: '', dob: '', dccZone: '', assemblyName: '',
  denomination: '', gender: '', phone: '', email: '', state: '', status: '',
  occupation: '', qualification: '',
};

interface Registrant extends FormData {
  uniqueCode: string;
  name: string;
}

const BulkRegistration = () => {
  const [scriptReady, setScriptReady] = useState(false);
  useEffect(() => {
    if (window.FlutterwaveCheckout) { setScriptReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.async = true;
    s.onload = () => setScriptReady(true);
    document.head.appendChild(s);
  }, []);

  // null = still checking; fails closed on a network error.
  const [registrationOpen, setRegistrationOpen] = useState<boolean | null>(null);
  useEffect(() => {
    fetch(`${API}/api/registrations/status`)
      .then(res => res.json())
      .then(data => setRegistrationOpen(!!data.open))
      .catch(() => setRegistrationOpen(false));
  }, []);

  const [payer, setPayer] = useState({ name: '', email: '', phone: '' });
  const [payerErrors, setPayerErrors] = useState<Partial<Record<'name' | 'email' | 'phone', string>>>({});

  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [group, setGroup] = useState<Registrant[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Ref, not just state: React state updates aren't synchronous, so a rapid
  // double-click could fire handlePay twice before the button visually
  // disables — that would submit the same group (same unique_codes) twice
  // and hit the unique_code constraint on the second insert.
  const payInFlight = useRef(false);
  const [paid, setPaid] = useState(false);

  const inputCls = (err: boolean) =>
    `w-full rounded-xl px-3 py-3.5 text-white placeholder-gray-500 bg-white/5 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm ${
      err ? 'border-red-500' : 'border-white/10'
    }`;
  const selectCls = (err: boolean) =>
    `w-full rounded-xl px-3 py-3.5 bg-gray-950 border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm text-white appearance-none ${
      err ? 'border-red-500' : 'border-white/10'
    }`;

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
      setForm(p => ({ ...p, state: value as SelectedState, dccZone: '', assemblyName: '', denomination: '' }));
      setErrors(p => ({ ...p, state: undefined, dccZone: undefined, assemblyName: undefined, denomination: undefined }));
    } else {
      setForm(p => ({ ...p, [field]: value }));
      setErrors(p => ({ ...p, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errs: Partial<Record<FormField, string>> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.dob.trim()) errs.dob = 'Required';
    if (!form.gender) errs.gender = 'Required';
    if (!form.status) errs.status = 'Required';
    if (!form.state) errs.state = 'Required';
    if (!form.dccZone.trim()) errs.dccZone = 'Required';
    if (form.state === 'OTHER' && !form.denomination.trim()) errs.denomination = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.occupation.trim()) errs.occupation = 'Required';
    if (!form.qualification) errs.qualification = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ');
    const stateForCode = form.state === 'OTHER' ? form.dccZone.toUpperCase() : (form.state as string);
    const uniqueCode = generateUniqueCode(stateForCode);
    setGroup(g => [...g, { ...form, name: fullName, uniqueCode }]);
    // Keep church/state selection sticky — a group usually shares one DCC zone/assembly.
    setForm(p => ({
      ...emptyForm,
      state: p.state, dccZone: p.dccZone, assemblyName: p.assemblyName, denomination: p.denomination,
    }));
    setErrors({});
  };

  const handleRemove = (uniqueCode: string) => setGroup(g => g.filter(r => r.uniqueCode !== uniqueCode));

  const total = group.length * CONFERENCE_FEE;

  const validatePayer = (): boolean => {
    const errs: Partial<Record<'name' | 'email' | 'phone', string>> = {};
    if (!payer.name.trim()) errs.name = 'Required';
    if (!payer.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(payer.email)) errs.email = 'Enter a valid email';
    if (!payer.phone.trim()) errs.phone = 'Required';
    setPayerErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async () => {
    if (payInFlight.current) return;
    if (group.length === 0) { alert('Add at least one person to the group first.'); return; }
    if (!validatePayer()) return;
    if (!scriptReady) { alert('Payment is still loading. Please try again in a moment.'); return; }

    payInFlight.current = true;
    const txRef = `CACBULK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/registrations/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txRef,
          registrants: group.map(r => ({ ...r, amount: CONFERENCE_FEE, assemblyName: r.assemblyName || null })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const base = data.error || 'Could not save the group. Please try again.';
        const withDetail = data.detail
          ? `${base} (${data.failedName ? `${data.failedName}: ` : ''}${data.detail})`
          : base;
        throw new Error(withDetail);
      }
    } catch (err) {
      setSubmitting(false);
      payInFlight.current = false;
      alert(err instanceof Error ? err.message : 'Could not save the group. Please try again.');
      return;
    }
    setSubmitting(false);

    window.FlutterwaveCheckout?.({
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
      tx_ref: txRef,
      amount: total,
      currency: 'NGN',
      payment_options: 'card,ussd,banktransfer',
      customer: { email: payer.email, phone_number: payer.phone, name: payer.name },
      customizations: {
        title: 'CAC Youth Conference — Group Registration',
        description: `2026 Conference — ${group.length} registrant(s)`,
        logo: `${window.location.origin}/favicon.png`,
      },
      callback: (response: { status: string }) => {
        if (response.status === 'successful' || response.status === 'completed') {
          setPaid(true);
        }
      },
      onclose: () => { payInFlight.current = false; },
    });
  };

  if (registrationOpen === null) {
    return <div className="min-h-screen bg-black-light" />;
  }

  if (registrationOpen === false) {
    return (
      <div className="min-h-screen bg-black-light flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-6 text-3xl">🚧</div>
          <h1 className="text-white text-2xl sm:text-3xl font-black mb-3">Registration Temporarily Closed</h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
            We're not accepting new group registrations right now. Please check back shortly.
          </p>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-black-light flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-5 text-3xl">✓</div>
          <h1 className="text-white text-2xl font-black mb-2">Group Payment Successful!</h1>
          <p className="text-gray-400 text-sm mb-6">
            {group.length} registration{group.length !== 1 ? 's' : ''} confirmed. Each person's slip has been sent to their own email address.
          </p>
          <div className="space-y-2 text-left mb-6 max-h-72 overflow-y-auto">
            {group.map(r => (
              <div key={r.uniqueCode} className="bg-black/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{r.name}</p>
                  <p className="text-gray-500 text-xs truncate">{r.email}</p>
                </div>
                <span className="font-mono font-bold text-amber-400 text-sm shrink-0">{r.uniqueCode}</span>
              </div>
            ))}
          </div>
          <a href="/" className="inline-block px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-light">
      <section className="relative overflow-hidden pt-32 pb-12 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-purple-400 uppercase tracking-widest text-xs font-semibold mb-3">
            CAC Youth Fellowship · Medaiyese Region
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">Group Registration</h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Add everyone in your group, then pay once for the whole group. Each person still gets their own slip by email.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-24 space-y-6">

        {/* Payer details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-white font-bold text-base mb-1">Your Details</h2>
          <p className="text-gray-500 text-xs mb-4">You're the one paying — the receipt goes here. Slips go to each registrant's own email below.</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <input type="text" placeholder="Your name" value={payer.name}
                onChange={e => { setPayer(p => ({ ...p, name: e.target.value })); setPayerErrors(p => ({ ...p, name: undefined })); }}
                className={inputCls(!!payerErrors.name)} />
              {payerErrors.name && <p className="text-red-400 text-xs mt-1">{payerErrors.name}</p>}
            </div>
            <div>
              <input type="email" placeholder="Your email" value={payer.email}
                onChange={e => { setPayer(p => ({ ...p, email: e.target.value })); setPayerErrors(p => ({ ...p, email: undefined })); }}
                className={inputCls(!!payerErrors.email)} />
              {payerErrors.email && <p className="text-red-400 text-xs mt-1">{payerErrors.email}</p>}
            </div>
            <div>
              <input type="tel" placeholder="Your phone" value={payer.phone}
                onChange={e => { setPayer(p => ({ ...p, phone: e.target.value })); setPayerErrors(p => ({ ...p, phone: undefined })); }}
                className={inputCls(!!payerErrors.phone)} />
              {payerErrors.phone && <p className="text-red-400 text-xs mt-1">{payerErrors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Add registrant form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-white font-bold text-base mb-4">Add a Registrant</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">First Name</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} className={inputCls(!!errors.firstName)} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Middle Name</label>
                <input type="text" name="middleName" value={form.middleName} onChange={handleChange} className={inputCls(false)} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Last Name</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} className={inputCls(!!errors.lastName)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Date of Birth</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} className={inputCls(!!errors.dob)} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Gender</label>
                <div className="flex gap-2">
                  {['Male', 'Female'].map(g => (
                    <button key={g} type="button" onClick={() => pick('gender', g)}
                      className={`flex-1 py-3.5 rounded-xl text-xs font-semibold border transition-all ${
                        form.gender === g ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Marital Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={selectCls(!!errors.status)}>
                  <option value="">— Select —</option>
                  {['Single', 'Married', 'Widowed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">State</label>
                <select name="state" value={form.state} onChange={e => pick('state', e.target.value)} className={selectCls(!!errors.state)}>
                  <option value="">— Select —</option>
                  <option value="FCT">FCT</option>
                  <option value="NIGER">Niger</option>
                  <option value="KADUNA">Kaduna</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">
                  {form.state === 'OTHER' ? 'Your State' : 'DCC / Zone'}
                </label>
                {form.state === 'OTHER' ? (
                  <select name="dccZone" value={form.dccZone} onChange={handleChange} className={selectCls(!!errors.dccZone)}>
                    <option value="">— Select —</option>
                    {OTHER_STATES.map(s => <option key={s} value={s}>{s} State</option>)}
                  </select>
                ) : (
                  <select name="dccZone" value={form.dccZone} onChange={handleChange} disabled={!form.state} className={selectCls(!!errors.dccZone)}>
                    <option value="">{form.state ? '— Select —' : '— Select a state first —'}</option>
                    {form.state && ZONES_BY_STATE[form.state].map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                )}
              </div>
            </div>

            {form.state && form.state !== 'OTHER' && (
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Assembly / District Name</label>
                <input type="text" name="assemblyName" value={form.assemblyName} onChange={handleChange} className={inputCls(false)} />
              </div>
            )}
            {form.state === 'OTHER' && (
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Church / Denomination</label>
                <input type="text" name="denomination" value={form.denomination} onChange={handleChange} className={inputCls(!!errors.denomination)} />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputCls(!!errors.phone)} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Email (their slip goes here)</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls(!!errors.email)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Occupation</label>
                <input type="text" name="occupation" value={form.occupation} onChange={handleChange} className={inputCls(!!errors.occupation)} />
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-semibold mb-1.5">Qualification</label>
                <select name="qualification" value={form.qualification} onChange={handleChange} className={selectCls(!!errors.qualification)}>
                  <option value="">— Select —</option>
                  {['Undergraduate', 'Graduate', 'Postgraduate', 'Other'].map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
            </div>

            <button type="button" onClick={handleAdd}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-colors active:scale-95">
              + Add to Group
            </button>
          </div>
        </div>

        {/* Group list */}
        {group.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-white font-bold text-base mb-4">Group ({group.length})</h2>
            <div className="space-y-2">
              {group.map(r => (
                <div key={r.uniqueCode} className="bg-black/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{r.name}</p>
                    <p className="text-gray-500 text-xs truncate">{r.phone} · {r.email}</p>
                  </div>
                  <button type="button" onClick={() => handleRemove(r.uniqueCode)} className="text-red-400 hover:text-red-300 text-xs font-semibold shrink-0">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total + pay */}
        <div className="bg-purple-900/40 border border-purple-500/20 rounded-xl p-5 text-center sticky bottom-4">
          <p className="text-purple-300 text-xs uppercase tracking-widest mb-1 font-semibold">
            {group.length} registrant{group.length !== 1 ? 's' : ''} × ₦{CONFERENCE_FEE.toLocaleString()}
          </p>
          <p className="text-white text-4xl font-black mb-4">₦{total.toLocaleString()}</p>
          <button type="button" onClick={handlePay} disabled={submitting || group.length === 0}
            className="w-full py-4 rounded-xl font-bold text-white text-base bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Saving group…' : `Pay ₦${total.toLocaleString()} for the Group`}
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center leading-relaxed">
          Secured by Flutterwave · One payment covers the whole group · Each person's slip is emailed to them individually.
        </p>
      </section>
    </div>
  );
};

export default BulkRegistration;
