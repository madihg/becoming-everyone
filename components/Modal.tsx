'use client';

import { useEffect, useCallback } from 'react';

// Import individual modal content components
import Modal1Content from './modals/Modal1';
import Modal2Content from './modals/Modal2';
import Modal3Content from './modals/Modal3';
import Modal4Content from './modals/Modal4';
import Modal5Content from './modals/Modal5';
import Modal6Content from './modals/Modal6';
import Modal7Content from './modals/Modal7';
import Modal8Content from './modals/Modal8';

interface Props {
  modalId: string;
  modalName: string;
  onClose: () => void;
}

const modalComponents: Record<string, React.ComponentType> = {
  modal1: Modal1Content,
  modal2: Modal2Content,
  modal3: Modal3Content,
  modal4: Modal4Content,
  modal5: Modal5Content,
  modal6: Modal6Content,
  modal7: Modal7Content,
  modal8: Modal8Content,
};

export default function Modal({ modalId, modalName, onClose }: Props) {
  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const ContentComponent = modalComponents[modalId];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#FFE600] text-2xl font-bold transition-colors z-10"
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-[#FFE600]">
            {modalName}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {ContentComponent ? (
            <ContentComponent />
          ) : (
            <p className="text-gray-400">Content not found for {modalId}</p>
          )}
        </div>
      </div>
    </div>
  );
}

