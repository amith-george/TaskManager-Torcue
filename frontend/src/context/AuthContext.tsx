"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase-config";
import api from "@/lib/api";
import { useRouter } from "next/navigation";


interface AuthContextType {
    user: any;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children } : { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setloading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken(true);

                    const response = await api.post('/users/sync', {
                        firebaseUid: firebaseUser.uid,
                        email: firebaseUser.email
                    });

                    const dbUser = response.data.data;

                    setUser({ ...firebaseUser, ...dbUser });
                } catch (error) {
                    console.error("Sync failed", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setloading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => useContext(AuthContext);