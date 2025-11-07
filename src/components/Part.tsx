import Partners from "./Partners";

const Part = () => {
  return (
    <section className="py-16 sm:py-24 bg-gray-100" id="packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
            Sponsorship Packages
          </h2>
          <p className="mt-4 text-lg text-text-light-muted dark:text-text-dark-muted max-w-2xl mx-auto">
            Choose a partnership level that aligns with your brand's vision and
            impact goals.
          </p>
        </div>
        <Partners />
      </div>
    </section>
  );
};

export default Part;
