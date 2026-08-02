import React from 'react';
import { SectionWidget } from '../../layout/section/SectionWidget';
import { TextWidget } from '../../content/text/TextWidget';
import { ButtonWidget } from '../../action/button/ButtonWidget';
import { ImageWidget } from '../../media/image/ImageWidget';

interface HeroCompositeWidgetProps {
  // Hero Section Props
  heroBackground?: string;
  heroPadding?: string;
  heroMaxWidth?: string;
  heroClassName?: string;
  
  // Copywriting Section Props
  copywritingGap?: string;
  copywritingAlign?: string;
  
  // Title Props
  titleContent?: string;
  titleSize?: string;
  titleWeight?: string;
  titleColor?: string;
  
  // Subtitle Props
  subtitleContent?: string;
  subtitleSize?: string;
  subtitleColor?: string;
  
  // CTA Button Props
  ctaText?: string;
  ctaVariant?: string;
  ctaSize?: string;
  ctaHref?: string;
  
  // Preview Section Props
  previewAlign?: string;
  
  // Image Props
  imageUrl?: string;
  imageAlt?: string;
  imageRounded?: boolean;
  imageClassName?: string;
}

export const HeroCompositeWidget: React.FC<HeroCompositeWidgetProps> = ({
  // Hero Section
  heroBackground = "gray-50",
  heroPadding = "xl",
  heroMaxWidth = "7xl",
  heroClassName = "",
  
  // Copywriting Section
  copywritingGap = "lg",
  copywritingAlign = "start",
  
  // Title
  titleContent = "Build faster with your Super Workspace",
  titleSize = "4xl",
  titleWeight = "bold",
  titleColor = "gray-900",
  
  // Subtitle
  subtitleContent = "Composable widgets, live JSON schema, and modern UI components for rapid development.",
  subtitleSize = "lg",
  subtitleColor = "gray-600",
  
  // CTA Button
  ctaText = "Open Dashboard",
  ctaVariant = "primary",
  ctaSize = "lg",
  ctaHref = "/dashboard",
  
  // Preview Section
  previewAlign = "center",
  
  // Image
  imageUrl = "https://picsum.photos/seed/hero/800/600",
  imageAlt = "Hero preview",
  imageRounded = true,
  imageClassName = "w-full h-auto shadow-lg"
}) => {
  return (
    <SectionWidget
      name="hero"
      display="flex"
      direction="row"
      align="center"
      gap="xl"
      padding={heroPadding as any}
      background={heroBackground as any}
      maxWidth={heroMaxWidth as any}
      className={heroClassName}
    >
      {/* Copywriting Section */}
      <SectionWidget
        name="copywriting"
        display="flex"
        direction="column"
        gap={copywritingGap as any}
        align={copywritingAlign as any}
        width="1/2"
        className="space-y-6"
      >
        {/* Title */}
        <TextWidget
          tag="h1"
          content={titleContent}
          fontSize={titleSize as any}
          fontWeight={titleWeight as any}
          textColor={titleColor as any}
          lineHeight="tight"
        />
        
        {/* Subtitle */}
        <TextWidget
          tag="p"
          content={subtitleContent}
          fontSize={subtitleSize as any}
          textColor={subtitleColor as any}
          lineHeight="relaxed"
        />
        
        {/* CTA Button */}
        <ButtonWidget
          text={ctaText}
          variant={ctaVariant as any}
          size={ctaSize as any}
          href={ctaHref}
          className="w-fit"
        />
      </SectionWidget>
      
      {/* Preview Section */}
      <SectionWidget
        name="preview"
        display="flex"
        align={previewAlign as any}
        justify="center"
        width="1/2"
      >
        <ImageWidget
          src={imageUrl}
          alt={imageAlt}
          rounded={imageRounded}
          className={imageClassName}
        />
      </SectionWidget>
    </SectionWidget>
  );
};
