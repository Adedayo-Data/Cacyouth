import { useEffect, useRef, useState } from 'react';
import { socialSlides } from '../../config/socialSlides';

const SocialMediaSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef < HTMLDivElement > (null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % socialSlides.length);
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 px-6 bg-gradient-to-b from-black-light to-black relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left side - Introduction */}
                    <div className="space-y-6 z-10 relative">
                        <div className="inline-block">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm">
                                    Live Metrics
                                </span>
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Our Growing Digital Community
                        </h2>

                        <p className="text-xl text-gray-300 leading-relaxed">
                            Witness the impact we're making across social media platforms.
                            Our community continues to grow as we share the message of hope,
                            worship, and transformation with thousands online.
                        </p>

                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-black-light"
                                    ></div>
                                ))}
                            </div>
                            <p className="text-gray-400 text-sm">
                                we've reached over <span className="text-white font-bold">1M+</span> views across our platform
                            </p>
                        </div>
                    </div>

                    {/* Right side - Stacked Cards Slider */}
                    <div className="relative h-[500px] flex items-center justify-center" ref={sliderRef}>
                        {/* Card stack container */}
                        <div className="relative w-full max-w-md h-full">
                            {socialSlides.map((slide, index) => {
                                const position = (index - currentSlide + socialSlides.length) % socialSlides.length;
                                const isActive = position === 0;
                                const isNext = position === 1;
                                const isPrev = position === socialSlides.length - 1;

                                return (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-700 ease-out ${isActive
                                            ? 'translate-x-0 scale-100 opacity-100 z-30'
                                            : isNext
                                                ? 'translate-x-[20px] scale-95 opacity-60 z-20'
                                                : isPrev
                                                    ? '-translate-x-[100%] scale-90 opacity-0 z-10'
                                                    : 'translate-x-[40px] scale-90 opacity-0 z-0'
                                            }`}
                                        style={{
                                            transformOrigin: 'center right',
                                        }}
                                    >
                                        {slide.type === 'title' ? (
                                            // Title Card
                                            <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-blue-900/40 backdrop-blur-xl border border-white/20 rounded-3xl p-12 flex flex-col justify-center items-center text-center shadow-2xl">
                                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                                    <svg
                                                        className="w-10 h-10 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                                        />
                                                    </svg>
                                                </div>
                                                <h3 className="text-3xl font-bold text-white mb-4">
                                                    {slide.title}
                                                </h3>
                                                <p className="text-gray-300 text-lg leading-relaxed">
                                                    {slide.subtitle}
                                                </p>
                                            </div>
                                        ) : (
                                            // Image Card
                                            <div className="w-full h-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                                                <div className="relative w-full h-full">
                                                    {slide.imageUrl ? (
                                                        <>
                                                            <img
                                                                src={slide.imageUrl}
                                                                alt={`${slide.platform} metrics`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {/* View count overlay - positioned at top right */}
                                                            {slide.views && (
                                                                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2 shadow-lg">
                                                                    <svg
                                                                        className="w-4 h-4 text-white"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                                        />
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                                        />
                                                                    </svg>
                                                                    <span className="text-white font-semibold text-sm">
                                                                        {slide.views}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {slide.platform && (
                                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                                                    <p className="text-white font-bold text-xl">
                                                                        {slide.platform}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <div className="text-center space-y-4">
                                                                <div className="w-16 h-16 bg-white/10 rounded-full mx-auto flex items-center justify-center">
                                                                    <svg
                                                                        className="w-8 h-8 text-white/50"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                        />
                                                                    </svg>
                                                                </div>
                                                                <p className="text-white/50 text-sm">
                                                                    Add Cloudinary image URL
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Slide indicators */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                            {socialSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'w-8 bg-purple-500'
                                        : 'w-2 bg-white/30 hover:bg-white/50'
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SocialMediaSlider;
