/* eslint-disable max-lines */

import { createTemplate } from '../shared';

const createWaitlistComingSoonTemplate = () => createTemplate({
    'page': { type: 'section', props: { path: '/', className: 'bg-zinc-950 text-white' }, children: ['wrap'] },
    'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['hero', 'benefits', 'roadmap', 'founder'] },
    'hero': { type: 'div', props: { className: 'px-8 py-20 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.22),_transparent_30%)]' }, children: ['hero-inner'] },
    'hero-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col items-center text-center gap-6' }, children: ['badge', 'title', 'body', 'actions', 'hero-proof'] },
    'badge': { type: 'text', props: { tag: 'span', content: 'Private launch / limited access', className: 'inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.28em] text-cyan-300' }, children: [] },
    'title': { type: 'text', props: { tag: 'h1', content: 'A waitlist page should feel like a credible product launch, not a temporary holding screen.', className: 'max-w-4xl text-5xl md:text-6xl font-black leading-[1.02] tracking-tight' }, children: [] },
    'body': { type: 'text', props: { tag: 'p', content: 'This version leads with product promise, early-access benefits, and a stronger sense of momentum so the page feels like a real launch motion.', className: 'max-w-2xl text-lg leading-8 text-zinc-300' }, children: [] },
    'actions': { type: 'div', props: { className: 'flex flex-row gap-4 flex-wrap justify-center' }, children: ['join-btn', 'deck-btn'] },
    'join-btn': { type: 'button', props: { text: 'Join the Waitlist', size: 'lg', className: 'bg-white text-zinc-950 hover:bg-zinc-100 font-semibold px-8' }, children: [] },
    'deck-btn': { type: 'button', props: { text: 'See What Is Coming', variant: 'outline', size: 'lg', className: 'border-white/20 text-white hover:bg-white/10 px-8' }, children: [] },
    'hero-proof': { type: 'grid', props: { columns: '3', gap: 'sm', className: 'w-full max-w-3xl pt-2' }, children: ['hero-proof-1', 'hero-proof-2', 'hero-proof-3'] },
    'hero-proof-1': { type: 'card', props: { title: '2,800+', description: 'People on the early-access list already.', className: 'bg-white/5 border border-white/10 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'hero-proof-2': { type: 'card', props: { title: '14 partners', description: 'Design partners helping shape the first release.', className: 'bg-white/5 border border-white/10 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'hero-proof-3': { type: 'card', props: { title: 'Q3 launch', description: 'Rolling invites with weekly feature drops.', className: 'bg-white/5 border border-white/10 rounded-[1.75rem] p-5 h-full' }, children: [] },

    'benefits': { type: 'div', props: { className: 'px-8 py-20 border-t border-zinc-900' }, children: ['benefits-inner'] },
    'benefits-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto flex flex-col gap-10' }, children: ['benefits-head', 'benefits-grid'] },
    'benefits-head': { type: 'div', props: { className: 'max-w-3xl flex flex-col gap-4' }, children: ['benefits-label', 'benefits-title', 'benefits-copy'] },
    'benefits-label': { type: 'text', props: { tag: 'span', content: 'Why join early', className: 'text-xs uppercase tracking-[0.24em] text-cyan-300' }, children: [] },
    'benefits-title': { type: 'text', props: { tag: 'h2', content: 'Early access should come with reasons people care about.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'benefits-copy': { type: 'text', props: { tag: 'p', content: 'Use these blocks to make the product feel specific and real instead of vague. The page now sells momentum, influence, and practical upside.', className: 'text-lg text-zinc-400 leading-8' }, children: [] },
    'benefits-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['benefit-1', 'benefit-2', 'benefit-3'] },
    'benefit-1': { type: 'card', props: { title: 'Priority onboarding', description: 'Early users get white-glove setup and direct product support.', className: 'bg-zinc-900 border border-zinc-800 rounded-[2rem] p-7 h-full' }, children: [] },
    'benefit-2': { type: 'card', props: { title: 'Influence roadmap', description: 'Shape what ships next through direct feedback loops with the team.', className: 'bg-zinc-900 border border-zinc-800 rounded-[2rem] p-7 h-full' }, children: [] },
    'benefit-3': { type: 'card', props: { title: 'Founder pricing', description: 'Lock in launch pricing before public plans go live.', className: 'bg-zinc-900 border border-zinc-800 rounded-[2rem] p-7 h-full' }, children: [] },

    'roadmap': { type: 'div', props: { className: 'px-8 py-20 bg-zinc-900/60' }, children: ['roadmap-inner'] },
    'roadmap-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start' }, children: ['roadmap-copy', 'roadmap-grid'] },
    'roadmap-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['roadmap-label', 'roadmap-title', 'roadmap-body'] },
    'roadmap-label': { type: 'text', props: { tag: 'span', content: 'Launch timeline', className: 'text-xs uppercase tracking-[0.24em] text-cyan-300' }, children: [] },
    'roadmap-title': { type: 'text', props: { tag: 'h2', content: 'Show what is shipping next so the launch feels active, not vague.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'roadmap-body': { type: 'text', props: { tag: 'p', content: 'Strong waitlist pages reduce ambiguity. They tell users what stage the product is in and why now is the right moment to join.', className: 'text-lg text-zinc-400 leading-8' }, children: [] },
    'roadmap-grid': { type: 'grid', props: { columns: '3', gap: 'sm', className: '' }, children: ['roadmap-1', 'roadmap-2', 'roadmap-3'] },
    'roadmap-1': { type: 'card', props: { title: 'Now', description: 'Private alpha with partner teams and onboarding support.', className: 'bg-zinc-950 border border-zinc-800 rounded-[1.75rem] p-6 h-full' }, children: [] },
    'roadmap-2': { type: 'card', props: { title: 'Next', description: 'Invite wave two with templates, analytics, and workspace roles.', className: 'bg-zinc-950 border border-zinc-800 rounded-[1.75rem] p-6 h-full' }, children: [] },
    'roadmap-3': { type: 'card', props: { title: 'Public', description: 'General launch with self-serve signup and paid plans.', className: 'bg-zinc-950 border border-zinc-800 rounded-[1.75rem] p-6 h-full' }, children: [] },

    'founder': { type: 'div', props: { className: 'px-8 py-24' }, children: ['founder-inner'] },
    'founder-inner': { type: 'div', props: { className: 'max-w-5xl mx-auto rounded-[2.5rem] border border-zinc-800 bg-white text-zinc-950 p-10 md:p-14 grid lg:grid-cols-[1fr_0.8fr] gap-8 items-start' }, children: ['founder-copy', 'founder-card'] },
    'founder-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['founder-label', 'founder-title', 'founder-body'] },
    'founder-label': { type: 'text', props: { tag: 'span', content: 'Founder note', className: 'text-xs uppercase tracking-[0.24em] text-zinc-500' }, children: [] },
    'founder-title': { type: 'text', props: { tag: 'h2', content: 'People join waitlists when the page feels like the beginning of something credible.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'founder-body': { type: 'text', props: { tag: 'p', content: 'This final section gives you a closing narrative, another conversion surface, and a clear explanation of what early users actually get in return for their trust.', className: 'text-lg text-zinc-700 leading-8' }, children: [] },
    'founder-card': { type: 'card', props: { title: 'Launch pack', description: 'Priority invite, founder update emails, roadmap previews, and discounted first-year pricing.', className: 'bg-zinc-950 text-white rounded-[2rem] p-8 h-full border-0' }, children: [] },
  });

export default createWaitlistComingSoonTemplate;
