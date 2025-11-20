import { useEffect } from "react";
import { createPortal } from "react-dom";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonateModal = ({ isOpen, onClose }: DonateModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 bg-opacity-50">
      <div className="bg-white rounded-lg  shadow-xl max-w-md w-full h-125 mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-center text-black-light mb-2 ">
          Support Our Mission
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Choose your preferred payment method below.
        </p>

        <div className="space-y-4">
          <div className="border border-gray-200  text-black-light rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Bank Transfer</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Account Name:</span> Christ
                Apostolic Church Youth Fellowship
              </p>
              <p>
                <span className="font-medium">Account Number:</span> 1234567890
              </p>
              <p>
                <span className="font-medium">Bank:</span> First Bank Nigeria
              </p>
            </div>
          </div>

          <div className="border border-gray-200 text-black-light rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">
              International Transfer
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">IBAN:</span> NG12 3456 7890 1234
                5678
              </p>
              <p>
                <span className="font-medium">SWIFT Code:</span> FBNINGLA
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            For any questions about donations, please contact us at{" "}
            <a
              href="mailto:donate@cacyof.org"
              className="text-primary hover:underline"
            >
              donate@cacyof.org
            </a>
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DonateModal;
