import { useState } from "react";
import { Link } from "react-router-dom";

export default function Notifications() {
  const [items] = useState([
    { id: 1, title: "Notification 1", read: false },
    { id: 2, title: "Notification 2", read: false },
    { id: 3, title: "Notification 3", read: false },
    { id: 4, title: "Notification 4", read: true },
    { id: 5, title: "Notification 5", read: true },
    { id: 6, title: "Notification 6", read: true },
    { id: 7, title: "Notification 7", read: true },
    { id: 8, title: "Notification 8", read: true },
    { id: 9, title: "Notification 9", read: true },
    { id: 10, title: "Notification 10", read: true },
  ]);

  const btnDark =
    "inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90 transition";

  const recent = items.filter((n) => !n.read);
  const earlier = items.filter((n) => n.read);

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4">
      <header className="mx-auto w-full max-w-md md:max-w-xl flex items-start justify-between">
        <Link to="/settings" className={btnDark}>
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

      <main className="mx-auto w-full max-w-md md:max-w-xl">
        <h1 className="mt-6 text-4xl font-semibold">Notifications</h1>

        <section
          aria-label="Notifications"
          className="mt-6 rounded-lg bg-white shadow-sm border border-gray-200"
        >
          <div className="px-4 py-3 border-b border-gray-200">
            <span className="text-sm text-[#282f32]/70">
              List of Current Notifications
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recent.length > 0 && (
              <div className="px-2 py-2">
                <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-[#282f32]/60">
                  Unread
                </div>
                <ul className="mt-1">
                  {recent.map((n) => (
                    <li
                      key={n.id}
                      className="px-3 py-3 flex items-start gap-3 hover:bg-gray-50"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-2 w-2 rounded-full bg-[#462c9f] shrink-0"
                      />
                      <p className="font-semibold">{n.title}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="px-2 py-2">
              <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-[#282f32]/60">
                Read
              </div>
              <ul className="mt-1">
                {earlier.map((n) => (
                  <li
                    key={n.id}
                    className="px-3 py-3 flex items-start gap-3 hover:bg-gray-50"
                  >
                    <span
                      aria-hidden
                      className="mt-2 h-2 w-2 rounded-full bg-gray-300 shrink-0"
                    />
                    <p className="font-normal text-[#282f32]">{n.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
          </div>
        </section>
      </main>
    </div>
  );
}
