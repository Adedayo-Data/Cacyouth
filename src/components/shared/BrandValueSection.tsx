import BrandCard from "../ui/BrandCard.tsx";
import { IoMdMusicalNote, IoIosSchool } from "react-icons/io";
import { MdOutlineFastfood } from "react-icons/md";
import { RiBankLine } from "react-icons/ri";

const brandData = [
  {
    icon: IoMdMusicalNote,
    title: "Music & Streaming",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjq5DnpfqWdBemvsNZt1AOWkM26KlJzsE1T_Fo1wV1P6Ns5OJNE8KVLtkKQAy5UCp_hudFC7NJHukOyfEuKfJyhdOeWMLsF3WTvOLgjYR97K2WTBExvxCGVZwi4sOtLoKH-9LgAmexQ0O9PjZoGNCwX5t-Nwojlk3owFrW87RZZXIPh-r7EfWEpvv3C2hZbi_2jIYl0qatVUtsLpKIzLHSkeWUwfQdQnOR0Da32RnozAivWXEXjYaMEYErA_PnCQvoxnSl7MtS3rU",
    imgAlt: "Spotify logo",
  },
  {
    icon: IoIosSchool,
    title: "EdTech",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCMR0tOImrg78ujbbdxQaVxu5SHmT38rQk0xIuYooSe-IdL3kGyIaFLQeyzlV34Kayna5hvAdr5KhGxnWxiYSBXczCQPsaW8p4GI38PpNZJFiEVwSzTKo8-mwrrnoGKWEk5kCOvX7Bp0gXQlexl5PufIkO9JaYAql5rYWaZFGN1eDvUnI0Z5W0uiqgeg1NYgHwKsauaSRPdi_cIka1ppSScBzOiyGDZeW9OuvUKlvdOIUNXtTst9gAwopV38kqL1aHDQL2WxMpB0t0",
    imgAlt: "Coursera logo",
  },
  {
    icon: MdOutlineFastfood,
    title: "FMCG",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDalEDrjhtUwz1j6VTXJyhGhNxwz_Fdy8LyTN6XBtYPPvckwZ3nxfCTfzclDHvUZLDHrYvfFLbITCFc97V7hczF9kE5ZTpHud_PqTcLr7sPTKz2caSA3MY5Iv93d_MsuHtBkHe6WFbxzTuO_z3Y9DrcExQDpncTbZXHwmISa-Hz7NfYQgtO0g3XLh45EVepD66PAkKznh2zzwQTcCXuo3kVFqYh-ViNY_3aepfswfFgEh8UToWzXRWP5sjdcEt9727Ugd3jRlQ4Ysk",
    imgAlt: "Coca-Cola logo",
  },
  {
    icon: RiBankLine,
    title: "Banks",
    imgSrc:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjFeRrTRxQG7K-Wun-sAZDsWyzndMJE-q_mVR8ArRLqymToVzRl22ZbWcdVjOgUEWrd1m_u-Q8OddTGOB2bmewrkks6Uc3yW8ioyx58mPe_Lr4k0b7b3CnH-6BLKW5l0lASxouV336BBEHc_QCXVubNp6pAHWd5j4HGblgqswL78Q0eQz6WG2fRYq9821wjNYUyVqeK2BWRUNYt88T1OFoNnpElPqFA75A5omc1-aljVAcPJB34Gdu_287n7odWZBQ7lFKEa6084Y",
    imgAlt: "GTBank logo",
  },
];

const BrandValueSection = () => {
  return (
    <section className="py-16 sm:py-24" id="brand-value">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
            Brand Value Opportunities
          </h2>
          <p className="mt-4 text-lg text-text-light-muted dark:text-text-dark-muted max-w-2xl mx-auto">
            Align your brand with a positive, large-scale youth movement. We
            welcome partners from all industries.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {brandData.map((brand, index) => (
            <BrandCard
              key={index}
              icon={brand.icon}
              title={brand.title}
              imgSrc={brand.imgSrc}
              imgAlt={brand.imgAlt}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandValueSection;
