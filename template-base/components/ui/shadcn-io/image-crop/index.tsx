'use client';

import { Button } from '@/components/ui/button';
import { CropIcon, RotateCcwIcon } from 'lucide-react';
import Image from 'next/image';
import { Slot } from '@radix-ui/react-slot';
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type PercentCrop,
  type PixelCrop,
  type ReactCropProps,
} from 'react-image-crop';
import { cn } from '@/lib/utils';

import 'react-image-crop/dist/ReactCrop.css';

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number | undefined
): PercentCrop =>
  centerCrop(
    aspect
      ? makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          mediaWidth,
          mediaHeight
        )
      : { x: 0, y: 0, width: 90, height: 90, unit: '%' },
    mediaWidth,
    mediaHeight
  );

export const getCroppedPngImage = async (
  imageSrc: HTMLImageElement,
  scaleFactor: number,
  pixelCrop: PixelCrop,
  maxImageSize: number
): Promise<string> => {
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const canvasToBlob = (
    canvas: HTMLCanvasElement,
    type: string
  ): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas.'));
          return;
        }
        resolve(blob);
      }, type);
    });

  const cropWidth = Number(pixelCrop.width);
  const cropHeight = Number(pixelCrop.height);

  if (!(Number.isFinite(cropWidth) && Number.isFinite(cropHeight))) {
    throw new Error('Invalid crop dimensions.');
  }
  if (cropWidth <= 0 || cropHeight <= 0) {
    throw new Error('Crop width/height must be > 0.');
  }

  const displayedWidth = imageSrc.width || imageSrc.naturalWidth || 1;
  const displayedHeight = imageSrc.height || imageSrc.naturalHeight || 1;

  const scaleX = imageSrc.naturalWidth / displayedWidth;
  const scaleY = imageSrc.naturalHeight / displayedHeight;

  const sourceX = pixelCrop.x * scaleX;
  const sourceY = pixelCrop.y * scaleY;
  const sourceWidth = cropWidth * scaleX;
  const sourceHeight = cropHeight * scaleY;

  const MAX_ITERATIONS = 12;
  const SAFETY_MARGIN = 0.95;

  let currentScale = Number.isFinite(scaleFactor) ? scaleFactor : 1;
  currentScale = clamp(currentScale, 0.01, 1);

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Context is null, this should never happen.');
    }

    const targetWidth = Math.max(1, Math.round(cropWidth * currentScale));
    const targetHeight = Math.max(1, Math.round(cropHeight * currentScale));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(
      imageSrc,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const blob = await canvasToBlob(canvas, 'image/png');

    if (blob.size <= maxImageSize) {
      return canvas.toDataURL('image/png');
    }

    if (targetWidth === 1 && targetHeight === 1) {
      break;
    }

    const ratio = maxImageSize / blob.size;
    const recommendedScale = currentScale * Math.sqrt(ratio) * SAFETY_MARGIN;
    currentScale = clamp(recommendedScale, 1 / Math.max(cropWidth, cropHeight), currentScale * 0.9);
  }

  // Final attempt: force a minimal 1x1 output as a last resort.
  const finalScale = 1 / Math.max(cropWidth, cropHeight);
  const finalCanvas = document.createElement('canvas');
  const finalCtx = finalCanvas.getContext('2d');

  if (!finalCtx) {
    throw new Error('Context is null, this should never happen.');
  }

  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCanvas.width = Math.max(1, Math.round(cropWidth * finalScale));
  finalCanvas.height = Math.max(1, Math.round(cropHeight * finalScale));

  finalCtx.drawImage(
    imageSrc,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    finalCanvas.width,
    finalCanvas.height
  );

  const finalBlob = await canvasToBlob(finalCanvas, 'image/png');
  if (finalBlob.size > maxImageSize) {
    throw new Error(
      `Unable to generate a cropped image under ${maxImageSize} bytes (best: ${finalBlob.size} bytes).`
    );
  }

  return finalCanvas.toDataURL('image/png');
};

type ImageCropContextType = {
  file: File;
  maxImageSize: number;
  imgSrc: string;
  imgSize: { width: number; height: number } | null;
  crop: PercentCrop | undefined;
  completedCrop: PixelCrop | null;
  imgRef: RefObject<HTMLImageElement | null>;
  onCrop?: (croppedImage: string) => void;
  reactCropProps: Omit<ReactCropProps, 'onChange' | 'onComplete' | 'children'>;
  handleChange: (pixelCrop: PixelCrop, percentCrop: PercentCrop) => void;
  handleComplete: (
    pixelCrop: PixelCrop,
    percentCrop: PercentCrop
  ) => Promise<void>;
  onImageLoad: (e: SyntheticEvent<HTMLImageElement>) => void;
  applyCrop: () => Promise<void>;
  resetCrop: () => void;
};

const ImageCropContext = createContext<ImageCropContextType | null>(null);

const useImageCrop = () => {
  const context = useContext(ImageCropContext);
  if (!context) {
    throw new Error('ImageCrop components must be used within ImageCrop');
  }
  return context;
};

export type ImageCropProps = {
  file: File;
  maxImageSize?: number;
  onCrop?: (croppedImage: string) => void;
  children: ReactNode;
  onChange?: ReactCropProps['onChange'];
  onComplete?: ReactCropProps['onComplete'];
} & Omit<ReactCropProps, 'onChange' | 'onComplete' | 'children'>;

export const ImageCrop = ({
  file,
  maxImageSize = 1024 * 1024 * 5,
  onCrop,
  children,
  onChange,
  onComplete,
  ...reactCropProps
}: ImageCropProps) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [imgSize, setImgSize] = useState<{ width: number; height: number } | null>(null);
  const [crop, setCrop] = useState<PercentCrop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [initialCrop, setInitialCrop] = useState<PercentCrop>();

  useEffect(() => {
    let cancelled = false;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const result = reader.result?.toString() || '';
      if (cancelled) return;

      setImgSrc(result);
      setImgSize(null);

      if (!result) return;

      const img = new window.Image();
      img.onload = () => {
        if (cancelled) return;
        setImgSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        if (cancelled) return;
        setImgSize(null);
      };
      img.src = result;
    });
    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [file]);

  const onImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const newCrop = centerAspectCrop(width, height, reactCropProps.aspect);
      setCrop(newCrop);
      setInitialCrop(newCrop);
    },
    [reactCropProps.aspect]
  );

  const handleChange = (pixelCrop: PixelCrop, percentCrop: PercentCrop) => {
    setCrop(percentCrop);
    onChange?.(pixelCrop, percentCrop);
  };

  // biome-ignore lint/suspicious/useAwait: "onComplete is async"
  const handleComplete = async (
    pixelCrop: PixelCrop,
    percentCrop: PercentCrop
  ) => {
    setCompletedCrop(pixelCrop);
    onComplete?.(pixelCrop, percentCrop);
  };

  const applyCrop = async () => {
    if (!(imgRef.current && completedCrop)) {
      return;
    }

    const croppedImage = await getCroppedPngImage(
      imgRef.current,
      1,
      completedCrop,
      maxImageSize
    );

    onCrop?.(croppedImage);
  };

  const resetCrop = () => {
    if (initialCrop) {
      setCrop(initialCrop);
      setCompletedCrop(null);
    }
  };

  const contextValue: ImageCropContextType = {
    file,
    maxImageSize,
    imgSrc,
    imgSize,
    crop,
    completedCrop,
    imgRef,
    onCrop,
    reactCropProps,
    handleChange,
    handleComplete,
    onImageLoad,
    applyCrop,
    resetCrop,
  };

  return (
    <ImageCropContext.Provider value={contextValue}>
      {children}
    </ImageCropContext.Provider>
  );
};

export type ImageCropContentProps = {
  style?: CSSProperties;
  className?: string;
};

export const ImageCropContent = ({
  style,
  className,
}: ImageCropContentProps) => {
  const {
    imgSrc,
    imgSize,
    crop,
    handleChange,
    handleComplete,
    onImageLoad,
    imgRef,
    reactCropProps,
  } = useImageCrop();

  const shadcnStyle = {
    '--rc-border-color': 'var(--color-border)',
    '--rc-focus-color': 'var(--color-primary)',
  } as CSSProperties;

  return (
    <ReactCrop
      className={cn('max-h-full max-w-full', className)}
      crop={crop}
      onChange={handleChange}
      onComplete={handleComplete}
      style={{ ...shadcnStyle, ...style }}
      {...reactCropProps}
    >
      {imgSrc && imgSize && (
        <Image
          alt="crop"
          className="size-full"
          height={imgSize.height}
          onLoad={onImageLoad}
          ref={imgRef}
          src={imgSrc}
          width={imgSize.width}
        />
      )}
    </ReactCrop>
  );
};

export type ImageCropApplyProps =
  | ({ asChild: true } & ComponentProps<typeof Slot>)
  | ({ asChild?: false } & ComponentProps<typeof Button>);

export const ImageCropApply = (props: ImageCropApplyProps) => {
  const { applyCrop } = useImageCrop();

  if (props.asChild) {
    const { asChild, onClick, ...slotProps } = props;

    const handleClick = async (e: MouseEvent<HTMLElement>) => {
      await applyCrop();
      onClick?.(e);
    };

    return (
      <Slot onClick={handleClick} {...slotProps} />
    );
  }

  const { asChild, children, onClick, ...buttonProps } = props;

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    await applyCrop();
    onClick?.(e);
  };

  return (
    <Button onClick={handleClick} size="icon" variant="ghost" {...buttonProps}>
      {children ?? <CropIcon className="size-4" />}
    </Button>
  );
};

export type ImageCropResetProps =
  | ({ asChild: true } & ComponentProps<typeof Slot>)
  | ({ asChild?: false } & ComponentProps<typeof Button>);

export const ImageCropReset = (props: ImageCropResetProps) => {
  const { resetCrop } = useImageCrop();

  if (props.asChild) {
    const { asChild, onClick, ...slotProps } = props;

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      resetCrop();
      onClick?.(e);
    };

    return (
      <Slot onClick={handleClick} {...slotProps} />
    );
  }

  const { asChild, children, onClick, ...buttonProps } = props;

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    resetCrop();
    onClick?.(e);
  };

  return (
    <Button onClick={handleClick} size="icon" variant="ghost" {...buttonProps}>
      {children ?? <RotateCcwIcon className="size-4" />}
    </Button>
  );
};

// Keep the original Cropper component for backward compatibility
export type CropperProps = Omit<ReactCropProps, 'onChange'> & {
  file: File;
  maxImageSize?: number;
  onCrop?: (croppedImage: string) => void;
  onChange?: ReactCropProps['onChange'];
};

export const Cropper = ({
  onChange,
  onComplete,
  onCrop,
  style,
  className,
  file,
  maxImageSize,
  ...props
}: CropperProps) => (
  <ImageCrop
    file={file}
    maxImageSize={maxImageSize}
    onChange={onChange}
    onComplete={onComplete}
    onCrop={onCrop}
    {...props}
  >
    <ImageCropContent className={className} style={style} />
  </ImageCrop>
);
