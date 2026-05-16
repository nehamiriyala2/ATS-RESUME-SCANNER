"use client";

import { useState } from "react";

export default function SignupPage() {

  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const handleSignup = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      setMessage(data.message);

    } catch (error) {

      console.log(error);

      setMessage("Signup Failed ❌");

    }
  };

  return (

    <main className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px]">

        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Signup
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="border p-2 w-full mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
        >
          Signup
        </button>

        {message && (
          <p className="mt-4 text-center text-green-600">
            {message}
          </p>
        )}

        <p className="mt-4 text-center">

          Already have an account?

          <a
            href="/login"
            className="text-blue-600 font-bold ml-1"
          >
            Login
          </a>

        </p>

      </div>

    </main>
  );
}