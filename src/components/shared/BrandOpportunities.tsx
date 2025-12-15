import { FaCheckCircle, FaInstagram, FaFacebook } from "react-icons/fa";
import { BiTrendingUp } from "react-icons/bi";
import { socialMetricsConfig } from "../../config/socialMetrics";
import { useState, useEffect } from "react";

const BrandOpportunities = () => {
    const [metricsLoaded, setMetricsLoaded] = useState(false);

    const benefits = [
        "A large, engaged youth community",
        "A high-impact worship and creative ministry",
        "A platform that promotes excellence, values, and purpose",
        "Life-changing outreach initiatives across the region",
    ];

    // Simulate API loading for metrics
    useEffect(() => {
        const timer = setTimeout(() => {
            setMetricsLoaded(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

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

                        {/* Social Media Metrics - Compact Version */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <h3 className="text-lg font-bold text-white">Our Reach & Impact</h3>
                            </div>

                            {!metricsLoaded ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl animate-pulse">
                                            <div className="h-4 w-16 bg-white/10 rounded mb-2"></div>
                                            <div className="h-6 w-20 bg-white/10 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Instagram */}
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                                                <FaInstagram className="text-white text-sm" />
                                            </div>
                                            <span className="text-xs text-gray-400">Instagram</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Followers</p>
                                                <p className="text-2xl font-bold text-white">{socialMetricsConfig.instagram.metrics.followers}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <BiTrendingUp className="text-green-400" />
                                                <span className="text-green-400 font-medium">{socialMetricsConfig.instagram.growth.percentage}</span>
                                                <span className="text-gray-500">growth</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Facebook */}
                                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                                                <FaFacebook className="text-white text-sm" />
                                            </div>
                                            <span className="text-xs text-gray-400">Facebook</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider">Followers</p>
                                                <p className="text-2xl font-bold text-white">{socialMetricsConfig.facebook.metrics.followers}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <BiTrendingUp className="text-green-400" />
                                                <span className="text-green-400 font-medium">{socialMetricsConfig.facebook.growth.percentage}</span>
                                                <span className="text-gray-500">growth</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 mt-3 text-center">
                                Combined reach of {metricsLoaded ? `${socialMetricsConfig.instagram.metrics.reach} + ${socialMetricsConfig.facebook.metrics.reach}` : '...'} monthly
                            </p>
                        </div>

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
