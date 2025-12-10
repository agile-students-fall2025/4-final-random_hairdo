import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to WebSocket server
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        
        // For DigitalOcean deployment with subpath, we need to configure the path correctly
        const socketConfig = {
            transports: ["polling", "websocket"], // Try polling first for DigitalOcean
            autoConnect: true,
        };
        
        // If using a subpath like /final-random-hairdo-back-end, include it in the path
        if (apiUrl.includes('/final-random-hairdo-back-end')) {
            socketConfig.path = '/final-random-hairdo-back-end/socket.io';
        } else {
            socketConfig.path = '/socket.io';
        }
        
        const socketInstance = io(apiUrl.replace('/final-random-hairdo-back-end', ''), socketConfig);

        socketInstance.on("connect", () => {
            //console.log("WebSocket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            //console.log("WebSocket disconnected");
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.close();
        };
    }, []);

    const value = {
        socket,
        isConnected,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
