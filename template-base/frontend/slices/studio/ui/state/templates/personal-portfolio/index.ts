/* eslint-disable max-lines */

import { createTemplate } from '../shared';

const createPersonalPortfolioTemplate = () => createTemplate({
    'page': { type: 'section', props: { path: '/', className: 'bg-slate-950 text-slate-100' }, children: ['wrap'] },
    'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['nav', 'hero', 'projects', 'experience', 'proof', 'contact'] },
    'nav': { type: 'div', props: { className: 'max-w-5xl mx-auto w-full flex flex-row items-center justify-between px-8 py-6' }, children: ['brand', 'links'] },
    'brand': { type: 'text', props: { tag: 'span', content: 'RIZKY FADEL', className: 'text-sm font-black tracking-[0.32em] text-sky-300' }, children: [] },
    'links': { type: 'div', props: { className: 'flex flex-row gap-4 text-sm text-slate-400' }, children: ['link-1', 'link-2', 'link-3'] },
    'link-1': { type: 'text', props: { tag: 'span', content: 'Projects', className: 'hover:text-white cursor-pointer transition-colors' }, children: [] },
    'link-2': { type: 'text', props: { tag: 'span', content: 'Writing', className: 'hover:text-white cursor-pointer transition-colors' }, children: [] },
    'link-3': { type: 'text', props: { tag: 'span', content: 'Contact', className: 'hover:text-white cursor-pointer transition-colors' }, children: [] },

    'hero': { type: 'div', props: { className: 'px-8 pt-8 pb-20' }, children: ['hero-shell'] },
    'hero-shell': { type: 'div', props: { className: 'max-w-5xl mx-auto grid lg:grid-cols-[0.7fr_1.3fr] gap-10 items-start' }, children: ['hero-left', 'hero-right'] },
    'hero-left': { type: 'div', props: { className: 'rounded-[2rem] border border-slate-800 bg-slate-900 p-6 flex flex-col gap-5' }, children: ['avatar', 'availability', 'social-proof'] },
    'avatar': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80', alt: 'Portrait', className: 'w-full rounded-[1.5rem] object-cover' }, children: [] },
    'availability': { type: 'card', props: { title: 'Available Q2', description: 'Product design systems, growth landing pages, and frontend architecture support.', className: 'bg-slate-950 border border-slate-800 rounded-[1.5rem] p-5' }, children: [] },
    'social-proof': { type: 'card', props: { title: '7 yrs', description: 'Shipping web products for startup, fintech, and internal tools.', className: 'bg-slate-950 border border-slate-800 rounded-[1.5rem] p-5' }, children: [] },
    'hero-right': { type: 'div', props: { className: 'flex flex-col gap-6 pt-2' }, children: ['eyebrow', 'title', 'summary', 'hero-actions', 'stat-grid'] },
    'eyebrow': { type: 'text', props: { tag: 'span', content: 'Product-minded frontend engineer and interface designer', className: 'text-xs uppercase tracking-[0.28em] text-sky-300' }, children: [] },
    'title': { type: 'text', props: { tag: 'h1', content: 'I design and build interfaces that feel sharp, clear, and commercially useful.', className: 'text-5xl md:text-6xl font-black leading-[1.02] tracking-tight' }, children: [] },
    'summary': { type: 'text', props: { tag: 'p', content: 'My sweet spot is turning fuzzy product direction into a system that can scale across acquisition pages, in-app surfaces, and the content team that updates them later.', className: 'max-w-2xl text-lg leading-8 text-slate-400' }, children: [] },
    'hero-actions': { type: 'div', props: { className: 'flex flex-row gap-4 flex-wrap' }, children: ['action-1', 'action-2'] },
    'action-1': { type: 'button', props: { text: 'See Selected Work', size: 'lg', className: 'bg-white text-slate-950 hover:bg-slate-100 font-semibold px-8' }, children: [] },
    'action-2': { type: 'button', props: { text: 'Download CV', variant: 'outline', size: 'lg', className: 'border-slate-700 text-white hover:bg-slate-900 px-8' }, children: [] },
    'stat-grid': { type: 'grid', props: { columns: '3', gap: 'sm', className: '' }, children: ['stat-1', 'stat-2', 'stat-3'] },
    'stat-1': { type: 'card', props: { title: '18 launches', description: 'Across B2B SaaS, internal tools, and content systems.', className: 'bg-slate-900 border border-slate-800 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'stat-2': { type: 'card', props: { title: '+27%', description: 'Average uplift on landing page conversion after redesign.', className: 'bg-slate-900 border border-slate-800 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'stat-3': { type: 'card', props: { title: '3 teams', description: 'Currently supporting product, growth, and content workflows.', className: 'bg-slate-900 border border-slate-800 rounded-[1.75rem] p-5 h-full' }, children: [] },

    'projects': { type: 'div', props: { className: 'px-8 py-20 border-t border-slate-900' }, children: ['projects-inner'] },
    'projects-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-10' }, children: ['projects-title', 'projects-grid'] },
    'projects-title': { type: 'text', props: { tag: 'h2', content: 'Selected projects', className: 'text-3xl font-black tracking-tight' }, children: [] },
    'projects-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['project-1', 'project-2', 'project-3'] },
    'project-1': { type: 'card', props: { title: 'SignalOS Relaunch', description: 'Repositioned a revenue ops product and shipped a new marketing system in 5 weeks.', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden h-full' }, children: [] },
    'project-2': { type: 'card', props: { title: 'Orbital CRM', description: 'Created a modular in-app workspace layout with better onboarding and team adoption.', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden h-full' }, children: [] },
    'project-3': { type: 'card', props: { title: 'North Current Commerce', description: 'Built a premium storytelling layer for a product launch with stronger conversion flow.', imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden h-full' }, children: [] },

    'experience': { type: 'div', props: { className: 'px-8 py-20 bg-slate-900/50' }, children: ['experience-inner'] },
    'experience-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start' }, children: ['experience-copy', 'experience-list'] },
    'experience-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['experience-label', 'experience-title', 'experience-body'] },
    'experience-label': { type: 'text', props: { tag: 'span', content: 'How I work', className: 'text-xs uppercase tracking-[0.24em] text-sky-300' }, children: [] },
    'experience-title': { type: 'text', props: { tag: 'h2', content: 'I bridge product narrative, interface detail, and implementation reality.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'experience-body': { type: 'text', props: { tag: 'p', content: 'That usually means shaping the story, translating it into a design system, and then staying close enough to engineering that the final output still feels deliberate.', className: 'text-lg text-slate-400 leading-8' }, children: [] },
    'experience-list': { type: 'grid', props: { columns: '1', gap: 'sm', className: '' }, children: ['experience-1', 'experience-2', 'experience-3'] },
    'experience-1': { type: 'card', props: { title: 'Lead Product Designer, Northstar', description: 'Owned growth surfaces, lifecycle experiments, and CMS handoff patterns for a 50-person team.', className: 'bg-slate-950 border border-slate-800 rounded-[1.75rem] p-6 h-full' }, children: [] },
    'experience-2': { type: 'card', props: { title: 'Senior Frontend Engineer, Orbit', description: 'Built reusable component architecture for product and marketing without divergence.', className: 'bg-slate-950 border border-slate-800 rounded-[1.75rem] p-6 h-full' }, children: [] },
    'experience-3': { type: 'card', props: { title: 'Independent Partner', description: 'Currently working with product teams that need sharper narrative, stronger UI, and faster shipping.', className: 'bg-slate-950 border border-slate-800 rounded-[1.75rem] p-6 h-full' }, children: [] },

    'proof': { type: 'div', props: { className: 'px-8 py-20 border-t border-slate-900' }, children: ['proof-inner'] },
    'proof-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start' }, children: ['proof-quote', 'proof-note'] },
    'proof-quote': { type: 'div', props: { className: 'rounded-[2rem] bg-white text-slate-950 p-8 flex flex-col gap-4' }, children: ['proof-label', 'proof-body', 'proof-author'] },
    'proof-label': { type: 'text', props: { tag: 'span', content: 'Client feedback', className: 'text-xs uppercase tracking-[0.24em] text-slate-600' }, children: [] },
    'proof-body': { type: 'text', props: { tag: 'p', content: '"Rizky helped us tighten the product story, simplify the interface, and still keep the build practical. The final result felt more expensive than our stage."', className: 'text-2xl leading-10 font-semibold' }, children: [] },
    'proof-author': { type: 'text', props: { tag: 'p', content: 'Helena M., VP Product at Arcwell', className: 'text-sm text-slate-600' }, children: [] },
    'proof-note': { type: 'card', props: { title: 'Stack I use', description: 'Next.js, TypeScript, Tailwind, Convex, Figma, design systems, narrative architecture.', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] p-8 h-full' }, children: [] },

    'contact': { type: 'div', props: { className: 'px-8 py-24' }, children: ['contact-inner'] },
    'contact-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto rounded-[2.5rem] border border-slate-800 bg-gradient-to-r from-sky-400 to-cyan-300 p-10 md:p-14 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center' }, children: ['contact-copy', 'contact-button'] },
    'contact-copy': { type: 'div', props: { className: 'max-w-2xl flex flex-col gap-4' }, children: ['contact-title', 'contact-body'] },
    'contact-title': { type: 'text', props: { tag: 'h2', content: 'Need a product launch or interface system that feels more intentional?', className: 'text-4xl font-black text-slate-950 tracking-tight' }, children: [] },
    'contact-body': { type: 'text', props: { tag: 'p', content: 'I take on a limited number of collaborations where design and implementation need to stay tightly connected.', className: 'text-lg text-slate-900/80 leading-8' }, children: [] },
    'contact-button': { type: 'button', props: { text: 'Book Intro', size: 'lg', className: 'bg-slate-950 text-white hover:bg-black font-semibold px-8' }, children: [] },
  });

export default createPersonalPortfolioTemplate;
