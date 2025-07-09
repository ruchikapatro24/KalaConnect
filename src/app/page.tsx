

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Percent, Search, Sparkles, Tag, Truck, Frown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { ProductCard } from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductStore } from '@/hooks/use-product-store';
import { mockSellers } from '@/lib/mock-data';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/hooks/use-i18n';

const categories = [
  'home-decor', 'fashion', 'art', 'kitchen', 'spiritual', 'beauty', 'toys', 'textiles'
];

export default function Home() {
  const { products } = useProductStore();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((product) =>
        selectedCategories.length === 0
          ? true
          : selectedCategories.some((cat) => product.tags?.includes(cat))
      )
      .filter(
        (product) =>
          product.price >= priceRange[0] && product.price <= priceRange[1]
      );
  }, [products, searchTerm, selectedCategories, priceRange]);

  const discountedProducts = products.filter(p => p.originalPrice).slice(0, 10);
  const sellers = mockSellers;

  const heroSlides = [
    {
      title: t('HomePage.HeroTitle1'),
      description: t('HomePage.HeroDescription1'),
      image: "https://png.pngtree.com/background/20250315/original/pngtree-artisan-craftsman-shaping-clay-pot-on-pottery-wheel-in-workshop-picture-image_16015526.jpg",
      aiHint: "pottery making",
      link: "#products"
    },
    {
      title: t('HomePage.HeroTitle2'),
      description: t('HomePage.HeroDescription2'),
      image: "https://placehold.co/1200x600.png",
      aiHint: "holi festival colors",
      link: "#deals"
    },
    {
      title: t('HomePage.HeroTitle3'),
      description: t('HomePage.HeroDescription3'),
      image: "https://placehold.co/1200x600.png",
      aiHint: "silk weaving loom",
      link: "#products"
    },
    {
      title: "Handmade Pottery Showcase",
      description: "Discover unique pottery, handcrafted with love by our talented artisans.",
      image: "https://placehold.co/1200x600.png",
      aiHint: "pottery making hands",
      link: "#products"
    }
  ];

  const infoBadges = [
    { text: t('HomePage.FreeShipping'), icon: <Truck className="h-6 w-6 text-primary" /> },
    { text: t('HomePage.AuthenticCrafts'), icon: <Sparkles className="h-6 w-6 text-primary" /> },
    { text: t('HomePage.BestPrices'), icon: <Tag className="h-6 w-6 text-primary" /> },
    { text: t('HomePage.AmazingDiscounts'), icon: <Percent className="h-6 w-6 text-primary" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full">
          <Carousel
            opts={{ loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-[50vh] md:h-[70vh] w-full">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover brightness-50"
                      data-ai-hint={slide.aiHint}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                      <h1 className="font-headline text-4xl md:text-6xl font-bold">
                        {slide.title}
                      </h1>
                      <p className="max-w-2xl mt-4 text-lg md:text-xl">
                        {slide.description}
                      </p>
                      <Button asChild className="mt-8">
                        <Link href={slide.link}>{t('HomePage.ShopNow')}</Link>
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
          </Carousel>
        </section>

        <section className="bg-muted">
            <div className="container mx-auto px-4 md:px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {infoBadges.map((badge) => (
                       <div key={badge.text} className="flex items-center justify-center gap-2">
                        {badge.icon}
                        <span className="text-sm font-medium">{badge.text}</span>
                    </div>
                    ))}
                </div>
            </div>
        </section>

        {discountedProducts.length > 0 && (
          <section id="deals" className="py-12 md:py-16">
            <div className="container px-4 md:px-6">
              <h2 className="font-headline text-2xl md:text-3xl font-bold mb-8 text-center">{t('HomePage.DealsOfTheDay')}</h2>
              <Carousel opts={{ align: "start" }}>
                <CarouselContent className="-ml-4">
                  {discountedProducts.map((product) => (
                    <CarouselItem key={product.id} className="pl-4 md:basis-1/3 lg:basis-1/5">
                      <ProductCard product={product} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          </section>
        )}
        
        <Separator />

        <section id="products" className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <h2 className="font-headline text-2xl md:text-3xl font-bold mb-8 text-center">{t('HomePage.ExploreCollection')}</h2>
            <div className="grid lg:grid-cols-4 gap-8">
              <aside className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Search</h3>
                       <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search products..."
                          className="w-full pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-4">Category</h3>
                      <div className="space-y-3">
                        {categories.map((cat) => (
                          <div key={cat} className="flex items-center space-x-2">
                            <Checkbox
                              id={cat}
                              checked={selectedCategories.includes(cat)}
                              onCheckedChange={() => handleCategoryChange(cat)}
                            />
                            <Label htmlFor={cat} className="capitalize cursor-pointer">
                              {cat.replace('-', ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Price Range</h3>
                      <Slider
                        value={priceRange}
                        onValueChange={(value: [number, number]) => setPriceRange(value)}
                        max={15000}
                        step={100}
                      />
                       <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => {
                        setSelectedCategories([]);
                        setPriceRange([0, 15000]);
                        setSearchTerm('');
                    }}>Clear Filters</Button>
                  </CardContent>
                </Card>
              </aside>

              <div className="lg:col-span-3">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground col-span-full">
                    <Frown className="mx-auto h-12 w-12" />
                    <p className="mt-4">No products match your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted">
            <div className="container px-4 md:px-6">
                <h2 className="font-headline text-2xl md:text-3xl font-bold mb-8 text-center">{t('HomePage.FeaturedArtisans')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-start text-center">
                    {sellers.map((seller) => (
                        <Link href={`/seller/${seller.id}`} key={seller.id} className="group">
                            <div className="flex flex-col items-center justify-center gap-2">
                               <Avatar className="h-20 w-20 transition-transform duration-300 group-hover:scale-110">
                                  <AvatarImage src={seller.logo} alt={seller.name} data-ai-hint={seller.logoDataAiHint} />
                                  <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <p className="text-sm font-semibold font-headline group-hover:text-primary">{seller.name}</p>
                               <p className="text-xs text-muted-foreground">{seller.craftswomanName}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}
