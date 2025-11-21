
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";
import { FaPray, FaBible, FaMusic } from "react-icons/fa";

const Ministry = () => {
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
          opacity: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: "back.out(1.7)",
        },
        "-=0.4"
      );
  });

  return (
    <div className="bg-black-light text-white overflow-x-hidden">
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
              Upcoming Worship Experience
            </span>
          </div>
          <h1
            className="text-5xl md:text-8xl lg:text-[100px] font-black leading-none tracking-tighter mb-8"
            id="ministry-head"
          >
            EMERGENCE
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              CONCERT
            </span>
          </h1>
          <p
            className="text-base md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4"
            id="ministry-sub"
          >
            A night where heaven touches earth. Join us for an electrifying
            atmosphere of undiluted worship, prophetic sounds, and the rising of
            a new generation of kingdom giants.
          </p>
        </div>
      </section>

      {/* Section 2: Daily Inspiration */}
      <section
        id="inspiration-section"
        className="py-24 px-4 relative flex items-center justify-center min-h-[80vh]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black-light to-black-light z-0"></div>

        <div
          id="inspiration-card"
          className="relative z-10 max-w-4xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16 text-center shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
            <FaBible className="text-3xl text-white" />
          </div>

          <h2 className="text-2xl md:text-3xl font-serif text-purple-300 mb-8 mt-6">
            Daily Inspiration
          </h2>

          <blockquote className="text-3xl md:text-5xl font-bold leading-tight mb-8 text-white">
            "For I know the plans I have for you," declares the Lord, "plans to
            prosper you and not to harm you, plans to give you hope and a
            future."
          </blockquote>

          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-transparent mx-auto mb-6"></div>

          <cite className="text-xl text-gray-400 not-italic font-medium">
            — Jeremiah 29:11
          </cite>
        </div>
      </section>

      {/* Section 3: Youth Conference */}
      <section
        id="conference-section"
        className="py-24 px-4 relative bg-gradient-to-t from-purple-900/20 to-black-light"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              id="conference-title"
              className="text-5xl md:text-7xl font-black mb-6 tracking-tight"
            >
              YOUTH <span className="text-purple-500">CONFERENCE</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three days of power, transformation, and encounter. Come and be
              equipped for the mandate upon your life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: The Word */}
            <div className="conference-feature group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaBible className="text-3xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">The Word</h3>
              <p className="text-gray-400 leading-relaxed">
                Deep exposition of scriptures to ground you in truth and unveil
                mysteries for your rising.
              </p>
            </div>

            {/* Feature 2: Prayer */}
            <div className="conference-feature group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300">
              <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaPray className="text-3xl text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Prayer</h3>
              <p className="text-gray-400 leading-relaxed">
                Intense sessions of intercession and spiritual warfare to break
                limits and birth destinies.
              </p>
            </div>

            {/* Feature 3: Worship */}
            <div className="conference-feature group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300">
              <div className="bg-pink-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaMusic className="text-3xl text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Worship</h3>
              <p className="text-gray-400 leading-relaxed">
                Ascend into the throne room through heart-rending worship and
                prophetic sounds.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ministry;
