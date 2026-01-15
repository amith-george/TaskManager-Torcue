"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, User as UserIcon, Trash2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface TaskGridProps {
  tasks: any[];
  onTaskDeleted: (id: string) => void;
}

export default function TaskGrid({ tasks, onTaskDeleted }: TaskGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [tasks]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task Deleted");
      onTaskDeleted(id);
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB'); 
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "To Do":
        return "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300";
      case "Current":
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  // Logic to determine urgency
  const isUrgentTask = (task: any) => {
    if (task.status === "Completed") return false;

    const deadline = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(today);
    tomorrowEnd.setDate(today.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    return deadline <= tomorrowEnd;
  };

  if (tasks.length === 0) {
    return <div className="py-12 text-center text-gray-400">No tasks found.</div>;
  }

  return (
    <div className="flex flex-col justify-between">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {currentTasks.map((task) => {
          const isUrgent = isUrgentTask(task);
          
          return (
            <div 
              key={task._id} 
              className={`relative flex flex-col justify-between rounded-2xl p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl 
                ${isUrgent 
                  ? "bg-red-50 ring-2 ring-red-500 dark:bg-red-900/10 dark:ring-red-500" 
                  : "bg-white dark:bg-zinc-900 dark:border dark:border-zinc-800"
                }`}
            >
              <button onClick={() => handleDelete(task._id)} className="absolute right-4 top-4 text-gray-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>

              <div>
                <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white line-clamp-1">{task.title}</h3>
                <div className="mb-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <UserIcon className="mr-1 h-3 w-3" />
                  {task.assignedTo?.email || "Unassigned"}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className={`flex items-center justify-between rounded-lg p-2 text-xs ${isUrgent ? "bg-white/50 dark:bg-zinc-800/50" : "bg-gray-50 dark:bg-zinc-800"}`}>
                  <span className="flex items-center text-gray-500 dark:text-gray-400"><Calendar className="mr-1 h-3 w-3" /> Start</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(task.date)}</span>
                </div>
                
                {/* Deadline Box */}
                <div className={`flex items-center justify-between rounded-lg p-2 text-xs ${isUrgent ? "bg-red-100 dark:bg-red-900/40" : "bg-red-50 dark:bg-red-900/20"}`}>
                  <span className={`flex items-center ${isUrgent ? "text-red-700 font-bold dark:text-red-300" : "text-red-500 dark:text-red-300"}`}>
                    {isUrgent ? <AlertCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />} 
                    Deadline
                  </span>
                  <span className={`font-medium ${isUrgent ? "text-red-800 dark:text-red-100" : "text-red-700 dark:text-red-200"}`}>
                    {formatDate(task.deadline)}
                  </span>
                </div>
              </div>

              <div className={`mt-4 w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                {task.status}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length > itemsPerPage && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}