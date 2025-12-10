import React, { useState } from "react";

interface PartnerCardProps {
  icon: React.ComponentType;
  title: string;
  priceRange: string;
  description: string;
  features: string[];
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const PartnerCard = ({
  icon,
  title,
  priceRange,
  description,
  features,
  className,
  onClick,
}: PartnerCardProps) => {
  const [showAll, setShowAll] = useState(false);
  const visibleFeatures = showAll ? features : features.slice(0, 3);

  return (
    <div
      className={`border border-gray-300 dark:border-white/10 rounded-xl p-6 flex flex-col bg-white dark:bg-white/5 shadow-lg ${className} ${onClick
        ? "cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-purple-500/50"
        : ""
        }`}
      onClick={onClick}
    >
      <span className="text-4xl mb-4 text-black-light dark:text-purple-400">
        {React.createElement(icon)}
      </span>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-lg font-semibold text-black-light dark:text-purple-300 mb-2">
        {priceRange}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-400 grow">
        {visibleFeatures.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2 text-purple-500">•</span> {feature}
          </li>
        ))}
      </ul>

      {features.length > 3 && (
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(!showAll);
            }}
            className="text-black-light dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 font-semibold text-sm transition-colors self-start"
          >
            {showAll ? "See Less" : "See More"}
          </button>

          {showAll && onClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-lg shadow-purple-900/20 self-start"
            >
              Contact Us
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PartnerCard;
