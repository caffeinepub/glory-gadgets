import { useNavigate } from "@tanstack/react-router";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useGetAllProducts } from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { Product } from "../backend";

export default function CartPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [], isLoading: cartLoading } = useGetCart();
  const { data: allProducts = [], isLoading: productsLoading } = useGetAllProducts();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const isAuthenticated = !!identity;

  // Get product details for cart items
  const cartItemsWithDetails = cart.map((item) => {
    const product = allProducts.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = cartItemsWithDetails.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * Number(item.quantity);
  }, 0);

  const handleUpdateQuantity = async (productId: bigint, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem.mutateAsync({ productId, quantity: BigInt(newQuantity) });
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to proceed to checkout");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate({ to: "/checkout" });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-semibold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Please log in to view your shopping cart
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Go to Home</Button>
      </div>
    );
  }

  if (cartLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some amazing gadgets to your cart!
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItemsWithDetails.map((item) => {
            const product = item.product;
            if (!product) return null;

            const imageUrl = product.image.getDirectURL();
            const itemTotal = product.price * Number(item.quantity);

            return (
              <Card key={product.id.toString()}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-4 mb-2">
                        <h3 className="font-heading font-semibold text-lg line-clamp-2">
                          {product.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(product.id)}
                          disabled={removeFromCart.isPending}
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(product.id, Number(item.quantity) - 1)
                            }
                            disabled={
                              updateCartItem.isPending || Number(item.quantity) <= 1
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {Number(item.quantity)}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(product.id, Number(item.quantity) + 1)
                            }
                            disabled={updateCartItem.isPending}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} each</p>
                          <p className="text-lg font-bold">${itemTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-heading font-bold mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items ({cart.length})</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 gap-2 h-12 text-lg font-semibold"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate({ to: "/" })}
                className="w-full mt-3"
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
