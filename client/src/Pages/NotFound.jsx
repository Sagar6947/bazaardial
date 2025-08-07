import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-orange-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">Page Not Found</p>
      <Link
        to="/"
        className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
      >
        Go Home
      </Link>
    </div>
  );
}
