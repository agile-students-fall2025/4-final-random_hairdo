import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [userId, setUserId] = useState(null);

  // Get user ID from JWT token
  const userFromToken = useMemo(() => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const decoded = jwtDecode(token)
      // Token payload is { id, email }
      return decoded
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }, [])

  useEffect(() => {
    if (userFromToken?.id) {
      setUserId(userFromToken.id)
    }
  }, [userFromToken])

  const btnDark =
    "inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90 transition";
  const btnPrimary =
    "px-4 py-2 bg-[#462c9f] text-white rounded-md text-sm font-medium hover:bg-[#3b237f] transition";
  const btnSecondary =
    "px-4 py-2 bg-gray-200 text-[#282f32] rounded-md text-sm font-medium hover:bg-gray-300 transition";

  // helper
  async function api(path, opts = {}) {
    const token = localStorage.getItem('token')
    const headers = {
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
    
    const res = await fetch(path, {
      method: opts.method || "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || data.message || res.statusText);
    }
    return data;
  }

  // initial load
  useEffect(() => {
    if (!userId) return;
    
    (async () => {
      try {
        setLoading(true);
        const { data } = await api(`/api/notifications/user/${userId}`);
        // backend uses isRead; normalize to isRead in state
        setItems(data);
      } catch (e) {
        setErr(e.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const unread = useMemo(() => items.filter(n => !n.isRead), [items]);
  const read = useMemo(() => items.filter(n => n.isRead), [items]);

  // Mark single as read (click on an unread item)
  async function markOne(id) {
    try {
      await api(`/api/notifications/${id}/read`, { method: "PUT" });
      setItems(prev => prev.map(n => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (e) {
      alert(`Could not mark as read: ${e.message}`);
    }
  }

  // Mark all unread as read
  async function markAllAsRead() {
    if (!unread.length) return;
    try {
      await Promise.all(
        unread.map(n => api(`/api/notifications/${n._id}/read`, { method: "PUT" }))
      );
      setItems(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      alert(`Could not mark all: ${e.message}`);
    }
  }

  // Clear all (UI only for now)
  function clearAll() {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setItems([]);
    }
  }

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
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">
                Loading…
              </div>
            ) : err ? (
              <div className="p-6 text-center text-sm text-red-600">
                {err}
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No notifications at the moment. Check back later!
              </div>
            ) : (
              <>
                {unread.length > 0 && (
                  <div className="px-2 py-2">
                    <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-[#282f32]/60">
                      Unread
                    </div>
                    <ul className="mt-1">
                      {unread.map((n) => (
                        <li
                          key={n._id}
                          className="px-3 py-3 flex items-start gap-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => markOne(n._id)}
                          title="Mark as read"
                        >
                          <span
                            aria-hidden
                            className="mt-2 h-2 w-2 rounded-full bg-[#462c9f] shrink-0"
                          />
                          <div>
                            <p className="font-semibold">{n.title}</p>
                            {n.message && (
                              <p className="text-sm text-gray-600">
                                {n.message}
                              </p>
                            )}
                          </div>
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
                    {read.map((n) => (
                      <li
                        key={n._id}
                        className="px-3 py-3 flex items-start gap-3 hover:bg-gray-50"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-2 w-2 rounded-full bg-gray-300 shrink-0"
                        />
                        <div>
                          <p className="font-normal text-[#282f32]">
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="text-sm text-gray-600">
                              {n.message}
                            </p>
                          )}
                        </div>
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
