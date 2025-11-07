import PartnerCard from "../components/PartnerCard";
import {
  MdDiamond,
  MdWorkspacePremium,
  MdFavorite,
  MdVolunteerActivism,
} from "react-icons/md";

const partnerData = [
  {
    icon: MdDiamond,
    title: "Kingdom Impact Partner",
    features: [
      "Headline branding exposure",
      "Stage mentions and logo projection",
      "Premium digital visibility",
    ],
    buttonText: "Partner Now",
  },
  {
    icon: MdWorkspacePremium,
    title: "Legacy Builder Partner",
    features: [
      "Prominent logo placement",
      "Social media features",
      "Exhibition space at event",
    ],
    buttonText: "Partner Now",
  },
  {
    icon: MdFavorite,
    title: "Friends of the Fellowship",
    features: [
      "Logo on sponsor banner",
      "Acknowledgement in program",
      "Website listing",
    ],
    buttonText: "Partner Now",
  },
  {
    icon: MdVolunteerActivism,
    title: "In-Kind Supporters",
    features: [
      "Support through services/products",
      "Tailored recognition benefits",
      "Valued partnership acknowledgment",
    ],
    buttonText: "Partner Now",
  },
];

const Partners = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {partnerData.map((partner, index) => (
        <PartnerCard
          key={index}
          icon={partner.icon}
          title={partner.title}
          features={partner.features}
          buttonText={partner.buttonText}
        />
      ))}
    </div>
  );
};

export default Partners;
