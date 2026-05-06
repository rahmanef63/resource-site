/* eslint-disable max-lines */

import { createTemplate } from '../shared';

const createLocalBusinessTemplate = () => createTemplate({
    'page': { type: 'section', props: { path: '/', className: 'bg-amber-50 text-stone-950' }, children: ['wrap'] },
    'wrap': { type: 'div', props: { className: 'flex flex-col' }, children: ['hero', 'highlights', 'gallery', 'reservation'] },
    'hero': { type: 'div', props: { className: 'px-8 py-16 bg-stone-950 text-amber-50' }, children: ['hero-inner'] },
    'hero-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-10 items-center' }, children: ['hero-copy', 'hero-image'] },
    'hero-copy': { type: 'div', props: { className: 'flex flex-col gap-6' }, children: ['hero-kicker', 'hero-title', 'hero-body', 'hero-actions', 'hero-note'] },
    'hero-kicker': { type: 'text', props: { tag: 'span', content: 'Private dining and intimate events', className: 'text-xs uppercase tracking-[0.28em] text-amber-300' }, children: [] },
    'hero-title': { type: 'text', props: { tag: 'h1', content: 'A neighborhood destination designed for slow dinners and memorable nights.', className: 'text-5xl md:text-6xl font-black leading-[1.02] tracking-tight max-w-3xl' }, children: [] },
    'hero-body': { type: 'text', props: { tag: 'p', content: 'Seasonal tasting menus, warm service, and a room that feels special without trying too hard. Ideal for date nights, celebrations, and private dinners.', className: 'max-w-xl text-lg leading-8 text-stone-300' }, children: [] },
    'hero-actions': { type: 'div', props: { className: 'flex flex-row gap-4 flex-wrap' }, children: ['reserve-btn', 'menu-btn'] },
    'reserve-btn': { type: 'button', props: { text: 'Reserve a Table', size: 'lg', className: 'bg-amber-300 text-stone-950 hover:bg-amber-200 font-semibold px-8' }, children: [] },
    'menu-btn': { type: 'button', props: { text: 'View Menu', variant: 'outline', size: 'lg', className: 'border-stone-700 text-amber-50 hover:bg-stone-900 px-8' }, children: [] },
    'hero-note': { type: 'card', props: { title: 'Open Wed-Sun', description: '17.00 - 23.00. Private room available for up to 18 guests.', className: 'bg-stone-900 border border-stone-800 rounded-[1.75rem] p-5 max-w-md' }, children: [] },
    'hero-image': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', alt: 'Restaurant interior', className: 'w-full rounded-[2rem] object-cover shadow-2xl' }, children: [] },

    'highlights': { type: 'div', props: { className: 'px-8 py-20' }, children: ['highlights-inner'] },
    'highlights-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto flex flex-col gap-10' }, children: ['highlights-head', 'highlights-grid'] },
    'highlights-head': { type: 'div', props: { className: 'max-w-3xl flex flex-col gap-4' }, children: ['highlights-label', 'highlights-title', 'highlights-copy'] },
    'highlights-label': { type: 'text', props: { tag: 'span', content: 'Why people come back', className: 'text-xs uppercase tracking-[0.24em] text-stone-500' }, children: [] },
    'highlights-title': { type: 'text', props: { tag: 'h2', content: 'A local business should still feel deeply considered.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'highlights-copy': { type: 'text', props: { tag: 'p', content: 'Instead of generic service cards, the experience is framed around atmosphere, hospitality, and the details guests actually mention after the night ends.', className: 'text-lg text-stone-600 leading-8' }, children: [] },
    'highlights-grid': { type: 'grid', props: { columns: '3', gap: 'md', className: '' }, children: ['highlight-1', 'highlight-2', 'highlight-3'] },
    'highlight-1': { type: 'card', props: { title: 'Seasonal menu', description: 'A tight menu built around ingredients that change with the month and the chef’s mood.', className: 'bg-white border border-amber-200 rounded-[2rem] p-7 h-full' }, children: [] },
    'highlight-2': { type: 'card', props: { title: 'Private dining', description: 'Celebrate birthdays, client dinners, or intimate events with a dedicated room and custom pacing.', className: 'bg-white border border-amber-200 rounded-[2rem] p-7 h-full' }, children: [] },
    'highlight-3': { type: 'card', props: { title: 'Warm service', description: 'The room is elegant but relaxed, designed for regulars as much as first-timers.', className: 'bg-white border border-amber-200 rounded-[2rem] p-7 h-full' }, children: [] },

    'gallery': { type: 'div', props: { className: 'px-8 py-20 bg-stone-100' }, children: ['gallery-inner'] },
    'gallery-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start' }, children: ['gallery-copy', 'gallery-grid'] },
    'gallery-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['gallery-label', 'gallery-title', 'gallery-body'] },
    'gallery-label': { type: 'text', props: { tag: 'span', content: 'Inside the room', className: 'text-xs uppercase tracking-[0.24em] text-stone-500' }, children: [] },
    'gallery-title': { type: 'text', props: { tag: 'h2', content: 'Lighting, material, and pacing do most of the talking.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'gallery-body': { type: 'text', props: { tag: 'p', content: 'Use this template to show what a real local brand feels like: not just the service, but the mood, the trust, and the reason guests recommend it.', className: 'text-lg text-stone-600 leading-8' }, children: [] },
    'gallery-grid': { type: 'grid', props: { columns: '2', gap: 'sm', className: '' }, children: ['gallery-1', 'gallery-2', 'gallery-3', 'gallery-4'] },
    'gallery-1': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', alt: 'Dish closeup', className: 'w-full rounded-[1.5rem] object-cover' }, children: [] },
    'gallery-2': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80', alt: 'Dining scene', className: 'w-full rounded-[1.5rem] object-cover' }, children: [] },
    'gallery-3': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', alt: 'Interior detail', className: 'w-full rounded-[1.5rem] object-cover' }, children: [] },
    'gallery-4': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80', alt: 'Bar setup', className: 'w-full rounded-[1.5rem] object-cover' }, children: [] },

    'reservation': { type: 'div', props: { className: 'px-8 py-24' }, children: ['reservation-inner'] },
    'reservation-inner': { type: 'div', props: { className: 'max-w-6xl mx-auto rounded-[2.5rem] bg-stone-950 text-amber-50 p-10 md:p-14 grid lg:grid-cols-[1fr_0.8fr] gap-8 items-start' }, children: ['reservation-copy', 'reservation-card'] },
    'reservation-copy': { type: 'div', props: { className: 'flex flex-col gap-4' }, children: ['reservation-title', 'reservation-body'] },
    'reservation-title': { type: 'text', props: { tag: 'h2', content: 'Reserve an evening worth remembering.', className: 'text-4xl font-black tracking-tight' }, children: [] },
    'reservation-body': { type: 'text', props: { tag: 'p', content: 'The final section is intentionally built like a real conversion surface with hours, address, and a clear path to reserve or call.', className: 'text-lg text-stone-300 leading-8' }, children: [] },
    'reservation-card': { type: 'card', props: { title: 'Jl. Wijaya II No. 14, Jakarta Selatan', description: 'Reservations by phone or WhatsApp. Best arrival times: 18.00, 19.30, 21.00.', className: 'bg-stone-900 border border-stone-800 rounded-[2rem] p-8 h-full' }, children: [] },
  });

export default createLocalBusinessTemplate;
