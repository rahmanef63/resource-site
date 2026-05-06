import React, { useState } from 'react';
import type { InspectorField as IField } from '@/frontend/slices/studio/ui/types';
import type { CMSNode, CMSEdge } from '@/frontend/slices/studio/ui/types';
import { Input, Label, Button } from '@/components/ui';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { NodeSelectorField } from './NodeSelectorField';
import { AutoConnectButton } from './AutoConnectButton';
import { AIGenerationButton } from './AIGenerationButton';
import { AIGenerationModal } from './AIGenerationModal';
import { useStudioAI } from '@/frontend/slices/studio/hooks/useStudioAI';

interface InspectorFieldProps {
  field: IField;
  value: any;
  onChange: (value: any) => void;
  nodes: CMSNode[];
  selectedNode: CMSNode;
  setEdges: React.Dispatch<React.SetStateAction<CMSEdge[]>>;
  setNodes: React.Dispatch<React.SetStateAction<CMSNode[]>>;
  edges: CMSEdge[];
}

export const InspectorField: React.FC<InspectorFieldProps> = ({
  field,
  value,
  onChange,
  nodes,
  selectedNode,
  setEdges,
  setNodes,
  edges,
}) => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [generationType, setGenerationType] = useState<'ai' | 'custom'>('ai');
  const { generate, isLoading: aiLoading, error: aiError } = useStudioAI();

  const handleAIGeneration = (type: 'ai' | 'custom') => {
    setGenerationType(type);
    setShowAIModal(true);
  };

  const handleGenerate = async (prompt: string, contentType: string) => {
    if (generationType === 'ai') {
      const result = await generate({
        prompt: `Generate ${contentType} content for: ${prompt}. Return only the content value, no quotes or explanation.`,
      });
      if (result) onChange(result.trim());
    } else {
      onChange(`Custom: ${prompt}`);
    }
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <Input
              type={field.type}
              value={value || ''}
              onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={field.placeholder}
              min={field.min}
              max={field.max}
              step={field.step}
              className="flex-1 h-9 bg-muted/50 border-border/50 focus:bg-background"
            />
            <AutoConnectButton
              selectedNode={selectedNode}
              connectKey={field.key}
              setNodes={setNodes}
              setEdges={setEdges}
              edges={edges}
            />
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <textarea
                className="w-full rounded-lg border border-border/50 bg-muted/50 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background resize-none"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
              <div className="flex flex-col gap-1">
                <AutoConnectButton
                  selectedNode={selectedNode}
                  connectKey={field.key}
                  setNodes={setNodes}
                  setEdges={setEdges}
                  edges={edges}
                />
                <AIGenerationButton onGenerate={handleAIGeneration} />
              </div>
            </div>
          </div>
        );

      case 'select':
        return (
          <div className="flex items-center gap-2">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-border/50 bg-muted/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
            >
              <option value="">{field.placeholder || 'Select...'}</option>
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted-foreground">{value ? 'Enabled' : 'Disabled'}</span>
            <Switch
              checked={!!value}
              onCheckedChange={onChange}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-3 py-1">
            <Checkbox
              checked={!!value}
              onCheckedChange={onChange}
              className="h-5 w-5"
            />
            <span className="text-sm text-muted-foreground">{value ? 'Yes' : 'No'}</span>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{field.min ?? 0}</span>
              <span className="font-medium text-foreground">{value ?? field.min ?? 0}</span>
              <span className="text-muted-foreground">{field.max ?? 100}</span>
            </div>
            <Slider
              value={[value ?? field.min ?? 0]}
              onValueChange={(v) => onChange(v[0])}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              className="w-full"
            />
          </div>
        );

      case 'range':
        return (
          <div className="space-y-2 py-1">
            <input
              type="range"
              value={value ?? field.min ?? 0}
              onChange={(e) => onChange(Number(e.target.value))}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.min ?? 0}</span>
              <span className="font-medium text-foreground">{value ?? field.min ?? 0}</span>
              <span>{field.max ?? 100}</span>
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="relative">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded-lg border border-border/50 cursor-pointer overflow-hidden"
                style={{ padding: 0 }}
              />
            </div>
            <Input
              type="text"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 h-9 font-mono text-sm bg-muted/50"
            />
          </div>
        );

      case 'button':
        return (
          <Button
            variant={field.buttonVariant || 'outline'}
            size="sm"
            onClick={field.onButtonClick}
            className="w-full"
          >
            {field.buttonLabel || 'Click'}
          </Button>
        );

      case 'buttonGroup':
        return (
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(field.buttons || []).map((btn) => (
              <Button
                key={btn.value}
                variant={value === btn.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onChange(btn.value)}
                className={cn(
                  "flex-1 h-8 text-xs",
                  value === btn.value && "shadow-sm"
                )}
              >
                {btn.icon && <btn.icon className="w-3.5 h-3.5 mr-1.5" />}
                {btn.label}
              </Button>
            ))}
          </div>
        );

      case 'nodeSelector':
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <NodeSelectorField
                value={value || ''}
                onChange={onChange}
                nodes={nodes}
                placeholder={field.placeholder}
              />
            </div>
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );

      case 'custom':
        if (field.component) {
          const CustomComponent = field.component;
          return (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CustomComponent
                  value={value}
                  onChange={onChange}
                  nodes={nodes}
                  selectedNode={selectedNode}
                  setEdges={setEdges}
                />
              </div>
              <AIGenerationButton onGenerate={handleAIGeneration} />
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              value={value || ''}
              onChange={onChange}
              placeholder={field.placeholder}
              className="flex-1 h-9 bg-muted/50"
            />
            <AIGenerationButton onGenerate={handleAIGeneration} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {field.label}
      </Label>
      {renderField()}

      <AIGenerationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleGenerate}
        generationType={generationType}
      />
    </div>
  );
};

