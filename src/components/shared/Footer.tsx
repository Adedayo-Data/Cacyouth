import { FaEnvelope, FaMapPin, FaPhone } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="bg-purple-100 text-white ">
      <div className="mt-8 md:mt-0 md:order-1 py-5  flex md:flex-row flex-col items-center justify-between px-15 sm:space-y-1">
        <div className="text-center sm:space-y-2">
          <div className="flex justify-center md:justify-start mb-4">
            <img
              src="/assets/CACYOF.png"
              alt="CACYOF Medaiyese Logo"
              className="h-48 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2 ">
            <FaMapPin />
            <p>Durumi District, Garki, Abuja</p>
          </div>
        </div>

        <p className="mt-1 flex flex-col text-center md:text-left">
          <div className="flex items-center gap-2">
            <FaEnvelope />
            <a
              className="hover:text-secondary"
              href="mailto:medaiyeseregionalyouthchoir@gmail.com"
            >
              medaiyeseregionalyouthchoir@gmail.com
            </a>
          </div>
          <div className="flex items-center md:justify-start justify-center gap-2">
            <FaPhone />
            <a className="hover:text-secondary" href="tel:+2348142926262">
              +234 814-121-5567
            </a>
          </div>

          <a></a>
        </p>
      </div>
      <div className="border-t border-gray-200 text-center text-sm ">
        <p className="py-4">© 2025 CACYOF MRYC. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footer;
