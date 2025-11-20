import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface DonateContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const DonateContext = createContext<DonateContextType | undefined>(undefined);

export const DonateProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <DonateContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </DonateContext.Provider>
  );
};

export const useDonate = () => {
  const context = useContext(DonateContext);
  if (!context) {
    throw new Error("useDonate must be used within a DonateProvider");
  }
  return context;
};
