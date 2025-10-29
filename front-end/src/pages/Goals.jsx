import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Goals() {
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

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals([...goals, newGoal.trim()]);
    setNewGoal('');
    console.log("Added goal:", newGoal);
  };

  const removeGoal = (i) =>
    setGoals(goals.filter((_, idx) => idx !== i));

  const completeGoal = (i) => {
    const completed = goals[i];
    setCompletedGoals([...completedGoals, completed]);
    removeGoal(i);
    console.log("Completed goal:", completed);
  };

  const handleInputChange = (event) => {
    setNewGoal(event.target.value);
  };

  const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer";
  const btnComplete =
    "px-3 py-1 rounded bg-green-300 hover:bg-green-400 text-xs font-semibold transition cursor-pointer";
  const btnRemove =
    "px-3 py-1 rounded bg-red-300 hover:bg-red-400 text-xs font-semibold transition cursor-pointer";

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
        <h1 className="text-4xl font-semibold mb-6">Goals</h1>

        {/* Add Goal Section */}
        <div className="flex flex-col items-center mb-8">
          <input
            type="text"
            value={newGoal}
            onChange={handleInputChange}
            placeholder="Enter new goal"
            className="w-full px-4 py-2 mb-4 border-2 border-gray-300 rounded-lg focus:border-[#462c9f] focus:outline-none"
          />
          <button
            type="button"
            onClick={addGoal}
            className={`${btnPrimary} w-auto px-6`}
          >
            Add Goal
          </button>
        </div>

        {/* Current Goals */}
        <h2 className="text-2xl font-semibold mb-4">Current Goals</h2>
        <div className="grid grid-cols-1 gap-3 mb-8">
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
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => removeGoal(index)}
                    className={btnRemove}
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

        {/* Completed Goals*/}
        <h2 className="text-2xl font-semibold mb-4">Completed Goals</h2>
        <div className="grid grid-cols-1 gap-3 mb-6 text-gray-500">
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
      </main>
    </div>
  );
}

export default Goals;
