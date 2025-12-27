export interface Product {
  id: number;
  categoryId?: number;
  subCategoryId?: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string | number;
  originalPrice?: string | number;
  category?: string;
  subcategory?: string;
  imageUrl: string;
  rating: string | number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  newLaunch: boolean;
  saleOffer?: string;
  variants?: {
    colors?: string[];
    shades?: string[];
    sizes?: string[];
  };
  ingredients?: string[];
  benefits?: string[];
  howToUse?: string;
  size?: string;
  tags?: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description?: string;
  productCount?: number;
}

export interface SubCategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
}

export interface Slider {
  id: number;
  title: string;
  imageUrl: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}
