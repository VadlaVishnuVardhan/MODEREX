import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">

      <h1 className="text-[8rem] font-extrabold text-red-500 mb-4">
        404
      </h1>

      <p className="text-2xl mb-2 font-semibold">
        Oops! Page Not Found
      </p>

      <p className="text-gray-500 mb-6">
        The page you are looking for does not exist in Moderex.
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>

    </div>
  );
};

export default NotFound;
