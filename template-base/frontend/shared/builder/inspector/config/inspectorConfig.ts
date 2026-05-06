import { InspectorConfig } from '../types/InspectorTypes';

export const inspectorConfig: InspectorConfig = {
  "tokens": {
    "typography": {
      "family": "Default",
      "weight": "Regular", 
      "style": "Default",
      "fontSize": "Default",
      "lineHeight": "1.75rem",
      "letterSpacing": "0em",
      "align": "Default",
      "decoration": { "italic": false, "underline": false, "strikethrough": false, "overline": false }
    },
    "color": "Default",
    "background": "Default",
    "layout": {
      "direction": "row",
      "align": "Default",
      "justify": "Default",
      "gap": "0px",
      "margin": { "top": "0px", "right": "0px", "bottom": "0px", "left": "0px" },
      "padding": { "top": "0px", "right": "0px", "bottom": "0px", "left": "0px" },
      "size": { "width": "auto", "height": "auto" }
    },
    "border": { "style": "Default", "color": "Default", "width": "0px" },
    "appearance": { "opacity": "100%", "radius": "Default" },
    "shadow": "Default",
    "icon": { "name": "None", "color": "Default" }
  },
  "library": {
    "controls": {
      "content.text": { "label": "Content", "ui": "textarea", "uiComponentPath": "text-area", "path": "content.text", "default": "" },

      "component.variant": { "label": "Variant", "ui": "select", "uiComponentPath": "select", "path": "component.variant", "options": ["Default","Primary","Secondary","Outline","Ghost","Link"], "default": "Default", "layout": "double" },
      "component.size": { "label": "Size", "ui": "select", "uiComponentPath": "select", "path": "component.size", "options": ["Default","xs","sm","md","lg","xl"], "default": "Default", "layout": "double" },
      "component.type": { "label": "Type", "ui": "select", "uiComponentPath": "select", "path": "component.type", "options": ["Text","Password","Email","Number","Search","Tel","URL"], "default": "Text" },

      "typography.family": { "label": "Font", "ui": "select", "uiComponentPath": "select", "path": "typography.family", "options": ["Default","Inter","System"], "default": "Default", "layout": "double" },
      "typography.weight": { "label": "Weight", "ui": "select", "uiComponentPath": "select", "path": "typography.weight", "options": ["Regular","Medium","Semibold","Bold"], "default": "Regular", "layout": "double" },
      "typography.style": { "label": "Style", "ui": "select", "uiComponentPath": "select", "path": "typography.style", "options": ["Default","italic"], "default": "Default", "layout": "double" },
      "typography.fontSize": { "label": "Font Size", "ui": "select", "uiComponentPath": "select", "path": "typography.fontSize", "options": ["xs","sm","md","lg","xl","Default"], "default": "Default", "layout": "double" },
      "typography.lineHeight": { "label": "Line Height", "ui": "dimension", "uiComponentPath": "dimension", "path": "typography.lineHeight", "default": "1.75rem", "layout": "double" },
      "typography.letterSpacing": { "label": "Letter Spacing", "ui": "dimension", "uiComponentPath": "dimension", "path": "typography.letterSpacing", "default": "0em", "layout": "double" },
      "typography.align": { "label": "Alignment", "ui": "segmented", "uiComponentPath": "segmented", "path": "typography.align", "options": ["start","center","end","justify","Default"], "default": "Default" },
      "typography.decoration": { "label": "Decoration", "ui": "toggleGroup", "uiComponentPath": "toggle-group", "path": "typography.decoration", "options": ["italic","underline","strikethrough","overline"], "default": [] },

      "color.base": { "label": "Color", "ui": "colorPicker", "uiComponentPath": "color-picker", "path": "color.base", "default": "Default", "tabs": ["Tailwind", "Custom"] },
      "background.base": { "label": "Background", "ui": "colorPicker", "uiComponentPath": "color-picker", "path": "background.base", "default": "Default", "tabs": ["Tailwind", "Custom"] },

      "layout.direction": { "label": "Direction", "ui": "segmented", "uiComponentPath": "direction", "path": "layout.direction", "options": ["row","column"], "default": "row" },
      "layout.align": { "label": "Align", "ui": "segmented", "uiComponentPath": "align", "path": "layout.align", "options": ["start","center","end","stretch","Default"], "default": "Default" },
      "layout.justify": { "label": "Justify", "ui": "segmented", "uiComponentPath": "justify", "path": "layout.justify", "options": ["start","center","end","between","around","evenly","Default"], "default": "Default" },
      "layout.gap": { "label": "Gap", "ui": "dimension", "uiComponentPath": "dimension", "path": "layout.gap", "default": "0px", "layout": "double" },

      "layout.margin": { "label": "Margin", "ui": "spacing", "uiComponentPath": "spacing", "path": "layout.margin", "default": { "top": "0px", "right": "0px", "bottom": "0px", "left": "0px" }, "sides": ["top","right","bottom","left"], "lockable": true },
      "layout.padding": { "label": "Padding", "ui": "spacing", "uiComponentPath": "spacing", "path": "layout.padding", "default": { "top": "0px", "right": "0px", "bottom": "0px", "left": "0px" }, "sides": ["top","right","bottom","left"], "lockable": true },

      "layout.size.width": { "label": "Width", "ui": "dimension", "uiComponentPath": "dimension", "path": "layout.size.width", "default": "auto", "layout": "double", "lockable": true },
      "layout.size.height": { "label": "Height", "ui": "dimension", "uiComponentPath": "dimension", "path": "layout.size.height", "default": "auto", "layout": "double", "lockable": true },

      "border.style": { "label": "Border Style", "ui": "select", "uiComponentPath": "select", "path": "border.style", "options": ["Default","Solid","Dashed","Dotted","None"], "default": "Default", "layout": "triple" },
      "border.color": { "label": "Border Color", "ui": "colorPicker", "uiComponentPath": "color-picker", "path": "border.color", "default": "Default", "layout": "triple" },
      "border.width": { "label": "Border Width", "ui": "dimension", "uiComponentPath": "dimension", "path": "border.width", "default": "0px", "layout": "triple" },

      "appearance.opacity": { "label": "Opacity", "ui": "percentage", "uiComponentPath": "percentage", "path": "appearance.opacity", "default": "100%" },
      "appearance.radius": { "label": "Radius", "ui": "select", "uiComponentPath": "select", "path": "appearance.radius", "options": ["Default","None","Sm","Md","Lg","Full","Large"], "default": "Default", "layout": "double" },

      "shadow.base": { "label": "Shadow", "ui": "select", "uiComponentPath": "select", "path": "shadow.base", "options": ["Default","None","Sm","Md","Lg"], "default": "Default" },

      "icon.name": { "label": "Icon", "ui": "iconPicker", "uiComponentPath": "icon-picker", "path": "icon.name", "default": "None", "layout": "double" },
      "icon.color": { "label": "Icon Color", "ui": "colorPicker", "uiComponentPath": "color-picker", "path": "icon.color", "default": "Default", "layout": "double" }
    },
    "groups": {
      "content": ["content.text"],
      "componentBase": ["component.variant","component.size","component.type"],
      "typographyBase": ["typography.family","typography.weight","typography.style","typography.fontSize","typography.lineHeight","typography.letterSpacing","typography.align","typography.decoration"],
      "coloring": ["color.base","background.base"],
      "layoutFlow": ["layout.direction","layout.align","layout.justify","layout.gap"],
      "layoutBox": ["layout.margin","layout.padding","layout.size.width","layout.size.height"],
      "bordering": ["border.style","border.color","border.width"],
      "appearance": ["appearance.opacity","appearance.radius","shadow.base"],
      "iconic": ["icon.name","icon.color"]
    }
  },
  "presets": {
    "text": {
      "extends": ["content","typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {
        "content.text": "Hello world"
      }
    },
    "span": {
      "extends": ["typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {}
    },
    "html": {
      "extends": ["typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {}
    },
    "SelectTrigger": {
      "extends": ["componentBase","typographyBase","coloring","layoutFlow","layoutBox","bordering","appearance"],
      "overrides": {
        "typography.fontSize": "xs",
        "layout.size.width": "160px",
        "layout.size.height": "28px"
      }
    },
    "TabsTrigger": {
      "extends": ["content","typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {
        "content.text": "Properties",
        "typography.weight": "Medium"
      }
    },
    "Input": {
      "extends": ["componentBase","typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {
        "component.type": "Text",
        "layout.margin.top": "4px"
      }
    },
    "Label": {
      "extends": ["content","typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {
        "content.text": "Label",
        "typography.weight": "Medium",
        "typography.fontSize": "xs"
      }
    },
    "Button": {
      "extends": ["componentBase","content","typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {
        "component.variant": "Primary",
        "content.text": "Build with AI Chat",
        "typography.weight": "Medium",
        "layout.size.width": "100%",
        "layout.size.height": "auto"
      }
    },
    "Badge": {
      "extends": ["componentBase","typographyBase","coloring","layoutBox","bordering","appearance"],
      "overrides": {
        "component.variant": "Secondary",
        "typography.weight": "Medium"
      }
    },
    "section": {
      "extends": ["typographyBase","coloring","layoutFlow","layoutBox","bordering","appearance"],
      "overrides": {
        "layout.direction": "row",
        "layout.size.width": "100%",
        "layout.size.height": "auto"
      }
    },
    "div": {
      "extends": ["typographyBase","coloring","layoutFlow","layoutBox","bordering","appearance"],
      "overrides": {
        "layout.direction": "row",
        "layout.gap": "16px",
        "layout.padding.top": "0px",
        "layout.padding.right": "16px",
        "layout.padding.bottom": "16px",
        "layout.padding.left": "16px"
      }
    }
  }
};
