// ----------------------
// SMARTFIT: Goals Page
// ----------------------
// This page allows users to create, track, complete, and remove fitness goals.
// React hooks manage state, and Tailwind CSS provides responsive styling.
// The layout is simple, minimal, and encourages daily motivation.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Goals() {
  // ----------------------------
  // State variables
  // ----------------------------
  const [goals, setGoals] = useState([
    'Go to the gym everyday this week',
    'Try out new equipment',
    'Beat current PR'
  ]);

  const [completedGoals, setCompletedGoals] = useState([
    'Go to the gym today',
    'Meet dietary requirements'
  ]);

  const [newGoal, setNewGoal] = useState('');

  // ----------------------------
  // Functions
  // ----------------------------

  // Adds a new goal to the active goals list
  const addGoal = () => {
    if (!newGoal.trim()) {
      console.warn("Attempted to add an empty goal.");
      return;
    }
    setGoals([...goals, newGoal.trim()]);
    setNewGoal('');
    console.log("Added goal:", newGoal);
  };

  // Removes a goal by index
  const removeGoal = (i) => {
    console.log("Removed goal:", goals[i]);
    setGoals(goals.filter((_, idx) => idx !== i));
  };

  // Moves a goal from active to completed
  const completeGoal = (i) => {
    const completed = goals[i];
    setCompletedGoals([...completedGoals, completed]);
    removeGoal(i);
    console.log("Completed goal:", completed);
  };

  // Handles controlled input
  const handleInputChange = (event) => {
    setNewGoal(event.target.value);
  };

  // Clears all goals (new functionality)
  const clearAllGoals = () => {
    setGoals([]);
    setCompletedGoals([]);
    console.log("All goals cleared");
  };

  // ----------------------------
  // Reusable styles
  // ----------------------------
  const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer";

  const btnComplete =
    "px-3 py-1 rounded bg-green-300 hover:bg-green-400 text-xs font-semibold transition cursor-pointer";

  const btnRemove =
    "px-3 py-1 rounded bg-red-300 hover:bg-red-400 text-xs font-semibold transition cursor-pointer";

  // ----------------------------
  // Render Section
  // ----------------------------
  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4 flex flex-col">
      {/* Header */}
      <header className="mx-auto w-full max-w-md md:max-w-xl flex items-start justify-between mb-6">
        <Link
          to="/profile"
          className="inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90"
        >
          Back to Profile Dashboard
        </Link>
        <Link to="/" aria-label="Home">
          <img
            src="/smartfit_logo.png"
            alt="SMARTFIT logo"
            className="h-12 w-auto md:h-16"
          />
        </Link>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-md md:max-w-xl flex-grow">
        <h1 className="text-4xl font-semibold mb-2">Goals</h1>
        <p className="text-gray-600 mb-6">
          Track your progress and stay consistent with your fitness journey.
        </p>

        {/* Add Goal Section */}
        <div className="flex flex-col items-center mb-8">
          <input
            type="text"
            value={newGoal}
            onChange={handleInputChange}
            placeholder="Enter new goal"
            className="w-full px-4 py-2 mb-4 border-2 border-gray-300 rounded-lg focus:border-[#462c9f] focus:outline-none"
            aria-label="Goal input field"
          />
          <button
            type="button"
            onClick={addGoal}
            className={`${btnPrimary} w-auto px-6`}
            aria-label="Add new goal"
          >
            Add Goal
          </button>

          {/* Clear all goals button */}
          <button
            onClick={clearAllGoals}
            className="mt-3 px-4 py-2 rounded bg-red-200 hover:bg-red-300 font-semibold text-sm"
            aria-label="Clear all goals"
          >
            Clear All Goals
          </button>
        </div>

        {/* Current Goals */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Current Goals</h2>
          <div className="grid grid-cols-1 gap-3 mb-4">
            {goals.length > 0 ? (
              goals.map((goal, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white shadow-sm rounded-lg px-4 py-3 border border-gray-200"
                >
                  <span className="text-lg">{goal}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => completeGoal(index)}
                      className={btnComplete}
                      aria-label={`Complete goal ${index + 1}`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => removeGoal(index)}
                      className={btnRemove}
                      aria-label={`Remove goal ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center">
                No current goals added yet.
              </p>
            )}
          </div>
        </section>

        {/* Completed Goals */}
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Completed Goals</h2>
          <div className="grid grid-cols-1 gap-3 text-gray-500">
            {completedGoals.length > 0 ? (
              completedGoals.map((goal, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-lg px-4 py-3 line-through shadow-sm border border-gray-200"
                >
                  {goal}
                </div>
              ))
            ) : (
              <p className="italic text-center">No goals completed yet.</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-400 mt-6">
        © {new Date().getFullYear()} SMARTFIT. All rights reserved.
      </footer>
    </div>
  );
}

export default Goals;
