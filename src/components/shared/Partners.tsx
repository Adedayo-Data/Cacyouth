import PartnerCard from "../ui/PartnerCard.tsx";
import {
  MdDiamond,
  MdWorkspacePremium,
  MdFavorite,
  MdVolunteerActivism,
} from "react-icons/md";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";


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

const Partners = () => {
    useGSAP(() =>{
        const packTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#partners",
                start: 'top top',
                end:'80% bottom',
                scrub:true,
            }
        })

        packTimeline.from(".partner-card", {
            opacity: 0,
            yPercent: 100,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.3,
        });
    })
  return (
      <section className="py-16 sm:py-24 bg-purple-100" id="packages">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
              <div className="text-center mb-12" id='pack'>
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
                      Sponsorship Packages
                  </h2>
                  <p className="mt-4 text-lg text-text-light-muted dark:text-text-dark-muted max-w-2xl mx-auto">
                      Choose a partnership level that aligns with your brand's vision and
                      impact goals.
                  </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" >
                     {partnerData.map((partner, index) => (
                       <PartnerCard
                         key={index}
                         icon={partner.icon}
                         title={partner.title}
                        features={partner.features}
                         className="partner-card"
                       />
                     ))}
                  </div>
          </div>
      </section>
    //
  );
};

export default Partners;
