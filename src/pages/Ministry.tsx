import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";

const Ministry = () => {
  useGSAP(() => {
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

    const scriptureTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#scripture-section",
        start: "top center",
        end: "bottom center",
        toggleActions: "play none none reverse",
      },
    });

    scriptureTimeline
      .from("#scripture-img", {
        opacity: 0,
        x: -100,
        duration: 0.8,
        ease: "power2.out",
      })
      .from(
        "#scripture-text",
        {
          opacity: 0,
          x: 100,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.6"
      );

    const programsTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#programs-section",
        start: "top center",
        end: "bottom center",
        toggleActions: "play none none reverse",
      },
    });

    programsTimeline.from(".program-card", {
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.2,
    });
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-[linear-gradient(rgba(26,16,34,0.7)_0%,rgba(74,20,140,0.5)_100%),url('/assets/back.png')] bg-cover bg-center bg-no-repeat w-full h-screen flex items-center justify-center px-4">
        <div className="text-center text-white">
          <div className="flex justify-center -mt-10 mb-10">
            <p className="uppercase bg-black-light w-50 py-1 rounded-full border border-white/70 text-xs ">
              Upcoming Event
            </p>
          </div>
          <h1
            className="text-6xl font-black leading-tight tracking-tight lg:text-[80px] text-gradient"
            id="ministry-head"
          >
            Youth Concert
          </h1>
          <p className="text-lg mt-6 max-w-2xl mx-auto" id="ministry-sub">
            Join us for an unforgettable night of worship, music, and spiritual
            renewal. Experience the power of faith through our upcoming youth
            concert event.
          </p>
        </div>
      </section>

      {/* Scripture Section */}
      <section
        className="py-16 bg-gray-50 overflow-x-hidden"
        id="scripture-section"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div id="scripture-img">
              <img
                src="/assets/back.png"
                alt="Ministry"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div
              id="scripture-text"
              className="text-center md:text-left bg-purple-100 py-25 px-5 rounded-lg"
            >
              <h2 className="text-3xl font-bold text-primary mb-6">
                Daily Inspiration
              </h2>
              <blockquote className="text-lg italic text-white/50 mb-4">
                "For I know the plans I have for you," declares the Lord, "plans
                to prosper you and not to harm you, plans to give you hope and a
                future."
              </blockquote>
              <cite className="text-primary font-semibold">
                - Jeremiah 29:11
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Programs */}
      <section className="py-16 bg-black-light" id="programs-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary">
              Upcoming Programs
            </h2>
            <p className="mt-4 text-lg text-white">
              Stay connected with our latest events and activities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="program-card bg-white/70 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black-light mb-3">
                Prayer Meeting
              </h3>
              <p className="text-gray-600 mb-4">
                Join us for our weekly prayer gathering every Wednesday at 7 PM.
              </p>
              <div className="text-sm text-gray-500">
                <p>📅 Next: Dec 6, 2023</p>
                <p>📍 Church Hall</p>
              </div>
            </div>
            <div className="program-card bg-white/70 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black-light mb-3">
                Bible Study
              </h3>
              <p className="text-gray-600 mb-4">
                Deep dive into God's word with our Saturday morning sessions.
              </p>
              <div className="text-sm text-gray-500">
                <p>📅 Every Saturday</p>
                <p>📍 Study Room</p>
              </div>
            </div>
            <div className="program-card bg-white/70 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black-light mb-3">
                Youth Retreat
              </h3>
              <p className="text-gray-600 mb-4">
                Annual spiritual retreat for renewal and fellowship.
              </p>
              <div className="text-sm text-gray-500">
                <p>📅 Feb 15-17, 2024</p>
                <p>📍 Mountain Resort</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ministry;
