'use client';

interface Props {
  expanded: boolean;
  onExpand: () => void;
  onNext: () => void;
}

export default function Module2({ expanded, onExpand, onNext }: Props) {
  return (
    <div className={`module-container ${expanded ? 'expanded' : ''}`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={onExpand}
      >
        <div className="text-gray-400 font-mono text-sm">
          Module 2 — Instructions
        </div>
        
        {expanded && (
          <div className="mt-4 animate-expand">
            <p className="text-gray-300 text-base leading-relaxed mb-4">
              This is the second instruction module.
              Content will be customized here.
            </p>
            
            <div className="flex justify-end">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="text-xs text-gray-500 hover:text-[#FFE600] transition-colors"
              >
                next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

