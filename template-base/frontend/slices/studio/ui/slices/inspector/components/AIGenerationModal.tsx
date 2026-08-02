import React, { useState } from 'react';
import { Button, Input, Label } from '@/components/ui';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, type: string) => void;
  generationType: 'ai' | 'custom';
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  generationType
}) => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('text');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(prompt, contentType);
      setPrompt('');
      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const getModalTitle = () => {
    return generationType === 'ai' ? 'Generate with AI' : 'Custom Node Connection';
  };

  const getPromptPlaceholder = () => {
    if (generationType === 'ai') {
      return 'Describe what you want to generate... (e.g., "Create a hero section with a call-to-action button")';
    }
    return 'Describe the custom node you want to connect...';
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-popover rounded-lg p-6 w-96 max-w-[90vw] border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{getModalTitle()}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Content Type</Label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
            >
              <option value="text">Text Content</option>
              <option value="image">Image</option>
              <option value="button">Button/CTA</option>
              <option value="section">Section Layout</option>
              <option value="form">Form Elements</option>
              <option value="navigation">Navigation</option>
            </select>
          </div>
          
          <div>
            <Label>
              {generationType === 'ai' ? 'AI Prompt' : 'Node Description'}
            </Label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getPromptPlaceholder()}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              rows={4}
            />
          </div>
          
          {generationType === 'ai' && (
            <div className="text-xs text-muted-foreground">
              <p>💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Be specific about styling and layout</li>
                <li>Mention colors, sizes, and positioning</li>
                <li>Include any specific text content needed</li>
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            {isGenerating ? 'Generating...' : 
             generationType === 'ai' ? 'Generate' : 'Connect'}
          </Button>
        </div>
      </div>
    </div>
  );
};
