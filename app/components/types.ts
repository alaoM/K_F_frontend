export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  bannerImg: string
  image: string;
  vendor: string;
  
  // Images
  primaryImage: string;
  otherImages: string[];

  // Trust Signals (Mappings from your Entity)
  averageRating: number;
  reviewCount: number;  
  isOrganic: boolean;
  isVerifiedVendor: boolean;
  location: string;

   category: {
    id: string;
    name: string;
  };
  categoryId: string;

   seller: {
    id: string;
    companyName: string; 
    businessName: string; 
  };
  sellerProfileId: string;

  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewer: {
      id: string;
      name: string;
      avatar: string;
    };
  }>;

  views: number;
  attributes: Record<string, any>;
  // status: ProductStatus;
  createdAt: string | Date;
  updatedAt: string | Date;


  // Frontend local state only
  quantity?: number; // Used for Cart management
}