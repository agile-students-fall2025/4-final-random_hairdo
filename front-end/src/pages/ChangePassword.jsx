import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ChangePassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirmChanges = async (event) => {
    event.preventDefault();

    // client-side checks
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setMessage("Please fill out both fields.");
      setIsSuccess(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match!");
      setIsSuccess(false);
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      setIsSuccess(false);
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      const token = localStorage.getItem('token')
      
      if (!storedUser._id || !token) {
        throw new Error('Please log in first')
      }

      const res = await fetch(`/api/users/${storedUser._id}/password`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(body.error || body.message || "Password change failed");
      }

      setMessage("✅ Your password has been successfully changed.");
      setIsSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      // navigate after a short delay
      setTimeout(() => navigate("/settings"), 1500);
    } catch (err) {
      setMessage(err.message || "Something went wrong. Please try again.");
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer";

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4 flex flex-col">
      <header className="mx-auto w-full max-w-md md:max-w-xl flex items-start justify-between mb-6">
        <Link
          to="/settings"
          className="inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90"
        >
          Back to Settings
        </Link>
        <Link to="/" aria-label="Home">
          <img src="/smartfit_logo.png" alt="SMARTFIT logo" className="h-12 w-auto md:h-16" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-md md:max-w-xl flex-grow flex flex-col justify-center">
        <h1 className="text-4xl font-semibold mb-8 text-center">Change Password</h1>

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

        <form onSubmit={handleConfirmChanges} className="flex flex-col gap-6">
          <div>
            <label htmlFor="newPassword" className="block text-lg font-medium mb-2">
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

          <div>
            <label htmlFor="confirmPassword" className="block text-lg font-medium mb-2">
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

          <button type="submit" disabled={submitting} className={`${btnPrimary} mt-4 ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}>
            {submitting ? "Saving…" : "Confirm Changes"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default ChangePassword;
