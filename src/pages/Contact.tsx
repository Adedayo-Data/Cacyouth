import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";

import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (type) {
      setMessage(`I am interested in becoming a ${type}.`);
    }
  }, [type]);

  useGSAP(() => {
    const titleSplit = new SplitText("#contact-title", {
      type: "lines, chars",
    });
    titleSplit.chars.forEach((char) => char.classList.add("text-gradient"));

    gsap.from(titleSplit.lines, {
      yPercent: 100,
      duration: 1,
      ease: "expo.out",
      stagger: 0.06,
    });

    gsap.from("#contact-form h2", {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
      delay: 1,
    });

    gsap.from(".form-group", {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.2,
      delay: 1.2,
    });

    gsap.from("#contact-social p", {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
      delay: 1.5,
    });

    gsap.from(".social-link", {
      opacity: 0,
      scale: 0.8,
      duration: 0.6,
      ease: "back.out(1.7)",
      stagger: 0.1,
      delay: 1.7,
    });
  });

  return (
    <section>
      <div className="bg-linear-to-r from-purple-100 to-black-light h-100">
        <p
          className="text-center text-[150px] text-gradient pt-25"
          id="contact-title"
        >
          Contact Us
        </p>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12" id="contact-form">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
            Reach out to us by sending a message
          </h2>
        </div>
        <form className="space-y-6 ">
          <div className="form-group">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="form-group">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>

      <div className="bg-gray-50 py-16">
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          id="contact-social"
        >
          <p className="text-lg text-gray-600 mb-8">
            Or reach out to us on our social media platforms
          </p>
          <div className="flex justify-center items-center gap-6">
            <a
              className="social-link text-gray-600 hover:text-red-600 transition-colors duration-200"
              data-alt="YouTube icon"
              href="#"
            >
              <svg
                className="h-15 w-15"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.93,18.84C17.13,18.91 16.44,18.94 15.84,18.94L15,19C12.81,19 11.2,18.84 10.17,18.56C9.27,18.31 8.69,17.73 8.44,16.83C8.31,16.36 8.22,15.73 8.16,14.93C8.09,14.13 8.06,13.44 8.06,12.84L8,12C8,9.81 8.16,8.2 8.44,7.17C8.69,6.27 9.27,5.69 10.17,5.44C10.64,5.31 11.27,5.22 12.07,5.16C12.87,5.09 13.56,5.06 14.16,5.06L15,5C17.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z"></path>
              </svg>
            </a>
            <a
              className="social-link text-gray-600 hover:text-blue-600 transition-colors duration-200"
              data-alt="Facebook icon"
              href="#"
            >
              <svg
                className="h-12 w-12"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.32 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z"></path>
              </svg>
            </a>
            <a
              className="social-link text-gray-600 hover:text-pink-600 transition-colors duration-200"
              data-alt="Instagram icon"
              href="#"
            >
              <svg
                className="h-12 w-12"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
    //
  );
};

export default Contact;
