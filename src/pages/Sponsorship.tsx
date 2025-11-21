import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";
import {
    MdDiamond,
    MdWorkspacePremium,
    MdFavorite,
    MdVolunteerActivism,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import PartnerCard from "../components/ui/PartnerCard";

const partnerData = [
    {
        icon: MdDiamond,
        title: "Kingdom Impact Partner",
        features: [
            "Headline branding exposure",
            "Stage mentions and logo projection",
            "Premium digital visibility",
        ],
    },
    {
        icon: MdWorkspacePremium,
        title: "Legacy Builder Partner",
        features: [
            "Prominent logo placement",
            "Social media features",
            "Exhibition space at event",
        ],
    },
    {
        icon: MdFavorite,
        title: "Friends of the Fellowship",
        features: [
            "Logo on sponsor banner",
            "Acknowledgement in program",
            "Website listing",
        ],
    },
    {
        icon: MdVolunteerActivism,
        title: "In-Kind Supporters",
        features: [
            "Support through services/products",
            "Tailored recognition benefits",
            "Valued partnership acknowledgment",
        ],
    },
];

const Sponsorship = () => {
    const navigate = useNavigate();

    useGSAP(() => {
        const titleSplit = new SplitText("#sponsor-title", {
            type: "lines, chars",
        });
        titleSplit.chars.forEach((char) => char.classList.add("text-gradient"));

        gsap.from(titleSplit.lines, {
            yPercent: 100,
            duration: 1,
            ease: "expo.out",
            stagger: 0.06,
        });

        gsap.fromTo(
            ".sponsor-card",
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.2,
                delay: 0.5,
            }
        );
    });

    const handleSponsorClick = (title: string) => {
        navigate(`/contact?type=${encodeURIComponent(title)}`);
    };

    return (
        <section>
            <div className="bg-linear-to-r from-purple-100 to-black-light h-100 flex items-center justify-center">
                <p
                    className="text-center text-6xl md:text-[100px] font-black text-gradient pt-25 leading-tight"
                    id="sponsor-title"
                >
                    Become a Sponsor
                </p>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl mb-4">
                        Choose Your Impact Level
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Partner with us to empower the next generation. Select a sponsorship
                        package that aligns with your vision.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {partnerData.map((partner, index) => (
                        <PartnerCard
                            key={index}
                            icon={partner.icon}
                            title={partner.title}
                            features={partner.features}
                            className="sponsor-card hover:shadow-2xl transition-all duration-300 h-full"
                        >
                            <Button
                                title="Select Plan"
                                containerClass="w-full bg-primary hover:bg-purple-700 text-white py-3 rounded-xl transition-colors duration-300 mt-auto"
                                handleClick={() => handleSponsorClick(partner.title)}
                            />
                        </PartnerCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Sponsorship;
