import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // verify nyu email format
  const isNyuEmail = (value) =>
    /^[^\s@]+@nyu\.edu$/i.test(value.trim());

  useEffect(() => {
    setIsFormValid(
      isNyuEmail(email) &&
        password.length > 0 &&
        password === confirmPassword
    );
  }, [email, password, confirmPassword]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setServerError("");

    if (!isNyuEmail(email)) {
      setEmailError("You must register with a valid @nyu.edu email.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0], // temporary name from email
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        // Check message first (backend sends it there)
        const errorMsg = data.message || data.error || "Registration failed.";

        // Route error to appropriate field
        if (errorMsg.toLowerCase().includes('password')) {
          setPasswordError(errorMsg);
        } else if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('exists')) {
          setEmailError(errorMsg);
        } else {
          setServerError(errorMsg);
        }
        return;
        
      }

      // If backend sends token + user, store them (optional but nice)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // You can skip the alert if you want, but it’s clear UX
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setServerError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getEmailHelperText = () => {
    if (emailError) return emailError;
    if (!email) return "Must be an @nyu.edu email to register.";
    if (isNyuEmail(email)) return null;
    return "e.g. abc123@nyu.edu";
  };

  const emailHelper = getEmailHelperText();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#efefed] text-[#282f32]">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="flex justify-center">
          <img src="/smartfit_logo.png" alt="Logo" className="w-70 h-auto" />
        </div>

        <h2 className="text-center text-3xl font-semibold">Register</h2>

        {serverError && (
          <p className="mt-1 text-sm text-red-600 text-center">{serverError}</p>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleRegister}>
          <div>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
              placeholder="Email (must be @nyu.edu)"
            />
            {emailHelper && (
              <p className="mt-1 text-sm text-red-600">{emailHelper}</p>
            )}
          </div>

          <div>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
              placeholder="Password"
            />
          </div>

          <div>
            <input
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#462c9f]"
              placeholder="Confirm Password"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={
              "w-full py-2 px-4 bg-[#462c9f] text-white rounded-md font-medium transition-colors " +
              (isFormValid && !loading
                ? "hover:bg-[#3b237f]"
                : "opacity-50 cursor-not-allowed")
            }
          >
            {loading ? "Registering…" : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account? Click{" "}
          <Link to="/login" className="text-[#462c9f] hover:underline">
            here to log in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default Register;

