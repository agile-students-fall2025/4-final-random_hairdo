import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "../context/SocketContext";
import Toast from "../components/Toast";

// Shared button styles
const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer";
const btnOutline =
    "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition hover:cursor-pointer";

const formatWaitTime = (minutes) => {
    if (minutes === 0) return "No wait";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getStatusColor = (status) => {
    switch (status) {
        case "available":
            return "text-green-600";
        case "moderate":
            return "text-yellow-600";
        case "busy":
            return "text-red-600";
        default:
            return "text-gray-600";
    }
};

function Zone() {
    const navigate = useNavigate();
    const location = useLocation();
    const facilityId = location.state?.facilityId;
    const { socket, isConnected } = useSocket();

    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);
    const [toast, setToast] = useState(null);

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
            showToast("Please log in to view zones", "warning");
            setTimeout(() => navigate("/login"), 1000);
        }
    }, [userFromToken, navigate]);

    // Redirect to facilities if no facilityId (direct URL access)
    useEffect(() => {
        if (!facilityId && userFromToken) {
            // User is logged in but came directly to /zone without selecting facility
            navigate("/facility");
        }
    }, [facilityId, userFromToken, navigate]);

    // Fetch zones for selected facility
    useEffect(() => {
        const fetchZones = async () => {
            if (!facilityId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(
                    `/api/zones?facilityId=${facilityId}`
                );
                const data = await response.json();

                if (data.success) {
                    setZones(data.data);
                } else {
                    setError(data.error || "Failed to load zones");
                }
            } catch (err) {
                console.error("Error fetching zones:", err);
                setError("Failed to connect to server");
            } finally {
                setLoading(false);
            }
        };

        fetchZones();
    }, [facilityId]);

    // WebSocket connection for real-time zone updates
    useEffect(() => {
        if (!facilityId || !socket || !isConnected) return;

        // Join the facility-zones room to get updates for all zones
        socket.emit("join:facility-zones", facilityId);
        //console.log("Joined facility-zones room:", facilityId);

        const handleFacilityZonesUpdate = async () => {
            try {
                const response = await fetch(`/api/zones?facilityId=${facilityId}`);
                const zonesData = await response.json();
        
                if (zonesData.success) {
                    setZones(zonesData.data);
                }
            } catch (err) {
                console.error("Error refetching zones:", err);
            }
        };


        socket.on("facility-zones:update", handleFacilityZonesUpdate);

        // Cleanup
        return () => {
            socket.emit("leave:facility-zones", facilityId);
            socket.off("facility-zones:update", handleFacilityZonesUpdate);
        };
    }, [facilityId, socket, isConnected]);

    const handleJoinQueue = (zone) => {
        if (selectedZone?._id === zone._id) {
            setSelectedZone(null);
        } 
        else {
            setSelectedZone(zone);
        }
    };

    const handleConfirmQueue = async () => {
        if (!selectedZone) return;

        try {
            const token = localStorage.getItem("token");

            if (!token || !userFromToken?.id) {
                showToast("Please log in to join a queue", "warning");
                setTimeout(() => navigate("/login"), 1000);
                return;
            }

            // Create queue entry in backend
            const response = await fetch("/api/queues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: userFromToken.id,
                    zoneId: selectedZone._id,
                    facilityId: facilityId,
                    position: selectedZone.queueLength + 1,
                    estimatedWait: selectedZone.averageWaitTime,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Navigate to confirmation page with queue data
                navigate("/confirmed-queue", {
                    state: {
                        zone: selectedZone,
                        facilityId: facilityId,
                        queueId: data.data._id,
                        position: data.data.position,
                        estimatedWait: data.data.estimatedWait,
                    },
                });
            } else {
                showToast(data.error || "Failed to join queue", "error");
            }
        } catch (error) {
            console.error("Error joining queue:", error);
            showToast("Failed to join queue. Please try again.", "error");
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
            <header className="mx-auto w-full max-w-xl flex items-start justify-between mb-6">
                <Link
                    to="/facility"
                    className="px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm hover:opacity-90"
                >
                    Back to Facilities
                </Link>
                <Link to="/">
                    <img src="/smartfit_logo.png" className="h-12 md:h-16" />
                </Link>
            </header>

            {/* Page Title - Centered */}
            <h1 className="text-4xl font-semibold mb-2">Equipment Zones</h1>
            <p className="text-gray-600 mb-6">
                Select a zone to join the queue.
            </p>

            <div className="flex-1 flex flex-col gap-4 max-w-md max-h-[60vh] overflow-y-auto">
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-600">
                            Loading zones...
                        </p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-red-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-[#462c9f] text-white rounded-lg hover:bg-[#3b237f]"
                        >
                            Retry
                        </button>
                    </div>
                ) : zones.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-600">
                            No zones available for this facility
                        </p>
                    </div>
                ) : (
                    zones.map((zone) => (
                        <div
                            key={zone._id}
                            className={`p-5 rounded-lg border-2 ${
                                selectedZone?._id === zone._id
                                    ? "border-[#462c9f] bg-purple-50"
                                    : "border-gray-300 bg-white"
                            }`}
                        >
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold">
                                        {zone.name}
                                    </h3>
                                    <span
                                        className={`text-sm font-semibold uppercase ${getStatusColor(
                                            zone.status
                                        )}`}
                                    >
                                        {zone.status}
                                    </span>
                                </div>
                                <div className="space-y-1 text-sm text-gray-700">
                                    <p>
                                        Queue Length:{" "}
                                        <span className="font-semibold">
                                            {zone.queueLength} {zone.queueLength === 1 ? "person" : "people"}
                                        </span>
                                    </p>
                                    <p>
                                        Estimated Wait:{" "}
                                        <span className="font-semibold">
                                            {formatWaitTime(
                                                zone.averageWaitTime
                                            )}
                                        </span>
                                    </p>
                                    <p>
                                        Capacity:{" "}
                                        <span className="font-semibold">
                                            {zone.currentOccupancy}/
                                            {zone.capacity}
                                        </span>
                                    </p>
                                    {zone.equipment &&
                                        zone.equipment.length > 0 && (
                                            <p className="text-xs text-gray-600 mt-2">
                                                Equipment:{" "}
                                                {zone.equipment.join(", ")}
                                            </p>
                                        )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleJoinQueue(zone)}
                                className={
                                    selectedZone?._id === zone._id
                                        ? btnPrimary
                                        : btnOutline
                                }
                            >
                                {selectedZone?._id === zone._id
                                    ? "Selected"
                                    : "Join Queue"}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 max-w-md">
                <button
                    onClick={handleConfirmQueue}
                    disabled={!selectedZone}
                    className={selectedZone ? btnPrimary : btnOutline}
                >
                    Confirm Queue
                </button>
            </div>
        </div>
    );
}

export default Zone;
