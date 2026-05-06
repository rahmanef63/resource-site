import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface TabsWidgetProps {
    tabs?: string;
    defaultTab?: string;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    children?: React.ReactNode;
}

export const TabsWidget: React.FC<TabsWidgetProps> = ({
    tabs = 'Tab 1,Tab 2,Tab 3',
    defaultTab,
    orientation = 'horizontal',
    className,
    children,
}) => {
    const tabList = Array.isArray(tabs)
        ? (tabs as unknown[]).map(String).filter(Boolean)
        : typeof tabs === 'string'
        ? tabs.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    const defaultValue = defaultTab || tabList[0] || 'tab-0';

    return (
        <Tabs
            defaultValue={defaultValue}
            orientation={orientation}
            className={cn('w-full', className)}
        >
            <TabsList className={cn(
                orientation === 'vertical' && 'flex-col h-auto'
            )}>
                {tabList.map((tab, i) => (
                    <TabsTrigger key={i} value={tab}>
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>
            {tabList.map((tab, i) => (
                <TabsContent key={i} value={tab}>
                    <div className="p-4 bg-muted/30 rounded-lg min-h-24">
                        {children || (
                            <span className="text-muted-foreground text-sm">
                                Content for {tab}
                            </span>
                        )}
                    </div>
                </TabsContent>
            ))}
        </Tabs>
    );
};
