

import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";
import { FaPray, FaBible, FaMusic, FaHandHoldingHeart, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import VanillaTilt from "vanilla-tilt";
import Button from "../components/ui/Button";
import { createPortal } from "react-dom";
import { useDonate } from "../components/shared/DonateContext";
import { Link } from "react-router-dom";
import GuestMinistersSlider from "../components/shared/GuestMinistersSlider";

const Ministry = () => {
  const { openModal } = useDonate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  useGSAP(() => {
    // Hero Animation
    const heroSplit = new SplitText("#ministry-head", { type: "lines, chars" });
    heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));

    gsap.from(heroSplit.lines, {
      yPercent: 100,
      duration: 1,
      ease: "expo.out",
      stagger: 0.06,
    });

    gsap.from("#ministry-sub", {
      opacity: 0,
      yPercent: 100,
      duration: 1,
      ease: "power2.inOut",
      delay: 1,
    });

    // Daily Inspiration Animation
    gsap.from("#inspiration-card", {
      scrollTrigger: {
        trigger: "#inspiration-section",
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });

    // Conference Animation
    const conferenceTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#conference-section",
        start: "top 70%",
      },
    });

    conferenceTl
      .from("#conference-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      })
      .from(
        ".conference-feature",
        {
          y: 30,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
        },
        "-=0.4"
      );
  });

  useEffect(() => {
    VanillaTilt.init(
      Array.from(document.querySelectorAll(".tilt-card")) as HTMLElement[],
      {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.5,
      }
    );
  }, []);

  return (
    <div className="bg-black-light text-white overflow-x-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* Section 1: Emergence Concert (Hero) */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-purple-900/40 to-black-light z-10"></div>
          <img
            src="/assets/4.jpg"
            alt="Concert Crowd"
            className="w-full h-full object-cover scale-105"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div className="inline-block mb-6 px-4 py-1 rounded-full border border-purple-500/50 bg-purple-900/30 backdrop-blur-sm">
            <span className="text-purple-300 text-xs md:text-sm font-medium tracking-wider uppercase">
              Annual Worship Event
            </span>
          </div>
          <h1
            className="text-5xl md:text-8xl lg:text-[100px] font-black leading-none tracking-tighter mb-8"
            id="ministry-head"
          >
            THE EMERGENCE
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              CONCERT
            </span>
          </h1>
          <p
            className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4"
            id="ministry-sub"
          >
            A Worship Encounter That Transforms Lives. Bringing thousands of young believers together for a night of revival, sound, and supernatural encounters.
          </p>
          <div className="flex justify-center mt-8 gap-4" id="btn">
            <Button
              title="Support The Vision"
              containerClass="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-purple-900/20"
              handleClick={openModal}
            />
          </div>
        </div>
      </section>

      {/* Section 2: What is Emergence Concert - Explanation */}
      <section className="py-24 px-6 bg-gradient-to-b from-black-light to-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Image */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-3xl transform -rotate-3 opacity-20 blur-lg"></div>
              <img
                src="/assets/4.jpg"
                alt="Emergence Concert Worship"
                className="relative rounded-3xl shadow-2xl border border-white/10 w-full object-cover aspect-4/3"
              />
            </div>

            {/* Right side - Content */}
            <div className="space-y-6 z-10 relative order-1 lg:order-2">
              <div className="inline-block">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm">
                    About The Event
                  </span>
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                What is the
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Emergence Concert?
                </span>
              </h2>

              <p className="text-xl text-gray-300 leading-relaxed">
                The Emergence Concert is our annual flagship worship event that brings
                thousands of young believers together for a night of revival, prophetic sound,
                and supernatural encounters with God.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-500 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold mb-1">Transformative Worship</h4>
                    <p className="text-gray-400 text-sm">
                      Experience heaven-touching worship that ushers in God's manifest presence
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-500 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold mb-1">Powerful Ministry</h4>
                    <p className="text-gray-400 text-sm">
                      Anointed ministers delivering life-changing messages and prophetic words
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-500 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold mb-1">Kingdom Impact</h4>
                    <p className="text-gray-400 text-sm">
                      Testimonies of salvation, healing, deliverance, and divine encounters
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-purple-500 text-xl mt-1 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold mb-1">Regional Unity</h4>
                    <p className="text-gray-400 text-sm">
                      Bringing together youth from across Abuja, Niger, and Kaduna states
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  "From an explosive launch in 2024, the Emergence Concert has grown into a
                  spiritual movement marked by testimonies, salvation, and deep encounters with God.
                  This is more than a concert—it's a divine appointment."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Guest Ministers Slider */}
      <GuestMinistersSlider />

      {/* Section 4: Emergence 2026 - Special Mission */}
      <section className="py-24 px-6 bg-black-light relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                The Emergence 2026 <br />
                <span className="text-purple-500">Special Mission</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                In 2026, the Emergence Concert extends beyond the hall. We will be visiting the Correctional Centre for a mini-concert, outreach, and gift distribution.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                    <FaHandHoldingHeart className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Our Commitment</h4>
                    <p className="text-gray-400 text-sm">Kingdom evangelism, Community impact, Christian social responsibility, and Spreading hope through worship.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                  <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Fundraising Goal</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">₦5,000,000</span>
                    <span className="text-purple-400 font-medium">+</span>
                  </div>
                </div>
                <div className="w-full h-px bg-white/10 mb-4"></div>
                <p className="text-gray-400 text-sm text-center md:text-left">
                  Targeting ₦5M for outreach execution, with an expanded vision of ₦10M to support all Choir activities for the year.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-3xl transform rotate-3 opacity-20 blur-lg"></div>
              <img src="/assets/6.jpg" alt="Outreach" className="relative rounded-3xl shadow-2xl border border-white/10 w-full object-cover aspect-4/3" />

              {/* Partners Link Card */}
              <div className="absolute -bottom-10 -left-10 bg-black-light border border-white/10 p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <p className="text-gray-300 mb-4 text-sm">Join us in making this vision a reality.</p>
                <Link to="/partnership" className="flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors group">
                  Partner With Us <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Daily Inspiration - Redesigned */}
      <section
        id="inspiration-section"
        className="py-32 px-4 relative flex items-center justify-center min-h-[60vh] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/assets/7.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black-light via-black-light/80 to-black-light"></div>

        <div
          id="inspiration-card"
          className="relative z-10 max-w-5xl w-full text-center"
        >
          <div className="mb-8 flex justify-center">
            <span className="px-4 py-1 rounded-full border border-white/20 text-white/60 text-sm uppercase tracking-[0.2em]">Daily Inspiration</span>
          </div>

          <blockquote className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-tight mb-12 text-white/90">
            "For God is Spirit, so those who worship him must worship in <span className="text-purple-500 italic">spirit</span> and in <span className="text-purple-500 italic">truth</span>."
          </blockquote>

          <cite className="text-xl md:text-2xl text-gray-400 not-italic font-light tracking-wide block">
            — John 4:24
          </cite>
        </div>
      </section>

      {/* Section 4: Youth Conference */}
      <section
        id="conference-section"
        className="py-24 px-4 relative bg-black-light"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              id="conference-title"
              className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white"
            >
              YOUTH <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">CONFERENCE</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Our annual Youth Conference is designed to develop, empower, and spiritually equip young believers. With teachings, worship, workshops, and worship nights, the conference strengthens the foundation of faith and leadership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: The Word */}
            <div className="conference-feature group relative bg-gray-900 border border-white/30 rounded-3xl p-10 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-colors"></div>

              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-blue-500/30">
                <FaBible className="text-3xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">The Word</h3>
              <p className="text-gray-300 leading-relaxed">
                Deep exposition of scriptures to ground you in truth and unveil mysteries for your rising.
              </p>
            </div>

            {/* Feature 2: Prayer */}
            <div className="conference-feature group relative bg-gray-900 border border-white/30 rounded-3xl p-10 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/30 transition-colors"></div>

              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
                <FaPray className="text-3xl text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Prayer</h3>
              <p className="text-gray-300 leading-relaxed">
                Intense sessions of intercession and spiritual warfare to break limits and birth destinies.
              </p>
            </div>

            {/* Feature 3: Worship */}
            <div className="conference-feature group relative bg-gray-900 border border-white/30 rounded-3xl p-10 hover:bg-gray-800 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-pink-500/30 transition-colors"></div>

              <div className="bg-pink-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 border border-pink-500/30">
                <FaMusic className="text-3xl text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Worship</h3>
              <p className="text-gray-300 leading-relaxed">
                Ascend into the throne room through heart-rending worship and prophetic sounds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-black-light border border-white/10 text-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8 md:p-12">
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    THE EMERGENCE CONCERT
                  </h2>
                  <p className="text-lg text-purple-400 font-medium mb-6">
                    A Worship Encounter That Transforms Lives
                  </p>
                  <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
                    The Emergence Concert is our annual worship event that brings thousands of young believers together for a night of revival, sound, and supernatural encounters. From an explosive launch in 2024, the concert has grown into a spiritual movement marked by testimonies, salvation, and deep encounters with God.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-8 border border-white/10 mb-10">
                  <h3 className="text-2xl font-bold text-white text-center mb-6">
                    The Emergence 2026 – Special Mission
                  </h3>
                  <p className="text-gray-300 text-center mb-8 max-w-3xl mx-auto">
                    In 2026, the Emergence Concert extends beyond the hall — We will be visiting the Correctional Centre for a mini-concert, outreach, and gift distribution.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                    <div className="bg-black-light p-4 rounded-lg border border-white/5 text-center">
                      <span className="block text-purple-400 font-bold mb-1">Kingdom Evangelism</span>
                    </div>
                    <div className="bg-black-light p-4 rounded-lg border border-white/5 text-center">
                      <span className="block text-purple-400 font-bold mb-1">Community Impact</span>
                    </div>
                    <div className="bg-black-light p-4 rounded-lg border border-white/5 text-center">
                      <span className="block text-purple-400 font-bold mb-1">Social Responsibility</span>
                    </div>
                    <div className="bg-black-light p-4 rounded-lg border border-white/5 text-center">
                      <span className="block text-purple-400 font-bold mb-1">Spreading Hope</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-white font-bold text-xl mb-2">Target: ₦5,000,000 - ₦10,000,000</p>
                    <p className="text-gray-400 text-sm">To support outreach execution and all Choir activities.</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    title="Donate Now"
                    containerClass="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-105"
                    handleClick={openModal}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Ministry;
