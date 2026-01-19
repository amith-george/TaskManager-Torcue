"use client";
import { useState, useRef, useEffect } from "react";
import { Search, LogOut, Bell, ChevronDown, AlertCircle } from "lucide-react";

interface Notification {
  id: number;
  taskTitle: string;
  newStatus: string;
  userEmail: string;
  time: string;
}

interface AdminHeaderProps {
  user: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showUrgent: boolean;
  setShowUrgent: (b: boolean) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  handleLogout: () => void;
  notifications: Notification[];
  clearNotifications: () => void;
}

export default function AdminHeader({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  showUrgent, 
  setShowUrgent,
  filterStatus,
  setFilterStatus,
  handleLogout,
  notifications,
  clearNotifications
}: AdminHeaderProps) {
  
  const [showDropdown, setShowDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Click Outside Logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleUrgent = () => {
    const newState = !showUrgent;
    setShowUrgent(newState);
    if (newState) {
      setFilterStatus("active");
    }
  };

  // NEW: Helper for Notification Colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 dark:text-green-400";
      case "To Do":
        return "text-gray-500 dark:text-gray-400";
      case "Current":
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className="relative mb-8 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
      
      {/* LEFT: Title + Mobile Profile */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Admin Dashboard
        </h1>

        <div className="flex items-center gap-3 lg:hidden">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-2 ring-white dark:ring-zinc-800">
             <span className="text-sm font-bold">{user?.email?.charAt(0).toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* CENTER: Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-self-center">
        
        <div className="flex w-full items-center gap-3 sm:w-auto">
          {/* Status Filter */}
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

          {/* Urgent Button */}
          <button
            onClick={toggleUrgent}
            title="Show Urgent Tasks"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-all ${
              showUrgent
                ? "border-red-500 bg-red-50 text-red-600 shadow-md dark:bg-red-900/20 dark:text-red-400"
                : "border-gray-300 bg-white text-gray-400 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            <AlertCircle className={`h-5 w-5 ${showUrgent ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Search */}
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

        {/* NOTIFICATION AREA */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 transition-all hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-400"
          >
            <Bell className="h-5 w-5" />
            
            {/* Numbered Badge */}
            {notifications.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-black">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 mt-2 w-96 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50">
              
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
                    Clear all
                    </button>
                )}
              </div>
              
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="flex flex-col gap-1 border-b border-gray-50 p-4 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                      
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {notif.taskTitle} <span className="text-gray-400">-</span> 
                        {/* COLOR APPLIED HERE */}
                        <span className={`ml-1 ${getStatusColor(notif.newStatus)}`}>
                            {notif.newStatus}
                        </span>
                      </p>
                      
                      <p className="text-xs text-gray-500">
                        By {notif.userEmail}
                      </p>
                      
                      <p className="text-[10px] text-gray-400">
                        {notif.time}
                      </p>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT: Desktop Profile */}
      <div className="hidden lg:flex items-center gap-4 lg:justify-self-end">
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