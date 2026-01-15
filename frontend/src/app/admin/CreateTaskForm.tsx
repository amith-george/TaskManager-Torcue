"use client";
import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";

interface CreateTaskFormProps {
  users: any[];
  onTaskCreated: () => void;
}

export default function CreateTaskForm({ users, onTaskCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !deadline) {
      return toast.error("Please select both dates");
    }

    if (startDate.toDateString() === deadline.toDateString()) {
      return toast.error("Deadline cannot be the same as the Start Date");
    }

    if (deadline < startDate) {
      return toast.error("Deadline cannot be before the Start Date");
    }

    let finalAssignedTo = assignedTo;
    if (!finalAssignedTo) {
        if(users.length > 0) finalAssignedTo = users[0]._id;
        else return toast.error("Please assign to a user");
    }

    try {
      await api.post("/tasks", {
        title,
        date: startDate,
        deadline: deadline,
        assignedTo: finalAssignedTo
      });
      
      toast.success("Task Created!");
      onTaskCreated(); 
      
      setTitle("");
      setStartDate(null);
      setDeadline(null);
      setAssignedTo("");

    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="h-fit rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">Create Task</h2>
      <form onSubmit={handleCreate} className="space-y-5">
        
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Task Title</label>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the task name..."
          />
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <div className="relative">
                <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    required
                />
                <CalendarIcon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
            <div className="relative">
                <DatePicker
                    selected={deadline}
                    onChange={(date: Date | null) => setDeadline(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    required
                />
                <CalendarIcon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Assign To */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
          <div className="relative">
            <select
              required
              className="w-full appearance-none rounded-lg border border-gray-300 p-3 pr-10 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="" disabled>Select Employee</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.email}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        <button type="submit" className="w-full rounded-lg bg-black py-3 font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
          Create
        </button>
      </form>
    </div>
  );
}