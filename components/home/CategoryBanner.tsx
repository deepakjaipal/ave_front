'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useRef, useEffect } from 'react'; // <-- Import hooks

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

interface CategorySliderProps {
  categories: Category[];
}

// Configuration for auto-scroll
const SCROLL_INTERVAL = 3000; // Time in ms between scrolls (3 seconds)
const SCROLL_AMOUNT = 200; // Pixels to scroll each time

export default function CategorySlider({ categories }: CategorySliderProps): React.JSX.Element {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollDirection = 1; // 1 for right, -1 for left
    let currentScroll = 0;

    const autoScroll = () => {
      // 1. Calculate the next scroll position
      currentScroll = slider.scrollLeft + scrollDirection * SCROLL_AMOUNT;

      // 2. Boundary Check (Reversing direction at ends)
      if (scrollDirection === 1 && currentScroll >= (slider.scrollWidth - slider.clientWidth - SCROLL_AMOUNT)) {
        // If approaching the far right end, reverse direction
        scrollDirection = -1;
      } else if (scrollDirection === -1 && currentScroll <= SCROLL_AMOUNT) {
        // If approaching the far left end, reverse direction
        scrollDirection = 1;
      }

      // Ensure scroll doesn't go below zero or past max width
      const targetScroll = Math.max(0, Math.min(currentScroll, slider.scrollWidth - slider.clientWidth));
      
      // 3. Perform the smooth scroll
      slider.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    };

    // Set up the interval for continuous scrolling
    const intervalId = setInterval(autoScroll, SCROLL_INTERVAL);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <section className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - kept the CTA style */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Category Spotlight
          </h2>
          <Link href="/categories" className="flex items-center text-primary text-sm hover:text-primary-dark transition-colors font-medium group">
            See All
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        
        {/* Slider Container - Added ref */}
        <div 
          ref={sliderRef} // <-- Hook the ref here
          className="
            overflow-x-scroll 
            whitespace-nowrap 
            py-2 -mx-4 px-4 
            lg:-mx-8 lg:px-8
            scrollbar-hide 
            
          "
        >
          {/* Flex Container for the "Six in a Row" items */}
          <div className="flex space-x-4">
            {categories.map((category: Category) => (
              <Link 
                key={category._id} 
                href={`/category/${category.slug}`} 
                className="
                  flex-shrink-0 
                  w-[calc(50%-8px)] sm:w-[calc(33.33%-11px)] md:w-[calc(25%-12px)] 
                  lg:w-[calc(16.66%-16px)] xl:w-[calc(16.66%-16px)]
                  max-w-[200px]
                " 
              >
                <Card className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-in-out">
                  
                  <div className="aspect-[5/6] relative"> 
                    {category.image ? (
                      <>
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 100px, (max-width: 1024px) 150px, 200px"
                          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-3 bg-gray-200 dark:bg-gray-800 text-center">
                        <ShoppingBag className="w-6 h-6 text-primary mb-1" />
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">No Image</p>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white bg-gradient-to-t bg-ring flex justify-between items-center group-hover:pb-5 transition-all duration-300">
                      <h3 className="text-sm font-semibold whitespace-normal truncate">
                        {category.name}
                      </h3>
                      {category.productCount !== undefined && (
                        <p className="text-xs opacity-90 mt-0.5">
                          {category.productCount.toLocaleString()}+
                        </p>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </div>
                  </div>

                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}