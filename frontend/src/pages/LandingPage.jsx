import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600">
        Welcome to Our Donation Platform
      </h1>
      <p className="mt-4 text-lg text-gray-700">
        Make a difference by donating to NGOs and helping those in need.
      </p>
      <div className="mt-6 space-x-4">
        <Link
          to="/register"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
        >
          Register
        </Link>
        <Link
          to="/login"
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;
