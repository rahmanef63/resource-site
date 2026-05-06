'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useCallback } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

export type ConversationProps = React.HTMLAttributes<HTMLDivElement> & {
  initial?: 'smooth' | 'auto';
  resize?: 'smooth' | 'auto';
};

export const Conversation = ({ className, ...props }: ConversationProps) => (
  // @ts-ignore - use-stick-to-bottom component returns ReactNode which fails NextJS 15 strict types
  <StickToBottom
    className={cn('relative flex-1 overflow-y-auto', className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...(props as any)}
  />
);

export type ConversationContentProps = React.HTMLAttributes<HTMLDivElement>;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  // @ts-ignore - use-stick-to-bottom component returns ReactNode which fails NextJS 15 strict types
  <StickToBottom.Content className={cn('p-4', className)} {...(props as any)} />
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn(
          'absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full',
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...(props as any)}
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
