'use client';

import { useState, useCallback, useEffect } from 'react';
import PhysarumVisualization from '@/components/PhysarumVisualization';
import Module1 from '@/components/modules/Module1';
import Module2 from '@/components/modules/Module2';
import Module3 from '@/components/modules/Module3';
import Modal from '@/components/Modal';
import modalsConfig from '@/config/modals.json';
import type { ModalConfig } from '@/types';
import { preloadBodyModel } from '@/lib/model-preloader';

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [revealedModals, setRevealedModals] = useState<string[]>([]);
  const [currentModule, setCurrentModule] = useState<1 | 2 | 3>(1);
  const [moduleExpanded, setModuleExpanded] = useState(false);
  const [targetModal, setTargetModal] = useState<string | null>(null);

  // Preload the body detection model on mount
  useEffect(() => {
    preloadBodyModel();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // a, s, d for modules 1, 2, 3
      if (e.key === 'a') setCurrentModule(1);
      if (e.key === 's') setCurrentModule(2);
      if (e.key === 'd') setCurrentModule(3);
      
      // 1-8 to directly open modals
      const num = parseInt(e.key);
      if (num >= 1 && num <= 8) {
        const modalId = `modal${num}`;
        // Reveal it if not already revealed
        if (!revealedModals.includes(modalId)) {
          setRevealedModals(prev => [...prev, modalId]);
        }
        // Open it
        setActiveModal(modalId);
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
    // Clear target once revealed
    setTargetModal(null);
  }, [revealedModals]);

  const handleModuleChange = useCallback((module: 1 | 2 | 3) => {
    setCurrentModule(module);
    setModuleExpanded(false);
  }, []);

  const handleModuleExpand = useCallback(() => {
    setModuleExpanded(prev => !prev);
  }, []);

  // Handle Module completion - triggers slime movement
  const handleModuleComplete = useCallback((targetModalId: string) => {
    console.log('Module complete, target:', targetModalId);
    setTargetModal(targetModalId);
    // Collapse the module
    setModuleExpanded(false);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Module Layer - Top */}
      <div className="absolute top-4 left-4 right-4 z-20">
        {currentModule === 1 && (
          <Module1 
            expanded={moduleExpanded} 
            onExpand={handleModuleExpand}
            onComplete={handleModuleComplete}
          />
        )}
        {currentModule === 2 && (
          <Module2 
            expanded={moduleExpanded} 
            onExpand={handleModuleExpand}
            onComplete={handleModuleComplete}
          />
        )}
        {currentModule === 3 && (
          <Module3 
            expanded={moduleExpanded} 
            onExpand={handleModuleExpand}
            onComplete={handleModuleComplete}
          />
        )}
      </div>

      {/* Physarum Visualization - Full Screen Background */}
      <PhysarumVisualization
        modals={modals}
        revealedModals={revealedModals}
        onRevealModal={handleRevealModal}
        onBecomeClick={handleBecomeClick}
        targetModal={targetModal}
      />

      {/* Modal Overlay */}
      {activeModal && (
        <Modal
          modalId={activeModal}
          modalName={modals.find(m => m.id === activeModal)?.name || 'Modal'}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}
