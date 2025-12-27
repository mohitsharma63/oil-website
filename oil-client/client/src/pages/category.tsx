import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Category, SubCategory } from "@/lib/types";
import { oliGetJson, oliUrl } from "@/lib/oliApi";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug || "";
  const [location] = useLocation();

  const querySub = (() => {
    const idx = location.indexOf("?");
    if (idx === -1) return "";
    const qs = location.slice(idx + 1);
    return new URLSearchParams(qs).get("sub") ?? "";
  })();

  const [selectedSubcategory, setSelectedSubcategory] = useState(querySub || "all");

  useEffect(() => {
    setSelectedSubcategory(querySub || "all");
  }, [categorySlug, querySub]);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [oliUrl("/api/categories")],
    queryFn: () => oliGetJson<Category[]>("/api/categories"),
  });

  const category = categories?.find((c) => c.slug === categorySlug);
  const categoryId = category?.id;

  const { data: subcategories } = useQuery<SubCategory[]>({
    queryKey: [oliUrl(`/api/subcategories?categoryId=${categoryId ?? ""}`)],
    enabled: !!categoryId,
    queryFn: () => oliGetJson<SubCategory[]>(`/api/subcategories?categoryId=${categoryId}`),
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [oliUrl("/api/products")],
    queryFn: () => oliGetJson<Product[]>("/api/products"),
  });

  const selectedSubCategoryId =
    selectedSubcategory === "all"
      ? undefined
      : subcategories?.find((sc) => sc.slug === selectedSubcategory)?.id;

  // Filter products based on selected subcategory
  const products = allProducts.filter((product) => {
    const matchesCategory =
      !!categoryId &&
      (product.categoryId === categoryId ||
        product.category === categorySlug ||
        product.category === category?.slug);

    if (!matchesCategory) return false;
    if (selectedSubcategory === "all") return true;
    if (selectedSubCategoryId !== undefined) return product.subCategoryId === selectedSubCategoryId;
    return product.subcategory === selectedSubcategory;
  });

  if (categoriesLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Link href="/">
            <span className="text-red-500 hover:text-red-600 font-medium">← Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedSubcategory} onValueChange={(value) => setSelectedSubcategory(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {(subcategories ?? []).map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.slug}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select defaultValue="popular">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-skin">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Skin Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-skin">All Skin Types</SelectItem>
              <SelectItem value="oily">Oily Skin</SelectItem>
              <SelectItem value="dry">Dry Skin</SelectItem>
              <SelectItem value="sensitive">Sensitive Skin</SelectItem>
              <SelectItem value="combination">Combination Skin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Product count */}
            <div className="text-center mt-12">
              <p className="text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''} in {category.name}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your filters or check back later.</p>
            <Link href="/">
              <span className="text-red-500 hover:text-red-600 font-medium">← Continue Shopping</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
