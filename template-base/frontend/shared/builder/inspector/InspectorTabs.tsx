import React from 'react';
import { UnifiedInspector } from './UnifiedInspector';
import { ChatAI, type Message } from './ChatAI';
import { ChildrenManager } from './ChildrenManager';
import { EventsInspector } from './EventsInspector';
import { Settings2, Bot, Layers, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InspectorTabsProps {
  selectedNode: any | null;
  /** Optional widget-specific fields getter injected by the host feature (e.g. Studio). */
  getWidgetFields?: (comp: string) => import('./DynamicInspector').InspectorField[] | undefined;
  /** Injected AI generate function — passed through to ChatAI. */
  onAIGenerate?: (prompt: string, systemPrompt: string) => Promise<string | null>;
  /** Called when AI produces a valid props patch for the selected node. */
  onApplyProps?: (nodeId: string, patchedProps: Record<string, unknown>) => void;
}

type InspectorTab = 'properties' | 'layers' | 'chat-ai' | 'events';
type AIScope = 'node' | 'project';

const TABS: { id: InspectorTab; label: string; icon: React.ElementType }[] = [
  { id: 'properties', label: 'Properties', icon: Settings2 },
  { id: 'layers',     label: 'Layers',     icon: Layers },
  { id: 'events',     label: 'Events',     icon: Zap },
  { id: 'chat-ai',    label: 'AI',         icon: Bot },
];

export function InspectorTabs({ selectedNode, getWidgetFields, onAIGenerate, onApplyProps }: InspectorTabsProps) {
  const [activeTab, setActiveTab] = React.useState<InspectorTab>('properties');
  const [aiScope, setAiScope] = React.useState<AIScope>('node');
  const prevNodeId = React.useRef<string | null>(null);

  // Auto-switch to Properties tab when a new node is selected
  React.useEffect(() => {
    const nodeId = selectedNode?.id ?? null;
    if (nodeId && nodeId !== prevNodeId.current) {
      setActiveTab('properties');
    }
    prevNodeId.current = nodeId;
  }, [selectedNode?.id]);

  // Lift message state for persistence across tab switches
  const [nodeMessages, setNodeMessages] = React.useState<Message[]>([]);
  const [projectMessages, setProjectMessages] = React.useState<Message[]>([]);

  return (
    <div className="h-full flex flex-col overflow-y-hidden">
      {/* Tab bar */}
      <TooltipProvider delayDuration={400}>
        <div className="flex items-center gap-0 mx-3 mt-3 bg-muted rounded-lg p-0.5 shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs rounded-md transition-colors ${
                    activeTab === id
                      ? 'bg-background text-foreground shadow-sm font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 mt-1">
        {activeTab === 'properties' && <UnifiedInspector selectedNode={selectedNode} getWidgetFields={getWidgetFields} />}
        {activeTab === 'layers'     && <ChildrenManager selectedNode={selectedNode} />}
        {activeTab === 'events'     && <EventsInspector selectedNode={selectedNode} />}
        {activeTab === 'chat-ai'    && (
          <div className="h-full flex flex-col">
            {/* AI sub-tab bar */}
            <div className="flex items-center gap-0 mx-3 mt-2 mb-1 bg-muted/50 rounded-md p-0.5 shrink-0">
              <button
                onClick={() => setAiScope('node')}
                className={`flex-1 text-[10px] px-2 py-1 rounded-sm transition-colors ${
                  aiScope === 'node'
                    ? 'bg-background text-foreground shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                This Node
              </button>
              <button
                onClick={() => setAiScope('project')}
                className={`flex-1 text-[10px] px-2 py-1 rounded-sm transition-colors ${
                  aiScope === 'project'
                    ? 'bg-background text-foreground shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                This Project
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {aiScope === 'node' && (
                <ChatAI
                  selectedNode={selectedNode}
                  messages={nodeMessages.length > 0 ? nodeMessages : undefined}
                  onMessagesChange={setNodeMessages}
                  onAIGenerate={onAIGenerate}
                  onApplyProps={onApplyProps}
                />
              )}
              {aiScope === 'project' && (
                <ChatAI
                  selectedNode={null}
                  projectMode={true}
                  messages={projectMessages.length > 0 ? projectMessages : undefined}
                  onMessagesChange={setProjectMessages}
                  onAIGenerate={onAIGenerate}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
