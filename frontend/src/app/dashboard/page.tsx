"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-config";
import { signOut } from "firebase/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Loader2 } from "lucide-react";

import EmployeeHeader from "@/app/dashboard/EmployeeHeader";
import KanbanColumn from "@/app/dashboard/KanbanColumn";
import { useSocket } from "@/hooks/useSocket"; 

interface Task {
  _id: string;
  title: string;
  date: string;
  deadline: string;
  status: "To Do" | "Current" | "Completed"; 
  assignedTo: string | { _id: string, email: string }; 
}

export default function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const socket = useSocket(); 

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
        return;
      }
      fetchMyTasks();
    }
  }, [user, authLoading, router]);

  // Socket Listeners
  useEffect(() => {
    if (!socket || !user) return;

    // 1. Task Created
    socket.on("task_created", (newTask: any) => {
        const assignedId = typeof newTask.assignedTo === 'object' 
            ? newTask.assignedTo._id 
            : newTask.assignedTo;

        if (assignedId === user._id) {
            toast.success("New task assigned!");
            setTasks((prev) => [...prev, newTask]);
        }
    });

    // 2. Task Updated
    socket.on("task_updated", (updatedTask: any) => {
        setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
    });

    // 3. Task Deleted
    socket.on("task_deleted", (deletedId: string) => {
        setTasks((prev) => prev.filter((t) => t._id !== deletedId));
    });

    return () => {
        socket.off("task_created");
        socket.off("task_updated");
        socket.off("task_deleted");
    };
  }, [socket, user]);


  const fetchMyTasks = async () => {
    try {
      const response = await api.get("/tasks/my-tasks");
      setTasks(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load your tasks.");
      setTasks([]);
    } finally {
      setLoadingData(false);
    }
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    if (destination.droppableId === "Completed") {
        const isConfirmed = window.confirm("Mark as Completed? Once moved, you cannot move it back.");
        if (!isConfirmed) {
            return;
        }
    }

    const newStatus = destination.droppableId as Task["status"];
    const previousTasks = [...tasks];

    const updatedTasks = tasks.map((t) => 
      t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      await api.patch(`/tasks/${draggableId}/status`, { status: newStatus });
    } catch (error) {
      toast.error("Failed to update status");
      setTasks(previousTasks);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  if (authLoading || loadingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!enabled) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 dark:bg-black md:overflow-hidden">
      
      <EmployeeHeader user={user} handleLogout={handleLogout} />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-3 md:pb-0">
          
          <KanbanColumn 
            title="To Do" 
            id="To Do" 
            tasks={getTasksByStatus("To Do")} 
          />

          <KanbanColumn 
            title="Current" 
            id="Current" 
            tasks={getTasksByStatus("Current")} 
          />

          <KanbanColumn 
            title="Completed" 
            id="Completed" 
            tasks={getTasksByStatus("Completed")} 
          />
          
        </div>
      </DragDropContext>
    </div>
  );
}