import { useState } from "react";
import { Link } from "react-router-dom";

export default function Support() {
  const [open, setOpen] = useState(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false); // ✅ new state for confirmation

  // FAQ content updated slightly for realism
  const faqs = [
    { q: "How can I reset my password?", a: "Go to your account settings and select 'Change Password'. Follow the prompts to create a new one." },
    { q: "Why am I not receiving notifications?", a: "Please check your app notification settings and ensure permissions are enabled." },
    { q: "Can I update my email address?", a: "Yes, you can update your registered email in the Profile section under Account Information." },
    { q: "How do I delete my account?", a: "We're sorry to see you go! Please reach out to support for help with account removal." },
  ];

  const toggle = (idx) => setOpen((prev) => (prev === idx ? null : idx));

  const onSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please enter a message before submitting.");
      return;
    }

    console.log("Support request submitted:", message);

    setSubmitted(true);
    setMessage("");

    // Auto-hide message after a few seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Shared styles
  const btnDark =
    "inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90 transition";
  const btnPrimary =
    "px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer";
  const card =
    "rounded-lg bg-white shadow-sm border border-gray-200";

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
        <h1 className="mt-6 text-4xl font-semibold">Help &amp; Support</h1>

        {/* FAQ Section */}
        <section aria-label="FAQs" className="mt-6">
          <h2 className="text-sm font-medium text-[#282f32]/70 mb-2">
            Frequently Asked Questions
          </h2>

          <ul className="space-y-3">
            {faqs.map((item, idx) => {
              const expanded = open === idx;
              return (
                <li key={idx} className={card}>
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
              <button type="submit" className={btnPrimary}>
                Submit
              </button>
            </div>
          </form>

          {/* ✅ Feedback message */}
          {submitted && (
            <div className="mt-4 px-4 py-3 bg-green-100 text-green-700 border border-green-300 rounded-lg text-center text-sm font-medium">
              ✅ Thank you! Your message has been sent. Our team will get back to you soon.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
