import { useState, useEffect } from "react";
import Button from "../components/ui/Button.tsx";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Partners from "../components/shared/Partners.tsx";
import BrandValueSection from "../components/shared/BrandValueSection.tsx";
import BrandOpportunities from "../components/shared/BrandOpportunities.tsx";
import VanillaTilt from "vanilla-tilt";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const images = ["/assets/1.jpg", "/assets/3.jpg", "/assets/5.jpg"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from("#hero-text", {
      opacity: 0,
      y: 100,
      duration: 1,
      ease: "power2.out",
    }).from("#hero-sub", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
      delay: 0.5,
    });

    const abtTimeLine = gsap.timeline({
      scrollTrigger: {
        trigger: "#abt",
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    });

    abtTimeLine.from("#abt", {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
    });

    abtTimeLine.from(
      "#abtimg",
      {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
      },
      "-=0.4"
    );

    // Video Section Animation
    // Testimonies Section Animation
    gsap.fromTo(
      ".video-card",
      {
        y: 50,
        opacity: 0,
      },
      {
        scrollTrigger: {
          trigger: "#video-section",
          start: "top 80%", // Trigger earlier
          toggleActions: "play none none reverse",
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      }
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

  const testimonies = [
    {
      name: "Sarah Adebayo",
      role: "Youth Member",
      quote:
        "This fellowship has completely transformed my spiritual life. The community is so welcoming and the word is always powerful.",
      image: "/assets/1.jpg",
    },
    {
      name: "Licia",
      role: "Choir Member",
      quote:
        "The worship atmosphere is unlike anything I've experienced. It's a place where you can truly encounter God's presence.",
      image: "/assets/3.jpg",
    },
    {
      name: "Praise Eniola",
      role: "Volunteer",
      quote:
        "Serving here has given me a sense of purpose and family. I've grown so much in my faith and leadership skills.",
      image: "/assets/5.jpg",
    },
  ];

  return (
    <div>
      <section className="relative w-full h-screen overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `linear-gradient(rgba(26,16,34,0.85) 0%, rgba(74,20,140,0.65) 100%), url(${img})`,
              opacity: index === currentImageIndex ? 1 : 0,
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
          />
        ))}

        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 text-center space-y-7 pt-20">
          <h1
            className="text-white text-5xl font-black leading-tight tracking-tight  lg:text-[80px] text-center"
            id="head"
          >
            <span>
              MEDAIYESE <br className="md:hidden" /> REGIONAL <br /> YOUTH CHOIR
              (MRYC)
            </span>
          </h1>
          <h2
            className="text-white font-normal leading-normal  text-center max-w-3xl"
            id="sub"
          >
            A home where worshippers rise, Kingdom sounds
            are reimagined, and generations are transformed.
          </h2>
          <Button
            title="Emergence Concert"
            containerClass="bg-black-light hover:bg-gray-800 cursor-pointer hover:scale-105 transition-transform duration-300"
            handleClick={() => navigate('/ministry')}
          />
        </div>
      </section>

      <section
        className="py-20 flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-20 px-6 lg:px-10 overflow-hidden"
        id="about"
      >
        <div
          className="w-full max-w-2xl text-center lg:text-left space-y-6"
          id="abt"
        >
          <div className="text-left">
            <div id="abt">
              <h2 className="text-5xl font-bold leading-tight tracking-tight text-primary">
                Who We Are
              </h2>
              <div className="mt-6 max-w-3xl">
                <p className="text-sm leading-relaxed ">
                  The Medaiyese Regional Youth Choir (MRYC) of Christ Apostolic
                  Church <br /> Youth Fellowship, is a vibrant gathering of
                  young worshippers across <br /> Abuja, Niger, and Kaduna
                  states, committed to advancing the Gospel <br /> through
                  excellence in music, service, and spiritual growth. <br /> We
                  exist to inspire revival, nurture talent, and build a unified
                  worship <br />
                  culture across the region.
                </p>
              </div>
              <Button
                title="About Us"
                containerClass="bg-purple-100 hover:bg-gray-800 cursor-pointer hover:scale-105 mt-5"
                handleClick={() => navigate('/about')}
              />
            </div>
          </div>
        </div>
        <img
          src="/assets/2.jpg"
          alt="Fellowship Gathering"
          id="abtimg"
          className="w-full max-w-md lg:max-w-lg rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer object-cover aspect-4/3"
        />
      </section>

      <section
        className="py-24 bg-black-light relative overflow-hidden"
        id="video-section"
      >
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Impact Stories
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Hear from the lives that have been touched, transformed, and
              empowered through our fellowship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonies.map((testimony, index) => (
              <div
                key={index}
                className="video-card bg-white/5 tilt-card backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="flex items-center  gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50">
                    <img
                      src={testimony.image}
                      alt={testimony.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">
                      {testimony.name}
                    </h3>
                    <p className="text-purple-400 text-sm">{testimony.role}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <svg
                    className="w-8 h-8 text-white/20 group-hover:text-purple-500/50 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21L14.017 18C14.017 16.896 14.913 16 16.017 16H19.017C19.569 16 20.017 15.552 20.017 15V9C20.017 8.448 19.569 8 19.017 8H15.017C14.465 8 14.017 8.448 14.017 9V11C14.017 11.552 13.569 12 13.017 12H12.017V5H22.017V15C22.017 18.314 19.331 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.896 5.91297 16 7.01697 16H10.017C10.569 16 11.017 15.552 11.017 15V9C11.017 8.448 10.569 8 10.017 8H6.01697C5.46497 8 5.01697 8.448 5.01697 9V11C5.01697 11.552 4.56897 12 4.01697 12H3.01697V5H13.017V15C13.017 18.314 10.331 21 7.01697 21H5.01697Z" />
                  </svg>
                </div>
                <p className="text-gray-300 leading-relaxed italic">
                  "{testimony.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Partners />
      <BrandValueSection />
      <BrandOpportunities />
    </div>
  );
};

export default Home;
