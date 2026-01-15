"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, googleProvider } from "@/lib/firebase-config";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"; // Icons

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Toggle between Login/Signup
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // 1. Redirect Logic: Watch for the user state to change
  useEffect(() => {
    if (!authLoading && user) {
      // If user is logged in, send them to the right dashboard
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // 2. Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in with Google!");
      // No need to redirect here; the useEffect above handles it
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // 3. Handle Email/Password Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLocal(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome back!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingLocal(false);
    }
  };

  // Prevent flash of login screen if we are just checking if the user is already logged in
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900 dark:border dark:border-zinc-800">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your details to manage your tasks
          </p>
        </div>

        {/* Email/Pass Form */}
        <form onSubmit={handleEmailAuth} className="space-y-6">
          
          {/* Email Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              placeholder="Email address"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={()=> setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loadingLocal}
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {loadingLocal ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              isRegistering ? "Sign Up" : "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
          <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 dark:focus:ring-gray-700"
        >
           {/* Simple G Icon SVG */}
           <svg className="mr-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
            <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
          </svg>
          Sign in with Google
        </button>

        {/* Toggle Signup/Login */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isRegistering ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              {isRegistering ? "Login" : "Sign up"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}