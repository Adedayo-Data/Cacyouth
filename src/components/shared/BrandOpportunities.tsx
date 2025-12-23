import { FaCheckCircle } from "react-icons/fa";

const BrandOpportunities = () => {
    const benefits = [
        "A large, engaged youth community",
        "A high-impact worship and creative ministry",
        "A platform that promotes excellence, values, and purpose",
        "Life-changing outreach initiatives across the region",
    ];

    return (
        <section className="py-24 px-6 bg-black-light border-y border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            Brand Value Opportunities
                        </h2>
                        <p className="text-xl text-gray-300 leading-relaxed mb-8 border-l-4 border-purple-500 pl-6">
                            Partnering with us positions your brand at the heart of a vibrant,
                            growing, and impactful youth movement.
                        </p>
                        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                            We welcome sponsorships from all industries looking to connect with
                            a positive, faith-driven audience and support meaningful community
                            transformation.
                        </p>

                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-6">
                                Position your brand alongside a dynamic, fast-growing youth audience.
                            </h3>
                            <p className="text-purple-400 font-medium">
                                Open to partners across all industries.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-10 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                        <h3 className="text-2xl font-bold text-white mb-8 relative z-10">
                            Through your partnership, your brand becomes part of:
                        </h3>
                        <ul className="space-y-6 relative z-10">
                            {benefits.map((benefit, index) => (
                                <li key={index} className="flex items-start gap-4 group">
                                    <FaCheckCircle className="text-purple-500 text-xl mt-1 shrink-0 group-hover:text-purple-400 transition-colors" />
                                    <span className="text-gray-300 text-lg group-hover:text-white transition-colors">
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandOpportunities;
