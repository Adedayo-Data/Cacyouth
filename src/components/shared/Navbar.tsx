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
            <li className="nav-hover-btn !ml-0">Mandate</li>
          </Link>
          <Link to="/media">
            <li className="nav-hover-btn !ml-0">Media</li>
          </Link>
          <Link to="/partnership">
            <li className="nav-hover-btn !ml-0">Partnership</li>
          </Link>
          <Link to="/contact">
            <li className="nav-hover-btn !ml-0">Contact</li>
          </Link>
        </ul>

        {/* Center: Logo with Text */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/favicon.png"
              alt="CAC Logo"
              className="h-16 w-16 object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl tracking-tight leading-tight">
                CACYOF
              </span>
              <span className="text-purple-300 text-xs font-medium tracking-wider uppercase">
                Medaiyese Region
              </span>
            </div>
          </Link>
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
          <button
            onClick={displayModal}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Donate
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden py-2 flex justify-between items-center px-4 relative z-50">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/favicon.png"
            alt="CAC Logo"
            className="h-12 w-12 object-contain group-hover:scale-105 transition-transform duration-300"
          />
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl tracking-tight leading-tight">
              CACYOF
            </span>
            <span className="text-purple-300 text-[10px] font-medium tracking-wider uppercase">
              Medaiyese Region
            </span>
          </div>
        </Link>
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
              Mandate
            </li>
          </Link>
          <Link to="/media" onClick={closeMenu}>
            <li className="mobile-nav-link hover:text-purple-400 transition-colors">
              Media
            </li>
          </Link>
          <Link to="/partnership" onClick={closeMenu}>
            <li className="mobile-nav-link hover:text-purple-400 transition-colors">
              Partnership
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
