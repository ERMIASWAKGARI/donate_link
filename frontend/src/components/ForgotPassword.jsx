import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./common/Header";

const ForgotPassword = () => {
  const [method, setMethod] = useState("email"); // "email" or "phone"
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    let payload;
    if (method === "email") {
      if (!email) {
        setError("Please enter your email.");
        setLoading(false);
        return;
      }
      payload = { email };
    } else if (method === "phone") {
      if (!phone) {
        setError("Please enter your phone number.");
        setLoading(false);
        return;
      }
      payload = { phone };
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setMessage(data.message);

      // Redirect to reset page for phone users
      if (method === "phone") {
        navigate(`/reset-password?phone=${phone}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Forgot Password
          </h2>
          {message && <p className="text-green-600">{message}</p>}
          {error && <p className="text-red-600">{error}</p>}

          {/* Method Toggle */}
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                method === "email"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setMethod("email")}
            >
              Email
            </button>
            <button
              className={`flex-1 py-3 font-medium text-sm ${
                method === "phone"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setMethod("phone")}
            >
              Phone
            </button>
          </div>

          {/* Email or Phone Input */}
          {method === "email" ? (
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
          ) : (
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="flex">
                <select
                  name="countryCode"
                  className="p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value="+251"
                >
                  <option value="+251">🇪🇹 +251</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                </select>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="1234567890"
                  className="flex-1 p-3 border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:[#008080] focus:border-transparent"
                  onChange={(e) => setPhone(e.target.value)}
                  value={phone}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full bg-primary text-white p-3 rounded-lg font-medium hover:bg-[#008080] transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-[#008080] focus:ring-offset-2"
          >
            {loading ? "Sending..." : "Send Reset"}
          </button>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
