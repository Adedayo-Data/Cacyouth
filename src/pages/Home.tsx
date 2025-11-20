import { useState } from "react";
import Button from "../components/ui/Button.tsx";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";
import Partners from "../components/shared/Partners.tsx";
import { useDonate } from "../components/shared/DonateContext";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const { openModal } = useDonate();

  const videos = [
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const videosPerPage = 3;
  const totalPages = Math.ceil(videos.length / videosPerPage);
  const navigate = useNavigate();

  useGSAP(() => {
    const heroSplit = new SplitText("#head", { type: " lines, chars" });
    const paragraphSplit = new SplitText("#sub", { type: "lines" });

    heroSplit.chars.forEach((chars) => chars.classList.add("text-gradient"));
    gsap.from(heroSplit.lines, {
      yPercent: 100,
      duration: 1,
      ease: "expo.out",
      stagger: 0.06,
    });

    gsap.from(paragraphSplit.lines, {
      opacity: 0,
      yPercent: 100,
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.06,
      delay: 1,
    });

    gsap.from("#btn", {
      opacity: 0,
      yPercent: 100,
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.06,
      delay: 1,
    });

    gsap.to("#hero-bg", {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    const abtTimeLine = gsap.timeline({
      scrollTrigger: {
        trigger: "#about",
        start: "top center",
        end: "bottom bottom",
        scrub: true,
      },
    });

    abtTimeLine.from("#abt", {
      opacity: 0,
      xPercent: -100,
      duration: 0.5,
      ease: "power2.inOut",
      stagger: 0.06,
    });

    abtTimeLine.from("#abtimg", {
      opacity: 0,
      xPercent: 100,
      duration: 0.5,
      ease: "power2.inOut",
    });

    const contactTimeLine = gsap.timeline({
      scrollTrigger: {
        trigger: "#contact",
        start: "top center",
        end: "bottom center",
        toggleActions: "play none none reverse",
      },
    });

    contactTimeLine
      .from("#cont h2", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
      })
      .from(
        "#cont p",
        {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .from(
        "#cont button",
        {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.4"
      );

    const videoTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#videos",
        start: "top center",
        end: "bottom center",
        toggleActions: "play none none reverse",
      },
    });

    videoTimeline
      .from("#videos h2", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
      })
      .from(
        "#videos .grid iframe",
        {
          opacity: 0,
          scale: 0.9,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: 0.1,
        },
        "-=0.4"
      )
      .from(
        "#videos .flex",
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.4"
      );
  });

  function handleAbout() {
    navigate("/about");
  }

  function handleContact() {
    navigate("/contact");
  }

  return (
    <div>
      <section className="bg-[linear-gradient(rgba(26,16,34,0.7)_0%,rgba(74,20,140,0.5)_100%),url('/assets/back.png')] bg-cover bg-center bg-no-repeat w-full h-screen space-y-7 pt-30  px-4  ">
        <h1
          className="text-white text-6xl font-black leading-tight tracking-tight  lg:text-[80px] text-center"
          id="head"
        >
          CAC Youth Medaiyese <br /> WorldWide
        </h1>
        <h2
          className="text-white font-normal leading-normal  text-center"
          id="sub"
        >
          Partner with us to empower the next generation. Your support fuels a
          spiritual <br /> revival that impacts thousands of young lives across
          the region.
        </h2>
        <div className="flex justify-center mt-12" id="btn">
          <Button
            title="Become a Sponsor"
            containerClass="bg-black-light hover:bg-gray-800 cursor-pointer hover:scale-105"
            handleClick={openModal}
          />
        </div>
      </section>
      <section
        className=" py-10 flex flex-col md:flex-row justify-center items-center gap-25 px-10 overflow-hidden"
        id="about"
      >
        <div className="text-left">
          <div id="abt">
            <h2 className="text-5xl font-bold leading-tight tracking-tight text-primary">
              About the <br /> Fellowship
            </h2>
            <div className="mt-6 max-w-3xl">
              <p className="text-sm leading-relaxed ">
                The Christ Apostolic Church Youth Fellowship (CACYOF){" "}
                <br className="hidden md:block" /> of the Medaiyese Region is
                dedicated to nurturing a generation <br /> of young leaders
                grounded in faith, purpose, and community.
              </p>
            </div>
            <Button
              title="About Us"
              containerClass="bg-purple-100 hover:bg-gray-800 cursor-pointer hover:scale-105 mt-5"
              handleClick={handleAbout}
            />
          </div>
        </div>
        <img
          src="/assets/back.png"
          alt="Image"
          className="h-100 w-110 max-w-full rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
          id="abtimg"
        />
      </section>
      <section>
        <Partners />
      </section>

      {/* Videos Section */}
      <section className="py-16 " id="videos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-8">
            Featured Videos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {videos
              .slice(
                currentPage * videosPerPage,
                (currentPage + 1) * videosPerPage
              )
              .map((video, index) => (
                <div
                  key={index}
                  className="aspect-video bg-black rounded-lg overflow-hidden"
                >
                  <iframe
                    src={video}
                    title={`Featured Video ${
                      currentPage * videosPerPage + index + 1
                    }`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
          </div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPage ? "bg-purple-100" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className="py-16 text-white bg-linear-to-b from-purple-900 to-black"
        id="contact"
      >
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
          id="cont"
        >
          <h2 className="text-5xl font-bold leading-tight tracking-tight ">
            Join the Movement
          </h2>
          <p className="mt-4 text-lg text-white">
            This is more than a concert—it’s a revival. <br /> Together, we can
            empower the next generation.
          </p>
          <Button
            title="Contact Us"
            containerClass="bg-purple-100 hover:bg-gray-800 cursor-pointer hover:scale-105 mt-5"
            handleClick={handleContact}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
