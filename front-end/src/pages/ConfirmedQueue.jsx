import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useSocket } from "../context/SocketContext";
import Toast from "../components/Toast";

const btnPrimary =
  "w-1/2 px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition hover:cursor-pointer";
const btnOutline =
  "w-1/2 px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition hover:cursor-pointer";

const formatWaitTime = (minutes) => {
  if (minutes === 0) return "Next in line!";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatTimer = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

function ConfirmedQueue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useSocket();

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
  const [queueStatus, setQueueStatus] = useState("active"); // NEW
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEndWorkoutModal, setShowEndWorkoutModal] = useState(false);
  const [workoutMood, setWorkoutMood] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  
  // Workout timer
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // Decode JWT
  const userFromToken = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.user;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!userFromToken) {
      showToast("Please log in to view your queue", "warning");
      setTimeout(() => navigate("/login"), 1000);
    }
  }, [userFromToken, navigate]);

  useEffect(() => {
    if (!queueId && userFromToken) {
      navigate("/facility");
    }
  }, [queueId, userFromToken, navigate]);

  // Timer effect - runs when workout is active
  useEffect(() => {
    if (queueStatus === "in_use" && workoutStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [queueStatus, workoutStartTime]);

  // SOCKET + INITIAL FETCH
  useEffect(() => {
    if (!queueId || !socket || !isConnected) return;

    socket.emit("join:queue", queueId);

    const handleQueueUpdate = (data) => {
      if (data.queueId === queueId) {
        setQueueStatus(data.status);

        if (data.status === "in_use") {
          setCurrentPosition(1);
          setEstimatedWait(0);
        } else {
          setCurrentPosition(data.position);
          setEstimatedWait(data.estimatedWait);
        }
      }
    };

    const [currentPosition, setCurrentPosition] = useState(initialPosition);
    const [estimatedWait, setEstimatedWait] = useState(
        initialWait || zone.averageWaitTime || 0
    );
    const [, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchQueueStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/queues/${queueId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.status === 401) {
          localStorage.clear();
          showToast("Session expired. Log in again.", "error");
          setTimeout(() => navigate("/login"), 1000);
          return;
        }

        if (res.status === 403) {
          showToast("Not authorized to view this queue.", "error");
          setTimeout(() => navigate("/facility"), 1000);
          return;
        }

        if (data.success) {
          const q = data.data;
          setQueueStatus(q.status);

          if (q.status === 'in_use') {
            setCurrentPosition(1);
            setEstimatedWait(0);
            // Restore timer if workout is in progress
            if (q.startedAt) {
              const startTime = new Date(q.startedAt).getTime();
              setWorkoutStartTime(startTime);
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              setElapsedSeconds(elapsed);
            }
          } else {
            setCurrentPosition(q.position);
            setEstimatedWait(q.estimatedWait);
          }
        }
      } catch (err) {
        console.error("Error fetching queue status:", err);
        setError("Failed to fetch queue status");
      }
    };

    fetchQueueStatus();

    return () => {
      socket.emit("leave:queue", queueId);
      socket.off("queue:update", handleQueueUpdate);
    };
  }, [queueId, socket, isConnected, navigate]);

  // LEAVE QUEUE
  const confirmLeaveQueue = async () => {
    setShowConfirm(false);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/queues/${queueId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.clear();
        showToast("Session expired. Log in again.", "error");
        setTimeout(() => navigate("/login"), 1000);
        return;
      }

      const data = await response.json();

      if (data.success) {
        showToast("Left queue successfully", "success");
        setTimeout(() => navigate("/facility"), 1000);
      } else {
        showToast(data.error || "Failed to leave queue", "error");
      }
    } catch (err) {
      console.error("Error leaving queue:", err);
      showToast("Failed to leave queue.", "error");
    }
  };

  // START WORKOUT
  const handleStartWorkout = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/queues/${queueId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.error || "Cannot start workout", "error");
        return;
      }

      showToast("Workout started!", "success");
      setQueueStatus("in_use");
      setCurrentPosition(1);
      setEstimatedWait(0);
      setWorkoutStartTime(Date.now());
      setElapsedSeconds(0);
    } catch (err) {
      console.error("Start workout failed:", err);
      showToast("Failed to start workout.", "error");
    }
  };

  // END WORKOUT
  const handleEndWorkout = () => {
    setShowEndWorkoutModal(true);
  };

  const confirmEndWorkout = async () => {
    try {
      const token = localStorage.getItem("token");

      // Validate mood
      const moodNum = parseInt(workoutMood);
      if (!workoutMood || isNaN(moodNum) || moodNum < 1 || moodNum > 10) {
        showToast("Please enter a mood rating between 1-10", "warning");
        return;
      }

      const res = await fetch(`/api/queues/${queueId}/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: moodNum,
          notes: workoutNotes.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.error || "Failed to end workout", "error");
        return;
      }

      setShowEndWorkoutModal(false);
      showToast("Workout completed!", "success");
      setTimeout(() => navigate("/history"), 900);
    } catch (err) {
      console.error("End workout failed:", err);
      showToast("Failed to end workout.", "error");
    }
  };

  const handleLeaveQueue = () => setShowConfirm(true);

  const handleViewOtherZones = () => {
    if (facilityId) navigate("/zone", { state: { facilityId } });
    else navigate("/facility");
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

      {/* Confirm Leave Modal */}
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

      {/* End Workout Modal */}
      {showEndWorkoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <h3 className="text-xl font-bold mb-4">Complete Workout</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How was your workout mood? (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={workoutMood}
                onChange={(e) => setWorkoutMood(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
                placeholder="Rate 1-10"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Notes (Optional)
              </label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#462c9f] resize-none"
                rows="3"
                placeholder="Add any notes about your workout..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEndWorkoutModal(false);
                  setWorkoutMood("");
                  setWorkoutNotes("");
                }}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndWorkout}
                className="flex-1 px-4 py-2 rounded-lg bg-[#462c9f] text-white font-semibold hover:bg-[#3b237f]"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full flex items-start justify-between mb-8">
        <Link
          to="/"
          aria-label="Back to Home"
          className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-black text-white text-sm font-medium hover:bg-[#462c9f]"
        >
          Back to Home
        </Link>
        <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
      </div>

      {/* Queue Summary */}
      <div className="flex-1 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Queue Summary</h2>

        <div className="space-y-4">
          {/* Zone */}
          <div className="pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Equipment Zone</p>
            <p className="text-xl font-bold">{zone.name}</p>
          </div>

          {/* STATUS */}
          <div className="pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Your Status</p>

            {queueStatus === "in_use" ? (
              <>
                <p className="text-3xl font-bold text-[#462c9f]">
                  Workout In Progress
                </p>
                <p className="text-sm text-green-600 font-semibold mt-2">
                  You're currently using the zone.
                </p>
                
                {/* Timer Display */}
                {workoutStartTime && (
                  <div className="mt-4 p-4 bg-[#462c9f] rounded-lg">
                    <p className="text-sm text-white mb-1 text-center">Workout Time</p>
                    <p className="text-5xl font-bold text-white text-center font-mono">
                      {formatTimer(elapsedSeconds)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-4xl font-bold text-[#462c9f]">
                  #{currentPosition}
                </p>
                {currentPosition === 1 ? (
                  <p className="text-sm text-green-600 font-semibold mt-2">
                    You're next! Please proceed.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-2">
                    {currentPosition - 1} people ahead of you
                  </p>
                )}
              </>
            )}
          </div>

          {/* WAIT */}
          {queueStatus !== "in_use" && (
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Estimated Wait Time
              </p>
              <p className="text-2xl font-bold">
                {formatWaitTime(estimatedWait)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Auto-updates</p>
            </div>
          )}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between gap-4 max-w-md mx-auto">
        {queueStatus === "in_use" ? (
          <>
            <button onClick={handleEndWorkout} className={btnPrimary}>
              End Workout
            </button>
            <button onClick={handleViewOtherZones} className={btnOutline}>
              View Other Zones
            </button>
          </>
        ) : (
          <>
            <button onClick={handleLeaveQueue} className={btnOutline}>
              Leave Queue
            </button>
            <button
              onClick={handleStartWorkout}
              className={`${btnPrimary} ${
                currentPosition !== 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={currentPosition !== 1}
            >
              {currentPosition === 1 ? "Start Workout" : "Waiting..."}
            </button>
          </>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span>Real-time updates enabled</span>
      </div>
      </div>
    </div>
  );
}

export default ConfirmedQueue;
