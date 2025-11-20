import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Media = () => {
  useGSAP(() => {
    const sections = gsap.utils.toArray(".media-section");

    sections.forEach((section) => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section as Element,
          start: "top center",
          end: "bottom center",
          toggleActions: "play none none reverse",
        },
      });

      timeline
        .from((section as Element).querySelector("h2"), {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: "power2.out",
        })
        .from(
          (section as Element).querySelectorAll(".media-image"),
          {
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
            ease: "back.out(1.7)",
            stagger: 0.1,
          },
          "-=0.4"
        );
    });
  });

  return (
    <div className="min-h-screen">
      <div className="bg-linear-to-r from-purple-100 to-black-light h-100">
        <p
          className="text-center text-[150px] text-gradient pt-25"
          id="contact-title"
        >
          Gallery
        </p>
      </div>
      {/* Conference Section */}
      <section className="media-section py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            Conference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`conf-${i}`}
                className="media-image overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src="/assets/back.png"
                  alt={`Conference ${i + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revivals Section */}
      <section className="media-section py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            Revivals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={`rev-${i}`}
                className="media-image overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src="/assets/back.png"
                  alt={`Revival ${i + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="media-section py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            Programs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`prog-${i}`}
                className="media-image overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src="/assets/back.png"
                  alt={`Program ${i + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Media;
