import { GiMusicalNotes, GiTrumpet, GiPrayer, GiGears } from "react-icons/gi";
import { FaUsers, FaGlobe, FaHeart } from "react-icons/fa";

const brandData = [
  {
    icon: GiMusicalNotes,
    title: "Music Ministry",
    content: ["BGVS (Background Vocalists)", "Praise Team"],
  },
  {
    icon: GiTrumpet,
    title: "Musicians",
    content: ["Band Department"],
  },
  {
    icon: GiPrayer,
    title: "Support Ministries",
    content: ["Welfare Department", "Intercessor Department"],
  },
  {
    icon: GiGears,
    title: "Operational Foundation",
    content: [
      "Secretariat",
      "Library Department",
      "Finance Department",
      "Media Department",
    ],
  },
];

const About = () => {
  return (
    <div className="bg-black-light min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Hero Section - Static & Elegant */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/5.jpg')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-black-light/80"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl">
            <h5 className="text-purple-500 font-bold tracking-widest uppercase mb-4 text-sm">
              Who We Are
            </h5>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Nurturing a Generation of <br />
              <span className="text-gray-400">Kingdom Leaders.</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl border-l-4 border-purple-500 pl-6">
              The Christ Apostolic Church Youth Fellowship (CACYOF) of the
              Medaiyese Region is a movement dedicated to faith, purpose, and
              community.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Mandate - Clean Grid */}
      <section className="py-24 px-6 bg-black-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Mission Column */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-1 bg-purple-500"></span>
                Our Mission
              </h2>
              <div className="space-y-8">
                <div className="group">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    Spiritual Excellence
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    To raise spiritually-grounded, skillful worship ministers who
                    understand the depth of their calling.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    Divine Encounter
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    To create platforms for young people to encounter God through
                    music, transcending mere performance.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    Unity & Leadership
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    To strengthen unity, excellence, and leadership within the
                    body of Christ, empowering the next generation.
                  </p>
                </div>
              </div>
            </div>

            {/* Mandate Column */}
            <div className="bg-white/5 p-10 rounded-sm border-l border-white/10">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-8 h-1 bg-blue-500"></span>
                Our Mandate
              </h2>
              <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                We host two major life-transforming programs annually that define
                our calendar and impact thousands:
              </p>

              <div className="space-y-6">
                <div className="flex gap-6 items-start">
                  <span className="text-4xl font-bold text-white/10">01</span>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      The Emergence Concert
                    </h3>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                      Flagship Worship Experience
                    </p>
                  </div>
                </div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="flex gap-6 items-start">
                  <span className="text-4xl font-bold text-white/10">02</span>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      The Youth Conference
                    </h3>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                      Teaching, Ministry & Connection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats - Minimalist */}
      <section className="py-20 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="px-4 py-4">
              <FaUsers className="text-3xl text-purple-500 mx-auto mb-4 opacity-80" />
              <div className="text-4xl font-bold text-white mb-2">500k+</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest">
                Youth Members
              </div>
            </div>
            <div className="px-4 py-4">
              <FaGlobe className="text-3xl text-blue-500 mx-auto mb-4 opacity-80" />
              <div className="text-4xl font-bold text-white mb-2">100k+</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest">
                Online Views
              </div>
            </div>
            <div className="px-4 py-4">
              <FaHeart className="text-3xl text-pink-500 mx-auto mb-4 opacity-80" />
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-sm text-gray-400 uppercase tracking-widest">
                Lives Touched
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structure Section - Professional Grid */}
      <section className="py-24 px-6 bg-black-light">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Organizational Structure
            </h2>
            <p className="text-gray-400 max-w-2xl text-lg">
              The harmonious blend of specialized ministries working in unison.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
            {brandData.map((brand, index) => (
              <div
                key={index}
                className="bg-black-light p-8 hover:bg-white/5 transition-colors duration-300 group"
              >
                <brand.icon className="text-3xl text-gray-500 group-hover:text-purple-500 transition-colors mb-6" />
                <h3 className="text-lg font-bold text-white mb-4">
                  {brand.title}
                </h3>
                <ul className="space-y-3">
                  {brand.content.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-gray-400 text-sm flex items-start gap-2"
                    >
                      <span className="w-1 h-1 bg-gray-600 rounded-full mt-2 group-hover:bg-purple-500 transition-colors"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
