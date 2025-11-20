import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { AnimatePresence, motion } from "framer-motion";
import Donate from "../components/ui/Donate";
import { useDonate } from "../components/shared/DonateContext";

const PageLayout = () => {
  const location = useLocation();
  const { isModalOpen, openModal, closeModal } = useDonate();

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="opacity-0"
        >
          <Navbar onDonateClick={openModal} />
          <Outlet />
          <Footer />
        </motion.div>
      </AnimatePresence>
      <Donate isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default PageLayout;
