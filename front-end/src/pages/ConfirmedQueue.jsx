import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "../context/SocketContext";
import Toast from "../components/Toast";

const btnPrimary =
    "w-1/2 px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer";
const btnOutline =
    "w-1/2 px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition hover:cursor-pointer";

// Utility function - defined outside component to avoid recreation
const formatWaitTime = (minutes) => {
    if (minutes === 0) return "Next in line!";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

function ConfirmedQueue() {
    const navigate = useNavigate();
    const location = useLocation();
    const { socket, isConnected } = useSocket();

    //Extract facilityId from state
    const {
        zone,
        position: initialPosition,
        queueId,
        facilityId,
        estimatedWait: initialWait,
    } = location.state || {
        zone: { name: "Unknown Zone", averageWaitTime: 0 },
        position: 0,
        queueId: null,
        facilityId: null,
        estimatedWait: 0,
    };

    const [currentPosition, setCurrentPosition] = useState(initialPosition);
    const [estimatedWait, setEstimatedWait] = useState(
        initialWait || zone.averageWaitTime || 0
    );
    const [, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const showToast = (message, type = "info") => {
        setToast({ message, type });
    };

    // Decode JWT to get user object
    const userFromToken = useMemo(() => {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            // Token payload is { user: { id, email, name } }
            return decoded.user;
        } catch (error) {
            console.error("Failed to decode token:", error);
            return null;
        }
    }, []);

    // Auth guard - redirect if not logged in
    useEffect(() => {
        if (!userFromToken) {
            showToast("Please log in to view your queue", "warning");
            setTimeout(() => navigate("/login"), 1000);
        }
    }, [userFromToken, navigate]);

    // Redirect if no queue data (direct URL access)
    useEffect(() => {
        if (!queueId && userFromToken) {
            navigate("/facility");
        }
    }, [queueId, userFromToken, navigate]);

    // WebSocket connection for real-time queue updates
    useEffect(() => {
        if (!queueId || !socket || !isConnected) return;

        // Join the queue room
        socket.emit("join:queue", queueId);
        //console.log("Joined queue room:", queueId);

        // Listen for queue updates
        const handleQueueUpdate = (data) => {
            //console.log("Queue update received:", data);
            if (data.queueId === queueId) {
                setCurrentPosition(data.position);
                setEstimatedWait(data.estimatedWait);
            }
        };

        socket.on("queue:update", handleQueueUpdate);

        // Fetch initial queue status
        const fetchQueueStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/queues/${queueId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (response.status === 401) {
                    localStorage.clear();
                    showToast("Your session has expired. Please log in again.", "error");
                    setTimeout(() => navigate("/login"), 1000);
                    return;
                }

                if (response.status === 403) {
                    showToast("You are not authorized to view this queue.", "error");
                    setTimeout(() => navigate("/facility"), 1000);
                    return;
                }

                if (data.success) {
                    setCurrentPosition(data.data.position);
                    setEstimatedWait(data.data.estimatedWait);
                } else {
                    setError("Failed to fetch queue status");
                }
            } catch (err) {
                console.error("Error fetching queue status:", err);
                setError("Failed to fetch queue status");
            }
        };

        fetchQueueStatus();

        // Cleanup
        return () => {
            socket.emit("leave:queue", queueId);
            socket.off("queue:update", handleQueueUpdate);
        };
    }, [queueId, socket, isConnected, navigate]);

    // Handle leave queue
    const handleLeaveQueue = () => {
        if (!queueId) return;
        setShowConfirm(true);
    };

    const confirmLeaveQueue = async () => {
        setShowConfirm(false);
        
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/queues/${queueId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.clear();
                showToast("Your session has expired. Please log in again.", "error");
                setTimeout(() => navigate("/login"), 1000);
                return;
            }

            if (response.status === 403) {
                showToast("You are not authorized to leave this queue.", "error");
                return;
            }

            const data = await response.json();

            if (data.success) {
                showToast("Successfully left the queue", "success");
                setTimeout(() => navigate("/facility"), 1000);
            } else {
                showToast(data.error || "Failed to leave queue", "error");
            }
        } catch (err) {
            console.error("Error leaving queue:", err);
            showToast("Failed to leave queue. Please try again.", "error");
        }
    };

    // Handle view other zones with facilityId
    const handleViewOtherZones = () => {
        if (facilityId) {
            // Pass facilityId to Zone.jsx
            navigate("/zone", { state: { facilityId } });
        } else {
            // No facilityId - go to facilities selection
            navigate("/facility");
        }
    };

    return (
        <div className="min-h-[90vh] flex flex-col bg-[#efefed] px-6 py-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-xl font-bold mb-4">Leave Queue?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to leave the queue?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLeaveQueue}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="w-full flex items-start justify-between mb-8">
                <div className="flex items-start">
                    <Link
                        to="/"
                        aria-label="Back to Home"
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-[#462c9f] transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>

                <div className="flex items-center">
                    <img
                        src="/smartfit_logo.png"
                        alt="Logo"
                        className="h-20 w-auto"
                    />
                </div>
            </div>

            <div className="mb-8">
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-green-800 mb-2">
                        ✓ Queue Confirmed!
                    </h1>
                    <p className="text-lg text-green-700">
                        You've successfully joined the queue
                    </p>
                </div>
                {error && (
                    <div className="bg-red-100 border-2 border-red-500 rounded-lg p-4 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}
            </div>

            <div className="flex-1 max-w-md">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Queue Summary</h2>

                    <div className="space-y-4">
                        <div className="pb-4 border-b border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                                Equipment Zone
                            </p>
                            <p className="text-xl font-bold">{zone.name}</p>
                        </div>

                        <div className="pb-4 border-b border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">
                                Your Position
                            </p>
                            <p className="text-4xl font-bold text-[#462c9f]">
                                #{currentPosition}
                            </p>
                            {currentPosition === 1 ? (
                                <p className="text-sm text-green-600 font-semibold mt-2">
                                    You're next! Please proceed to the zone.
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500 mt-2">
                                    {currentPosition - 1} people ahead of you
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                Estimated Wait Time
                            </p>
                            <p className="text-2xl font-bold">
                                {formatWaitTime(estimatedWait)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Updates automatically as the queue moves
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between gap-4">
                    <button onClick={handleLeaveQueue} className={btnOutline}>
                        Leave Queue
                    </button>

                    {/* Pass facilityId to Zone.jsx via onClick handler */}
                    <button
                        onClick={handleViewOtherZones}
                        className={btnPrimary}
                    >
                        View Other Zones
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Queue position updating in real-time</span>
                </div>
            </div>
        </div>
    );
}

export default ConfirmedQueue;
