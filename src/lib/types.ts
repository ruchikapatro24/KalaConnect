

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductSale {
    month: string;
    unitsSold: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  sellerId: string;
  tags?: string[];
  culturalContext?: string;
  aiGenerated?: boolean;
  dataAiHint?: string;
  color?: string;
  sustainabilityCoins?: number;
  reviews?: Review[];
  stock: number;
  sales?: ProductSale[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
    id: string;
    date: string;
    items: CartItem[];
    total: number;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    sustainabilityCoinsEarned: number;
}

export interface Seller {
  id: string;
  name: string;
  story: string;
  logo: string;
  craftswomanName: string;
  background: string;
  coverImage: string;
  logoDataAiHint: string;
  coverDataAiHint: string;
}

export interface Reel {
  id: string;
  videoUrl: string;
  caption: string;
  sellerId: string;
  taggedProductIds: string[];
  script?: string;
  aiGenerated?: boolean;
}

export type UserRole = 'user' | 'shopper';

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  sustainabilityCoins: number;
  orders: Order[];
}
