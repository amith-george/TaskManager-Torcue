"use client";
import { CheckCircle2, Circle, AlertCircle, Layers } from "lucide-react";

interface StatsProps {
  stats: {
    total: number;
    completed: number;
    active: number;
    urgent: number;
  };
}

export default function TaskStats({ stats }: StatsProps) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        
        {/* Total */}
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-zinc-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Layers className="h-4 w-4" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>

        {/* Active */}
        <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Circle className="h-4 w-4" />
            <span className="text-xs font-medium">Active</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.active}</p>
        </div>

        {/* Completed */}
        <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Done</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
        </div>

        {/* Urgent */}
        <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-medium">Urgent</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">{stats.urgent}</p>
        </div>

      </div>
    </div>
  );
}