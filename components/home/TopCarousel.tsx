'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Truck, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface BannerItem {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: string;
  mobileImage?: string;
  badge: string;
  buttonText: string;
  link: string;
  features?: string[];
}

export default function TopCarousel(): React.JSX.Element {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect mobile screen size - run immediately on mount
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch Banners from backend API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await api.get('/banners/public');
        console.log('Fetched banners:', response.data);
        setBanners(response.data);
      } catch (error) {
        console.error('Banner fetch error:', error);
      }
    };

    fetchBanners();
  }, []);

  // Auto-slide rotation
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="text-center p-10 text-gray-500">
        Loading banners...
      </div>
    );
  }

  return (
    <section className="relative bg-gray-50 py-4">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500">
          {/* Carousel */}
          <div className="relative h-88 md:h-104 lg:h-120">
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {banners.map((item) => {
                // Use mobile image if available and on mobile, otherwise use desktop image
                const backgroundImage = (isClient && isMobile && item.mobileImage) 
                  ? item.mobileImage 
                  : item.image;

                console.log('Rendering banner:', item._id, 'isMobile:', isMobile, 'using image:', backgroundImage);

                return (
                  <div key={item._id} className="w-full flex-shrink-0 relative">
                    {/* Mobile view - use img tag for better visibility */}
                    <div className="block md:hidden w-full h-full relative">
                      <img
                        src={item.mobileImage || item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />

                      {/* Content */}
                      <div className="absolute inset-0 flex items-center justify-center px-4">
                        <div className="text-center max-w-md">
                          {/* Badge */}
                          {item.badge && (
                            <div className="inline-block mb-2">
                              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow">
                                {item.badge}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h2 className="text-2xl font-extrabold text-white drop-shadow-lg mb-2">
                            {item.title}
                          </h2>

                          {/* Subtitle */}
                          <p className="text-sm text-white/90 mb-4 font-medium">
                            {item.subtitle}
                          </p>

                          {/* CTA Button */}
                          <Link href={item.link || '#'}>
                            <Button
                              size="sm"
                              className="bg-white text-primary hover:bg-white/90 font-semibold"
                            >
                              {item.buttonText || 'Shop Now'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Desktop view - use background image */}
                    <div
                      className="hidden md:block w-full h-full bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${item.image})` }}
                    >
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 flex items-center px-8 md:px-16">
                        <div className="container mx-auto px-8">
                          <div className="max-w-2xl">
                            {/* Badge */}
                            {item.badge && (
                              <div className="inline-block mb-3">
                                <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow">
                                  {item.badge}
                                </span>
                              </div>
                            )}

                            {/* Title */}
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-white drop-shadow-lg">
                              {item.title}
                            </h2>

                            {/* Subtitle */}
                            <p className="text-2xl text-white/90 mb-6 font-medium">
                              {item.subtitle}
                            </p>

                            {/* Features */}
                            {item.features && item.features.length > 0 && (
                              <div className="flex flex-wrap gap-4 mb-6">
                                {item.features.map((feature, index) => {
                                  const icons = [Truck, Shield, Clock];
                                  const Icon = icons[index % icons.length];
                                  return (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-white/80"
                                    >
                                      <Icon className="h-5 w-5" />
                                      <span className="text-sm">{feature}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* CTA Button */}
                            <Link href={item.link || '#'}>
                              <Button
                                size="lg"
                                className="bg-white text-primary hover:bg-white/90 font-semibold hover:scale-105 transition-all duration-300 shadow-md"
                              >
                                {item.buttonText || 'Shop Now'}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white z-10"
              onClick={goToPrevious}
              aria-label="Previous banner"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white z-10"
              onClick={goToNext}
              aria-label="Next banner"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}