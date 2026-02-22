import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useGetCart, useGetAllProducts, usePlaceOrder, useGetCallerUserProfile } from "../hooks/useQueries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cart = [] } = useGetCart();
  const { data: allProducts = [] } = useGetAllProducts();
  const { data: userProfile } = useGetCallerUserProfile();
  const placeOrder = usePlaceOrder();

  const [customerName, setCustomerName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");

  const isAuthenticated = !!identity;

  // Calculate cart items with product details
  const cartItemsWithDetails = cart.map((item) => {
    const product = allProducts.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = cartItemsWithDetails.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * Number(item.quantity);
  }, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to place an order");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const orderId = await placeOrder.mutateAsync({
        customerName: customerName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        paymentMethod,
      });

      toast.success(
        paymentMethod === "UPI"
          ? "Order placed! Please complete the UPI payment"
          : "Order placed successfully!"
      );

      navigate({ to: "/" });
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-heading font-semibold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Please log in to proceed with checkout
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Go to Home</Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-heading font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add some products to your cart before checking out
        </p>
        <Button onClick={() => navigate({ to: "/" })}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="tel"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    placeholder="Enter your complete delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as "COD" | "UPI")}
                >
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="COD" id="cod" />
                    <Label
                      htmlFor="cod"
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <Wallet className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          Pay when you receive your order
                        </p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value="UPI" id="upi" />
                    <Label
                      htmlFor="upi"
                      className="flex-1 cursor-pointer flex items-center gap-3"
                    >
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">UPI Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Pay instantly using UPI
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "UPI" && (
                  <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm font-semibold mb-2">UPI Payment Details:</p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Please pay to the following UPI ID:
                    </p>
                    <p className="text-lg font-mono font-bold text-primary select-all">
                      9892246308-2@axl
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      After placing the order, please complete the payment using your UPI app.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-heading">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItemsWithDetails.map((item) => {
                    const product = item.product;
                    if (!product) return null;

                    return (
                      <div key={product.id.toString()} className="flex gap-3">
                        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                          <img
                            src={product.image.getDirectURL()}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {Number(item.quantity)} × ${product.price.toFixed(2)}
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            ${(product.price * Number(item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({cart.length} items)
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-accent">Free</span>
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
                  type="submit"
                  disabled={placeOrder.isPending}
                  className="w-full gap-2 h-12 text-lg font-semibold"
                  size="lg"
                >
                  {placeOrder.isPending && (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  )}
                  {placeOrder.isPending ? "Placing Order..." : "Place Order"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
