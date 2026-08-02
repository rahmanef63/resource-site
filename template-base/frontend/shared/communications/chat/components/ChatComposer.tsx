/**
 * Message composer/editor component
 * @module shared/chat/components/ChatComposer
 */

import React from "react";

export type ChatComposerProps = {
  value?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  onSend: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  submitLabel?: string;
};

/**
 * Text composer with send functionality
 */
export function ChatComposer({
  value: controlledValue,
  initialValue = "",
  onChange,
  onSend,
  onCancel,
  placeholder = "Type a message...",
  disabled = false,
  maxLength,
  autoFocus = false,
  submitLabel = "Send",
}: ChatComposerProps) {
  const [internalValue, setInternalValue] = React.useState(initialValue);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length > maxLength) {
      return;
    }

    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
      onChange?.(newValue);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!value.trim() || disabled) return;

    onSend(value);

    if (!isControlled) {
      setInternalValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }

    // Cancel on Escape
    if (e.key === "Escape") {
      onCancel?.();
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <div className="chat-composer">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="chat-composer-textarea"
        rows={1}
        aria-label="Message input"
      />

      <div className="chat-composer-actions">
        {maxLength && (
          <span className="chat-composer-count">
            {value.length}/{maxLength}
          </span>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="chat-composer-cancel"
            disabled={disabled}
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={() => handleSubmit()}
          className="chat-composer-send"
          disabled={disabled || !value.trim()}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
