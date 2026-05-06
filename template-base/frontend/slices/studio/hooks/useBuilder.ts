import { useState } from 'react';
import type { BuilderData, BuilderProject } from '../ui/types';

export function useBuilder() {
    const [data, setData] = useState<BuilderData>({
        isLoading: false,
        projects: [
            {
                id: '1',
                name: 'Main Website',
                lastModified: Date.now() - 1000 * 60 * 60 * 2,
                pageCount: 12,
                status: 'published',
                thumbnail: '', // Could be a real URL in prod
                url: 'https://mysite.com'
            },
            {
                id: '2',
                name: 'Landing Page Campaign',
                lastModified: Date.now() - 1000 * 60 * 60 * 24 * 3,
                pageCount: 1,
                status: 'draft',
                thumbnail: ''
            }
        ],
        templates: [
            {
                id: 't1',
                name: 'SaaS Product Landing',
                category: 'Marketing',
                description: 'Premium dark SaaS page with proof, pricing, and an operator-style dashboard story.',
                thumbnail: 'linear-gradient(135deg, #0f172a 0%, #111827 45%, #22d3ee 100%)'
            },
            {
                id: 't2',
                name: 'Agency Studio',
                category: 'Creative',
                description: 'Editorial agency launch page with case studies, process blocks, and a stronger visual stance.',
                thumbnail: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 55%, #f59e0b 100%)'
            },
            {
                id: 't3',
                name: 'Personal Portfolio',
                category: 'Portfolio',
                description: 'High-signal personal site with selected work, experience framing, and client proof.',
                thumbnail: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #38bdf8 100%)'
            },
            {
                id: 't4',
                name: 'Startup Pitch',
                category: 'Investor',
                description: 'Investor-style narrative page built around problem, solution, traction, and the next raise.',
                thumbnail: 'linear-gradient(135deg, #0a0a0a 0%, #171717 55%, #bef264 100%)'
            },
            {
                id: 't5',
                name: 'Mobile App Landing',
                category: 'App',
                description: 'Mobile-first launch page with app-store CTAs, proof cards, and stronger feature framing.',
                thumbnail: 'linear-gradient(135deg, #082f49 0%, #0f172a 55%, #22d3ee 100%)'
            },
            {
                id: 't6',
                name: 'Streaming Platform',
                category: 'Entertainment',
                description: 'The detailed Netflix-style template that already felt closest to a real product surface.',
                thumbnail: 'linear-gradient(135deg, #000000 0%, #111111 55%, #dc2626 100%)'
            },
        ]
    });

    const createProject = () => {
        // Mock create
        const newProject: BuilderProject = {
            id: Math.random().toString(),
            name: 'Untitled Project ' + (data.projects.length + 1),
            lastModified: Date.now(),
            pageCount: 1,
            status: 'draft'
        };
        setData(prev => ({
            ...prev,
            projects: [newProject, ...prev.projects]
        }));
    };

    return {
        data,
        createProject
    };
}
