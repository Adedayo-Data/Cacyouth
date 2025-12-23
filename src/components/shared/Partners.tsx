import PartnerCard from "../ui/PartnerCard.tsx";
import {
  MdDiamond,
  MdWorkspacePremium,
  MdFavorite,
  MdVolunteerActivism,
} from "react-icons/md";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const partnerData = [
  {
    icon: MdDiamond,
    title: "Kingdom Impact Partner",
    priceRange: "₦1,000,000 and above",
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
    priceRange: "₦500,000 — ₦1,000,000",
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
    priceRange: "₦100,000 — ₦500,000",
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
    priceRange: "",
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

const Partners = () => {
  useGSAP(() => {
    const packTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#packages",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    packTimeline.from(".partner-card", {
      opacity: 0,
      yPercent: 100,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.3,
    });
  });
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-black-light to-slate-900 relative overflow-hidden" id="packages">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 relative z-10" id="pack">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            PARTNER WITH US
          </h2>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            Together, we can raise a generation of skilled, Spirit-filled
            worshippers and extend the sound of God's kingdom across the region.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 auto-rows-fr">
          {/* Kingdom Impact - Full Width */}
          <div className="md:col-span-2">
            <PartnerCard
              icon={partnerData[0].icon}
              title={partnerData[0].title}
              priceRange={partnerData[0].priceRange}
              description={partnerData[0].description}
              features={partnerData[0].features}
              className="partner-card h-full"
            />
          </div>

          {/* Legacy Builder - Half Width */}
          <div className="md:col-span-1">
            <PartnerCard
              icon={partnerData[1].icon}
              title={partnerData[1].title}
              priceRange={partnerData[1].priceRange}
              description={partnerData[1].description}
              features={partnerData[1].features}
              className="partner-card h-full"
            />
          </div>

          {/* Friends of Fellowship - Half Width */}
          <div className="md:col-span-1">
            <PartnerCard
              icon={partnerData[2].icon}
              title={partnerData[2].title}
              priceRange={partnerData[2].priceRange}
              description={partnerData[2].description}
              features={partnerData[2].features}
              className="partner-card h-full"
            />
          </div>

          {/* In-Kind Supporters - Full Width */}
          <div className="md:col-span-2">
            <PartnerCard
              icon={partnerData[3].icon}
              title={partnerData[3].title}
              priceRange={partnerData[3].priceRange}
              description={partnerData[3].description}
              features={partnerData[3].features}
              className="partner-card h-full"
            />
          </div>
        </div>
      </div>
    </section>
    //
  );
};

export default Partners;
