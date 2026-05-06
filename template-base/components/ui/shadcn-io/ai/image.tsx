import { cn } from '@/lib/utils';
import type { Experimental_GeneratedImage } from 'ai';
import NextImage from 'next/image';

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  uint8Array,
  mediaType,
  ...props
}: ImageProps) => (
  <NextImage
    {...(props as any)}
    alt={props.alt ?? ''}
    className={cn(
      'h-auto max-w-full overflow-hidden rounded-md',
      props.className
    )}
    height={(props as any).height ?? 1024}
    src={`data:${mediaType};base64,${base64}`}
    width={(props as any).width ?? 1024}
  />
);
