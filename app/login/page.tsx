"use client"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "../components/navbar"
import { Mail, Lock, Trash2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate authentication - Replace with your actual API call
    try {
      // For demo purposes, accept any email/password combination
      // In production, you would validate against your backend
      if (email && password) {
        console.log("Login successful:", { email })
        // Store user session (you can use localStorage, cookies, or your auth solution)
        localStorage.setItem("userEmail", email)
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError("Please enter both email and password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Trash2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to your citizen account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="remember" className="ml-2 block text-sm">Remember me</label>
              </div>
              <Link href="#" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account? <Link href="/register" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
