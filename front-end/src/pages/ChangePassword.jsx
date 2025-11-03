import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();

  // State for form inputs
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null); // ✅ new state for success/error message
  const [isSuccess, setIsSuccess] = useState(false); // ✅ distinguish success/error

  // Handler for form submission
  const handleConfirmChanges = (event) => {
    event.preventDefault();

    if (newPassword.trim() === "" || confirmPassword.trim() === "") {
      setMessage("Please fill out both fields.");
      setIsSuccess(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match!");
      setIsSuccess(false);
      return;
    }

    // ✅ Simulate success
    console.log("Attempting to change password to:", newPassword);

    setMessage("✅ Your password has been successfully changed.");
    setIsSuccess(true);
    setNewPassword("");
    setConfirmPassword("");

    // Auto-navigate after short delay
    setTimeout(() => navigate("/settings"), 2000);
  };

  const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer";

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4 flex flex-col">
      
      {/* Header */}
      <header className="mx-auto w-full max-w-md md:max-w-xl flex items-start justify-between mb-6">
        <Link
          to="/settings"
          className="inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90"
        >
          Back to Settings
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
      <main className="mx-auto w-full max-w-md md:max-w-xl flex-grow flex flex-col justify-center">
        <h1 className="text-4xl font-semibold mb-8 text-center">
          Change Password
        </h1>

        {/* ✅ Feedback Message */}
        {message && (
          <div
            className={`mb-6 text-center px-4 py-3 rounded-lg text-base font-medium ${
              isSuccess
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleConfirmChanges} className="flex flex-col gap-6">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-lg font-medium mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#462c9f] focus:outline-none"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-lg font-medium mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#462c9f] focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className={`${btnPrimary} mt-4`}>
            Confirm Changes
          </button>
        </form>
      </main>
    </div>
  );
}

export default ChangePassword;
