import React from "react";

interface PartnerCardProps {
  icon: React.ComponentType;
  title: string;
  features: string[];
  className?: string;
  children?: React.ReactNode;
}

const PartnerCard = ({
  icon,
  title,
  features,
  className,
  children,
}: PartnerCardProps) => {
  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col bg-white/90 ${className}`}
    >
      <span className=" text-4xl mb-4 text-black-light">
        {React.createElement(icon)}
      </span>

      <h3 className="text-xl font-bold text-gray-200">{title}</h3>

      <ul className="mt-4 space-y-2 text-sm text-gray-200 grow mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
};

export default PartnerCard;
