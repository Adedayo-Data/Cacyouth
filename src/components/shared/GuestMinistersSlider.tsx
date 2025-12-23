import { useEffect, useRef, useState } from 'react';
import { guestMinisters } from '../../config/guestMinistersConfig';
import { FaUserTie } from 'react-icons/fa';

const GuestMinistersSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef < HTMLDivElement > (null);

    useEffect(() => {
        if (guestMinisters.length === 0) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % guestMinisters.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // Show placeholder if no ministers added yet
    if (guestMinisters.length === 0) {
        return (
            <section className="py-24 px-6 bg-black-light relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Our Guest Ministers
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                            Add guest minister details to the configuration file to display them here.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
                            <FaUserTie className="text-6xl text-white/20 mx-auto mb-4" />
                            <p className="text-white/50 text-sm">
                                Configure ministers in <code className="text-purple-400">guestMinistersConfig.ts</code>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24 px-6 bg-black-light relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left side - Introduction */}
                    <div className="space-y-6 z-10 relative">
                        <div className="inline-block">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                <span className="text-purple-400 font-semibold uppercase tracking-wider text-sm">
                                    Special Guests
                                </span>
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Anointed Ministers
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                Leading Us
                            </span>
                        </h2>

                        <p className="text-xl text-gray-300 leading-relaxed">
                            We are honored to host powerful men and women of God who will minister
                            the Word, lead worship, and facilitate divine encounters at the Emergence Concert.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Each minister brings a unique anointing and message that will inspire,
                                challenge, and transform lives. Join us as we sit under their ministry.
                            </p>
                        </div>
                    </div>

                    {/* Right side - Stacked Cards Slider */}
                    <div className="relative h-[500px] flex items-center justify-center" ref={sliderRef}>
                        {/* Card stack container */}
                        <div className="relative w-full max-w-md h-full">
                            {guestMinisters.map((minister, index) => {
                                const position = (index - currentSlide + guestMinisters.length) % guestMinisters.length;
                                const isActive = position === 0;
                                const isNext = position === 1;
                                const isPrev = position === guestMinisters.length - 1;

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
                                        <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-blue-900/40 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                                            {minister.imageUrl ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={minister.imageUrl}
                                                        alt={minister.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {/* Gradient overlay for text readability */}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-8">
                                                        <h3 className="text-2xl font-bold text-white text-center">
                                                            {minister.name}
                                                        </h3>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Placeholder when no image
                                                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                                                    <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                                        <FaUserTie className="text-6xl text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">
                                                        {minister.name}
                                                    </h3>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Slide indicators */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-40">
                            {guestMinisters.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                        ? 'w-8 bg-purple-500'
                                        : 'w-2 bg-white/30 hover:bg-white/50'
                                        }`}
                                    aria-label={`Go to minister ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GuestMinistersSlider;
