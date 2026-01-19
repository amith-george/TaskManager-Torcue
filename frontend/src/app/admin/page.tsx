"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-config";
import { signOut } from "firebase/auth";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import AdminHeader from "@/app/admin/AdminHeader"; 
import CreateTaskForm from "@/app/admin/CreateTaskForm";
import TaskGrid from "@/app/admin/TaskGrid";
import TaskStats from "@/app/admin/TaskStats"; 
import { useSocket } from "@/hooks/useSocket"; 

// Updated Notification Interface
interface Notification {
  id: number;
  taskTitle: string;
  newStatus: string;
  userEmail: string;
  time: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const socket = useSocket(); 

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, urgent: 0 }); 
  
  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showUrgent, setShowUrgent] = useState(false);
  const [filterStatus, setFilterStatus] = useState("active"); 
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/");
        return;
      }
      fetchInitialData();
    }
  }, [user, authLoading, router]);

  // Search & Filter Listener
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) fetchTasks(); 
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, showUrgent, filterStatus]); 

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    // 1. Task Created
    socket.on("task_created", (newTask: any) => {
        setTasks((prev) => [newTask, ...prev]);
        refreshStats();
    });

    // 2. Task Updated
    socket.on("task_updated", (updatedTask: any) => {
        // Update Grid
        setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
        refreshStats();

        // NEW: Add structured Notification
        // Safely access email since we populated it in the backend
        const email = typeof updatedTask.assignedTo === 'object' 
            ? updatedTask.assignedTo.email 
            : "Unknown User";

        const notif: Notification = {
          id: Date.now(),
          taskTitle: updatedTask.title,
          newStatus: updatedTask.status,
          userEmail: email,
          time: new Date().toLocaleString('en-GB', { 
             day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
          })
        };
        
        setNotifications((prev) => [notif, ...prev]);
        
        // Removed Toast as requested
    });

    // 3. Task Deleted
    socket.on("task_deleted", (deletedId: string) => {
        setTasks((prev) => prev.filter((t) => t._id !== deletedId));
        refreshStats();
    });

    // 4. User Registered
    socket.on("user_registered", (newUser: any) => {
        setUsers((prev: any) => [...prev, newUser]);
    });

    return () => {
        socket.off("task_created");
        socket.off("task_updated");
        socket.off("task_deleted");
        socket.off("user_registered");
    };
  }, [socket]);

  const refreshStats = async () => {
    try {
        const { data } = await api.get("/tasks/stats");
        setStats(data.data || { total: 0, active: 0, completed: 0, urgent: 0 });
    } catch (e) {
        console.error("Stats refresh failed", e);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [usersRes, tasksRes, statsRes] = await Promise.all([
        api.get("/users"),
        api.get("/tasks?status=active"),
        api.get("/tasks/stats")
      ]);
      setUsers(usersRes.data.data || []);
      setTasks(tasksRes.data.data || []);
      setStats(statsRes.data.data || { total: 0, active: 0, completed: 0, urgent: 0});
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      let url = `/tasks?search=${searchQuery}&status=${filterStatus}`;
      if (showUrgent) url += `&filter=urgent`;

      const { data } = await api.get(url);
      setTasks(data.data || []);
      
      refreshStats(); 
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 dark:bg-black">
      
      <AdminHeader 
        user={user} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        showUrgent={showUrgent}       
        setShowUrgent={setShowUrgent}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        handleLogout={handleLogout}
        // Pass Notifications Down
        notifications={notifications}
        clearNotifications={() => setNotifications([])} 
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-6"> 
            <CreateTaskForm 
              users={users} 
              onTaskCreated={fetchTasks} 
            />
            <TaskStats stats={stats} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <TaskGrid 
            tasks={tasks} 
            onTaskDeleted={(id) => {
                setTasks(tasks.filter((t: any) => t._id !== id));
                refreshStats(); 
            }} 
          />
        </div>
      </div>
    </div>
  );
}