import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

const btnPrimary =
  "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition";
const btnOutline =
  "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition";

const btnPrimaryBtn = `${btnPrimary} cursor-pointer`;
const btnOutlineBtn = `${btnOutline} cursor-pointer`;


export default function Settings() {
  const navigate = useNavigate();

  // ---- Get current user + id from localStorage / JWT ----
  const { userId, isAuthed } = useMemo(() => {
    let userId = null;

    // Try to get user object (if your login stores it)
    const storedUserRaw = localStorage.getItem("user");
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        userId = storedUser._id || storedUser.id || null;
      } catch {
        // ignore parse error, we'll try token next
      }
    }

    // Fallback: decode JWT and pull id from payload
    if (!userId) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const [, payloadBase64] = token.split(".");
          const payloadJson = atob(payloadBase64);
          const payload = JSON.parse(payloadJson);
          // depending on how you signed the token
          userId = payload.id || payload.user?.id || null;
        } catch {
          // bad token, ignore
        }
      }
    }

    return { userId, isAuthed: Boolean(userId) };
  }, []);

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
    if (!isAuthed || !userId) {
      setDeleteErr("You must be logged in to delete your account.");
      return;
    }

    if (!window.confirm("Delete your account? This cannot be undone.")) return;

    try {
      setDeleting(true);
      setDeleteErr("");

      const token = localStorage.getItem("token");

      const res = await fetch(`/api/settings/account/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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

  
  return (
    <div className="min-h-[90vh] bg-[#efefed] text-[#282f32] px-6 py-4">
      <div className="w-full flex items-start justify-between mb-8">
        <div className="flex items-center">
          <img src="/smartfit_logo.png" alt="Logo" className="h-20 w-auto" />
        </div>
      </div>

      <main className="mx-auto w-full max-w-md md:max-w-xl">
        <h1 className="mt-6 text-4xl font-semibold">Settings</h1>

        <nav aria-label="Settings actions" className="mt-6 flex flex-col gap-4">
          <Link to="/edit-profile" className={btnPrimary}>
            Edit Profile
          </Link>
          <Link to="/support" className={btnPrimary}>
            Help &amp; Support
          </Link>
          <Link to="/change-password" className={btnPrimary}>
            Change Password
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className={btnPrimaryBtn}
          >
            Sign Out
          </button>
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
            disabled={deleting || !isAuthed}
            className={`md:w-[520px] ${btnOutlineBtn} ${
              deleting || !isAuthed ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {deleting
              ? "Deleting…"
              : isAuthed
              ? "Delete Account"
              : "Login to delete account"}
          </button>
        </div>
      </main>
    </div>
  );
}