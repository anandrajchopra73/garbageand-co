"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "../../components/navbar"
import { Footer } from "../../components/footer"
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Trash2,
  MapPin,
  Calendar,
  UserCheck,
  Eye,
  X,
  LogOut,
  Filter,
  Search,
  Camera,
} from "lucide-react"

interface Worker {
  id: string
  name: string
  phone: string
  email?: string
  status?: string
}

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

export default function AdminDashboardPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [workers, setWorkers] = useState<Worker[]>([])

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem("isAdmin")
    if (!adminAuth) {
      router.push("/admin/login")
      return
    }
    setIsAdmin(true)

    // Load workers from JSON
    loadWorkers()
    
    // Load complaints from localStorage
    loadComplaints()
  }, [])

  const loadWorkers = async () => {
    try {
      const response = await fetch('/workers.json')
      const data = await response.json()
      setWorkers(data)
    } catch (err) {
      console.error('Failed to load workers:', err)
    }
  }

  useEffect(() => {
    // Apply filters
    let filtered = complaints

    if (filterStatus !== "all") {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredComplaints(filtered)
  }, [complaints, filterStatus, searchQuery])

  const loadComplaints = async () => {
    try {
      const response = await fetch('/api/complaints');
      const result = await response.json();
      
      if (result.success) {
        // Transform API data to match the component's expected format
        const transformedComplaints = result.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          priority: c.priority,
          location: c.location_address,
          coordinates: c.latitude && c.longitude ? {
            lat: parseFloat(c.latitude),
            lng: parseFloat(c.longitude)
          } : undefined,
          images: c.images_data || [],
          userEmail: c.metadata?.userEmail || c.citizen_name,
          timestamp: c.created_at,
          status: c.status,
          date: new Date(c.created_at).toISOString().split('T')[0],
          assignedWorker: c.worker_name,
          completionImages: c.metadata?.completionImages,
          completionNotes: c.metadata?.completionNotes,
          completedAt: c.resolved_at
        }));
        setComplaints(transformedComplaints);
      }
    } catch (error) {
      console.error('Failed to load complaints:', error);
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem("userComplaints");
      if (stored) {
        setComplaints(JSON.parse(stored));
      }
    }
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

  const handleStatusUpdate = async (complaintId: number, newStatus: string) => {
    try {
      // Get admin user ID from localStorage
      const userId = localStorage.getItem("userId");
      
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          userId: parseInt(userId || '0'),
          notes: `Status updated to ${newStatus} by admin`
        })
      });

      if (response.ok) {
        // Update local state
        const updated = complaints.map(c =>
          c.id === complaintId ? { ...c, status: newStatus } : c
        );
        setComplaints(updated);
        
        if (selectedComplaint?.id === complaintId) {
          setSelectedComplaint({ ...selectedComplaint, status: newStatus });
        }
        
        // Reload complaints to get fresh data
        loadComplaints();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      // Fallback to localStorage
      const updated = complaints.map(c =>
        c.id === complaintId ? { ...c, status: newStatus } : c
      );
      setComplaints(updated);
      localStorage.setItem("userComplaints", JSON.stringify(updated));
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, status: newStatus })
    }
  }

  const handleWorkerAssignment = (complaintId: number, worker: string) => {
    const updated = complaints.map(c =>
      c.id === complaintId ? { ...c, assignedWorker: worker } : c
    )
    setComplaints(updated)
    localStorage.setItem("userComplaints", JSON.stringify(updated))
    if (selectedComplaint?.id === complaintId) {
      setSelectedComplaint({ ...selectedComplaint, assignedWorker: worker })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminEmail")
    localStorage.removeItem("isAdmin")
    router.push("/admin/login")
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage complaints and assign tasks to workers
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

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, location, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-lg p-6 border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Complaints</p>
                  <p className="text-3xl font-bold mt-2">{complaints.length}</p>
                </div>
                <Trash2 className="h-12 w-12 text-primary opacity-20" />
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

          {/* Complaints Table */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">All Complaints</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Citizen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        {complaints.length === 0
                          ? "No complaints submitted yet"
                          : "No complaints match your filters"}
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          #{complaint.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{complaint.userEmail.split('@')[0]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate max-w-[200px]">{complaint.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">
                          {complaint.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(complaint.status)}
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                                complaint.status
                              )}`}
                            >
                              {complaint.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {complaint.assignedWorker ? (
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                              {complaint.assignedWorker}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedComplaint(complaint)}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Complaint Details</h2>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Complaint ID</p>
                  <p className="font-semibold">#{selectedComplaint.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Submitted By</p>
                  <p className="font-semibold">{selectedComplaint.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date Submitted</p>
                  <p className="font-semibold">
                    {new Date(selectedComplaint.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(
                      selectedComplaint.priority
                    )}`}
                  >
                    {selectedComplaint.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Issue Title</p>
                <p className="text-lg font-semibold">{selectedComplaint.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedComplaint.description}</p>
              </div>

              {/* Location */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Location</p>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{selectedComplaint.location}</p>
                      {selectedComplaint.coordinates && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Coordinates: {selectedComplaint.coordinates.lat.toFixed(6)}, {selectedComplaint.coordinates.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Original Problem Images */}
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Problem Photos (Citizen)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedComplaint.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg border overflow-hidden bg-muted">
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Camera className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs">{image}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completion Photos - Worker */}
              {selectedComplaint.completionImages && selectedComplaint.completionImages.length > 0 && (
                <div className="border-t pt-6">
                  <p className="text-sm text-muted-foreground mb-2">Completion Photos (Worker)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedComplaint.completionImages.map((image: string, index: number) => (
                      <div key={index} className="aspect-square rounded-lg border overflow-hidden bg-green-50 dark:bg-green-900/10">
                        <div className="w-full h-full flex items-center justify-center text-green-600">
                          <div className="text-center">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-xs">{image}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedComplaint.completionNotes && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-400 mb-1">Worker Notes:</p>
                      <p className="text-sm text-green-800 dark:text-green-500">{selectedComplaint.completionNotes}</p>
                    </div>
                  )}
                  {selectedComplaint.completedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Completed on: {new Date(selectedComplaint.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Status Management */}
              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground mb-3">Update Status</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, "pending")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedComplaint.status === "pending"
                        ? "bg-red-500 text-white"
                        : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, "in-progress")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedComplaint.status === "in-progress"
                        ? "bg-yellow-500 text-white"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedComplaint.id, "resolved")}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedComplaint.status === "resolved"
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Worker Assignment */}
              <div>
                <p className="text-sm text-muted-foreground mb-3">Assign Worker</p>
                <div className="flex gap-3">
                  <select
                    value={selectedComplaint.assignedWorker || ""}
                    onChange={(e) => handleWorkerAssignment(selectedComplaint.id, e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Worker</option>
                    {workers.length > 0 ? (
                      workers.map(worker => (
                        <option key={worker.id} value={worker.id}>
                          {worker.name} ({worker.id}) - {worker.phone}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading workers...</option>
                    )}
                  </select>
                  {selectedComplaint.assignedWorker && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <UserCheck className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-400">
                        Assigned
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t p-6">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
