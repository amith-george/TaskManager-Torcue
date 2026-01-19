"use client";

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase-config';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {

        const unsubscribe = auth.onIdTokenChanged(async (user) => {
            if (user) {

                const token = await user.getIdToken();

                const socketInstance = io(SOCKET_URL, {
                    auth: {
                        token: token 
                    }
                });

                socketInstance.on("connect", () => {
                    console.log("Connected to Secure Socket:", socketInstance.id);
                });

                socketInstance.on("connect_error", (err) => {
                    console.error("Socket Connection Error:", err.message);
                });

                setSocket(socketInstance);
            } else {
                if (socket) {
                    socket.disconnect();
                    setSocket(null);
                }
            }
        });

        return () => {
            unsubscribe();
            if (socket) socket.disconnect();
        };
    }, []); 

    return socket;
}