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

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, urgent: 0 }); 
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
      
      const statsRes = await api.get("/tasks/stats");
      setStats(statsRes.data.data || { total: 0, active: 0, completed: 0, urgent: 0});

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
                fetchTasks();
            }} 
          />
        </div>
      </div>
    </div>
  );
}