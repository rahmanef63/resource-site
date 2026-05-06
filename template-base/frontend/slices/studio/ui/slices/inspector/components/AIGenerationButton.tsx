import React, { useState } from 'react';
import { Button } from '@/components/ui';

interface AIGenerationButtonProps {
  onGenerate: (type: 'ai' | 'custom') => void;
  className?: string;
}

export const AIGenerationButton: React.FC<AIGenerationButtonProps> = ({
  onGenerate,
  className = ""
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setShowMenu(!showMenu)}
        className="w-8 h-8 p-0"
        title="AI Generation & Custom Nodes"
      >
        ✨
      </Button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-popover rounded-lg border border-border shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={() => {
                  onGenerate('ai');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <span>🤖</span>
                <span>Generate with AI</span>
              </button>
              <button
                onClick={() => {
                  onGenerate('custom');
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors text-left"
              >
                <span>🔧</span>
                <span>Use Custom Node</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
