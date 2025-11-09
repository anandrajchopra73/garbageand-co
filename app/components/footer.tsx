import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/logo-old.png" alt="SmartBinX Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold">SmartBinX</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">Making communities cleaner, one report at a time. Report, track, and transform waste management in your area.</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Quick Links</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/#about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
              <Link href="/register" className="hover:text-primary transition-colors">Register</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Admin</h3>
            <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Login</Link>
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2025 SmartBinX. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
