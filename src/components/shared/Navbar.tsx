import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useState, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

interface NavbarProps {
  onDonateClick?: () => void;
}

const Navbar = ({ onDonateClick }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef < HTMLDivElement > (null);
  const tl = useRef < gsap.core.Timeline | null > (null);

  useGSAP(() => {
    // Scroll Animation for Navbar Background
    const navTween = gsap.timeline({
      scrollTrigger: {
        trigger: "nav",
        start: "bottom top",
      },
    });

    navTween.fromTo(
      "nav",
      { backgroundColor: "transparent" },
      {
        backgroundColor: "#00000050",
        backgroundFilter: "blur(10px)",
        duration: 1,
        ease: "power1.inOut",
      }
    );

    // Mobile Menu Animation Timeline
    tl.current = gsap.timeline({ paused: true });

    tl.current
      .to(menuRef.current, {
        x: 0,
        duration: 0.5,
        ease: "power3.inOut",
      })
      .from(
        ".mobile-nav-link",
        {
          y: 50,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.2"
      )
      .from(
        ".mobile-social-link",
        {
          y: 20,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        },
        "-=0.2"
      );
  }, []);

  const toggleMenu = () => {
    if (isMenuOpen) {
      tl.current?.reverse();
    } else {
      tl.current?.play();
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    if (isMenuOpen) {
      tl.current?.reverse();
      setIsMenuOpen(false);
    }
  };

  function displayModal() {
    if (onDonateClick) {
      onDonateClick();
    }
    closeMenu();
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" id="nav">
      <div className="hidden md:flex justify-between items-center px-8 py-4 relative">
        {/* Left Side: Navigation Links */}
        <ul className="flex gap-8 text-sm text-white font-medium">
          <Link to="/">
            <li className="nav-hover-btn !ml-0">Home</li>
          </Link>
          <Link to="/about">
            <li className="nav-hover-btn !ml-0">About</li>
          </Link>
          <Link to="/ministry">
            <li className="nav-hover-btn !ml-0">Ministry</li>
          </Link>
          <Link to="/media">
            <li className="nav-hover-btn !ml-0">Media</li>
          </Link>
          <Link to="/contact">
            <li className="nav-hover-btn !ml-0">Contact</li>
          </Link>
        </ul>

        {/* Center: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="size-20 text-purple-100">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 className="font-bold tracking-[-0.015em] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-center text-white/80 pointer-events-none whitespace-nowrap">
              <p className="text-3xl">CACYOF</p>
              <p className="text-lg -mt-2">Medaiyese</p>
            </h2>
          </div>
        </div>

        {/* Right Side: Social Links (Text) */}
        <div className="flex gap-6 text-white items-center text-sm font-medium">
          <a
            href="#"
            className="hover:text-green-400 transition-colors duration-300"
          >
            Spotify
          </a>
          <a
            href="#"
            className="hover:text-blue-400 transition-colors duration-300"
          >
            Boomplay
          </a>
          <a
            href="#"
            className="hover:text-red-500 transition-colors duration-300"
          >
            Youtube
          </a>
          <a
            href="#"
            className="hover:text-pink-500 transition-colors duration-300"
          >
            Instagram
          </a>
          <a
            href="#"
            className="hover:text-blue-600 transition-colors duration-300"
          >
            Facebook
          </a>
          <a
            href="#"
            className="hover:text-white transition-colors duration-300"
          >
            Tiktok
          </a>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden py-2 flex justify-between items-center px-4 relative z-50">
        <div className="relative">
          <div className="size-16 text-purple-100">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="font-bold tracking-[-0.015em] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-center text-white/80 whitespace-nowrap">
            <p className="text-2xl">CACYOF</p>
            <p className="text-sm -mt-1">Medaiyese</p>
          </h2>
        </div>
        <button onClick={toggleMenu} className="text-white z-50">
          {isMenuOpen ? <FaTimes size={30} /> : <FaBars size={30} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        ref={menuRef}
        className="fixed inset-0 bg-black-light z-40 flex flex-col justify-center items-center translate-x-full md:hidden"
      >
        <ul className="flex flex-col gap-8 text-2xl text-white font-bold text-center mb-12">
          <Link to="/" onClick={closeMenu}>
            <li className="mobile-nav-link hover:text-purple-400 transition-colors">
              Home
            </li>
          </Link>
          <Link to="/about" onClick={closeMenu}>
            <li className="mobile-nav-link hover:text-purple-400 transition-colors">
              About
            </li>
          </Link>
          <Link to="/ministry" onClick={closeMenu}>
            <li className="mobile-nav-link hover:text-purple-400 transition-colors">
              Ministry
            </li>
          </Link>
          <Link to="/media" onClick={closeMenu}>
            <li className="mobile-nav-link hover:text-purple-400 transition-colors">
              Media
            </li>
          </Link>
          <Link to="/contact" onClick={closeMenu}>
            <li className="mobile-nav-link hover:text-purple-400 transition-colors">
              Contact
            </li>
          </Link>
          <button
            className="mobile-nav-link text-purple-400 hover:text-purple-300 transition-colors"
            onClick={displayModal}
          >
            Donate Now
          </button>
        </ul>

        <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm font-medium px-8">
          <a href="#" className="mobile-social-link hover:text-green-400">
            Spotify
          </a>
          <a href="#" className="mobile-social-link hover:text-blue-400">
            Boomplay
          </a>
          <a href="#" className="mobile-social-link hover:text-red-500">
            Youtube
          </a>
          <a href="#" className="mobile-social-link hover:text-pink-500">
            Instagram
          </a>
          <a href="#" className="mobile-social-link hover:text-blue-600">
            Facebook
          </a>
          <a href="#" className="mobile-social-link hover:text-white">
            Tiktok
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
