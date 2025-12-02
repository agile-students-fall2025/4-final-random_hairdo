import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Goals() {
  const [userId, setUserId] = useState(null)
  const [goals, setGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  // Get user ID from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    if (storedUser._id) {
      setUserId(storedUser._id)
    }
  }, [])

  // ------------------------
  // Load goals on page load
  // ------------------------
  useEffect(() => {
    if (!userId) return
    
    const token = localStorage.getItem('token')
    fetch(`http://localhost:3000/api/goals/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        // Backend doesn't track "completed", so we simulate it:
        const active = data.data.filter((g) => g.progress < 100);
        const done = data.data.filter((g) => g.progress >= 100);

        setGoals(active);
        setCompletedGoals(done);
      })
      .catch(console.error);
  }, [userId]);

  // ------------------------
  // Add new goal
  // ------------------------
  const addGoal = async () => {
    if (!newGoal.trim() || !userId) return;

    const token = localStorage.getItem('token')
    const res = await fetch("http://localhost:3000/api/goals", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        userId,
        goal: newGoal.trim(),
        progress: 0,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setGoals([...goals, data.data]);
      setNewGoal("");
    }
  };

  // ------------------------
  // Delete goal
  // ------------------------
  const removeGoal = async (id) => {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:3000/api/goals/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    setGoals(goals.filter((g) => g.id !== id));
  };

  // ------------------------
  // Complete goal (progress = 100)
  // ------------------------
  const completeGoal = async (goal) => {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:3000/api/goals/${goal.id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ progress: 100 }),
    });

    setGoals(goals.filter((g) => g.id !== goal.id));
    setCompletedGoals([...completedGoals, { ...goal, progress: 100 }]);
  };

  // ------------------------
  // Clear both lists locally (safe)
  // ------------------------
  const clearAllGoals = () => {
    setGoals([]);
    setCompletedGoals([]);
  };

  // Styles
  const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold hover:bg-[#3b237f] transition";

  const btnComplete =
    "px-3 py-1 rounded bg-green-300 hover:bg-green-400 text-xs font-semibold";

  const btnRemove =
    "px-3 py-1 rounded bg-red-300 hover:bg-red-400 text-xs font-semibold";

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4 flex flex-col">
      <header className="mx-auto w-full max-w-xl flex items-start justify-between mb-6">
        <Link
          to="/profile"
          className="px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm hover:opacity-90"
        >
          Back to Profile Dashboard
        </Link>

        <Link to="/">
          <img src="/smartfit_logo.png" className="h-12 md:h-16" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-xl flex-grow">
        <h1 className="text-4xl font-semibold mb-2">Goals</h1>
        <p className="text-gray-600 mb-6">
          Track your progress and stay consistent.
        </p>

        {/* Add Goal */}
        <div className="flex flex-col items-center mb-8">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter new goal"
            className="w-full px-4 py-2 mb-4 border-2 border-gray-300 rounded-lg focus:border-[#462c9f]"
          />

          <button onClick={addGoal} className={`${btnPrimary} w-auto px-6`}>
            Add Goal
          </button>

          <button
            onClick={clearAllGoals}
            className="mt-3 px-4 py-2 rounded bg-red-200 hover:bg-red-300 text-sm font-semibold"
          >
            Clear All Goals
          </button>
        </div>

        {/* Current Goals */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Current Goals</h2>

          {goals.length ? (
            goals.map((g) => (
              <div
                key={g.id}
                className="flex justify-between items-center bg-white shadow-sm rounded-lg px-4 py-3 border"
              >
                <span className="text-lg">{g.goal}</span>
                <div className="flex gap-2">
                  <button onClick={() => completeGoal(g)} className={btnComplete}>
                    ✓
                  </button>
                  <button onClick={() => removeGoal(g.id)} className={btnRemove}>
                    ✕
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No current goals.</p>
          )}
        </section>

        {/* Completed Goals */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Completed Goals</h2>

          {completedGoals.length ? (
            completedGoals.map((g) => (
              <div
                key={g.id}
                className="bg-gray-100 rounded-lg px-4 py-3 line-through border"
              >
                {g.goal}
              </div>
            ))
          ) : (
            <p className="italic text-center">No goals completed yet.</p>
          )}
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 mt-6">
        © {new Date().getFullYear()} SMARTFIT
      </footer>
    </div>
  );
}

export default Goals;
