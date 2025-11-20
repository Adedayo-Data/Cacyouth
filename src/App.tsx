import { Routes, Route } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import Home from "./pages/Home.tsx";
import PageLayout from "./pages/PageLayout.tsx";
import About from "./pages/About.tsx";
import Ministry from "./pages/Ministry.tsx";
import Media from "./pages/Media.tsx";
import Contact from "./pages/Contact.tsx";
import { DonateProvider } from "./components/shared/DonateContext.tsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  return (
    <DonateProvider>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/ministry" element={<Ministry />} />
          <Route path="/media" element={<Media />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </DonateProvider>
  );
};

export default App;
