"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  LogOut,
  User,
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

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState("")
  const [userName, setUserName] = useState("")
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    const name = localStorage.getItem("userName")
    if (!email) {
      router.push("/login")
    } else {
      setUserEmail(email)
      setUserName(name || email.split("@")[0])
      // Load user's complaints
      loadUserComplaints(email)
    }
  }, [router])

  const loadUserComplaints = (email: string) => {
    const stored = localStorage.getItem("userComplaints")
    if (stored) {
      const allComplaints = JSON.parse(stored)
      // Filter complaints for this user
      const userComplaints = allComplaints.filter((c: Complaint) => c.userEmail === email)
      setComplaints(userComplaints)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    router.push("/")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
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

  if (!userEmail) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Welcome back, {userName}
              </p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/report-issue')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Report New Issue
              </button>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-3xl font-bold mt-2">{complaints.length}</p>
                </div>
                <FileText className="h-12 w-12 text-primary opacity-20" />
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold mt-2">
                    {complaints.filter((c) => c.status === "pending").length}
                  </p>
                </div>
                <AlertCircle className="h-12 w-12 text-red-500 opacity-20" />
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold mt-2">
                    {complaints.filter((c) => c.status === "in-progress").length}
                  </p>
                </div>
                <Clock className="h-12 w-12 text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold mt-2">
                    {complaints.filter((c) => c.status === "resolved").length}
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Complaints List */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">My Reports</h2>
              <p className="text-sm text-muted-foreground mt-1">Track all your waste collection reports</p>
            </div>
            <div className="divide-y">
              {complaints.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                  <p className="text-muted-foreground mb-4">Start by reporting your first waste issue</p>
                  <button 
                    onClick={() => router.push('/report-issue')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Report Issue
                  </button>
                </div>
              ) : (
                complaints.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="p-6 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(complaint.status)}
                          <h3 className="font-semibold text-lg">{complaint.title}</h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{complaint.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {complaint.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reported on {new Date(complaint.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                        {complaint.status === "resolved" && complaint.completedAt && (
                          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <p className="text-sm font-medium text-green-900 dark:text-green-400">
                                Work Completed
                              </p>
                            </div>
                            <p className="text-xs text-green-800 dark:text-green-500">
                              Completed on {new Date(complaint.completedAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {complaint.completionNotes && (
                              <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                                <strong>Notes:</strong> {complaint.completionNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>
                        <button className="text-sm text-primary hover:underline">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
