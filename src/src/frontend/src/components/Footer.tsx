import { Heart, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              GLORY GADGETS
            </h3>
            <p className="text-sm text-muted-foreground">
              Your trusted destination for the latest gadgets and electronics.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-foreground mb-3">
              Contact Us
            </h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <a href="tel:9892246308" className="hover:text-primary transition-colors">
                9892246308
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>R.N.15 DHARAVI MUMBAI</span>
            </div>
          </div>

          {/* Credits */}
          <div className="flex flex-col justify-end">
            <p className="text-sm text-muted-foreground text-right">
              © 2026. Built with{" "}
              <Heart className="inline h-4 w-4 text-primary fill-primary animate-pulse" />{" "}
              using{" "}
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
