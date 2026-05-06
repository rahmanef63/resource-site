/* eslint-disable max-lines */

import { createTemplate } from '../shared';

const createMobileAppLandingTemplate = () => createTemplate({
    'page': { type: 'section', props: { path: '/', className: 'bg-slate-950 text-white' }, children: ['wrap'] },
    'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['nav', 'hero', 'features', 'reviews', 'download'] },
    'nav': { type: 'div', props: { className: 'max-w-6xl mx-auto w-full flex flex-row items-center justify-between px-8 py-6' }, children: ['brand', 'nav-links', 'nav-cta'] },
    'brand': { type: 'text', props: { tag: 'span', content: 'PULSE APP', className: 'text-sm font-black tracking-[0.3em] text-cyan-300' }, children: [] },
    'nav-links': { type: 'div', props: { className: 'hidden md:flex flex-row gap-6 text-sm text-slate-400' }, children: ['nav-1', 'nav-2', 'nav-3'] },
    'nav-1': { type: 'text', props: { tag: 'span', content: 'Features', className: 'hover:text-white cursor-pointer transition-colors' }, children: [] },
    'nav-2': { type: 'text', props: { tag: 'span', content: 'Reviews', className: 'hover:text-white cursor-pointer transition-colors' }, children: [] },
    'nav-3': { type: 'text', props: { tag: 'span', content: 'Download', className: 'hover:text-white cursor-pointer transition-colors' }, children: [] },
    'nav-cta': { type: 'button', props: { text: 'Pre-order', variant: 'outline', className: 'border-slate-700 text-white hover:bg-slate-900' }, children: [] },

    'hero': { type: 'div', props: { className: 'px-8 pt-8 pb-20' }, children: ['hero-shell'] },
    'hero-shell': { type: 'div', props: { className: 'max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-10 items-center' }, children: ['hero-copy', 'hero-phones'] },
    'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-6' }, children: ['hero-kicker', 'hero-title', 'hero-body', 'hero-actions', 'hero-proof'] },
    'hero-kicker': { type: 'text', props: { tag: 'span', content: 'Daily coordination without the noise', className: 'text-xs uppercase tracking-[0.28em] text-cyan-300' }, children: [] },
    'hero-title': { type: 'text', props: { tag: 'h1', content: 'The mobile workspace for teams that need clarity while moving fast.', className: 'text-5xl md:text-6xl font-black leading-[1.02] tracking-tight max-w-3xl' }, children: [] },
    'hero-body': { type: 'text', props: { tag: 'p', content: 'Pulse keeps tasks, approvals, chat, and live performance in one mobile rhythm so teams stay aligned without opening six tabs.', className: 'max-w-xl text-lg leading-8 text-slate-400' }, children: [] },
    'hero-actions': { type: 'div', props: { className: 'flex flex-row gap-4 flex-wrap' }, children: ['download-ios', 'download-android'] },
    'download-ios': { type: 'button', props: { text: 'App Store', size: 'lg', className: 'bg-white text-slate-950 hover:bg-slate-100 font-semibold px-8' }, children: [] },
    'download-android': { type: 'button', props: { text: 'Google Play', variant: 'outline', size: 'lg', className: 'border-slate-700 text-white hover:bg-slate-900 px-8' }, children: [] },
    'hero-proof': { type: 'grid', props: { columns: '3', gap: 'sm', className: '' }, children: ['proof-1', 'proof-2', 'proof-3'] },
    'proof-1': { type: 'card', props: { title: '4.9 stars', description: 'Average rating from 8,200+ early users.', className: 'bg-slate-900 border border-slate-800 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'proof-2': { type: 'card', props: { title: '2.4 hrs saved', description: 'Daily admin time recovered by frontline managers.', className: 'bg-slate-900 border border-slate-800 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'proof-3': { type: 'card', props: { title: '11 regions', description: 'Teams coordinating shifts and approvals across timezones.', className: 'bg-slate-900 border border-slate-800 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'hero-phones': { type: 'div', props: { className: 'grid grid-cols-2 gap-4 items-end' }, children: ['phone-1', 'phone-2'] },
    'phone-1': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=700&q=80', alt: 'Mobile screen 1', className: 'w-full rounded-[2rem] border border-white/10 shadow-2xl translate-y-8' }, children: [] },
    'phone-2': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80', alt: 'Mobile screen 2', className: 'w-full rounded-[2rem] border border-white/10 shadow-2xl' }, children: [] },

    'features': { type: 'div', props: { className: 'px-8 py-20 border-t border-slate-900' }, children: ['features-inner'] },
    'features-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto flex flex-col gap-10' }, children: ['features-head', 'features-grid'] },
    'features-head': { type: 'div', props: { className: 'max-w-3xl flex flex-col gap-4' }, children: ['features-label', 'features-title', 'features-copy'] },
    'features-label': { type: 'text', props: { tag: 'span', content: 'Built for real movement', className: 'text-xs uppercase tracking-[0.24em] text-cyan-300' }, children: [] },
    'features-title': { type: 'text', props: { tag: 'h2', content: 'All the context you need, sized for the moments that matter.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'features-copy': { type: 'text', props: { tag: 'p', content: 'Pulse is designed for managers and operators who need fast signal, clean approvals, and the ability to act while walking, commuting, or between meetings.', className: 'text-lg text-slate-400 leading-8' }, children: [] },
    'features-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['feature-1', 'feature-2', 'feature-3'] },
    'feature-1': { type: 'card', props: { title: 'Action inbox', description: 'One stream for approvals, blockers, SLA breaches, and follow-up.', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] p-7 h-full' }, children: [] },
    'feature-2': { type: 'card', props: { title: 'Live team rhythm', description: 'Track progress, shift health, and active issues without opening reports.', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] p-7 h-full' }, children: [] },
    'feature-3': { type: 'card', props: { title: 'Voice-ready capture', description: 'Log context, tasks, and notes in seconds while on the move.', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] p-7 h-full' }, children: [] },

    'reviews': { type: 'div', props: { className: 'px-8 py-20 bg-cyan-300 text-slate-950' }, children: ['reviews-inner'] },
    'reviews-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start' }, children: ['reviews-copy', 'reviews-grid'] },
    'reviews-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['reviews-label', 'reviews-title', 'reviews-body'] },
    'reviews-label': { type: 'text', props: { tag: 'span', content: 'What teams say', className: 'text-xs uppercase tracking-[0.24em] text-slate-700' }, children: [] },
    'reviews-title': { type: 'text', props: { tag: 'h2', content: 'It feels less like another app and more like getting your day back.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'reviews-body': { type: 'text', props: { tag: 'p', content: 'Teams use Pulse to stop juggling Slack, spreadsheets, and static reports when they need to make decisions quickly.', className: 'text-lg leading-8 text-slate-800' }, children: [] },
    'reviews-grid': { type: 'grid', props: { columns: '2', gap: 'sm', className: '' }, children: ['review-1', 'review-2'] },
    'review-1': { type: 'card', props: { title: 'Store ops lead', description: '"I clear approvals between sites in under five minutes now. It used to take half a morning."', className: 'bg-white rounded-[1.75rem] p-6 h-full border-0' }, children: [] },
    'review-2': { type: 'card', props: { title: 'Regional manager', description: '"The dashboard is short, decisive, and actually useful on a phone. That alone makes it rare."', className: 'bg-white rounded-[1.75rem] p-6 h-full border-0' }, children: [] },

    'download': { type: 'div', props: { className: 'px-8 py-24' }, children: ['download-inner'] },
    'download-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto rounded-[2.5rem] border border-slate-800 bg-slate-900 p-10 md:p-14 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center' }, children: ['download-copy', 'download-buttons'] },
    'download-copy': { type: 'div', props: { className: 'max-w-2xl flex flex-col gap-4' }, children: ['download-title', 'download-body'] },
    'download-title': { type: 'text', props: { tag: 'h2', content: 'Take your operating rhythm with you.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'download-body': { type: 'text', props: { tag: 'p', content: 'Available now for iOS and Android with secure sign-in, offline notes, and live sync back to your workspace.', className: 'text-lg text-slate-400 leading-8' }, children: [] },
    'download-buttons': { type: 'div', props: { className: 'flex flex-row gap-4 flex-wrap' }, children: ['download-final-ios', 'download-final-android'] },
    'download-final-ios': { type: 'button', props: { text: 'Download for iPhone', size: 'lg', className: 'bg-white text-slate-950 hover:bg-slate-100 font-semibold px-8' }, children: [] },
    'download-final-android': { type: 'button', props: { text: 'Download for Android', variant: 'outline', size: 'lg', className: 'border-slate-700 text-white hover:bg-slate-800 px-8' }, children: [] },
  });

export default createMobileAppLandingTemplate;
