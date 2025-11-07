const Navbar = () => {
  return (
    <div className="">
      <div className="flex justify-between items-center mx-10 my-2">
        <div className="flex items-center gap-2">
          <div className="size-6 text-primary ">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clip-rule="evenodd"
                d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                fill="currentColor"
                fill-rule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className=" font-bold tracking-[-0.015em] text-muted dark:text-text-dark">
            CACYOF Medaiyese
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            className="text-sm font-medium hover:text-primary dark:hover:text-secondary"
            href="#about"
          >
            About
          </a>
          <a
            className="text-sm font-medium hover:text-primary dark:hover:text-secondary"
            href="#impact"
          >
            Impact
          </a>
          <a
            className="text-sm font-medium hover:text-primary dark:hover:text-secondary"
            href="#packages"
          >
            Packages
          </a>
          <a
            className="text-sm font-medium hover:text-primary dark:hover:text-secondary"
            href="#contact"
          >
            Contact
          </a>
        </nav>
        <a
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
          href="#packages"
        >
          <span className="truncate">Become a Sponsor</span>
        </a>
      </div>
    </div>
  );
};

export default Navbar;
