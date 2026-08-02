import React from 'react';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export interface BreadcrumbWidgetProps {
    items?: string;
    separator?: 'chevron' | 'slash';
    className?: string;
}

export const BreadcrumbWidget: React.FC<BreadcrumbWidgetProps> = ({
    items = 'Home,Products,Category,Item',
    separator = 'chevron',
    className,
}) => {
    const crumbs = Array.isArray(items)
        ? (items as unknown[]).map(String).filter(Boolean)
        : typeof items === 'string'
        ? items.split(',').map(c => c.trim()).filter(Boolean)
        : [];

    return (
        <Breadcrumb className={cn('', className)}>
            <BreadcrumbList>
                {crumbs.map((crumb, i) => (
                    <React.Fragment key={i}>
                        <BreadcrumbItem>
                            {i < crumbs.length - 1 ? (
                                <BreadcrumbLink href="#">{crumb}</BreadcrumbLink>
                            ) : (
                                <BreadcrumbPage>{crumb}</BreadcrumbPage>
                            )}
                        </BreadcrumbItem>
                        {i < crumbs.length - 1 && (
                            <BreadcrumbSeparator>
                                {separator === 'slash' ? '/' : undefined}
                            </BreadcrumbSeparator>
                        )}
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};
