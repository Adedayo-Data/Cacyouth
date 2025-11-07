import React from "react";

interface PartnerCardProps {
  icon: React.ComponentType;
  title: string;
  features: string[];
  buttonText: string;
}

const PartnerCard = ({
  icon,
  title,
  features,
  buttonText,
}: PartnerCardProps) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col bg-white">
      <span className=" text-4xl mb-4 text-secondary">
        {React.createElement(icon)}
      </span>

      <h3 className="text-xl font-bold">{title}</h3>

      <ul className="mt-4 space-y-2 text-sm text-text-light-muted dark:text-text-dark-muted grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature}
          </li>
        ))}
      </ul>

      <button className="mt-6 w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-primary text-white text-sm font-bold tracking-[0.015em] hover:bg-primary/90 transition-colors">
        {buttonText}
      </button>
    </div>
  );
};

export default PartnerCard;
