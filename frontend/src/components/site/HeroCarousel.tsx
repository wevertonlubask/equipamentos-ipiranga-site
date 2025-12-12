'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '@/types';

interface HeroCarouselProps {
  banners: Banner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative h-[600px] md:h-[700px] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            IPIRANGA<span className="text-amber-500">FITNESS</span>
          </h1>
          <p className="text-xl text-neutral-400 mb-8">Equipamentos de Musculação de Alta Performance</p>
          <Link href="/equipamentos" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg transition-colors">
            Ver Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden bg-neutral-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          {currentBanner.image_desktop && (
            <div className="absolute inset-0">
              <Image
                src={currentBanner.image_desktop}
                alt={currentBanner.title || 'Banner'}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl"
            >
              {currentBanner.title && (
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {currentBanner.title}
                </h1>
              )}
              {currentBanner.subtitle && (
                <p className="text-xl md:text-2xl text-neutral-300 mb-8">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.link_url && currentBanner.button_text && (
                <Link
                  href={currentBanner.link_url}
                  target={currentBanner.link_target || '_self'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg transition-all hover:scale-105"
                >
                  {currentBanner.button_text}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Próximo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-amber-500 w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
