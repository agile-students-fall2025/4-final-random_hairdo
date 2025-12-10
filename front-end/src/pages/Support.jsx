import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import getApiUrl from "../utils/api";

// Shared styles
const btnPrimary =
  "px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer";
const card = "rounded-lg bg-white shadow-sm border border-gray-200";

export default function Support() {
  const navigate = useNavigate();

  // ---- Get current user + id from localStorage / JWT ----
  const { userId, isAuthed } = useMemo(() => {
    let userId = null;

    // Try to get user object from localStorage (set at login)
    const storedUserRaw = localStorage.getItem("user");
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw);
        userId = storedUser._id || storedUser.id || null;
      } catch {
        // ignore parse error, try token
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
          userId = payload.id || payload.user?.id || null;
        } catch {
          // bad token, ignore
        }
      }
    }

    return { userId, isAuthed: Boolean(userId) };
  }, []);

  const [open, setOpen] = useState(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [faqError, setFaqError] = useState("");

  const toggle = (idx) => setOpen((prev) => (prev === idx ? null : idx));

  async function api(path, opts = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(getApiUrl(path), {
      method: opts.method || "GET",
      headers: {
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.error || data.message || res.statusText);
    }
    return data;
  }

  // Load FAQs from backend
  useEffect(() => {
    (async () => {
      try {
        setLoadingFaqs(true);
        const { data } = await api("/api/support/faqs");
        const normalized = data.map((f) => ({
          q: f.question ?? f.q,
          a: f.answer ?? f.a,
          id: f.id,
          category: f.category,
          order: f.order,
        }));
        setFaqs(normalized);
      } catch (e) {
        setFaqError(e.message || "Failed to load FAQs");
      } finally {
        setLoadingFaqs(false);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please enter a message before submitting.");
      return;
    }

    if (!isAuthed || !userId) {
      // up to you: redirect or just show alert
      alert("You must be logged in to submit a support issue.");
      navigate("/login");
      return;
    }

    try {
      await api("/api/support/issues", {
        method: "POST",
        body: {
          userId, // real logged-in user id
          message,
          subject: "Support request from app",
          category: "General",
          priority: "medium",
        },
      });
      setSubmitted(true);
      setMessage("");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      alert(`Could not submit: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4">
      {/* Header */}
      <header className="mx-auto w-full max-w-xl flex items-start justify-between mb-6">
        <Link
          to="/settings"
          className="px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm hover:opacity-90"
        >
          Back to Settings
        </Link>
        <Link to="/">
          <img src="/smartfit_logo.png" className="h-12 md:h-16" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-md md:max-w-xl">
        <h1 className="text-4xl font-semibold mb-2">Help &amp; Support</h1>

        {/* FAQ Section */}
        <section aria-label="FAQs" className="mt-6">
          <h2 className="text-sm font-medium text-[#282f32]/70 mb-2">
            Frequently Asked Questions
          </h2>

          {loadingFaqs ? (
            <div className="p-4 text-sm text-gray-600">Loading FAQs…</div>
          ) : faqError ? (
            <div className="p-4 text-sm text-red-600">{faqError}</div>
          ) : (
            <ul className="space-y-3">
              {faqs.map((item, idx) => {
                const expanded = open === idx;
                return (
                  <li key={item.id ?? idx} className={card}>
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-expanded={expanded}
                      className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
                    >
                      <span className="font-semibold">{item.q}</span>
                      <span
                        className={`transition-transform text-lg ${
                          expanded ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      >
                        {expanded ? "−" : "+"}
                      </span>
                    </button>

                    {expanded && (
                      <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                        {item.a}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Support Form */}
        <section aria-label="Report an issue" className="mt-10">
          <h2 className="text-sm font-medium text-[#282f32]/70 mb-2">
            Report an Issue
          </h2>

          <form onSubmit={onSubmit} className={`${card} p-4`}>
            <label htmlFor="issue" className="sr-only">
              Describe the issue
            </label>
            <textarea
              id="issue"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the problem or send us feedback…"
              className="w-full h-40 rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#462c9f] bg-white"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className={`${btnPrimary} ${
                  !isAuthed ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={!isAuthed}
              >
                {isAuthed ? "Submit" : "Login to submit"}
              </button>
            </div>
          </form>

          {submitted && (
            <div className="mt-4 px-4 py-3 bg-green-100 text-green-700 border border-green-300 rounded-lg text-center text-sm font-medium">
              ✅ Thank you! Your message has been sent. Our team will get back
              to you soon.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}