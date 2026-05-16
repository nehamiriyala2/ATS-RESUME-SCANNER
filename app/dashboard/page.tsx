"use client";

import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

interface Candidate {
  id: number;
  filename: string;
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

export default function Dashboard() {

  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {

      window.location.href = "/login";

      return;

    }

    fetchCandidates();

  }, []);

  const fetchCandidates = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/candidates/"
      );

      const data = await response.json();

      console.log(data);

      if (data.candidates) {

        setCandidates(data.candidates);

      }

    } catch (error) {

      console.log("Dashboard Error:", error);

    } finally {

      setLoading(false);

    }

  };

  const logout = () => {

    localStorage.removeItem("token");

    window.location.href = "/login";

  };

  // =========================================
  // ANALYTICS
  // =========================================

  const totalCandidates = candidates.length;

  const averageScore =
    candidates.length > 0
      ? (
          candidates.reduce(
            (acc, curr) => acc + curr.ats_score,
            0
          ) / candidates.length
        ).toFixed(2)
      : "0";

  const highestScore =
    candidates.length > 0
      ? Math.max(
          ...candidates.map(
            (c) => c.ats_score
          )
        )
      : 0;

  // =========================================
  // SEARCH FILTER
  // =========================================

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.filename
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-3xl font-bold bg-gray-100">

        Loading Dashboard...

      </div>

    );

  }

  return (

    <main className="min-h-screen bg-gray-100 p-6 md:p-10">

      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-5">

        <h1 className="text-4xl font-bold text-blue-600">

          ATS Analytics Dashboard 🚀

        </h1>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl shadow-md"
        >

          Logout

        </button>

      </div>

      {/* ========================================= */}
      {/* ANALYTICS CARDS */}
      {/* ========================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* TOTAL */}

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">

          <h2 className="text-xl font-bold text-gray-700 mb-3">

            Total Candidates 👥

          </h2>

          <p className="text-5xl font-bold text-blue-600">

            {totalCandidates}

          </p>

        </div>

        {/* AVERAGE */}

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">

          <h2 className="text-xl font-bold text-gray-700 mb-3">

            Average ATS 📈

          </h2>

          <p className="text-5xl font-bold text-green-600">

            {averageScore}%

          </p>

        </div>

        {/* HIGHEST */}

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">

          <h2 className="text-xl font-bold text-gray-700 mb-3">

            Highest Score 🏆

          </h2>

          <p className="text-5xl font-bold text-purple-600">

            {highestScore}%

          </p>

        </div>

      </div>

      {/* ========================================= */}
      {/* SEARCH BAR */}
      {/* ========================================= */}

      <div className="bg-white p-5 rounded-2xl shadow-lg mb-10">

        <input
          type="text"
          placeholder="Search Resume..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
        />

      </div>

      {/* ========================================= */}
      {/* CHART */}
      {/* ========================================= */}

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-10">

        <h2 className="text-2xl font-bold mb-6">

          ATS Score Analytics 📊

        </h2>

        {filteredCandidates.length > 0 ? (

          <ResponsiveContainer
            width="100%"
            height={400}
          >

            <BarChart data={filteredCandidates}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="filename" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="ats_score"
                fill="#2563eb"
                radius={[10, 10, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        ) : (

          <p className="text-gray-500 text-lg">

            No candidate data available.

          </p>

        )}

      </div>

      {/* ========================================= */}
      {/* TABLE */}
      {/* ========================================= */}

      <div className="bg-white p-8 rounded-2xl shadow-lg">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold">

            Candidate History 📄

          </h2>

          <button
            onClick={fetchCandidates}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >

            Refresh

          </button>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-blue-100 text-gray-700">

                <th className="border p-4">
                  ID
                </th>

                <th className="border p-4">
                  Resume
                </th>

                <th className="border p-4">
                  ATS Score
                </th>

                <th className="border p-4">
                  Matched Skills
                </th>

                <th className="border p-4">
                  Missing Skills
                </th>

                <th className="border p-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredCandidates.length > 0 ? (

                filteredCandidates.map((candidate) => (

                  <tr
                    key={candidate.id}
                    className="hover:bg-gray-50 transition"
                  >

                    <td className="border p-4 text-center">

                      {candidate.id}

                    </td>

                    <td className="border p-4">

                      {candidate.filename}

                    </td>

                    <td className="border p-4 font-bold text-green-600">

                      {candidate.ats_score}%

                    </td>

                    <td className="border p-4">

                      {candidate.matched_skills.length > 0
                        ? candidate.matched_skills.join(", ")
                        : "No Skills"}

                    </td>

                    <td className="border p-4 text-red-500">

                      {candidate.missing_skills.length > 0
                        ? candidate.missing_skills.join(", ")
                        : "No Missing Skills"}

                    </td>

                    <td className="border p-4">

                      {candidate.ats_score >= 70 ? (

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">

                          Selected

                        </span>

                      ) : candidate.ats_score >= 40 ? (

                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">

                          Average

                        </span>

                      ) : (

                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">

                          Rejected

                        </span>

                      )}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={6}
                    className="text-center p-6 text-gray-500 text-lg"
                  >

                    No Candidates Found

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );

}