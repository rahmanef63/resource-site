/**
 * container-component Wrapper
 * Provides flexible layout with display, spacing, and positioning options
 */

import { ContainerComponent } from "./container-component"
import { createComponent, selectProp, textProp, childrenProp } from "../utils/componentFactory"
import type { ComponentWrapper } from "@/frontend/shared/foundation"

export interface ContainerProps {
  display?: string
  direction?: string
  gap?: string
  padding?: string
  margin?: string
  width?: string
  height?: string
  position?: string
  className?: string
  children?: React.ReactNode
}

export const ContainerWrapper: ComponentWrapper<ContainerProps> = createComponent<ContainerProps>({
  id: "container",
  name: "Container",
  displayName: "Container",
  description: "A flexible container for layout with display, spacing, and positioning options",
  category: "layout",
  component: ContainerComponent as any,

  defaults: {
    display: "flex",
    direction: "column",
    gap: "4",
    padding: "4",
    margin: "0",
    width: "full",
    height: "auto",
    position: "relative",
  },

  props: {
    display: selectProp(
      "Display",
      ['block', 'flex', 'grid', 'inline-block', 'inline-flex'],
      "flex"
    ),
    direction: selectProp(
      "Direction",
      ['row', 'column', 'row-reverse', 'column-reverse'],
      "column"
    ),
    gap: selectProp(
      "Gap",
      ['0', '1', '2', '3', '4', '6', '8', '12', '16'],
      "4"
    ),
    padding: selectProp(
      "Padding",
      ['0', '2', '4', '6', '8', '12', '16', '24'],
      "4"
    ),
    margin: selectProp(
      "Margin",
      ['0', '2', '4', '6', '8', '12', '16', 'auto'],
      "0"
    ),
    width: selectProp(
      "Width",
      ['auto', 'full', '1/2', '1/3', '2/3', '1/4', '3/4', 'screen'],
      "full"
    ),
    height: selectProp(
      "Height",
      ['auto', 'full', 'screen', 'min', 'max', 'fit'],
      "auto"
    ),
    position: selectProp(
      "Position",
      ['static', 'relative', 'absolute', 'fixed', 'sticky'],
      "relative"
    ),
    children: childrenProp("Container content"),
  },

  icon: "Container",
  tags: ["container", "layout", "flex", "wrapper"],

  metadata: {
    version: "1.0.0",
    category: "layout",
  },
})

export default ContainerWrapper
