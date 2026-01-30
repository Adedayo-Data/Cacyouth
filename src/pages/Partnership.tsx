import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "../components/ui/Button";
import PartnerCard from "../components/ui/PartnerCard";
import BrandOpportunities from "../components/shared/BrandOpportunities";
import {
    MdDiamond,
    MdWorkspacePremium,
    MdFavorite,
    MdVolunteerActivism,
} from "react-icons/md";
import { FaChurch, FaHandsHelping, FaMicrophoneAlt, FaSeedling, FaGlobeAfrica } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const partnerData = [
    {
        icon: MdDiamond,
        title: "Kingdom Impact Partner",
        priceRange: "₦250,000 and above",
        description:
            "For partners who want to sow deeply into what God is doing through this ministry.",
        features: [
            "Headline branding across all official platforms",
            "Stage mentions and full logo projection during key moments of the concert",
            "Premium digital visibility (website, livestream, promo videos & social media)",
            "Priority logo placement on all printed and digital materials",
            "Product/Brand voice-over woven into selected program segments",
            "Optional spotlight/interview opportunity",
            "VIP seating & access to restricted areas",
            "Featured recognition in post-event reports",
            "Certificate of Partnership + Appreciation Plaque",
        ],
    },
    {
        icon: MdWorkspacePremium,
        title: "Legacy Builder Partner",
        priceRange: "₦150,000 — ₦200,000",
        description:
            "For partners who want to stand visibly with this vision and help strengthen its reach.",
        features: [
            "Prominent logo placement on selected promotional materials",
            "Social media features and partner highlight posts",
            "Exhibition space at the event (for product display or engagement)",
            "Product/Brand voice-over during selected periods",
            "Stage acknowledgment during program",
            "Logo on sponsor banner",
            "Website listing",
            "Certificate of Partnership",
        ],
    },
    {
        icon: MdFavorite,
        title: "Friends of the Fellowship",
        priceRange: "₦50,000 — ₦100,000",
        description:
            "For partners who want to support and be part of what God is building.",
        features: [
            "Logo on sponsor banner",
            "Recognition in the printed program",
            "Website listing",
            "Social media 'Thank You' feature",
            "Certificate of Appreciation",
        ],
    },
    {
        icon: MdVolunteerActivism,
        title: "In-Kind Supporters",
        priceRange: "Product / Service Based",
        description:
            "For partners offering products, services, or equipment that help make the event possible.",
        features: [
            "Recognition based on value of support",
            "Name mention during program",
            "Listing on website and program",
            "Appreciation announcement during the event",
        ],
    },
];

const impactPoints = [
    {
        icon: FaMicrophoneAlt,
        title: "Transformational Concerts",
        desc: "Host transformational worship concerts that ignite revival and inspire thousands.",
    },
    {
        icon: FaChurch,
        title: "Regional Outreach",
        desc: "Strengthen regional outreach and evangelism, reaching hearts within and beyond the church walls.",
    },
    {
        icon: FaSeedling,
        title: "Empower Ministers",
        desc: "Train and empower young worship ministers, equipping them with spiritual depth and musical excellence.",
    },
    {
        icon: FaHandsHelping,
        title: "Development Initiatives",
        desc: "Fund development initiatives such as music training, leadership workshops, and spiritual retreats.",
    },
    {
        icon: FaGlobeAfrica,
        title: "CSR Impact",
        desc: "Expand our Christian Social Responsibility (CSR) impact, including prison concerts, charity gifts, and community relief efforts.",
    },
];

const Partnership = () => {
    const navigate = useNavigate();

    const handleScrollToTiers = () => {
        const element = document.getElementById("tiers");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleSponsorshipClick = (tierTitle: string) => {
        navigate("/contact", { state: { sponsorship: tierTitle } });
    };

    useGSAP(() => {
        const tl = gsap.timeline();

        tl.from("#hero-title", {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
        })
            .from(
                "#hero-subtitle",
                {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: "power3.out",
                },
                "-=0.6"
            )
            .from(
                "#hero-btn",
                {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                },
                "-=0.4"
            );
    });

    return (
        <div className="bg-black-light min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white dark">
            {/* Hero Section - Static & Elegant */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/3.jpg')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-black-light/85"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                    <h5 className="text-purple-500 font-bold tracking-widest uppercase mb-4 text-sm">
                        Partner With Us
                    </h5>
                    <h1
                        id="hero-title"
                        className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                    >
                        Fueling the <span className="text-gray-400">Vision.</span>
                    </h1>
                    <p
                        id="hero-subtitle"
                        className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        Join us in raising a generation of skilled, Spirit-filled
                        worshippers. Your partnership fuels the sound of revival.
                    </p>
                    <div id="hero-btn">
                        <Button
                            title="Become a Partner"
                            containerClass="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-full transition-all duration-300 shadow-lg shadow-purple-900/20"
                            handleClick={handleScrollToTiers}
                        />
                    </div>
                </div>
            </section>

            {/* Why Partner With Us - Professional Grid */}
            <section className="py-24 px-6 bg-black-light">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left Column: Intro Text */}
                        <div className="sticky top-24">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                                Why Partner With Us?
                            </h2>
                            <p className="text-xl text-gray-300 leading-relaxed mb-8 border-l-4 border-purple-500 pl-6">
                                Your partnership is more than support, it is a seed into a
                                movement. By standing with the Medaiyese Regional Youth Choir,
                                you help us extend the sound of God’s kingdom.
                            </p>
                            <p className="text-gray-400 text-lg">
                                Together, we can raise a generation of skilled, Spirit-filled
                                worshippers across the region.
                            </p>
                        </div>

                        {/* Right Column: Points Grid */}
                        <div className="grid gap-6">
                            {impactPoints.map((point, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300 transition-colors">
                                            <point.icon className="text-2xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-2">
                                                {point.title}
                                            </h3>
                                            <p className="text-gray-400 leading-relaxed text-sm">
                                                {point.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnership Tiers */}
            <section id="tiers" className="py-24 px-6 bg-white/5 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Partnership Opportunities
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Choose a level of support that aligns with your vision.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {partnerData.map((partner, index) => (
                            <PartnerCard
                                key={index}
                                icon={partner.icon}
                                title={partner.title}
                                priceRange={partner.priceRange}
                                description={partner.description}
                                features={partner.features}
                                className="!bg-black-light !border-white/10 !text-white hover:!border-purple-500/50"
                                onClick={() => handleSponsorshipClick(partner.title)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <BrandOpportunities />
        </div>
    );
};

export default Partnership;
