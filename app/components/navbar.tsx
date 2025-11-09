"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo-old.png" alt="SmartBinX Logo" width={48} height={48} className="h-12 w-12" />
            <span className="text-xl font-bold">SmartBinX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
            <Link href="/worker/login" className="text-sm font-medium hover:text-primary transition-colors">Worker</Link>
            <Link href="/admin/login" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
            <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Get Started</Link>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3 animate-in slide-in-from-top-2">
            <Link 
              href="/" 
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/#about" 
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/worker/login" 
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Worker
            </Link>
            <Link 
              href="/admin/login" 
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
            <Link 
              href="/login" 
              className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="block mx-4 text-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
