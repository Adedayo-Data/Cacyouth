import { useState, useEffect } from "react";
import Button from "../components/ui/Button.tsx";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";
import Partners from "../components/shared/Partners.tsx";
import BrandValueSection from "../components/shared/BrandValueSection.tsx";
import { useDonate } from "../components/shared/DonateContext";
import { useNavigate } from "react-router-dom";
const Home = () => {

  const images = [
    "/assets/1.jpg",
    "/assets/3.jpg",
    "/assets/5.jpg",
  ];

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

  const navigate = useNavigate();

  const openModal = () => {
    navigate("/sponsorship");
  };

  const testimonies = [
    {
      name: "Sarah Adebayo",
      role: "Youth Member",
      quote:
        "This fellowship has completely transformed my spiritual life. The community is so welcoming and the word is always powerful.",
      image: "/assets/1.jpg",
    },
    {
      name: "David Okon",
      role: "Choir Lead",
      quote:
        "The worship atmosphere is unlike anything I've experienced. It's a place where you can truly encounter God's presence.",
      image: "/assets/3.jpg",
    },
    {
      name: "Grace Nwachukwu",
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
              backgroundImage: `linear-gradient(rgba(26,16,34,0.7) 0%, rgba(74,20,140,0.5) 100%), url(${img})`,
              opacity: index === currentImageIndex ? 1 : 0,
              zIndex: index === currentImageIndex ? 1 : 0,
            }}
          />
        ))}

        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 text-center space-y-7 pt-20">
          <div className="overflow-hidden flex flex-col items-center">
            <h2 className="text-xl md:text-3xl font-bold tracking-[0.2em] mb-2 text-gray-300 uppercase text-center">
              CAC Youth Medaiyese Region
            </h2>
            <h1
              className="text-5xl md:text-7xl lg:text-[100px] font-black leading-tight tracking-tight text-gradient"
              id="hero-text"
            >
              RAISING GIANTS
            </h1>
          </div>
          <p
            className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto"
            id="hero-sub"
          >
            Empowering the next generation of kingdom leaders through worship,
            word, and fellowship.
          </p>
          <Button
            title="Become a Sponsor"
            containerClass="bg-black-light hover:bg-gray-800 cursor-pointer hover:scale-105 transition-transform duration-300"
            handleClick={openModal}
          />
        </div>
      </section>

      <section className="py-20 flex flex-col lg:flex-row justify-center items-center gap-12 lg:gap-20 px-6 lg:px-10 overflow-hidden" id="about">
        <div className="w-full max-w-2xl text-center lg:text-left space-y-6" id="abt">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            About The Fellowship
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            The Christ Apostolic Church Youth Fellowship (CACYOF) of the
            Medaiyese Region is dedicated to nurturing a generation of young
            leaders grounded in faith, purpose, and community.
          </p>
          <Button
            title="Learn More"
            containerClass="bg-primary hover:bg-purple-700 text-white mt-4 inline-block"
            handleClick={() => navigate("/about")}
          />
        </div>
        <img
          src="/assets/2.jpg"
          alt="Fellowship Gathering"
          id="abtimg"
          className="w-full max-w-md lg:max-w-lg rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer object-cover aspect-[4/3]"
        />
      </section>

      <section className="py-24 bg-black-light relative overflow-hidden" id="video-section">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Voices of Impact
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Hear from the lives that have been touched, transformed, and empowered through our fellowship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonies.map((testimony, index) => (
              <div
                key={index}
                className="video-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50">
                    <img src={testimony.image} alt={testimony.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{testimony.name}</h3>
                    <p className="text-purple-400 text-sm">{testimony.role}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <svg className="w-8 h-8 text-white/20 group-hover:text-purple-500/50 transition-colors" fill="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
};

export default Home;
