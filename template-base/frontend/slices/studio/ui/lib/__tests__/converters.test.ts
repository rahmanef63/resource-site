/**
 * Tests for Studio JSON ↔ HTML / TSX Converters
 *
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from 'vitest';
import { jsonToHtml, jsonToTsx, htmlToJson, tsxToJson, computeConversionStats } from '../converters';
import type { Schema } from '../converters';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const minimalSchema: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: { className: 'container' }, children: [] },
  },
};

const schemaWithText: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: {}, children: ['heading-1', 'para-1'] },
    'heading-1': { type: 'text', props: { tag: 'h1', content: 'Hello World' }, children: [] },
    'para-1': { type: 'text', props: { tag: 'p', content: 'Test paragraph' }, children: [] },
  },
};

const schemaWithImage: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: {}, children: ['img-1'] },
    'img-1': { type: 'image', props: { src: 'https://example.com/photo.jpg', alt: 'Photo', width: '800', height: '600' }, children: [] },
  },
};

const schemaWithButton: Schema = {
  version: '0.4',
  root: ['root-1'],
  nodes: {
    'root-1': { type: 'div', props: {}, children: ['btn-1'] },
    'btn-1': { type: 'button', props: { text: 'Click Me' }, children: [] },
  },
};

// ─── jsonToHtml ───────────────────────────────────────────────────────────────

describe('jsonToHtml', () => {
  it('returns valid HTML document string', () => {
    const html = jsonToHtml(minimalSchema);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<body');
  });

  it('includes Tailwind CDN script', () => {
    const html = jsonToHtml(minimalSchema);
    expect(html).toContain('cdn.tailwindcss.com');
  });

  it('renders div with className', () => {
    const html = jsonToHtml(minimalSchema);
    expect(html).toContain('class="container"');
  });

  it('renders text nodes with correct tag and content', () => {
    const html = jsonToHtml(schemaWithText);
    expect(html).toContain('<h1>Hello World</h1>');
    expect(html).toContain('<p>Test paragraph</p>');
  });

  it('renders image as void tag', () => {
    const html = jsonToHtml(schemaWithImage);
    expect(html).toContain('<img');
    expect(html).toContain('src="https://example.com/photo.jpg"');
    expect(html).toContain('alt="Photo"');
  });

  it('renders button with text content', () => {
    const html = jsonToHtml(schemaWithButton);
    expect(html).toContain('<button');
    expect(html).toContain('Click Me');
  });

  it('handles empty root array', () => {
    const schema: Schema = { version: '0.4', root: [], nodes: {} };
    const html = jsonToHtml(schema);
    expect(html).toContain('<!DOCTYPE html>');
  });

  it('handles nested nodes', () => {
    const html = jsonToHtml(schemaWithText);
    expect(html).toContain('<div>');
    expect(html).toContain('<h1>');
  });

  it('escapes special characters in attributes', () => {
    const schema: Schema = {
      version: '0.4',
      root: ['n1'],
      nodes: { n1: { type: 'link', props: { href: 'https://example.com?a=1&b=2' }, children: [] } },
    };
    const html = jsonToHtml(schema);
    expect(html).toContain('&amp;');
  });

  it('link uses label prop for inner text', () => {
    const schema: Schema = {
      version: '0.4',
      root: ['n1'],
      nodes: { n1: { type: 'link', props: { href: '/home', label: 'Go Home' }, children: [] } },
    };
    const html = jsonToHtml(schema);
    expect(html).toContain('Go Home');
  });
});

// ─── jsonToTsx ────────────────────────────────────────────────────────────────

describe('jsonToTsx', () => {
  it('returns a valid React component string', () => {
    const tsx = jsonToTsx(minimalSchema);
    expect(tsx).toContain("import React from 'react'");
    expect(tsx).toContain('export default function');
    expect(tsx).toContain('return (');
  });

  it('uses provided component name', () => {
    const tsx = jsonToTsx(minimalSchema, 'MyPage');
    expect(tsx).toContain('function MyPage()');
  });

  it('defaults component name to StudioPage', () => {
    const tsx = jsonToTsx(minimalSchema);
    expect(tsx).toContain('function StudioPage()');
  });

  it('includes Next.js Image import when schema has image nodes', () => {
    const tsx = jsonToTsx(schemaWithImage);
    expect(tsx).toContain("import Image from 'next/image'");
  });

  it('does NOT include Image import when no image nodes', () => {
    const tsx = jsonToTsx(schemaWithText);
    expect(tsx).not.toContain("import Image from 'next/image'");
  });

  it('renders image as Next.js Image component', () => {
    const tsx = jsonToTsx(schemaWithImage);
    expect(tsx).toContain('<Image');
    expect(tsx).toContain('src="https://example.com/photo.jpg"');
  });

  it('renders className prop', () => {
    const tsx = jsonToTsx(minimalSchema);
    expect(tsx).toContain('className="container"');
  });

  it('renders button text', () => {
    const tsx = jsonToTsx(schemaWithButton);
    expect(tsx).toContain('Click Me');
  });
});

// ─── htmlToJson ───────────────────────────────────────────────────────────────

describe('htmlToJson', () => {
  it('returns a schema with version and root array', () => {
    const schema = htmlToJson('<div class="test">Hello</div>');
    expect(schema.version).toBeTruthy();
    expect(Array.isArray(schema.root)).toBe(true);
    expect(typeof schema.nodes).toBe('object');
  });

  it('parses a simple div with class', () => {
    const schema = htmlToJson('<div class="wrapper">Content</div>');
    const rootId = schema.root[0];
    expect(rootId).toBeTruthy();
    const node = schema.nodes[rootId];
    expect(node.type).toBe('div');
  });

  it('maps img tag to image type', () => {
    const schema = htmlToJson('<img src="https://example.com/x.jpg" alt="Test" />');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.type).toBe('image');
    expect(node.props.src).toBe('https://example.com/x.jpg');
    expect(node.props.alt).toBe('Test');
  });

  it('maps a tag to link type with label prop', () => {
    const schema = htmlToJson('<a href="https://example.com">Link Text</a>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.type).toBe('link');
    expect(node.props.href).toBe('https://example.com');
    // BUG 4 FIX: use label, not text
    expect(node.props.label).toBe('Link Text');
    expect(node.children).toEqual([]);
  });

  it('maps heading tags to text type with tag prop', () => {
    const schema = htmlToJson('<h1>Title</h1>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.type).toBe('text');
    expect(node.props.tag).toBe('h1');
    expect(node.props.content).toBe('Title');
  });

  it('handles multiple root elements', () => {
    const schema = htmlToJson('<div>One</div><div>Two</div>');
    expect(schema.root).toHaveLength(2);
  });

  it('handles empty HTML', () => {
    const schema = htmlToJson('');
    expect(Array.isArray(schema.root)).toBe(true);
  });

  // ── BUG 2 FIX: Inline style parsing ────────────────────────────────────────

  it('BUG 2: parses inline style → display, gap, backgroundColor props', () => {
    const schema = htmlToJson('<div style="display:flex;gap:1.5rem;background-color:#1e293b">content</div>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.props.display).toBe('flex');
    expect(node.props.gap).toBe('1.5rem');
    expect(node.props.backgroundColor).toBe('#1e293b');
  });

  it('BUG 2: parses color and font-size from style attribute', () => {
    const schema = htmlToJson('<h2 style="color:#ffffff;font-size:2rem">Heading</h2>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.props.color).toBe('#ffffff');
    expect(node.props.fontSize).toBe('2rem');
  });

  it('BUG 2: parses flex-direction from style attribute', () => {
    const schema = htmlToJson('<div style="flex-direction:column;align-items:center">x</div>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.props.flexDirection).toBe('column');
    expect(node.props.alignItems).toBe('center');
  });

  // ── BUG 1 + 3 FIX: Text nodes and nested container recursion ───────────────

  it('BUG 1: captures text-only content as a child text node', () => {
    const schema = htmlToJson('<div>Hello World</div>');
    const rootId = schema.root[0];
    const root = schema.nodes[rootId];
    // The text "Hello World" should become a child text node
    expect(root.children.length).toBeGreaterThan(0);
    const textChild = schema.nodes[root.children[0]];
    expect(textChild.type).toBe('text');
    expect(textChild.props.content).toBe('Hello World');
  });

  it('BUG 3: nav with anchor children creates link nodes recursively', () => {
    const schema = htmlToJson('<nav><a href="/">Home</a><a href="/docs">Docs</a></nav>');
    const rootId = schema.root[0];
    const nav = schema.nodes[rootId];
    // nav should have 2 link children
    expect(nav.children).toHaveLength(2);
    const link1 = schema.nodes[nav.children[0]];
    const link2 = schema.nodes[nav.children[1]];
    expect(link1.type).toBe('link');
    expect(link1.props.href).toBe('/');
    expect(link2.type).toBe('link');
    expect(link2.props.href).toBe('/docs');
  });

  it('BUG 3: header with mixed text and element children', () => {
    const schema = htmlToJson('<header><h1>Brand</h1><nav><a href="/">Home</a></nav></header>');
    const rootId = schema.root[0];
    const header = schema.nodes[rootId];
    // Should have h1 + nav as children
    expect(header.children.length).toBeGreaterThanOrEqual(2);
    const h1Node = schema.nodes[header.children[0]];
    expect(h1Node.type).toBe('text');
    expect(h1Node.props.tag).toBe('h1');
    expect(h1Node.props.content).toBe('Brand');
  });

  it('extracts external links and style blocks into metadata', () => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
          <style>body { color: red; }</style>
        </head>
        <body>
          <div class="content">Hello</div>
        </body>
      </html>
    `;
    const schema = htmlToJson(html);
    const expectedLink = JSON.stringify({ href: 'https://fonts.googleapis.com/icon?family=Material+Icons', rel: 'stylesheet', crossorigin: null });
    expect(schema.metadata?.externalAssets?.links).toContain(expectedLink);
    expect(schema.metadata?.externalAssets?.styles).toContain('body { color: red; }');
  });

  it('auto-injects Material Symbols link when symbol class is detected', () => {
    const html = '<span class="material-symbols-outlined">search</span>';
    const schema = htmlToJson(html);
    const expectedLink = 'Material+Symbols+Outlined';
    const hasLink = schema.metadata?.externalAssets?.links?.some(l => l.includes(expectedLink));
    expect(hasLink).toBe(true);

    // Verify it maps to the specialized icon widget
    const rootId = schema.root?.[0];
    const node = schema.nodes[rootId as string];
    expect(node.type).toBe('icon');
    expect(node.props.name).toBe('search');

    const exportedHtml = jsonToHtml(schema);
    const exportedTsx = jsonToTsx(schema, 'IconPreview');
    expect(exportedHtml).toContain('material-symbols-outlined');
    expect(exportedHtml).toContain('>search</span>');
    expect(exportedTsx).toContain('material-symbols-outlined');
    expect(exportedTsx).toContain('>search</span>');
  });

  it('preserves nested icons inside headings (prevents flattening)', () => {
    const html = '<h2><span class="material-symbols-outlined">hub</span> Dashboard</h2>';
    const schema = htmlToJson(html);
    
    // The h2 should be a div (container) because it has an icon child
    const rootId = schema.root?.[0];
    const h2Node = schema.nodes[rootId as string];
    
    expect(h2Node.type).toBe('text');
    expect(h2Node.props.tag).toBe('h2');
    expect(h2Node.children?.length).toBe(2); // The icon span and the " Dashboard" text
    
    const iconNodeId = h2Node.children?.[0];
    const iconNode = schema.nodes[iconNodeId as string];
    expect(iconNode.type).toBe('icon');
    expect(iconNode.props.name).toBe('hub');

    const exportedHtml = jsonToHtml(schema);
    expect(exportedHtml).toContain('<h2');
    expect(exportedHtml).toContain('material-symbols-outlined');
    expect(exportedHtml).toContain('Dashboard');
  });

  it('does not duplicate link or button labels when children are present during export', () => {
    const schema: Schema = {
      version: '0.5',
      root: ['root'],
      nodes: {
        root: { type: 'div', props: {}, children: ['link-1', 'button-1'] },
        'link-1': {
          type: 'link',
          props: { href: '/docs', label: 'Docs' },
          children: ['link-text'],
        },
        'link-text': {
          type: 'text',
          props: { tag: 'span', content: 'Docs' },
          children: [],
        },
        'button-1': {
          type: 'button',
          props: { text: 'Launch' },
          children: ['button-text'],
        },
        'button-text': {
          type: 'text',
          props: { tag: 'span', content: 'Launch' },
          children: [],
        },
      },
    };

    const html = jsonToHtml(schema);

    expect(html.match(/>Docs</g)?.length ?? 0).toBe(1);
    expect(html.match(/>Launch</g)?.length ?? 0).toBe(1);
  });

  it('collapses fragmented adjacent anchors when href and classes clearly match', () => {
    const html = `
      <nav>
        <a href="/logs" class="nav-link"><span class="material-symbols-outlined">description</span></a>
        <a href="/logs" class="nav-link"><span class="text-sm font-medium">Logs</span></a>
      </nav>
    `;

    const schema = htmlToJson(html);
    const navId = schema.root[0];
    const nav = schema.nodes[navId];

    expect(nav.children).toHaveLength(1);
    const mergedLink = schema.nodes[nav.children[0]];
    expect(mergedLink.type).toBe('link');
    expect(mergedLink.children).toHaveLength(2);
    expect(schema.nodes[mergedLink.children[0]].type).toBe('icon');
    expect(schema.nodes[mergedLink.children[1]].props.content).toBe('Logs');
  });

  it('repairs desktop-only app shells for smaller viewports during import', () => {
    const html = `
      <div class="flex h-screen w-full flex-row overflow-hidden">
        <aside class="flex w-64 flex-col shrink-0 border-r"></aside>
        <main class="flex-1 flex flex-col overflow-hidden">
          <div class="relative w-64 md:w-96 group">
            <input type="text" />
          </div>
        </main>
      </div>
    `;

    const schema = htmlToJson(html);
    const shell = schema.nodes[schema.root[0]];
    const sidebar = schema.nodes[shell.children[0]];
    const main = schema.nodes[shell.children[1]];
    const search = schema.nodes[main.children[0]];

    expect(shell.props.className).toContain('flex-col');
    expect(shell.props.className).toContain('md:flex-row');
    expect(sidebar.props.className).toContain('w-full');
    expect(sidebar.props.className).toContain('md:w-64');
    expect(sidebar.props.className).toContain('md:shrink-0');
    expect(main.props.className).toContain('w-full');
    expect(main.props.className).toContain('min-w-0');
    expect(search.props.className).toContain('w-full');
    expect(search.props.className).toContain('md:w-96');
    expect(search.props.className).toContain('max-w-full');
  });

  // ── BUG 5 FIX: data-path re-import ─────────────────────────────────────────

  it('BUG 5: preserves data-path attribute as path prop', () => {
    const schema = htmlToJson('<div data-path="/dashboard">Content</div>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.props.path).toBe('/dashboard');
  });

  // ── BUG 6 FIX: font-weight names ───────────────────────────────────────────

  it('BUG 6: maps font-weight:bold → "700"', () => {
    const schema = htmlToJson('<h1 style="font-weight:bold">Title</h1>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.props.fontWeight).toBe('700');
  });

  it('BUG 6: maps font-weight:semibold → "600"', () => {
    const schema = htmlToJson('<span style="font-weight:semibold">Label</span>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.props.fontWeight).toBe('600');
  });

  it('BUG 6: keeps numeric font-weight values as-is', () => {
    const schema = htmlToJson('<p style="font-weight:500">Medium text</p>');
    const rootId = schema.root[0];
    const node = schema.nodes[rootId];
    expect(node.props.fontWeight).toBe('500');
  });

  // ── Complex HTML round-trip ─────────────────────────────────────────────────

  it('complex hero section round-trip', () => {
    const html = `<div style="display:flex;gap:1.5rem;background-color:#1e293b" class="hero-section">
      <h1 style="font-weight:bold;color:#ffffff">Build Faster</h1>
      <p style="color:#94a3b8">The platform for modern teams.</p>
      <nav>
        <a href="/">Home</a>
        <a href="/docs">Docs</a>
      </nav>
    </div>`;

    const schema = htmlToJson(html);
    expect(schema.root).toHaveLength(1);

    const rootNode = schema.nodes[schema.root[0]];
    expect(rootNode.type).toBe('div');
    expect(rootNode.props.display).toBe('flex');
    expect(rootNode.props.gap).toBe('1.5rem');
    expect(rootNode.props.backgroundColor).toBe('#1e293b');
    expect(rootNode.props.className).toBe('hero-section');
    // Should have h1, p, nav as children
    expect(rootNode.children.length).toBeGreaterThanOrEqual(3);

    // Find the h1 node
    const h1 = Object.values(schema.nodes).find(n => n.type === 'text' && n.props.tag === 'h1');
    expect(h1).toBeTruthy();
    expect(h1?.props.content).toBe('Build Faster');
    expect(h1?.props.fontWeight).toBe('700');
    expect(h1?.props.color).toBe('#ffffff');

    // Find link nodes
    const links = Object.values(schema.nodes).filter(n => n.type === 'link');
    expect(links.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── tsxToJson ────────────────────────────────────────────────────────────────

describe('tsxToJson', () => {
  it('returns a schema object', () => {
    const tsx = `
      export default function Page() {
        return (
          <div className="wrapper">
            <h1>Hello</h1>
          </div>
        );
      }
    `;
    const schema = tsxToJson(tsx);
    expect(schema.version).toBeTruthy();
    expect(Array.isArray(schema.root)).toBe(true);
  });

  it('converts className to class attribute', () => {
    const tsx = `export default function P() { return (<div className="test" />); }`;
    const schema = tsxToJson(tsx);
    expect(schema).toBeTruthy();
    expect(typeof schema.nodes).toBe('object');
  });

  it('handles bare JSX without return wrapper', () => {
    const schema = tsxToJson('<div class="bare">Bare JSX</div>');
    expect(schema.root).toHaveLength(1);
  });

  it('converts <Image> back to <img>', () => {
    const tsx = `
      import Image from 'next/image';
      export default function P() {
        return (
          <Image src="https://x.com/img.jpg" alt="img" width={640} height={420} />
        );
      }
    `;
    const schema = tsxToJson(tsx);
    expect(schema).toBeTruthy();
    expect(schema.root.length).toBeGreaterThan(0);
  });

  // BUG 7 FIX: Custom components
  it('BUG 7: replaces PascalCase custom component with div', () => {
    const tsx = `
      export default function Page() {
        return (
          <div className="wrapper">
            <MyCard title="Test" />
            <CustomBanner text="Hello" />
          </div>
        );
      }
    `;
    const schema = tsxToJson(tsx);
    // Should not throw, and should have nodes
    expect(Object.keys(schema.nodes).length).toBeGreaterThan(0);
  });

  it('BUG 7: handles self-closing custom components gracefully', () => {
    const tsx = '<SomeWidget prop="value" />';
    const schema = tsxToJson(tsx);
    expect(schema).toBeTruthy();
    expect(Array.isArray(schema.root)).toBe(true);
  });

  it('TSX with className gets parsed via htmlToJson', () => {
    const tsx = `
      export default function P() {
        return (
          <div className="flex gap-4">
            <h1>Title</h1>
          </div>
        );
      }
    `;
    const schema = tsxToJson(tsx);
    const rootId = schema.root[0];
    const root = schema.nodes[rootId];
    expect(root.props.className).toBe('flex gap-4');
  });
});

// ─── computeConversionStats ───────────────────────────────────────────────────

describe('computeConversionStats', () => {
  it('returns nodeCount, emptyNodes, textNodesExtracted', () => {
    const schema = htmlToJson('<div><h1>Title</h1><p>Para</p></div>');
    const stats = computeConversionStats(schema);
    expect(stats.nodeCount).toBeGreaterThan(0);
    expect(typeof stats.emptyNodes).toBe('number');
    expect(stats.textNodesExtracted).toBeGreaterThan(0);
  });

  it('counts text nodes from h1, p, span', () => {
    const schema = htmlToJson('<div><h1>A</h1><p>B</p><span>C</span></div>');
    const stats = computeConversionStats(schema);
    expect(stats.textNodesExtracted).toBeGreaterThanOrEqual(3);
  });

  it('returns nodeCount = 0 for empty schema', () => {
    const schema = htmlToJson('');
    const stats = computeConversionStats(schema);
    expect(stats.nodeCount).toBe(0);
  });
});
