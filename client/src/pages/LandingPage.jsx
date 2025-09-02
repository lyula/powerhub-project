import { Link } from "react-router-dom";
import { colors } from "../theme/colors";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#181818]">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#212121] shadow">
        <h1
          className="text-2xl font-extrabold tracking-tight"
          style={{ color: colors.primary }}
        >
          PowerHub
        </h1>
        <nav className="flex gap-4">
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: colors.secondary }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-lg font-bold transition shadow-md"
            style={{
              backgroundColor: colors.primary,
              color: "#fff",
            }}
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
          Learn. Share.{" "}
          <span style={{ color: colors.primary }}>Grow.</span>
        </h2>
        <p
          className="mt-4 max-w-2xl text-lg md:text-xl text-gray-700 dark:text-gray-300"
        >
          PowerHub is your space to upload videos, build channels, and join a
          growing community of PLP students.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            to="/register"
            className="px-6 py-3 text-lg rounded-lg font-semibold transition shadow-md"
            style={{
              backgroundColor: colors.primary,
              color: "#fff",
            }}
          >
            Join Now
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 text-lg rounded-lg font-semibold transition border"
            style={{
              borderColor: colors.secondary,
              color: colors.secondary,
            }}
          >
            Login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-[#212121]">
        <span style={{ color: colors.secondary }}>
          © {new Date().getFullYear()} PowerHub. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
