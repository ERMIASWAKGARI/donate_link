import { useState } from "react";

function LoginPage() {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in user:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            required
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full p-2 border border-gray-300 rounded"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
