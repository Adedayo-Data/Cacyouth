const Footer = () => {
  return (
   <div className='bg-purple-100 text-white '>
       <div className="mt-8 md:mt-0 md:order-1 py-5  flex md:flex-row flex-col items-center justify-between px-15 sm:space-y-1">
           <div className='text-center sm:space-y-2'>
               <div className='relative left-1/4 md:left-0'>
                   <div className="size-15 text-gray-200 ml-4">
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
                   <h2 className=" font-bold tracking-[-0.015em] left-5/150 top-2 absolute text-center text-white/80">
                       <p className='text-xl'>CACYOF</p>
                       <p className='text-sm -mt-2'>Medaiyese</p>
                   </h2>
               </div>
               <p>123 Faith Avenue, Revival City</p>
           </div>
           <p className="mt-1 flex flex-col text-center md:text-left">
               <a
                   className="hover:text-secondary"
                   href="mailto:info@cacyofmedaiyese.org"
               >
                   info@cacyofmedaiyese.org
               </a>{" "}
               <a className="hover:text-secondary" href="tel:+1234567890">
                   +1 (234) 567-890
               </a>
           </p>
       </div>
       <div className='border-t border-gray-200 text-center text-sm '>
           <p className='py-4'>© 2024 CACYOF Medaiyese Region. All rights reserved.</p>
       </div>
   </div>
  );
};

export default Footer;

