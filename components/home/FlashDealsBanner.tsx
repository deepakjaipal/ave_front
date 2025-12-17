'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from "@/lib/api";
interface DealItem {
  title: string;
  discount: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  category: string;
}

interface FlashDealSection {
  title: string;
  deals: DealItem[];
  endTime?: string;
}

// Configuration for auto-scroll
const SCROLL_INTERVAL = 4000; // Time in ms between scrolls (4 seconds)
const SCROLL_AMOUNT_FACTOR = 0.5; // Scroll 50% of the visible container width

// Helper function to format the timer
const formatTimeLeft = (diff: number): string | null => {
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  
  const format = (unit: number) => String(unit).padStart(2, '0');

  return `${format(h)}:${format(m)}:${format(s)}`;
};

export default function FlashDealsBanner() {
  const [section, setSection] = useState<FlashDealSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false); // NEW state for pause on hover
  const sliderRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching Effect (Existing) ---
  useEffect(() => {
  const fetchFlashDeals = async () => {
    try {
      const res = await api.get("/home-sections/public");
      const flashDeals = res.data.find(
        (s: any) => s.type === "flash_deals" && s.enabled
      );

      if (flashDeals?.deals?.length) {
        setSection({
          title: flashDeals.title,
          deals: flashDeals.deals,
          endTime: flashDeals.endTime,
        });
      }
    } catch (error) {
      console.error("Failed to load flash deals", error);
    } finally {
      setLoading(false);
    }
  };

  fetchFlashDeals();
}, []);

  // --- Countdown Timer Effect (Existing) ---
  useEffect(() => {
    if (!section?.endTime) return;

    const updateTimeLeft = () => {
      const diff = new Date(section.endTime!).getTime() - Date.now();
      setTimeLeft(formatTimeLeft(diff));
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [section]);

  // --- Auto Scroll Effect (UPDATED to include Pause on Hover) ---
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || isHovered) return; // Skip if hovered

    let scrollDirection = 1; 
    let currentScroll = 0;
    
    const scrollDistance = slider.clientWidth * SCROLL_AMOUNT_FACTOR;
    let intervalId: NodeJS.Timeout;

    const autoScroll = () => {
      // Logic for reverse scrolling (Same as before)
      currentScroll = slider.scrollLeft + scrollDirection * scrollDistance;
      
      if (scrollDirection === 1 && currentScroll >= (slider.scrollWidth - slider.clientWidth - scrollDistance * 0.5)) {
        scrollDirection = -1;
      } else if (scrollDirection === -1 && currentScroll <= scrollDistance * 0.5) {
        scrollDirection = 1;
      }

      const targetScroll = Math.max(0, Math.min(currentScroll, slider.scrollWidth - slider.clientWidth));
      
      slider.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    };
    
    // Only set the interval if not hovered
    if (!isHovered) {
        intervalId = setInterval(autoScroll, SCROLL_INTERVAL);
    }

    // Clean up
    return () => clearInterval(intervalId);
  }, [isHovered, SCROLL_INTERVAL, SCROLL_AMOUNT_FACTOR]); // Dependency on isHovered

  // --- Manual Scroll Functions (Existing) ---
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth / 2;
      sliderRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) return <p className="text-center py-10">Loading flash deals...</p>;
  if (!section || !section.deals?.length)
    return <p className="text-center py-10">No flash deals available</p>;

  return (
    <section className="py-10 bg-gradient-to-r from-orange-50 via-white to-red-50 relative">
      <div className="container mx-auto px-4">
        {/* Header (Existing) */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Zap className="h-8 w-8 text-red-500 fill-red-200" />
            <h2 className="text-3xl font-extrabold text-gray-900">{section.title}</h2>
            {timeLeft && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full shadow-lg">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-semibold">ENDS IN: {timeLeft}</span>
              </div>
            )}
          </div>
          <Link href="/deals" className='w-full sm:w-auto'>
            <Button 
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
              variant="default"
            >
              View All Deals <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Slider Navigation Arrows (Manual Scroll - Existing) */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -mt-8 z-10 hidden lg:flex rounded-full shadow-lg opacity-70 hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -mt-8 z-10 hidden lg:flex rounded-full shadow-lg opacity-70 hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>


        {/* Deals Slider Container (UPDATED with Hover Handlers) */}
        <div 
          ref={sliderRef}
          onMouseEnter={() => setIsHovered(true)} // PAUSE on hover
          onMouseLeave={() => setIsHovered(false)} // RESUME on mouse leave
          className="
            flex 
            overflow-x-scroll 
            whitespace-nowrap 
            py-4 -mx-4 px-4 
            lg:-mx-8 lg:px-8
            scrollbar-hide 
            [mask-image:linear-gradient(to_right,transparent,black_1%,black_99%,transparent)]
            hover:shadow-inner
            transition-shadow duration-500
          "
        >
          {/* Inner container for spacing */}
          <div className="flex space-x-4">
            {section.deals.map((deal, index) => (
              <Link 
                key={deal.title + index} 
                href={`/product/${index}`}
                className="
                  flex-shrink-0 
                  w-[calc(50%-8px)] sm:w-[calc(33.33%-10.66px)] 
                  // NEW: 4 items in a row (25% minus gap calculation)
                  md:w-[calc(25%-12px)] lg:w-[calc(25%-12px)] xl:w-[calc(25%-12px)]
                  max-w-[320px] // Slightly increased max width for larger cards
                "
              >
                <Card 
                  className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      sizes="(max-width: 640px) 150px, (max-width: 1024px) 250px, 320px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized={deal.image.includes('placehold.co')}
                    />
                    
                    {/* Discount Badge */}
                    <Badge className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold shadow-md">
                      {deal.discount} OFF
                    </Badge>

                    {/* Timer Badge */}
                    {timeLeft && timeLeft !== 'Expired' && (
                      <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="h-3 w-3 text-red-400" />
                        <span className="font-mono tracking-wider">{timeLeft}</span>
                      </div>
                    )}

                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="text-base font-semibold line-clamp-2 mb-1 min-h-[2.5rem] hover:text-orange-600 transition-colors">
                      {deal.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{deal.category}</p>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-red-600 text-xl leading-none">
                        ${deal.salePrice.toFixed(2)}
                      </span>
                      <span className="line-through text-gray-400 text-sm">
                        ${deal.originalPrice.toFixed(2)}
                      </span>
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