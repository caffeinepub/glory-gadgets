import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "../backend";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.image.getDirectURL();

  return (
    <Link to="/product/$id" params={{ id: product.id.toString() }}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border h-full">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Floating price badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg px-3 py-1.5 text-sm font-bold">
              ${product.price.toFixed(2)}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-medium">
              {product.rating > 0 ? product.rating.toFixed(1) : "New"}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {product.rating > 0 ? "rating" : "product"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
