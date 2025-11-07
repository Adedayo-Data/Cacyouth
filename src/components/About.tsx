const About = () => {
  return (
    <section
      className="py-16 sm:py-24 bg-tertary dark:bg-surface-dark"
      id="about"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
          About the Fellowship
        </h2>
        <div className="mt-6 max-w-3xl mx-auto">
          <p className="text-lg leading-relaxed text-text-light-muted dark:text-text-dark-muted">
            The Christ Apostolic Church Youth Fellowship (CACYOF) of the
            Medaiyese Region is <br /> dedicated to nurturing a generation of
            young leaders grounded in faith, purpose, and <br /> community. Our
            annual concert is the cornerstone of this mission, creating a
            powerful <br />
            platform for spiritual growth, talent discovery, and positive youth
            engagement.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
