/* eslint-disable max-lines */

const createStreamingPlatformTemplate = () => ({
    version: '0.4',
    root: ['page'],
    nodes: {
      // ── Page root ──────────────────────────────────────────────────────
      'page': { type: 'section', props: { path: '/', className: 'bg-black text-white min-h-screen font-sans' }, children: ['nav', 'hero', 'content-area'] },

      // ── Navigation ─────────────────────────────────────────────────────
      'nav': {
        type: 'div',
        props: { className: 'flex flex-row relative z-30 items-center justify-between px-10 py-4 bg-gradient-to-b from-black/95 to-transparent' },
        children: ['nav-logo', 'nav-links', 'nav-right'],
      },
      'nav-logo': { type: 'text', props: { tag: 'span', content: 'STREAMSPACE', className: 'text-red-600 font-black text-2xl tracking-widest cursor-pointer select-none' }, children: [] },
      'nav-links': {
        type: 'div',
        props: { className: 'flex flex-row gap-7 text-sm font-medium' },
        children: ['nav-home', 'nav-shows', 'nav-movies', 'nav-new', 'nav-kids'],
      },
      'nav-home':   { type: 'text', props: { tag: 'span', content: 'Home',         className: 'cursor-pointer hover:text-gray-300 transition-colors' }, children: [] },
      'nav-shows':  { type: 'text', props: { tag: 'span', content: 'TV Shows',     className: 'text-gray-400 cursor-pointer hover:text-white transition-colors' }, children: [] },
      'nav-movies': { type: 'text', props: { tag: 'span', content: 'Movies',       className: 'text-gray-400 cursor-pointer hover:text-white transition-colors' }, children: [] },
      'nav-new':    { type: 'text', props: { tag: 'span', content: 'New & Popular',className: 'text-gray-400 cursor-pointer hover:text-white transition-colors' }, children: [] },
      'nav-kids':   { type: 'text', props: { tag: 'span', content: 'Kids',         className: 'text-gray-400 cursor-pointer hover:text-white transition-colors' }, children: [] },
      'nav-right': {
        type: 'div',
        props: { className: 'flex flex-row gap-4 items-center' },
        children: ['nav-search-btn', 'nav-notif', 'nav-avatar'],
      },
      'nav-search-btn': { type: 'button', props: { text: '🔍', variant: 'ghost', className: 'text-white hover:text-gray-300 px-2' }, children: [] },
      'nav-notif':      { type: 'button', props: { text: '🔔', variant: 'ghost', className: 'text-white hover:text-gray-300 px-2' }, children: [] },
      'nav-avatar': {
        type: 'div',
        props: { className: 'w-8 h-8 rounded bg-red-600 flex items-center justify-center text-xs font-bold cursor-pointer' },
        children: ['nav-avatar-letter'],
      },
      'nav-avatar-letter': { type: 'text', props: { tag: 'span', content: 'U', className: 'text-white font-bold text-sm' }, children: [] },

      // ── Hero ───────────────────────────────────────────────────────────
      'hero': {
        type: 'div',
        props: { className: 'relative -mt-16 h-[85vh] min-h-[520px] overflow-hidden' },
        children: ['hero-bg', 'hero-overlay-left', 'hero-overlay-bottom', 'hero-content'],
      },
      'hero-bg': {
        type: 'image',
        props: {
          src: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80',
          alt: 'Featured show backdrop',
          className: 'w-full h-full object-cover object-center',
        },
        children: [],
      },
      'hero-overlay-left': {
        type: 'div',
        props: { className: 'absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent' },
        children: [],
      },
      'hero-overlay-bottom': {
        type: 'div',
        props: { className: 'absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent' },
        children: [],
      },
      'hero-content': {
        type: 'div',
        props: { className: 'absolute bottom-32 left-12 flex flex-col gap-5 max-w-lg' },
        children: ['hero-badge', 'hero-title', 'hero-meta', 'hero-desc', 'hero-actions', 'hero-rating'],
      },
      'hero-badge': {
        type: 'div',
        props: { className: 'flex flex-row items-center gap-2' },
        children: ['hero-badge-icon', 'hero-badge-text'],
      },
      'hero-badge-icon': { type: 'text', props: { tag: 'span', content: '🔥', className: 'text-lg' }, children: [] },
      'hero-badge-text': { type: 'text', props: { tag: 'span', content: '#1 in Indonesia Today', className: 'text-sm font-semibold text-orange-400 tracking-wide' }, children: [] },
      'hero-title': {
        type: 'text',
        props: { tag: 'h1', content: 'The Last Frontier', className: 'text-5xl font-black leading-none tracking-tight drop-shadow-2xl' },
        children: [],
      },
      'hero-meta': {
        type: 'div',
        props: { className: 'flex flex-row gap-3 items-center text-sm text-gray-300' },
        children: ['hero-year', 'hero-rating-badge', 'hero-seasons', 'hero-quality'],
      },
      'hero-year':         { type: 'text', props: { tag: 'span', content: '2024',           className: 'text-green-400 font-semibold' }, children: [] },
      'hero-rating-badge': { type: 'text', props: { tag: 'span', content: '18+',            className: 'border border-gray-500 px-1 py-0.5 text-xs rounded' }, children: [] },
      'hero-seasons':      { type: 'text', props: { tag: 'span', content: '2 Seasons',      className: '' }, children: [] },
      'hero-quality':      { type: 'text', props: { tag: 'span', content: '4K Ultra HD',    className: 'border border-gray-500 px-1 py-0.5 text-xs rounded' }, children: [] },
      'hero-desc': {
        type: 'text',
        props: {
          tag: 'p',
          content: 'Five strangers stranded on a mountain after a helicopter crash. Zero resources. One secret that could get them all killed. A gripping survival thriller where no one is who they seem.',
          className: 'text-gray-300 text-sm leading-relaxed line-clamp-3',
        },
        children: [],
      },
      'hero-actions': {
        type: 'div',
        props: { className: 'flex flex-row gap-3' },
        children: ['btn-play', 'btn-info', 'btn-add'],
      },
      'btn-play': {
        type: 'button',
        props: { text: '▶  Play', className: 'bg-white text-black font-bold hover:bg-gray-200 px-7 py-2 rounded text-sm' },
        children: [],
      },
      'btn-info': {
        type: 'button',
        props: { text: 'ⓘ  More Info', className: 'bg-gray-600/80 text-white hover:bg-gray-600 px-7 py-2 rounded text-sm font-medium' },
        children: [],
      },
      'btn-add': {
        type: 'button',
        props: { text: '+ My List', variant: 'ghost', className: 'text-white border border-gray-600 hover:border-white px-5 py-2 rounded text-sm' },
        children: [],
      },
      'hero-rating': {
        type: 'div',
        props: { className: 'flex flex-row items-center gap-2' },
        children: ['hero-stars', 'hero-score'],
      },
      'hero-stars': { type: 'text', props: { tag: 'span', content: '★★★★½', className: 'text-yellow-400 text-sm' }, children: [] },
      'hero-score': { type: 'text', props: { tag: 'span', content: '9.1 / 10', className: 'text-gray-400 text-xs' }, children: [] },

      // ── Content Area ───────────────────────────────────────────────────
      'content-area': {
        type: 'div',
        props: { className: 'flex flex-col gap-12 px-10 pb-20 -mt-32 relative z-10 bg-gradient-to-b from-transparent to-black' },
        children: ['row-continue', 'row-trending', 'row-originals', 'row-new', 'categories'],
      },

      // ── Continue Watching ──────────────────────────────────────────────
      'row-continue': {
        type: 'div',
        props: { className: 'flex flex-col gap-4' },
        children: ['row-continue-hdr', 'row-continue-cards'],
      },
      'row-continue-hdr': {
        type: 'div',
        props: { className: 'flex flex-row items-baseline gap-3' },
        children: ['row-continue-title', 'row-continue-see-all'],
      },
      'row-continue-title':   { type: 'text', props: { tag: 'h3', content: 'Continue Watching', className: 'text-lg font-bold' }, children: [] },
      'row-continue-see-all': { type: 'text', props: { tag: 'span', content: 'See all ›', className: 'text-blue-400 text-xs cursor-pointer hover:underline' }, children: [] },
      'row-continue-cards': {
        type: 'div',
        props: { className: 'flex flex-row gap-3 overflow-x-auto pb-1 scrollbar-hide' },
        children: ['cw-1', 'cw-2', 'cw-3', 'cw-4', 'cw-5'],
      },

      // Continue Watching cards (each has thumbnail + progress bar)
      'cw-1': { type: 'div', props: { className: 'flex-shrink-0 w-52 rounded-md overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform group' }, children: ['cw-1-img', 'cw-1-info', 'cw-1-bar'] },
      'cw-1-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=225&q=80', alt: 'Dark Matter', className: 'w-full h-28 object-cover' }, children: [] },
      'cw-1-info': { type: 'div', props: { className: 'p-2' }, children: ['cw-1-name', 'cw-1-ep'] },
      'cw-1-name': { type: 'text', props: { tag: 'p', content: 'Dark Matter',   className: 'text-xs font-semibold truncate' }, children: [] },
      'cw-1-ep':   { type: 'text', props: { tag: 'p', content: 'S2 E4 · 38m left', className: 'text-[10px] text-gray-400' }, children: [] },
      'cw-1-bar':  { type: 'div', props: { className: 'h-0.5 bg-gray-700 mx-2 mb-2 rounded' }, children: ['cw-1-prog'] },
      'cw-1-prog': { type: 'div', props: { className: 'h-full w-3/5 bg-red-600 rounded' }, children: [] },

      'cw-2': { type: 'div', props: { className: 'flex-shrink-0 w-52 rounded-md overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['cw-2-img', 'cw-2-info', 'cw-2-bar'] },
      'cw-2-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&h=225&q=80', alt: 'Neon City', className: 'w-full h-28 object-cover' }, children: [] },
      'cw-2-info': { type: 'div', props: { className: 'p-2' }, children: ['cw-2-name', 'cw-2-ep'] },
      'cw-2-name': { type: 'text', props: { tag: 'p', content: 'Neon City',     className: 'text-xs font-semibold truncate' }, children: [] },
      'cw-2-ep':   { type: 'text', props: { tag: 'p', content: 'S1 E7 · 52m left', className: 'text-[10px] text-gray-400' }, children: [] },
      'cw-2-bar':  { type: 'div', props: { className: 'h-0.5 bg-gray-700 mx-2 mb-2 rounded' }, children: ['cw-2-prog'] },
      'cw-2-prog': { type: 'div', props: { className: 'h-full w-1/4 bg-red-600 rounded' }, children: [] },

      'cw-3': { type: 'div', props: { className: 'flex-shrink-0 w-52 rounded-md overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['cw-3-img', 'cw-3-info', 'cw-3-bar'] },
      'cw-3-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1512400930990-e0bc0f170a89?auto=format&fit=crop&w=400&h=225&q=80', alt: 'The Void', className: 'w-full h-28 object-cover' }, children: [] },
      'cw-3-info': { type: 'div', props: { className: 'p-2' }, children: ['cw-3-name', 'cw-3-ep'] },
      'cw-3-name': { type: 'text', props: { tag: 'p', content: 'The Void',      className: 'text-xs font-semibold truncate' }, children: [] },
      'cw-3-ep':   { type: 'text', props: { tag: 'p', content: 'S3 E1 · 1h 12m left', className: 'text-[10px] text-gray-400' }, children: [] },
      'cw-3-bar':  { type: 'div', props: { className: 'h-0.5 bg-gray-700 mx-2 mb-2 rounded' }, children: ['cw-3-prog'] },
      'cw-3-prog': { type: 'div', props: { className: 'h-full w-4/5 bg-red-600 rounded' }, children: [] },

      'cw-4': { type: 'div', props: { className: 'flex-shrink-0 w-52 rounded-md overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['cw-4-img', 'cw-4-info', 'cw-4-bar'] },
      'cw-4-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=400&h=225&q=80', alt: 'Echoes', className: 'w-full h-28 object-cover' }, children: [] },
      'cw-4-info': { type: 'div', props: { className: 'p-2' }, children: ['cw-4-name', 'cw-4-ep'] },
      'cw-4-name': { type: 'text', props: { tag: 'p', content: 'Echoes',        className: 'text-xs font-semibold truncate' }, children: [] },
      'cw-4-ep':   { type: 'text', props: { tag: 'p', content: 'S1 E3 · 45m left', className: 'text-[10px] text-gray-400' }, children: [] },
      'cw-4-bar':  { type: 'div', props: { className: 'h-0.5 bg-gray-700 mx-2 mb-2 rounded' }, children: ['cw-4-prog'] },
      'cw-4-prog': { type: 'div', props: { className: 'h-full w-2/5 bg-red-600 rounded' }, children: [] },

      'cw-5': { type: 'div', props: { className: 'flex-shrink-0 w-52 rounded-md overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['cw-5-img', 'cw-5-info', 'cw-5-bar'] },
      'cw-5-img': { type: 'image', props: { src: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=400&h=225&q=80', alt: 'Signal', className: 'w-full h-28 object-cover' }, children: [] },
      'cw-5-info': { type: 'div', props: { className: 'p-2' }, children: ['cw-5-name', 'cw-5-ep'] },
      'cw-5-name': { type: 'text', props: { tag: 'p', content: 'Signal',        className: 'text-xs font-semibold truncate' }, children: [] },
      'cw-5-ep':   { type: 'text', props: { tag: 'p', content: 'S2 E9 · 22m left', className: 'text-[10px] text-gray-400' }, children: [] },
      'cw-5-bar':  { type: 'div', props: { className: 'h-0.5 bg-gray-700 mx-2 mb-2 rounded' }, children: ['cw-5-prog'] },
      'cw-5-prog': { type: 'div', props: { className: 'h-full w-9/10 bg-red-600 rounded' }, children: [] },

      // ── Trending Now ───────────────────────────────────────────────────
      'row-trending': {
        type: 'div',
        props: { className: 'flex flex-col gap-4' },
        children: ['row-trending-title', 'row-trending-cards'],
      },
      'row-trending-title': { type: 'text', props: { tag: 'h3', content: 'Trending Now', className: 'text-lg font-bold' }, children: [] },
      'row-trending-cards': {
        type: 'div',
        props: { className: 'flex flex-row gap-3 overflow-x-auto pb-1' },
        children: ['tr-1', 'tr-2', 'tr-3', 'tr-4', 'tr-5', 'tr-6'],
      },

      'tr-1': { type: 'div', props: { className: 'flex-shrink-0 w-40 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform relative' }, children: ['tr-1-img', 'tr-1-rank', 'tr-1-title'] },
      'tr-1-img':   { type: 'image', props: { src: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=300&h=450&q=80', alt: 'Poster 1', className: 'w-full h-60 object-cover rounded-md' }, children: [] },
      'tr-1-rank':  { type: 'text', props: { tag: 'span', content: '1', className: 'absolute top-2 left-2 text-4xl font-black text-white drop-shadow-lg opacity-90' }, children: [] },
      'tr-1-title': { type: 'text', props: { tag: 'p', content: 'Glass Horizon', className: 'mt-1 text-xs font-medium text-gray-300 truncate' }, children: [] },

      'tr-2': { type: 'div', props: { className: 'flex-shrink-0 w-40 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform relative' }, children: ['tr-2-img', 'tr-2-rank', 'tr-2-title'] },
      'tr-2-img':   { type: 'image', props: { src: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&w=300&h=450&q=80', alt: 'Poster 2', className: 'w-full h-60 object-cover rounded-md' }, children: [] },
      'tr-2-rank':  { type: 'text', props: { tag: 'span', content: '2', className: 'absolute top-2 left-2 text-4xl font-black text-white drop-shadow-lg opacity-90' }, children: [] },
      'tr-2-title': { type: 'text', props: { tag: 'p', content: 'Midnight Run', className: 'mt-1 text-xs font-medium text-gray-300 truncate' }, children: [] },

      'tr-3': { type: 'div', props: { className: 'flex-shrink-0 w-40 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform relative' }, children: ['tr-3-img', 'tr-3-rank', 'tr-3-title'] },
      'tr-3-img':   { type: 'image', props: { src: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&h=450&q=80', alt: 'Poster 3', className: 'w-full h-60 object-cover rounded-md' }, children: [] },
      'tr-3-rank':  { type: 'text', props: { tag: 'span', content: '3', className: 'absolute top-2 left-2 text-4xl font-black text-white drop-shadow-lg opacity-90' }, children: [] },
      'tr-3-title': { type: 'text', props: { tag: 'p', content: 'Iron Circuit', className: 'mt-1 text-xs font-medium text-gray-300 truncate' }, children: [] },

      'tr-4': { type: 'div', props: { className: 'flex-shrink-0 w-40 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform relative' }, children: ['tr-4-img', 'tr-4-rank', 'tr-4-title'] },
      'tr-4-img':   { type: 'image', props: { src: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=300&h=450&q=80', alt: 'Poster 4', className: 'w-full h-60 object-cover rounded-md' }, children: [] },
      'tr-4-rank':  { type: 'text', props: { tag: 'span', content: '4', className: 'absolute top-2 left-2 text-4xl font-black text-white drop-shadow-lg opacity-90' }, children: [] },
      'tr-4-title': { type: 'text', props: { tag: 'p', content: 'Lost Signal', className: 'mt-1 text-xs font-medium text-gray-300 truncate' }, children: [] },

      'tr-5': { type: 'div', props: { className: 'flex-shrink-0 w-40 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform relative' }, children: ['tr-5-img', 'tr-5-rank', 'tr-5-title'] },
      'tr-5-img':   { type: 'image', props: { src: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?auto=format&fit=crop&w=300&h=450&q=80', alt: 'Poster 5', className: 'w-full h-60 object-cover rounded-md' }, children: [] },
      'tr-5-rank':  { type: 'text', props: { tag: 'span', content: '5', className: 'absolute top-2 left-2 text-4xl font-black text-white drop-shadow-lg opacity-90' }, children: [] },
      'tr-5-title': { type: 'text', props: { tag: 'p', content: 'The Archive', className: 'mt-1 text-xs font-medium text-gray-300 truncate' }, children: [] },

      'tr-6': { type: 'div', props: { className: 'flex-shrink-0 w-40 rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform relative' }, children: ['tr-6-img', 'tr-6-rank', 'tr-6-title'] },
      'tr-6-img':   { type: 'image', props: { src: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=300&h=450&q=80', alt: 'Poster 6', className: 'w-full h-60 object-cover rounded-md' }, children: [] },
      'tr-6-rank':  { type: 'text', props: { tag: 'span', content: '6', className: 'absolute top-2 left-2 text-4xl font-black text-white drop-shadow-lg opacity-90' }, children: [] },
      'tr-6-title': { type: 'text', props: { tag: 'p', content: 'Neon Rebel', className: 'mt-1 text-xs font-medium text-gray-300 truncate' }, children: [] },

      // ── StreamSpace Originals ──────────────────────────────────────────
      'row-originals': {
        type: 'div',
        props: { className: 'flex flex-col gap-4' },
        children: ['row-originals-hdr', 'row-originals-cards'],
      },
      'row-originals-hdr': {
        type: 'div',
        props: { className: 'flex flex-row items-baseline gap-3' },
        children: ['row-originals-logo', 'row-originals-title'],
      },
      'row-originals-logo':  { type: 'text', props: { tag: 'span', content: 'STREAMSPACE', className: 'text-red-600 font-black text-sm' }, children: [] },
      'row-originals-title': { type: 'text', props: { tag: 'span', content: 'Originals', className: 'text-lg font-bold' }, children: [] },
      'row-originals-cards': {
        type: 'div',
        props: { className: 'flex flex-row gap-4 overflow-x-auto pb-1' },
        children: ['orig-1', 'orig-2', 'orig-3', 'orig-4'],
      },

      'orig-1': { type: 'div', props: { className: 'flex-shrink-0 w-64 rounded-lg overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['orig-1-img', 'orig-1-body'] },
      'orig-1-img':  { type: 'image', props: { src: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=400&h=180&q=80', alt: 'Original 1', className: 'w-full h-36 object-cover' }, children: [] },
      'orig-1-body': { type: 'div', props: { className: 'p-3 flex flex-col gap-1' }, children: ['orig-1-badge', 'orig-1-name', 'orig-1-genre'] },
      'orig-1-badge': { type: 'text', props: { tag: 'span', content: '🔴 ORIGINAL', className: 'text-[9px] font-black text-red-500 tracking-widest' }, children: [] },
      'orig-1-name':  { type: 'text', props: { tag: 'p', content: 'Project Omega', className: 'text-sm font-bold' }, children: [] },
      'orig-1-genre': { type: 'text', props: { tag: 'p', content: 'Sci-Fi · Thriller', className: 'text-[11px] text-gray-400' }, children: [] },

      'orig-2': { type: 'div', props: { className: 'flex-shrink-0 w-64 rounded-lg overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['orig-2-img', 'orig-2-body'] },
      'orig-2-img':  { type: 'image', props: { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&h=180&q=80', alt: 'Original 2', className: 'w-full h-36 object-cover' }, children: [] },
      'orig-2-body': { type: 'div', props: { className: 'p-3 flex flex-col gap-1' }, children: ['orig-2-badge', 'orig-2-name', 'orig-2-genre'] },
      'orig-2-badge': { type: 'text', props: { tag: 'span', content: '🔴 ORIGINAL', className: 'text-[9px] font-black text-red-500 tracking-widest' }, children: [] },
      'orig-2-name':  { type: 'text', props: { tag: 'p', content: 'Mountain Code', className: 'text-sm font-bold' }, children: [] },
      'orig-2-genre': { type: 'text', props: { tag: 'p', content: 'Drama · Adventure', className: 'text-[11px] text-gray-400' }, children: [] },

      'orig-3': { type: 'div', props: { className: 'flex-shrink-0 w-64 rounded-lg overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['orig-3-img', 'orig-3-body'] },
      'orig-3-img':  { type: 'image', props: { src: 'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?auto=format&fit=crop&w=400&h=180&q=80', alt: 'Original 3', className: 'w-full h-36 object-cover' }, children: [] },
      'orig-3-body': { type: 'div', props: { className: 'p-3 flex flex-col gap-1' }, children: ['orig-3-badge', 'orig-3-name', 'orig-3-genre'] },
      'orig-3-badge': { type: 'text', props: { tag: 'span', content: '🔴 ORIGINAL', className: 'text-[9px] font-black text-red-500 tracking-widest' }, children: [] },
      'orig-3-name':  { type: 'text', props: { tag: 'p', content: 'Night Protocol', className: 'text-sm font-bold' }, children: [] },
      'orig-3-genre': { type: 'text', props: { tag: 'p', content: 'Action · Mystery', className: 'text-[11px] text-gray-400' }, children: [] },

      'orig-4': { type: 'div', props: { className: 'flex-shrink-0 w-64 rounded-lg overflow-hidden bg-zinc-900 cursor-pointer hover:scale-105 transition-transform' }, children: ['orig-4-img', 'orig-4-body'] },
      'orig-4-img':  { type: 'image', props: { src: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=400&h=180&q=80', alt: 'Original 4', className: 'w-full h-36 object-cover' }, children: [] },
      'orig-4-body': { type: 'div', props: { className: 'p-3 flex flex-col gap-1' }, children: ['orig-4-badge', 'orig-4-name', 'orig-4-genre'] },
      'orig-4-badge': { type: 'text', props: { tag: 'span', content: '🔴 ORIGINAL', className: 'text-[9px] font-black text-red-500 tracking-widest' }, children: [] },
      'orig-4-name':  { type: 'text', props: { tag: 'p', content: 'Deep Signal', className: 'text-sm font-bold' }, children: [] },
      'orig-4-genre': { type: 'text', props: { tag: 'p', content: 'Sci-Fi · Drama', className: 'text-[11px] text-gray-400' }, children: [] },

      // ── New Releases ───────────────────────────────────────────────────
      'row-new': {
        type: 'div',
        props: { className: 'flex flex-col gap-4' },
        children: ['row-new-title', 'row-new-cards'],
      },
      'row-new-title': { type: 'text', props: { tag: 'h3', content: 'New Releases This Week', className: 'text-lg font-bold' }, children: [] },
      'row-new-cards': {
        type: 'div',
        props: { className: 'grid grid-cols-4 gap-4' },
        children: ['nr-1', 'nr-2', 'nr-3', 'nr-4'],
      },
      'nr-1': { type: 'div', props: { className: 'relative rounded-lg overflow-hidden cursor-pointer group' }, children: ['nr-1-img', 'nr-1-overlay', 'nr-1-info'] },
      'nr-1-img':     { type: 'image', props: { src: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&w=400&h=240&q=80', alt: 'New 1', className: 'w-full h-40 object-cover' }, children: [] },
      'nr-1-overlay': { type: 'div', props: { className: 'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center' }, children: ['nr-1-play'] },
      'nr-1-play':    { type: 'text', props: { tag: 'span', content: '▶', className: 'text-white text-3xl' }, children: [] },
      'nr-1-info':    { type: 'div', props: { className: 'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black' }, children: ['nr-1-name', 'nr-1-type'] },
      'nr-1-name':    { type: 'text', props: { tag: 'p', content: 'Fractured',   className: 'text-xs font-bold' }, children: [] },
      'nr-1-type':    { type: 'text', props: { tag: 'p', content: 'Film · 2024', className: 'text-[10px] text-gray-400' }, children: [] },

      'nr-2': { type: 'div', props: { className: 'relative rounded-lg overflow-hidden cursor-pointer group' }, children: ['nr-2-img', 'nr-2-overlay', 'nr-2-info'] },
      'nr-2-img':     { type: 'image', props: { src: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=400&h=240&q=80', alt: 'New 2', className: 'w-full h-40 object-cover' }, children: [] },
      'nr-2-overlay': { type: 'div', props: { className: 'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center' }, children: ['nr-2-play'] },
      'nr-2-play':    { type: 'text', props: { tag: 'span', content: '▶', className: 'text-white text-3xl' }, children: [] },
      'nr-2-info':    { type: 'div', props: { className: 'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black' }, children: ['nr-2-name', 'nr-2-type'] },
      'nr-2-name':    { type: 'text', props: { tag: 'p', content: 'Starfall',    className: 'text-xs font-bold' }, children: [] },
      'nr-2-type':    { type: 'text', props: { tag: 'p', content: 'Series · S1', className: 'text-[10px] text-gray-400' }, children: [] },

      'nr-3': { type: 'div', props: { className: 'relative rounded-lg overflow-hidden cursor-pointer group' }, children: ['nr-3-img', 'nr-3-overlay', 'nr-3-info'] },
      'nr-3-img':     { type: 'image', props: { src: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&w=400&h=240&q=80', alt: 'New 3', className: 'w-full h-40 object-cover' }, children: [] },
      'nr-3-overlay': { type: 'div', props: { className: 'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center' }, children: ['nr-3-play'] },
      'nr-3-play':    { type: 'text', props: { tag: 'span', content: '▶', className: 'text-white text-3xl' }, children: [] },
      'nr-3-info':    { type: 'div', props: { className: 'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black' }, children: ['nr-3-name', 'nr-3-type'] },
      'nr-3-name':    { type: 'text', props: { tag: 'p', content: 'Pulse',       className: 'text-xs font-bold' }, children: [] },
      'nr-3-type':    { type: 'text', props: { tag: 'p', content: 'Film · 2025', className: 'text-[10px] text-gray-400' }, children: [] },

      'nr-4': { type: 'div', props: { className: 'relative rounded-lg overflow-hidden cursor-pointer group' }, children: ['nr-4-img', 'nr-4-overlay', 'nr-4-info'] },
      'nr-4-img':     { type: 'image', props: { src: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&h=240&q=80', alt: 'New 4', className: 'w-full h-40 object-cover' }, children: [] },
      'nr-4-overlay': { type: 'div', props: { className: 'absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center' }, children: ['nr-4-play'] },
      'nr-4-play':    { type: 'text', props: { tag: 'span', content: '▶', className: 'text-white text-3xl' }, children: [] },
      'nr-4-info':    { type: 'div', props: { className: 'absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black' }, children: ['nr-4-name', 'nr-4-type'] },
      'nr-4-name':    { type: 'text', props: { tag: 'p', content: 'Collapse',    className: 'text-xs font-bold' }, children: [] },
      'nr-4-type':    { type: 'text', props: { tag: 'p', content: 'Series · S2', className: 'text-[10px] text-gray-400' }, children: [] },

      // ── Category Pills ─────────────────────────────────────────────────
      'categories': {
        type: 'div',
        props: { className: 'flex flex-col gap-4 border-t border-zinc-800 pt-8' },
        children: ['categories-title', 'categories-pills'],
      },
      'categories-title': { type: 'text', props: { tag: 'h3', content: 'Browse by Category', className: 'text-base font-semibold text-gray-300' }, children: [] },
      'categories-pills': {
        type: 'div',
        props: { className: 'flex flex-row gap-3 flex-wrap' },
        children: ['cat-action', 'cat-drama', 'cat-comedy', 'cat-thriller', 'cat-scifi', 'cat-doc', 'cat-anime', 'cat-horror'],
      },
      'cat-action':   { type: 'button', props: { text: '💥 Action',    variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
      'cat-drama':    { type: 'button', props: { text: '🎭 Drama',     variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
      'cat-comedy':   { type: 'button', props: { text: '😂 Comedy',    variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
      'cat-thriller': { type: 'button', props: { text: '🔪 Thriller',  variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
      'cat-scifi':    { type: 'button', props: { text: '🚀 Sci-Fi',    variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
      'cat-doc':      { type: 'button', props: { text: '📹 Documentary', variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
      'cat-anime':    { type: 'button', props: { text: '⛩️ Anime',    variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
      'cat-horror':   { type: 'button', props: { text: '👻 Horror',    variant: 'ghost', className: 'border border-zinc-700 hover:border-white rounded-full px-4 py-1.5 text-sm' }, children: [] },
    },
  });

export default createStreamingPlatformTemplate;
