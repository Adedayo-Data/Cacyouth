const Hero = () => {
  return (
    <section className="bg-[linear-gradient(rgba(26,16,34,0.7)_0%,rgba(74,20,140,0.5)_100%),url('/assets/back.png')] bg-cover bg-center bg-no-repeat w-full h-124 space-y-5 pt-20">
      <h1 className="text-white text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl text-center">
        Annual Regional Youth Concert <br />— A Movement of Worship, <br />
        Talent &amp; Revival
      </h1>
      <h2 className="text-gray-200 text-lg font-normal leading-normal sm:text-xl text-center">
        Partner with us to empower the next generation. Your support fuels a
        spiritual revival that impacts <br /> thousands of young lives across
        the region.
      </h2>
      <a
        className="flex mx-auto w-fit min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-secondary text-primary text-base font-bold leading-normal tracking-[0.015em] hover:bg-secondary/90 transition-colors"
        href="#packages"
      >
        <span className="truncate">Become a Sponsor</span>
      </a>
    </section>
  );
};

export default Hero;
