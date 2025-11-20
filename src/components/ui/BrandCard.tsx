import React from "react";

interface BrandCardProps {
  icon: React.ComponentType;
  title: string;
  imgSrc: string;
  imgAlt: string;
}

const BrandCard = ({ icon, title, imgSrc, imgAlt }: BrandCardProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100/50 rounded-xl text-center">
      <span className=" text-4xl mb-4 text-primary">
        {React.createElement(icon)}
      </span>
      <h4 className="font-bold">{title}</h4>
      <img
        className="h-8 mt-4 filter grayscale hover:grayscale-0 transition-all duration-300 opacity-60"
        src={imgSrc}
        alt={imgAlt}
      />
    </div>
  );
};

export default BrandCard;
