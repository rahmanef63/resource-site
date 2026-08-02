/* eslint-disable max-lines */

import { createTemplate } from '../shared';

const createEventConferenceTemplate = () => createTemplate({
    'page': { type: 'section', props: { path: '/', className: 'bg-slate-950 text-white' }, children: ['wrap'] },
    'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['hero', 'speakers', 'agenda', 'tickets', 'cta'] },
    'hero': { type: 'div', props: { className: 'px-8 py-16 bg-gradient-to-br from-indigo-950 via-slate-950 to-sky-950' }, children: ['hero-inner'] },
    'hero-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-10 items-center' }, children: ['hero-copy', 'hero-side'] },
    'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-6' }, children: ['hero-kicker', 'hero-title', 'hero-body', 'hero-actions', 'hero-strip'] },
    'hero-kicker': { type: 'text', props: { tag: 'span', content: 'Jakarta / 15-16 August / 1,200 builders', className: 'text-xs uppercase tracking-[0.28em] text-sky-300' }, children: [] },
    'hero-title': { type: 'text', props: { tag: 'h1', content: 'A conference page should feel like a real event, not a placeholder poster.', className: 'text-5xl md:text-6xl font-black leading-[1.02] tracking-tight max-w-3xl' }, children: [] },
    'hero-body': { type: 'text', props: { tag: 'p', content: 'This template is structured for ticket urgency, keynote credibility, and a schedule that actually helps attendees decide to register.', className: 'max-w-2xl text-lg leading-8 text-slate-300' }, children: [] },
    'hero-actions': { type: 'div', props: { className: 'flex flex-row gap-4 flex-wrap' }, children: ['hero-primary', 'hero-secondary'] },
    'hero-primary': { type: 'button', props: { text: 'Get Tickets', size: 'lg', className: 'bg-white text-slate-950 hover:bg-slate-100 font-semibold px-8' }, children: [] },
    'hero-secondary': { type: 'button', props: { text: 'See Agenda', variant: 'outline', size: 'lg', className: 'border-white/20 text-white hover:bg-white/10 px-8' }, children: [] },
    'hero-strip': { type: 'grid', props: { columns: '3', gap: 'sm', className: '' }, children: ['hero-strip-1', 'hero-strip-2', 'hero-strip-3'] },
    'hero-strip-1': { type: 'card', props: { title: '28 talks', description: 'Product, AI infrastructure, design systems, and growth.', className: 'bg-white/10 border border-white/10 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'hero-strip-2': { type: 'card', props: { title: '9 workshops', description: 'Hands-on sessions with operators and builders.', className: 'bg-white/10 border border-white/10 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'hero-strip-3': { type: 'card', props: { title: '1 city guide', description: 'Optional dinner circuits and side events around the venue.', className: 'bg-white/10 border border-white/10 rounded-[1.75rem] p-5 h-full' }, children: [] },
    'hero-side': { type: 'card', props: { title: 'Tech Forward Summit 2026', description: 'Two days of keynotes, operator workshops, and networking designed for people actively shipping, scaling, and leading software products.', imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', className: 'bg-slate-900/70 border border-white/10 rounded-[2rem] overflow-hidden h-full' }, children: [] },

    'speakers': { type: 'div', props: { className: 'px-8 py-20 border-t border-slate-900' }, children: ['speakers-inner'] },
    'speakers-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto flex flex-col gap-10' }, children: ['speakers-title', 'speakers-grid'] },
    'speakers-title': { type: 'text', props: { tag: 'h2', content: 'Key speakers', className: 'text-3xl font-black tracking-tight' }, children: [] },
    'speakers-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['speaker-1', 'speaker-2', 'speaker-3'] },
    'speaker-1': { type: 'card', props: { title: 'Lina Prabowo', description: 'Chief Product Officer, RelayPay. On building category trust in regulated markets.', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden h-full' }, children: [] },
    'speaker-2': { type: 'card', props: { title: 'Marcus Reed', description: 'VP Engineering, Northstar. On scaling platform teams without slowing product velocity.', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden h-full' }, children: [] },
    'speaker-3': { type: 'card', props: { title: 'Asha Nair', description: 'Founder, Mono Studio. On designing launch narratives that survive implementation.', imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden h-full' }, children: [] },

    'agenda': { type: 'div', props: { className: 'px-8 py-20 bg-slate-900/50' }, children: ['agenda-inner'] },
    'agenda-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start' }, children: ['agenda-copy', 'agenda-grid'] },
    'agenda-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['agenda-label', 'agenda-title', 'agenda-body'] },
    'agenda-label': { type: 'text', props: { tag: 'span', content: 'Agenda', className: 'text-xs uppercase tracking-[0.24em] text-sky-300' }, children: [] },
    'agenda-title': { type: 'text', props: { tag: 'h2', content: 'A schedule that balances inspiration with practical depth.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'agenda-body': { type: 'text', props: { tag: 'p', content: 'Use agenda blocks like these to show the shape of the event quickly instead of burying it in a generic list.', className: 'text-lg text-slate-400 leading-8' }, children: [] },
    'agenda-grid': { type: 'grid', props: { columns: '3', gap: 'sm', className: '' }, children: ['agenda-1', 'agenda-2', 'agenda-3'] },
    'agenda-1': { type: 'card', props: { title: 'Day 1 / Strategy', description: 'Keynotes, market narratives, product positioning, and founder sessions.', className: 'bg-slate-950 border border-slate-800 rounded-[1.75rem] p-6 h-full' }, children: [] },
    'agenda-2': { type: 'card', props: { title: 'Day 2 / Systems', description: 'Workshops on infra, workflows, AI operations, and design systems.', className: 'bg-slate-950 border border-slate-800 rounded-[1.75rem] p-6 h-full' }, children: [] },
    'agenda-3': { type: 'card', props: { title: 'After Hours', description: 'Partner demos, curated dinners, and an operator mixer around the city.', className: 'bg-slate-950 border border-slate-800 rounded-[1.75rem] p-6 h-full' }, children: [] },

    'tickets': { type: 'div', props: { className: 'px-8 py-20 border-t border-slate-900' }, children: ['tickets-inner'] },
    'tickets-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto flex flex-col gap-10' }, children: ['tickets-title', 'tickets-grid'] },
    'tickets-title': { type: 'text', props: { tag: 'h2', content: 'Ticket tiers', className: 'text-3xl font-black tracking-tight' }, children: [] },
    'tickets-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['ticket-1', 'ticket-2', 'ticket-3'] },
    'ticket-1': { type: 'card', props: { title: 'Early Bird', description: 'Rp 799.000. Main stage access, coffee, networking floor.', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] p-7 h-full' }, children: [] },
    'ticket-2': { type: 'card', props: { title: 'Builder Pass', description: 'Rp 1.499.000. Includes workshops, recordings, and side events.', className: 'bg-white text-slate-950 rounded-[2rem] p-7 h-full border-0' }, children: [] },
    'ticket-3': { type: 'card', props: { title: 'VIP Operator', description: 'Rp 2.999.000. Dinner access, concierge, and speaker meetups.', className: 'bg-slate-900 border border-slate-800 rounded-[2rem] p-7 h-full' }, children: [] },

    'cta': { type: 'div', props: { className: 'px-8 py-24' }, children: ['cta-inner'] },
    'cta-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto rounded-[2.5rem] bg-sky-400 text-slate-950 p-10 md:p-14 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center' }, children: ['cta-copy', 'cta-button'] },
    'cta-copy': { type: 'div', props: { className: 'max-w-2xl flex flex-col gap-4' }, children: ['cta-title', 'cta-body'] },
    'cta-title': { type: 'text', props: { tag: 'h2', content: 'The point is to make the event feel real before the user ever buys a ticket.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'cta-body': { type: 'text', props: { tag: 'p', content: 'This closing section creates urgency while reinforcing what the attendee actually gets.', className: 'text-lg text-slate-900/80 leading-8' }, children: [] },
    'cta-button': { type: 'button', props: { text: 'Reserve My Spot', size: 'lg', className: 'bg-slate-950 text-white hover:bg-black px-8 font-semibold' }, children: [] },
  });

export default createEventConferenceTemplate;
