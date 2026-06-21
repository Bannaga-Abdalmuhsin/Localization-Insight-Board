import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <p className="text-sm text-muted-foreground">Page not found</p>
      <Link href="/">
        <span className="text-sm text-primary font-medium hover:underline cursor-pointer">Go to Dashboard</span>
      </Link>
    </div>
  );
}
