"use client";
import { Search, LogOut, Bell, ChevronDown } from "lucide-react";

interface AdminHeaderProps {
  user: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showUrgent: boolean;
  setShowUrgent: (b: boolean) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  handleLogout: () => void;
}

export default function AdminHeader({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  showUrgent, 
  setShowUrgent,
  filterStatus,
  setFilterStatus,
  handleLogout 
}: AdminHeaderProps) {
  
  const toggleUrgent = () => {
    const newState = !showUrgent;
    setShowUrgent(newState);
    if (newState) {
      setFilterStatus("active");
    }
  };

  return (
    <div className="relative mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      
      {/* TOP ROW */}
      <div className="flex items-center justify-between lg:w-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Admin Dashboard
        </h1>

        {/* Mobile Profile */}
        <div className="flex items-center gap-3 lg:hidden">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-2 ring-white dark:ring-zinc-800">
             <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* CENTER CONTROLS*/}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
        
        <div className="flex w-full items-center gap-3 sm:w-auto">
          {/* STATUS FILTER */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              disabled={showUrgent} 
              className="h-12 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white sm:w-auto"
            >
              <option value="active">Active Tasks</option>
              <option value="completed">Completed Tasks</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          </div>

          {/* URGENT BUTTON */}
          <button
            onClick={toggleUrgent}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-all ${
              showUrgent
                ? "border-red-500 bg-red-50 text-red-600 shadow-md dark:bg-red-900/20 dark:text-red-400"
                : "border-gray-300 bg-white text-gray-400 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <Bell className={`h-5 w-5 ${showUrgent ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full lg:w-96">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Task Title..."
            className="block w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

      </div>

      {/* DESKTOP PROFILE */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-base font-semibold text-gray-900 dark:text-white">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center text-sm font-medium text-red-500 hover:text-red-700 hover:underline"
          >
            <LogOut className="mr-1 h-4 w-4" />
            Log out
          </button>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-2 ring-white dark:ring-zinc-800">
          <span className="text-xl font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}