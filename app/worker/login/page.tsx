"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "../../components/navbar"
import { Mail, Lock, HardHat, AlertCircle } from "lucide-react"

interface Worker {
  id: string
  name: string
  phone: string
  email?: string
  status?: string
  password?: string
}

export default function WorkerLoginPage() {
  const [workerId, setWorkerId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [workers, setWorkers] = useState<Worker[]>([])
  const router = useRouter()

  useEffect(() => {
    // Load workers data from JSON
    fetch('/workers.json')
      .then(res => res.json())
      .then(data => {
        setWorkers(data)
      })
      .catch(err => {
        console.error('Failed to load workers data:', err)
      })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Authenticate worker from database
    const worker = workers.find(w => w.id === workerId)
    
    if (!worker) {
      setError("Worker ID not found. Please check your ID.")
      return
    }
    
    // Check password (use worker's password from DB or default)
    const workerPassword = worker.password || "worker123"
    
    if (password === workerPassword) {
      console.log("Worker Login Successful")
      // Store worker session with full data
      localStorage.setItem("workerId", worker.id)
      localStorage.setItem("workerName", worker.name)
      localStorage.setItem("workerPhone", worker.phone)
      localStorage.setItem("isWorker", "true")
      router.push("/worker/dashboard")
    } else {
      setError("Invalid password. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <HardHat className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Worker Portal</h2>
            <p className="mt-2 text-muted-foreground">Sign in to view your assignments</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="workerId" className="block text-sm font-medium mb-2">Worker ID</label>
              <div className="relative">
                <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="workerId"
                  type="text"
                  required
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your Worker ID"
                  list="worker-ids"
                />
                <datalist id="worker-ids">
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                  ))}
                </datalist>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {workers.length > 0 ? `${workers.length} workers registered` : 'Loading workers...'}
              </p>
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
            <button type="submit" className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Sign In as Worker
            </button>
            <div className="flex justify-between text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline font-medium">Citizen Login</Link>
              <Link href="/admin/login" className="text-primary hover:underline font-medium">Admin Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}