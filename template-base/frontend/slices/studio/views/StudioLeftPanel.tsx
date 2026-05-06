import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Card, Input, Label, Button, Textarea } from '@/components/ui';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, Check, Library, LayoutTemplate, Settings2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { UnifiedLibrary } from '@/frontend/shared/builder';
import { TemplateLibrary } from '@/frontend/shared/builder';
import { cmsTemplateProvider } from '@/frontend/slices/studio/ui/state/templateProvider';
import { saveAssetTemplate, getTemplateByKey } from '@/frontend/slices/studio/ui/state/templateStore';
import { useSharedCanvas } from '@/frontend/shared/builder';
import { toSchema } from '@/frontend/slices/studio/ui/hooks/useSchema';
import type { StudioMode } from '@/frontend/slices/studio/registry';
import { STUDIO_TAB_ICONS } from '@/frontend/slices/studio/registry/studioLibraryTabs';

const TemplatesGallery = dynamic(
    () => import('@/frontend/slices/studio/components/TemplatesGallery').then((mod) => mod.TemplatesGallery),
    { ssr: false, loading: () => <div className="p-3 text-xs text-muted-foreground">Loading templates…</div> }
);

const SETTINGS_KEY = 'studio-project-settings';

interface ProjectSettings {
    name: string;
    description: string;
    author: string;
}

function useProjectSettings() {
    const [settings, setSettings] = useState<ProjectSettings>(() => {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : { name: 'My Project', description: '', author: '' };
        } catch {
            return { name: 'My Project', description: '', author: '' };
        }
    });

    const save = (next: ProjectSettings) => {
        setSettings(next);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    };

    return { settings, save };
}

interface LeftPanelProps {
    mode: StudioMode;
    leftTab: 'library' | 'templates' | 'settings';
    setLeftTab: (t: 'library' | 'templates' | 'settings') => void;
    onAddComponent: (compKey: string) => void;
    onImportTemplate: (template: any) => void;
}

export const StudioLeftPanel: React.FC<LeftPanelProps> = ({
    mode,
    leftTab,
    setLeftTab,
    onAddComponent,
    onImportTemplate,
}) => {
    const { settings, save } = useProjectSettings();
    const { nodes, edges } = useSharedCanvas();
    const [saved, setSaved] = useState(false);
    const [savedSettings, setSavedSettings] = useState(false);
    const [pendingTemplateKey, setPendingTemplateKey] = useState<string | null>(null);
    const [isOpeningTemplate, setIsOpeningTemplate] = useState(false);

    const handleSaveTemplate = () => {
        const schema = toSchema(nodes as any, edges as any);
        saveAssetTemplate(settings.name || 'My Project', schema);
        setSaved(true);
        toast.success('Template saved', {
            description: `"${settings.name || 'My Project'}" added to your template library.`,
        });
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSettingsChange = (next: ProjectSettings) => {
        save(next);
        setSavedSettings(true);
        setTimeout(() => setSavedSettings(false), 1500);
    };

    const confirmOpenTemplate = async () => {
        if (!pendingTemplateKey || isOpeningTemplate) return;

        setIsOpeningTemplate(true);
        try {
            const schema = await getTemplateByKey(pendingTemplateKey);
            if (schema) {
                onImportTemplate(schema);
            } else {
                toast.error('Template unavailable', {
                    description: `Could not load "${pendingTemplateKey}".`,
                });
            }
        } finally {
            setIsOpeningTemplate(false);
            setPendingTemplateKey(null);
        }
    };

    return (
        <Card className="h-full flex flex-col overflow-hidden border-0 rounded-none">
            {/* Tab bar — panel-level navigation */}
            <div className="flex items-center border-b shrink-0 bg-muted/20">
                {([
                    { id: 'library',   icon: Library,       label: 'Library' },
                    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
                ] as const).map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setLeftTab(id)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors border-b-2 -mb-px ${
                            leftTab === id
                                ? 'border-primary text-foreground font-medium'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                        title={label}
                    >
                        <Icon size={13} />
                        <span>{label}</span>
                    </button>
                ))}
                <div className="flex-1" />
                <button
                    onClick={() => setLeftTab('settings')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors border-b-2 -mb-px ${
                        leftTab === 'settings'
                            ? 'border-primary text-foreground font-medium'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                    title="Project settings"
                >
                    <Settings2 size={13} />
                    <span>Project</span>
                </button>
            </div>

            <div className="flex-1 overflow-hidden">
                {leftTab === 'library' && (
                    <div className="h-full">
                        <UnifiedLibrary currentFeature="studio" onAdd={onAddComponent} tabIcons={STUDIO_TAB_ICONS} />
                    </div>
                )}
                {leftTab === 'templates' && (
                    <div className="h-full">
                        {mode === 'workflow' ? (
                            <TemplatesGallery onImport={onImportTemplate} />
                        ) : (
                            <TemplateLibrary
                                onOpen={(key) => setPendingTemplateKey(key)}
                                templateProvider={cmsTemplateProvider}
                            />
                        )}
                    </div>
                )}
                {leftTab === 'settings' && (
                    <ScrollArea className="h-full">
                    <div className="p-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Project Settings
                            </div>
                            {savedSettings && (
                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                                    <Check size={10} />
                                    Auto-saved
                                </div>
                            )}
                        </div>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs">Project Name</Label>
                                <Input
                                    value={settings.name}
                                    onChange={e => handleSettingsChange({ ...settings, name: e.target.value })}
                                    placeholder="My Project"
                                    className="mt-1 h-8"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Description</Label>
                                <Textarea
                                    value={settings.description}
                                    onChange={e => handleSettingsChange({ ...settings, description: e.target.value })}
                                    placeholder="Project description..."
                                    className="mt-1 min-h-[60px] resize-none text-sm"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Author</Label>
                                <Input
                                    value={settings.author}
                                    onChange={e => handleSettingsChange({ ...settings, author: e.target.value })}
                                    placeholder="Your name..."
                                    className="mt-1 h-8"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-3 space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Canvas
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 text-xs"
                                onClick={handleSaveTemplate}
                            >
                                <Save size={12} />
                                {saved ? 'Saved!' : 'Save as Template'}
                            </Button>
                            <p className="text-[10px] text-muted-foreground">
                                Saves current canvas to the Templates library under project name.
                            </p>
                        </div>
                    </div>
                    </ScrollArea>
                )}
            </div>

            <AlertDialog open={!!pendingTemplateKey} onOpenChange={(open) => { if (!open) setPendingTemplateKey(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Replace current canvas?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Opening this template will replace your current canvas content. Any unsaved work will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isOpeningTemplate}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmOpenTemplate}>
                            {isOpeningTemplate ? 'Opening...' : 'Open Template'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
};
