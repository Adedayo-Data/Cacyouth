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
      className={`relative overflow-hidden rounded-2xl p-8 flex flex-col shadow-2xl ${className} ${onClick
          ? "cursor-pointer hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-300"
          : ""
        }`}
      style={{
        background: title.includes("Kingdom")
          ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)"
          : title.includes("Legacy")
            ? "linear-gradient(135deg, #ec4899 0%, #d946ef 50%, #c026d3 100%)"
            : title.includes("Friends")
              ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)"
              : "linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #0ea5e9 100%)",
      }}
      onClick={onClick}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <span className="text-4xl text-white">
            {React.createElement(icon)}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        {priceRange && (
          <p className="text-xl font-semibold text-white/90 mb-3">
            {priceRange}
          </p>
        )}
        <p className="text-base text-white/80 mb-6 leading-relaxed">{description}</p>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mb-4">
          <ul className="space-y-3 text-sm text-white grow">
            {visibleFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg
                  className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {features.length > 3 && (
          <div className="flex flex-col gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(!showAll);
              }}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 self-start border border-white/30"
            >
              {showAll ? "See Less ↑" : "See More ↓"}
            </button>

            {showAll && onClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="bg-white text-purple-600 hover:bg-white/90 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 shadow-xl self-start"
              >
                Contact Us →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerCard;
