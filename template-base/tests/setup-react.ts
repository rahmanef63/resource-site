/**
 * Vitest setup for React component tests (jsdom env).
 *
 * Source: ported from superspace/tests/setup-react.ts so consumer apps
 * inherit the same mocks (matchMedia, IntersectionObserver,
 * ResizeObserver, scrollIntoView, getComputedStyle Radix shims).
 */

import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

(globalThis as any).React = React;

if (typeof window !== "undefined") {
  afterEach(() => {
    cleanup();
  });

  if (!document.doctype) {
    const doctype = document.implementation.createDocumentType("html", "", "");
    document.insertBefore(doctype, document.documentElement);
  }

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(_: IntersectionObserverCallback) {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  }
  (globalThis as any).IntersectionObserver = MockIntersectionObserver;

  class MockResizeObserver implements ResizeObserver {
    constructor(_: ResizeObserverCallback) {}
    disconnect() {}
    observe() {}
    unobserve() {}
  }
  (globalThis as any).ResizeObserver = MockResizeObserver;

  Element.prototype.scrollIntoView = function () {};

  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = (element: Element, pseudoElt?: string | null) => {
    const style = originalGetComputedStyle(element, pseudoElt);
    return {
      ...style,
      getPropertyValue: (prop: string) => {
        if (prop === "--radix-popper-available-width") return "300px";
        if (prop === "--radix-popper-available-height") return "400px";
        return style.getPropertyValue(prop);
      },
    } as CSSStyleDeclaration;
  };
}
