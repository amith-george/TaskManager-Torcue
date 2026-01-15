"use client";
import { LogOut } from "lucide-react";

interface EmployeeHeaderProps {
  user: any;
  handleLogout: () => void;
}

export default function EmployeeHeader({ user, handleLogout }: EmployeeHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Board</h1>
        <p className="text-base text-gray-500">Manage your assigned tasks</p>
      </div>

      <div className="flex items-center gap-4 self-end sm:self-auto">
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