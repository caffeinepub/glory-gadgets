import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCart, useIsCallerAdmin } from "../hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: cart = [] } = useGetCart();
  const { data: isAdmin = false } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const cartItemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate({ to: "/" });
    } else {
      try {
        await login();
        toast.success("Logged in successfully");
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/", search: { search: searchQuery.trim() } });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 border-b border-border shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <h1 className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              GLORY GADGETS
            </h1>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative group">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search for gadgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-11 bg-background border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden md:flex gap-2"
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              size="icon"
              className="relative"
            >
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </Button>

            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              className="gap-2"
              variant={isAuthenticated ? "outline" : "default"}
            >
              {isLoggingIn ? (
                "Loading..."
              ) : isAuthenticated ? (
                <>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline">Login</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
