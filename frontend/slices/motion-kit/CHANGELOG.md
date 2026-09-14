# Changelog — motion-kit

## 0.2.0 — 2026-09-14

- Added native Svelte 5/SvelteKit parity for reveal, stagger, count-up, marquee, Embla carousel, and accordion.
- Extracted framework-neutral IntersectionObserver/easing/stagger helpers so React and Svelte share motion semantics.
- Svelte carousel uses Embla core with explicit lifecycle cleanup; Svelte accordion uses native accessible button/context state with no React/Radix leakage.

## 0.1.0

- Initial React motion kit.
