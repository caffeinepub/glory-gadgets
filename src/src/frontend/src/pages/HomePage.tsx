import { useEffect, useState } from "react";
import { useSearch, Link } from "@tanstack/react-router";
import { useGetAllProducts, useGetAllCategories, useSearchProducts } from "../hooks/useQueries";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
import type { Product } from "../backend";

export default function HomePage() {
  const search = useSearch({ from: "/" }) as { search?: string; category?: string };
  const searchQuery = search.search || "";
  const categoryFilter = search.category || "";

  const { data: allProducts = [], isLoading: isLoadingAll } = useGetAllProducts();
  const { data: searchResults = [], isLoading: isSearching } = useSearchProducts(searchQuery);
  const { data: categories = [] } = useGetAllCategories();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter);

  useEffect(() => {
    setSelectedCategory(categoryFilter);
  }, [categoryFilter]);

  // Determine which products to display
  let displayProducts: Product[] = [];
  let isLoading = false;

  if (searchQuery) {
    displayProducts = searchResults;
    isLoading = isSearching;
  } else {
    displayProducts = allProducts;
    isLoading = isLoadingAll;
  }

  // Filter by category
  if (selectedCategory) {
    displayProducts = displayProducts.filter(
      (p) => p.category.toString() === selectedCategory
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Discover Amazing Gadgets
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Shop the latest tech products with confidence. Quality guaranteed, fast delivery.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                size="sm"
              >
                All Products
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id.toString()}
                  variant={selectedCategory === cat.id.toString() ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  size="sm"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h3 className="text-xl font-heading font-semibold">
              Search results for "{searchQuery}"
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {displayProducts.length} {displayProducts.length === 1 ? "product" : "products"} found
            </p>
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try a different search term"
                : "Check back later for new products"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
