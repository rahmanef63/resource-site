/**
 * text-component Wrapper
 * Provides comprehensive typography options
 */

import { TextComponent } from "./text-component"
import { createComponent, selectProp, textProp, booleanProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface TextProps {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'strong' | 'em' | 'small'
  content?: string
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  decoration?: 'none' | 'underline' | 'overline' | 'line-through'
  spacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest'
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose'
  family?: 'sans' | 'serif' | 'mono'
  style?: 'normal' | 'italic'
  truncate?: boolean
  whitespace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap'
  className?: string
}

export const TextWrapper: ComponentWrapper<TextProps> = createComponent<TextProps>({
  id: "text",
  name: "Text",
  displayName: "Text",
  description: "A versatile text block with comprehensive typography options",
  category: "typography",
  component: TextComponent as any,

  defaults: {
    tag: "p",
    content: "Text content",
    size: "base",
    weight: "normal",
    color: "gray-900",
    align: "left",
    transform: "none",
    decoration: "none",
    spacing: "normal",
    leading: "normal",
    family: "sans",
    style: "normal",
    truncate: false,
    whitespace: "normal",
  },

  props: {
    tag: selectProp(
      "HTML Tag",
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'strong', 'em', 'small'],
      "p"
    ),
    content: {
      ...textProp("Content", "Text content"),
      multiline: true,
      description: "Text content to display",
    },
    size: selectProp(
      "Size",
      ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'],
      "base"
    ),
    weight: selectProp(
      "Weight",
      ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      "normal"
    ),
    color: textProp("Color", "gray-900"),
    align: selectProp("Align", ['left', 'center', 'right', 'justify'], "left"),
    transform: selectProp("Transform", ['none', 'uppercase', 'lowercase', 'capitalize'], "none"),
    decoration: selectProp("Decoration", ['none', 'underline', 'overline', 'line-through'], "none"),
    spacing: selectProp("Letter Spacing", ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'], "normal"),
    leading: selectProp("Line Height", ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'], "normal"),
    family: selectProp("Font Family", ['sans', 'serif', 'mono'], "sans"),
    style: selectProp("Style", ['normal', 'italic'], "normal"),
    truncate: booleanProp("Truncate", false),
    whitespace: selectProp("Whitespace", ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap'], "normal"),
  },

  icon: "Type",
  tags: ["text", "typography", "heading", "paragraph", "content"],

  metadata: {
    version: "1.0.0",
    category: "typography",
  },
})

export default TextWrapper
