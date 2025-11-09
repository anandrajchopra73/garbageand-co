"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "./components/navbar"
import { Footer } from "./components/footer"
import { Trash2, UserPlus, FileText, LayoutDashboard, ClipboardList, Truck, MessageSquare } from "lucide-react"

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1920&h=1080&fit=crop",
    alt: "Waste management workers collecting garbage"
  },
  {
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=1920&h=1080&fit=crop",
    alt: "Clean city streets"
  },
  {
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=1920&h=1080&fit=crop",
    alt: "Recycling and waste sorting"
  },
  {
    image: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=1920&h=1080&fit=crop",
    alt: "Green sustainable city"
  }
]

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(timer)
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Slider */}
        <div className="absolute inset-0 w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />
            </div>
          ))}
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-lg">
              Report, Track, Transform
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
              SmartBinX is an innovative platform designed to make waste collection efficient and transparent. 
              Citizens can easily register, report garbage issues, and track real-time progress, while administrators 
              manage and assign tasks to sanitation workers seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Report Issue Now
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/80 bg-white/10 backdrop-blur-sm px-8 py-3 text-lg font-medium text-white hover:bg-white/20 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Trash2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              🗑️ About SmartBinX
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground text-center">
              <p>
                SmartBinX is a digital waste management platform that connects citizens, administrators, 
                and sanitation workers to keep our cities clean and efficient.
              </p>
              <p>
                Through this app, users can easily report garbage issues, track progress, and see when 
                the problem is resolved. Admins manage complaints, assign tasks to workers, and ensure 
                timely waste collection through a single dashboard.
              </p>
              <p>
                SmartBinX simplifies waste management by promoting transparency, teamwork, and real-time 
                monitoring — turning everyday efforts into a cleaner and smarter tomorrow.
              </p>
              <p className="font-semibold text-primary text-xl">
                Report. Track. Transform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card rounded-lg p-6 shadow-sm border space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Citizen Registration/ Login</h3>
              <p className="text-muted-foreground">
                Users create an account and log in to start reporting issues.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Complaint Submission</h3>
              <p className="text-muted-foreground">
                Report garbage with photos, location, and details.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Admin Dashboard</h3>
              <p className="text-muted-foreground">
                Admins review reports and manage the system.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Task Allocation</h3>
              <p className="text-muted-foreground">
                Admins assign cleanup tasks to sanitation workers.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Waste Collection</h3>
              <p className="text-muted-foreground">
                Workers are assigned and proceed with waste collection.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Tracking & Feedback</h3>
              <p className="text-muted-foreground">
                Citizens track progress and provide feedback on resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
