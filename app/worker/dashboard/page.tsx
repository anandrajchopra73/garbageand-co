"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import {
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
  Camera,
  Upload,
  X,
  LogOut,
  AlertCircle,
  Loader2,
  HardHat,
  FileText,
  Eye,
} from "lucide-react"

interface Complaint {
  id: number
  title: string
  description: string
  priority: string
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
  images?: string[]
  userEmail: string
  timestamp: string
  status: string
  date: string
  assignedWorker?: string
  completionImages?: string[]
  completionNotes?: string
  completedAt?: string
}

export default function WorkerDashboardPage() {
  const router = useRouter()
  const [workerId, setWorkerId] = useState("")
  const [workerName, setWorkerName] = useState("")
  const [isWorker, setIsWorker] = useState(false)
  const [myTasks, setMyTasks] = useState<Complaint[]>([])
  const [selectedTask, setSelectedTask] = useState<Complaint | null>(null)
  
  // Completion form
  const [completionImages, setCompletionImages] = useState<File[]>([])
  const [completionPreviews, setCompletionPreviews] = useState<string[]>([])
  const [completionNotes, setCompletionNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Check worker authentication
    const workerAuth = localStorage.getItem("isWorker")
    const id = localStorage.getItem("workerId")
    const name = localStorage.getItem("workerName")
    if (!workerAuth || !id) {
      router.push("/worker/login")
      return
    }
    setIsWorker(true)
    setWorkerId(id)
    setWorkerName(name || id)
    loadMyTasks(id)
  }, [])

  const loadMyTasks = (id: string) => {
    const stored = localStorage.getItem("userComplaints")
    if (stored) {
      const allComplaints: Complaint[] = JSON.parse(stored)
      // Filter tasks assigned to this worker
      const assigned = allComplaints.filter(c => c.assignedWorker === id)
      setMyTasks(assigned)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (completionImages.length + files.length > 5) {
      alert("Maximum 5 images allowed")
      return
    }

    setCompletionImages(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompletionPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setCompletionImages(prev => prev.filter((_, i) => i !== index))
    setCompletionPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleCompleteTask = async () => {
    if (!selectedTask) return
    
    if (completionImages.length === 0) {
      alert("Please upload at least one completion photo")
      return
    }

    setSubmitting(true)

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Update the complaint with completion data
      const stored = localStorage.getItem("userComplaints")
      if (stored) {
        const allComplaints: Complaint[] = JSON.parse(stored)
        const updated = allComplaints.map(c => {
          if (c.id === selectedTask.id) {
            return {
              ...c,
              status: "resolved",
              completionImages: completionImages.map(img => img.name),
              completionNotes,
              completedAt: new Date().toISOString(),
            }
          }
          return c
        })
        
        localStorage.setItem("userComplaints", JSON.stringify(updated))
        
        // Refresh tasks
        loadMyTasks(workerId)
        
        // Reset form
        setSelectedTask(null)
        setCompletionImages([])
        setCompletionPreviews([])
        setCompletionNotes("")
        
        alert("Task completed successfully!")
      }
    } catch (err) {
      alert("Failed to complete task. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("workerId")
    localStorage.removeItem("isWorker")
    router.push("/worker/login")
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "in-progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      pending: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    }
    return styles[priority as keyof typeof styles] || styles.medium
  }

  if (!isWorker) {
    return null
  }

  const pendingTasks = myTasks.filter(t => t.status === "pending" || t.status === "in-progress")
  const completedTasks = myTasks.filter(t => t.status === "resolved")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <HardHat className="h-8 w-8 text-primary" />
                Worker Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome, {workerName}
              </p>
              <p className="text-sm text-muted-foreground">
                Worker ID: {workerId}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assigned</p>
                  <p className="text-3xl font-bold mt-2">{myTasks.length}</p>
                </div>
                <FileText className="h-12 w-12 text-primary opacity-20" />
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                  <p className="text-3xl font-bold mt-2">{pendingTasks.length}</p>
                </div>
                <Clock className="h-12 w-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold mt-2">{completedTasks.length}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-card rounded-lg border shadow-sm mb-8">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Pending Tasks</h2>
              <p className="text-sm text-muted-foreground mt-1">Tasks assigned to you that need completion</p>
            </div>
            <div className="divide-y">
              {pendingTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No pending tasks</h3>
                  <p className="text-muted-foreground">All assigned tasks are completed</p>
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div key={task.id} className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{task.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Reported: {new Date(task.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Complete Task
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Completed Tasks</h2>
              <p className="text-sm text-muted-foreground mt-1">Tasks you have finished</p>
            </div>
            <div className="divide-y">
              {completedTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No completed tasks yet</h3>
                  <p className="text-muted-foreground">Complete your first task to see it here</p>
                </div>
              ) : (
                completedTasks.map((task) => (
                  <div key={task.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{task.location}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Complete Task</h2>
              <button
                onClick={() => {
                  setSelectedTask(null)
                  setCompletionImages([])
                  setCompletionPreviews([])
                  setCompletionNotes("")
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Details */}
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">{selectedTask.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedTask.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedTask.location}</span>
                </div>
              </div>

              {/* Upload Completion Photos */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Completion Photos * (Max 5)
                </label>
                
                {completionPreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {completionPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Completion ${index + 1}`}
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
                      <span className="font-semibold">Click to upload</span> completion photos
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={completionImages.length >= 5}
                  />
                </label>
              </div>

              {/* Completion Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Completion Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Add any notes about the completed work..."
                />
              </div>
            </div>

            <div className="border-t p-6 flex gap-4">
              <button
                onClick={() => {
                  setSelectedTask(null)
                  setCompletionImages([])
                  setCompletionPreviews([])
                  setCompletionNotes("")
                }}
                className="flex-1 px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteTask}
                disabled={submitting || completionImages.length === 0}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  "Mark as Complete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}