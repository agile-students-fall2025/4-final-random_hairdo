import { Link, useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const onSignOut = () => navigate("/login");
  const onDelete = () =>
    window.confirm("Delete your account? This cannot be undone.") &&
    navigate("/register");

  // shared bases (unchanged)
  const btnPrimary =
    "w-full px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition";
  const btnOutline =
    "w-full px-5 py-3 rounded-lg border-2 border-[#462c9f] text-[#462c9f] text-base font-semibold text-center hover:bg-[#462c9f] hover:text-white transition";

  // button-only variants (just add cursor)
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

        <div className="md:flex md:justify-center">
          <button type="button" onClick={onDelete} className={`md:w-[520px] ${btnOutlineBtn}`}>
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}
