import { Routes, Route } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";
import Home from "./pages/Home.tsx";
import PageLayout from "./pages/PageLayout.tsx";
import About from "./pages/About.tsx";
import Ministry from "./pages/Ministry.tsx";
import Media from "./pages/Media.tsx";
import Contact from "./pages/Contact.tsx";
import Partnership from "./pages/Partnership.tsx";
import ShowcaseBusiness from "./pages/ShowcaseBusiness.tsx";
import Conference from "./pages/Conference.tsx";
import ConferenceSlip from "./pages/ConferenceSlip.tsx";
import VendorSlip from "./pages/VendorSlip.tsx";
import VendorStaffPortal from "./pages/VendorStaffPortal.tsx";
import PaymentReturn from "./pages/PaymentReturn.tsx";
import AdminConsole from "./pages/AdminConsole.tsx";
import StaffPortal from "./pages/StaffPortal.tsx";
import { DonateProvider } from "./components/shared/DonateContext.tsx";

gsap.registerPlugin(ScrollTrigger, SplitText);

const App = () => {
  return (
    <DonateProvider>
      <Routes>
        {/* Admin & Staff — standalone, no navbar/footer */}
        <Route path="/admin" element={<AdminConsole />} />
        <Route path="/staff" element={<StaffPortal />} />
        <Route path="/vendor-staff" element={<VendorStaffPortal />} />
        <Route path="/payment/return" element={<PaymentReturn />} />

        <Route element={<PageLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/ministry" element={<Ministry />} />
          <Route path="/media" element={<Media />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/showcase" element={<ShowcaseBusiness />} />
          <Route path="/conference" element={<Conference />} />
          <Route path="/conference/slip" element={<ConferenceSlip />} />
          <Route path="/vendor/slip" element={<VendorSlip />} />
        </Route>
      </Routes>
    </DonateProvider>
  );
};

export default App;
