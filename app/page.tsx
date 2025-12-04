'use client';

import { useState, useCallback, useEffect } from 'react';
import PhysarumVisualization from '@/components/PhysarumVisualization';
import Module1 from '@/components/modules/Module1';
import Module2 from '@/components/modules/Module2';
import Module3 from '@/components/modules/Module3';
import Modal from '@/components/Modal';
import modalsConfig from '@/config/modals.json';
import type { ModalConfig } from '@/types';

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [revealedModals, setRevealedModals] = useState<string[]>([]);
  const [currentModule, setCurrentModule] = useState<1 | 2 | 3>(1);
  const [moduleExpanded, setModuleExpanded] = useState(false);

  // Keyboard controls for testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') setCurrentModule(1);
      if (e.key === '2') setCurrentModule(2);
      if (e.key === '3') setCurrentModule(3);
      // Press 'r' to reveal a random modal (for testing)
      if (e.key === 'r') {
        const unrevealed = modalsConfig.modals.filter(
          (m: ModalConfig) => !revealedModals.includes(m.id)
        );
        if (unrevealed.length > 0) {
          const random = unrevealed[Math.floor(Math.random() * unrevealed.length)];
          setRevealedModals(prev => [...prev, random.id]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealedModals]);

  const modals = modalsConfig.modals as ModalConfig[];

  const handleBecomeClick = useCallback((modalId: string) => {
    setActiveModal(modalId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleRevealModal = useCallback((modalId: string) => {
    if (!revealedModals.includes(modalId)) {
      setRevealedModals(prev => [...prev, modalId]);
    }
  }, [revealedModals]);

  const handleModuleChange = useCallback((module: 1 | 2 | 3) => {
    setCurrentModule(module);
    setModuleExpanded(false);
  }, []);

  const handleModuleExpand = useCallback(() => {
    setModuleExpanded(prev => !prev);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Module Layer - Top */}
      <div className="absolute top-4 left-4 right-4 z-20">
        {currentModule === 1 && (
          <Module1 
            expanded={moduleExpanded} 
            onExpand={handleModuleExpand}
            onNext={() => handleModuleChange(2)}
          />
        )}
        {currentModule === 2 && (
          <Module2 
            expanded={moduleExpanded} 
            onExpand={handleModuleExpand}
            onNext={() => handleModuleChange(3)}
          />
        )}
        {currentModule === 3 && (
          <Module3 
            expanded={moduleExpanded} 
            onExpand={handleModuleExpand}
            onNext={() => handleModuleChange(1)}
          />
        )}
      </div>

      {/* Physarum Visualization - Full Screen Background */}
      <PhysarumVisualization
        modals={modals}
        revealedModals={revealedModals}
        onRevealModal={handleRevealModal}
        onBecomeClick={handleBecomeClick}
      />

      {/* Modal Overlay */}
      {activeModal && (
        <Modal
          modalId={activeModal}
          modalName={modals.find(m => m.id === activeModal)?.name || 'Modal'}
          onClose={handleCloseModal}
        />
      )}

      {/* Dev controls */}
      <div className="fixed bottom-4 right-4 text-gray-600 text-xs z-10 text-right">
        <div>1, 2, 3 — switch modules</div>
        <div>r — reveal random modal</div>
      </div>
    </main>
  );
}
