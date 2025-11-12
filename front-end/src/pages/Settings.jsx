import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Settings() {
  const navigate = useNavigate();

  // TODO: replace with real logged-in user id
  const USER_ID = 1;

  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  const onSignOut = () => {
    // clear any client-side session state
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const onDelete = async () => {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;

    try {
      setDeleting(true);
      setDeleteErr("");

      const res = await fetch(`/api/settings/account/${USER_ID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.success === false) {
        throw new Error(body.error || body.message || "Delete failed");
      }

      // Clear local state and send user to register (or landing)
      localStorage.clear();
      sessionStorage.clear();
      navigate("/register");
    } catch (err) {
      setDeleteErr(err.message || "Something went wrong deleting your account");
    } finally {
      setDeleting(false);
    }
  };

  // shared bases (unchanged)
  const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition";
  const btnOutline =
    "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition";

  const btnPrimaryBtn = `${btnPrimary} cursor-pointer`;
  const btnOutlineBtn = `${btnOutline} cursor-pointer`;

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4">
      <header className="mx-auto w-full max-w-md md:max-w-xl flex items-start justify-between">
        <Link
          to="/"
          className="inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90"
        >
          Back to Home Page
        </Link>
        <Link to="/" aria-label="Home">
          <img src="/smartfit_logo.png" alt="SMARTFIT logo" className="h-12 w-auto md:h-16" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-md md:max-w-xl">
        <h1 className="mt-6 text-4xl font-semibold">Settings</h1>

        <nav aria-label="Settings actions" className="mt-6 flex flex-col gap-4">
          <Link to="/notifications" className={btnPrimary}>Notifications</Link>
          <Link to="/support" className={btnPrimary}>Help &amp; Support</Link>
          <Link to="/change-password" className={btnPrimary}>Change Password</Link>
          <button type="button" onClick={onSignOut} className={btnPrimaryBtn}>Sign Out</button>
        </nav>

        <div className="h-20" />

        {deleteErr && (
          <div className="mb-4 text-sm text-red-600 border border-red-200 bg-red-50 rounded-md px-3 py-2">
            {deleteErr}
          </div>
        )}

        <div className="md:flex md:justify-center">
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className={`md:w-[520px] ${btnOutlineBtn} ${deleting ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {deleting ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </main>
    </div>
  );
}
