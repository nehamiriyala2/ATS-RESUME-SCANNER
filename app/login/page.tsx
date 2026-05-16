"use client";

import { useState } from "react";

export default function LoginPage() {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {

      setMessage("Please fill all fields ❌");

      return;

    }

    try {

      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      // LOGIN SUCCESS

      if (data.access_token) {

        localStorage.setItem(
          "token",
          data.access_token
        );

        setMessage("Login Successful ✅");

        // REDIRECT TO ATS PAGE

        setTimeout(() => {

          window.location.href = "/";

        }, 1000);

      } else {

        setMessage(
          data.message || "Invalid Credentials ❌"
        );

      }

    } catch (error) {

      console.log(error);

      setMessage("Login Failed ❌");

    } finally {

      setLoading(false);

    }

  };

  return (

    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

        {/* TITLE */}

        <h1 className="text-4xl font-bold mb-2 text-center text-blue-600">

          ATS Login 🚀

        </h1>

        <p className="text-center text-gray-500 mb-6">

          Login to continue

        </p>

        {/* EMAIL */}

        <input
          type="email"
          placeholder="Enter Email"
          className="border p-3 w-full mb-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}

        <input
          type="password"
          placeholder="Enter Password"
          className="border p-3 w-full mb-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* LOGIN BUTTON */}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-3 rounded-lg w-full font-bold"
        >

          {loading ? "Logging in..." : "Login"}

        </button>

        {/* MESSAGE */}

        {message && (

          <p className="mt-4 text-center font-semibold text-green-600">

            {message}

          </p>

        )}

        {/* SIGNUP */}

        <p className="mt-6 text-center text-gray-600">

          Don't have an account?

          <a
            href="/signup"
            className="text-blue-600 font-bold ml-1 hover:underline"
          >

            Signup

          </a>

        </p>

      </div>

    </main>

  );

}