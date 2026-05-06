'use client'

import { useCallback, useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

import { cn } from '@/lib/utils'

export const HeroSection = () => {
  const heroImagesData = useQuery(api.heroImages.list)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const heroImages = heroImagesData
    ? heroImagesData.sort((a, b) => a.order - b.order).map((img) => img.src)
    : []

  useEffect(() => {
    if (heroImages.length === 0) return
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [heroImages.length])

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    )
  }

  if (!heroImagesData) {
    return (
      <section className="relative h-screen">
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      </section>
    )
  }

  return (
    <section className="relative h-screen">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <div className="relative w-full h-full overflow-hidden left-0 top-0">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              quality={85}
              sizes="100vw"
              onLoadingComplete={() => setIsLoading(false)}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button
          onClick={prevImage}
          className="p-2 rounded-full bg-white/50 hover:bg-white/75 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextImage}
          className="p-2 rounded-full bg-white/50 hover:bg-white/75 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
