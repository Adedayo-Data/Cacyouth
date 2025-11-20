import BrandValueSection from "../components/shared/BrandValueSection.tsx";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";

const About = () => {
  useGSAP(() => {
    const titleSplit = new SplitText("#about-title", { type: "lines, chars" });
    titleSplit.chars.forEach((char) => char.classList.add("text-gradient"));

    gsap.from(titleSplit.lines, {
      yPercent: 100,
      duration: 1,
      ease: "expo.out",
      stagger: 0.06,
    });

    gsap.from("#about-desc h2", {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
      delay: 1,
    });

    gsap.from("#about-desc p", {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
      delay: 1.2,
    });

    const impactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#impact",
        start: "top center",
        end: "bottom center",
        toggleActions: "play none none reverse",
      },
    });

    impactTimeline
      .from("#impact h2", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
      })
      .from(
        "#impact p",
        {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .from(
        ".impact-card",
        {
          opacity: 0,
          y: 50,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.2,
        },
        "-=0.4"
      );
  });
  return (
    <section>
      <div className="bg-gradient-to-r from-purple-100 to-black-light h-100">
        <p
          className="text-center text-[150px] text-gradient pt-25"
          id="about-title"
        >
          About Us
        </p>
      </div>
      <div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20"
        id="about-desc"
      >
        <h2 className="text-3xl font-bold  leading-tight tracking-tight text-primary sm:text-4xl">
          About the Fellowship
        </h2>
        <div className="mt-6 max-w-3xl mx-auto">
          <p className="text-lg leading-relaxed text-text-light-muted dark:text-text-dark-muted">
            The Christ Apostolic Church Youth Fellowship (CACYOF) of the
            Medaiyese Region is <br /> dedicated to nurturing a generation of
            young leaders grounded in faith, purpose, and <br /> community. Our
            annual concert is the cornerstone of this mission, creating a
            powerful <br />
            platform for spiritual growth, talent discovery, and positive youth
            engagement.
          </p>
        </div>
      </div>
      <section className="py-16 sm:py-24 bg-purple-100" id="impact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
              Our Impact
            </h2>
            <p className="mt-4 text-lg text-text-light-muted dark:text-text-dark-muted max-w-2xl mx-auto">
              Reaching hearts and transforming lives through faith and
              community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center text-black-light -mt-5">
            <div className="p-5 bg-white/70 rounded-xl impact-card hover:scale-105 transition-transform duration-300">
              <h3 className="text-3xl font-extrabold text-primary">500,000+</h3>
              <p className="mt-2 text-lg font-medium">Youth Members</p>
            </div>
            <div className="p-5 bg-white/70 rounded-xl impact-card hover:scale-105 transition-transform duration-300">
              <h3 className="text-3xl font-extrabold text-primary">100,000+</h3>
              <p className="mt-2 text-lg font-medium">Online Views</p>
            </div>
            <div className="p-5 bg-white/70 rounded-xl impact-card hover:scale-105 transition-transform duration-300">
              <h3 className="text-3xl font-extrabold text-primary">50+</h3>
              <p className="mt-2 text-lg font-medium">Community Projects</p>
            </div>
          </div>
        </div>
      </section>
      <BrandValueSection />
    </section>
  );
};

export default About;
