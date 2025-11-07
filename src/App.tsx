import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Impact from "./components/Impact";
import Contact from "./components/Contact";
import BrandValueSection from "./components/BrandValueSection";
import Part from "./components/Part";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Impact />
      <Part />
      <BrandValueSection />
      <Contact />
      <Footer />
    </div>
  );
};

export default App;
