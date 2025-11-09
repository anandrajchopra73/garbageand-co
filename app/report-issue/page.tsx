"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import {
  Camera,
  MapPin,
  Upload,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  address: string
}

export default function ReportIssuePage() {
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()
  
  // Form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [location, setLocation] = useState<LocationData | null>(null)
  
  // UI states
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    if (!email) {
      router.push("/login")
    } else {
      setUserEmail(email)
    }
  }, [router])

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }

    // Add new images
    setImages(prev => [...prev, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  // Remove image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Get current location
  const getLocation = () => {
    setLoadingLocation(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await response.json()
          
          setLocation({
            latitude,
            longitude,
            address: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          })
        } catch (err) {
          // Fallback to coordinates if address fetch fails
          setLocation({
            latitude,
            longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          })
        }
        
        setLoadingLocation(false)
      },
      (error) => {
        setLocationError(
          error.code === 1
            ? "Location access denied. Please enable location services."
            : "Unable to retrieve your location."
        )
        setLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (images.length === 0) {
      setError("Please upload at least one photo")
      return
    }
    
    if (!location) {
      setError("Please add your location")
      return
    }

    setSubmitting(true)

    try {
      // Simulate API call - Replace with your actual backend API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, you would:
      // 1. Upload images to cloud storage (S3, Cloudinary, etc.)
      // 2. Send complaint data to your backend API
      // 3. Save to database
      
      const complaintData = {
        title,
        description,
        priority,
        location: location.address,
        coordinates: {
          lat: location.latitude,
          lng: location.longitude,
        },
        images: images.map(img => img.name),
        userEmail,
        timestamp: new Date().toISOString(),
      }
      
      console.log("Complaint submitted:", complaintData)
      
      // Store in localStorage for demo (in production, this comes from your backend)
      const existingComplaints = JSON.parse(localStorage.getItem("userComplaints") || "[]")
      existingComplaints.push({
        id: Date.now(),
        ...complaintData,
        status: "pending",
        date: new Date().toISOString().split('T')[0],
      })
      localStorage.setItem("userComplaints", JSON.stringify(existingComplaints))
      
      setSubmitSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
      
    } catch (err) {
      setError("Failed to submit complaint. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!userEmail) {
    return null
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center space-y-4">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
            <h2 className="text-3xl font-bold">Report Submitted!</h2>
            <p className="text-muted-foreground">
              Your complaint has been submitted successfully. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>

          <div className="bg-card rounded-lg border shadow-sm p-8">
            <h1 className="text-3xl font-bold mb-2">Report Waste Issue</h1>
            <p className="text-muted-foreground mb-8">
              Help keep our community clean by reporting waste collection issues
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Issue Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Overflowing bin on Main Street"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-2">
                  Priority Level *
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Photos * (Max 5)
                </label>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG (MAX. 5 images)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={images.length >= 5}
                  />
                </label>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location *
                </label>
                
                {location ? (
                  <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="font-medium">Location Detected</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{location.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLocation(null)}
                        className="text-sm text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={getLocation}
                    disabled={loadingLocation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingLocation ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Detecting Location...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5" />
                        <span>Get Current Location</span>
                      </>
                    )}
                  </button>
                )}

                {locationError && (
                  <p className="text-sm text-destructive mt-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {locationError}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}