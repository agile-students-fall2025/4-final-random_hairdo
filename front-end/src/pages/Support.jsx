import { useState } from "react";
import { Link } from "react-router-dom";

export default function Support() {
  const [open, setOpen] = useState(null); 
  const [message, setMessage] = useState("");

  const faqs = [
    { q: "Question 1", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque in feugiat metus. Donec facilisis, purus vitae porta luctus, augue arcu aliquet ipsum, sed ultricies mauris risus nec lorem." },
    { q: "Question 2", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non fermentum lectus. Integer luctus dapibus orci, eu efficitur dolor blandit vitae." },
    { q: "Question 3", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent venenatis arcu id massa pulvinar, non sagittis arcu bibendum." },
    { q: "Question 4", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae turpis at nibh interdum cursus et sed justo." },
  ];

  const toggle = (idx) => setOpen((prev) => (prev === idx ? null : idx));

  const onSubmit = (e) => {
    e.preventDefault();
    alert("Support form: to be implemented");
    setMessage("");
  };

  // shared styles (same pattern as Settings/Home)
  const btnDark =
    "inline-flex px-4 py-2 rounded-lg bg-[#282f32] text-white text-sm font-medium hover:opacity-90 transition";
  const btnPrimary =
    "px-5 py-3 rounded-lg bg-[#462c9f] text-white text-base font-semibold text-center hover:bg-[#3b237f] transition cursor-pointer";
  const card = "rounded-lg bg-white shadow-sm border border-gray-200";

  return (
    <div className="min-h-screen bg-[#efefed] text-[#282f32] px-6 py-4">
      <header className="mx-auto w-full max-w-md md:max-w-xl flex items-start justify-between">
        <Link to="/settings" className={btnDark}>Back to Settings</Link>
        <Link to="/" aria-label="Home">
          <img src="/smartfit_logo.png" alt="SMARTFIT logo" className="h-12 w-auto md:h-16" />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-md md:max-w-xl">
        <h1 className="mt-6 text-4xl font-semibold">Help &amp; Support</h1>

        <section aria-label="FAQs" className="mt-6">
          <h2 className="text-sm font-medium text-[#282f32]/70 mb-2">FAQs</h2>

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
                      className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                      aria-hidden
                    >
                      
                    </span>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 text-sm text-gray-600">
                      {item.a}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-label="Report an issue" className="mt-10">
          <h2 className="text-sm font-medium text-[#282f32]/70 mb-2">Report an issue</h2>

          <form onSubmit={onSubmit} className={`${card} p-4`}>
            <label htmlFor="issue" className="sr-only">Describe the issue</label>
            <textarea
              id="issue"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the problem…"
              className="w-full h-40 rounded-md border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-[#462c9f] bg-white"
            />
            <div className="mt-4 flex justify-end">
              <button type="submit" className={btnPrimary}>
                Submit
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
