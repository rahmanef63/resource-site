export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAriaLabel(label: string, required?: boolean, error?: string): string {
  let ariaLabel = label;
  
  if (required) {
    ariaLabel += ', required';
  }
  
  if (error) {
    ariaLabel += `, ${error}`;
  }
  
  return ariaLabel;
}

export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-pressed'?: boolean;
  'aria-disabled'?: boolean;
  'aria-modal'?: boolean;
  'aria-activedescendant'?: string;
  'aria-selected'?: boolean;
  role?: string;
  tabIndex?: number;
}

export function getFormFieldAriaProps(
  id: string,
  label: string,
  options: {
    required?: boolean;
    error?: string;
    description?: string;
  } = {}
): AriaProps {
  const props: AriaProps = {
    'aria-label': getAriaLabel(label, options.required),
    'aria-required': options.required,
    'aria-invalid': !!options.error,
  };

  if (options.description) {
    const descriptionId = `${id}-description`;
    props['aria-describedby'] = descriptionId;
  }

  if (options.error) {
    const errorId = `${id}-error`;
    props['aria-describedby'] = props['aria-describedby']
      ? `${props['aria-describedby']} ${errorId}`
      : errorId;
  }

  return props;
}

export function getButtonAriaProps(
  label: string,
  options: {
    pressed?: boolean;
    expanded?: boolean;
    controls?: string;
    disabled?: boolean;
  } = {}
): AriaProps {
  const props: AriaProps = {
    'aria-label': label,
  };

  if (options.pressed !== undefined) {
    props['aria-pressed'] = options.pressed;
  }

  if (options.expanded !== undefined) {
    props['aria-expanded'] = options.expanded;
  }

  if (options.controls) {
    props['aria-controls'] = options.controls;
  }

  if (options.disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

export function getDialogAriaProps(
  labelId: string,
  descriptionId?: string
): AriaProps {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  };
}

export function getListboxAriaProps(
  labelId: string,
  selectedId?: string
): AriaProps {
  return {
    role: 'listbox',
    'aria-labelledby': labelId,
    'aria-activedescendant': selectedId,
  };
}

export function getTabsAriaProps(
  selectedIndex: number,
  panelId: string
): AriaProps {
  return {
    role: 'tab',
    'aria-selected': true,
    'aria-controls': panelId,
    tabIndex: 0,
  };
}

export function skipToContent(targetId: string) {
  const target = document.getElementById(targetId);
  if (target) {
    target.focus();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function announceLiveRegion(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  setTimeout(() => {
    if (liveRegion.parentNode) {
      liveRegion.parentNode.removeChild(liveRegion);
    }
  }, 1000);
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

export function trapFocus(container: HTMLElement) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

export const visuallyHiddenStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: '0',
};
