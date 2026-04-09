import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";
import { useState } from "react";
import Button from "../components/ui/Button";
import {
  FaBullhorn,
  FaUsers,
  FaAward,
} from "react-icons/fa";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT – Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const benefitCards = [
  {
    icon: FaBullhorn,
    title: "Event Spotlight",
    desc: "Your business gets featured and announced before a live audience at our ministry event.",
  },
  {
    icon: FaUsers,
    title: "Wide Reach",
    desc: "Gain exposure to thousands of attendees, digital viewers, and our active online community.",
  },
  {
    icon: FaAward,
    title: "Brand Credibility",
    desc: "Align your brand with a trusted, spirit-filled movement that people believe in.",
  },
];

const ShowcaseBusiness = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    state: "",
    businessDescription: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "b0e5369a-c015-4a71-8df5-eafbe3e2276f",
          name: formData.fullName,
          email: formData.email,
          state: formData.state,
          message: formData.businessDescription,
          subject: "Business Showcase Registration – CACYOF Event",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message:
            "Registration received! We'll be in touch with you shortly regarding your business showcase.",
        });
        setFormData({
          fullName: "",
          email: "",
          state: "",
          businessDescription: "",
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message:
          "Something went wrong. Please try again or reach out to us directly via email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useGSAP(() => {
    const titleSplit = new SplitText("#showcase-title", {
      type: "lines, chars",
    });
    titleSplit.chars.forEach((char) => char.classList.add("text-gradient"));

    gsap.from(titleSplit.lines, {
      yPercent: 100,
      duration: 1,
      ease: "expo.out",
      stagger: 0.06,
    });

    gsap.from("#showcase-subtitle", {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
      delay: 0.8,
    });

    gsap.from(".benefit-card", {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.15,
      delay: 1,
    });

    gsap.from(".form-group", {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.15,
      delay: 1.2,
    });
  });

  return (
    <section className="bg-black-light min-h-screen relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-800/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-900/5 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 pt-24 pb-24">
        {/* ── Hero ── */}
        <div className="text-center mb-6 px-4">
          <p className="text-purple-400 font-semibold tracking-widest uppercase text-sm mb-4">
            CACYOF Event Series
          </p>

          <div className="overflow-hidden">
            <h1
              id="showcase-title"
              className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              SHOWCASE YOUR BUSINESS
            </h1>
          </div>

          <p
            id="showcase-subtitle"
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Get your business promoted at our next ministry event. Fill in your
            details below and our team will reach out with everything you need
            to get started.
          </p>
        </div>

        {/* ── Form ── */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-2">
              Register Your Business
            </h2>
            <p className="text-gray-400 mb-8 text-sm">
              All fields are required. We'll review your submission and get back
              to you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Status message */}
              {submitStatus.type && (
                <div
                  className={`p-4 rounded-xl text-sm ${submitStatus.type === "success"
                    ? "bg-green-500/20 border border-green-500/50 text-green-300"
                    : "bg-red-500/20 border border-red-500/50 text-red-300"
                    }`}
                >
                  {submitStatus.message}
                </div>
              )}

              {/* Full Name */}
              <div className="form-group">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="e.g. Temi Adedayo"
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* State */}
              <div className="form-group">
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  State (Nigeria)
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-4 rounded-xl bg-[#0D1B2A] border border-white/10 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                >
                  <option value="" disabled className="text-gray-500">
                    — Select your state —
                  </option>
                  {NIGERIAN_STATES.map((state) => (
                    <option
                      key={state}
                      value={state}
                      className="bg-[#0D1B2A] text-white"
                    >
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Description */}
              <div className="form-group">
                <label
                  htmlFor="businessDescription"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Business Description
                </label>
                <textarea
                  id="businessDescription"
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  rows={5}
                  placeholder="Tell us about your business — what you do, what you sell, and why you'd like to be featured at the event."
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit */}
              <div className="form-group pt-2">
                <Button
                  title={isSubmitting ? "Submitting…" : "Submit Registration"}
                  containerClass={`w-full ${isSubmitting
                    ? "bg-purple-600/50 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                    } text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-600/30 transition-all duration-300 transform hover:-translate-y-1`}
                />
              </div>
            </form>
          </div>
        </div>

        {/* ── Benefit Strips ── */}
        {/* <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <h3 className="text-center text-xl font-bold text-white mb-6">What You Get</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {benefitCards.map((card, i) => (
              <div
                key={i}
                className="benefit-card bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:border-purple-500/40 transition-all duration-300 group"
              >
                <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <card.icon className="text-2xl text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default ShowcaseBusiness;
