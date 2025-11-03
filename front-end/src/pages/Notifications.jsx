import { useState } from "react";
import { Link } from "react-router-dom";

export default function Notifications() {
  // Initialize with sample notifications (some unread, some read)
  const [items, setItems] = useState([
    { id: 1, title: "Goal deadline reminder: Leg day scheduled for 6 PM", read: false },
    { id: 2, title: "New message from your friend", read: false },
    { id: 3, title: "Weekly progress report is ready to view", read: false },
    { id: 4, title: "Goal completed: 5-day streak!", read: true },
    { id: 5, title: "New equipments are free", read: true },
    { id: 6, title: "New class added: Power Yoga", read: true },
    { id: 7, title: "New equipments are free", read: true },
    { id: 8, title: "SmartFit app update now available", read: true },
  ]);

  const btnDark =
    "inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90 transition";
  const btnPrimary =
    "px-4 py-2 bg-[#462c9f] text-white rounded-md text-sm font-medium hover:bg-[#3b237f] transition";
  const btnSecondary =
    "px-4 py-2 bg-gray-200 text-[#282f32] rounded-md text-sm font-medium hover:bg-gray-300 transition";

  const recent = items.filter((n) => !n.read);
  const earlier = items.filter((n) => n.read);

  // Mark all unread notifications as read
  const markAllAsRead = () => {
    if (recent.length === 0) return;
    const updated = items.map((n) => ({ ...n, read: true }));
    setItems(updated);
    console.log("All notifications marked as read");
  };

  // Clear all notifications
  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setItems([]);
      console.log("All notifications cleared");
    }
  };

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4">
      
      {/* Header */}
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
          {/* Section header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <span className="text-sm text-[#282f32]/70">
              Your latest updates and alerts
            </span>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button onClick={markAllAsRead} className={btnSecondary}>
                Mark all as read
              </button>
              <button onClick={clearAll} className={btnPrimary}>
                Clear All
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No notifications at the moment. Check back later!
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-500 text-center">
            Last updated just now
          </div>
        </section>
      </main>
    </div>
  );
}
