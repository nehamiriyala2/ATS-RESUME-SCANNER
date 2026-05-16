"use client";

import { useState } from "react";

interface Candidate {
  filename: string;
  ats_score: number;
  matched_skills: string[];
  missing_skills: string[];
  suggestions: string[];
}

export default function Home() {

  const [files, setFiles] =
    useState<FileList | null>(null);

  const [jobDescription, setJobDescription] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [rankedCandidates, setRankedCandidates] =
    useState<Candidate[]>([]);

  // =========================================
  // HANDLE UPLOAD
  // =========================================

  const handleUpload = async () => {

    if (!files || files.length === 0) {

      alert("Please select resumes");

      return;

    }

    if (!jobDescription.trim()) {

      alert("Please enter job description");

      return;

    }

    setLoading(true);

    setMessage("");

    const formData = new FormData();

    // MULTIPLE FILES

    for (let i = 0; i < files.length; i++) {

      formData.append(
        "files",
        files[i]
      );

    }

    // JOB DESCRIPTION

    formData.append(
      "job_description",
      jobDescription
    );

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/upload-resume/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.status === "success") {

        setMessage(
          "Candidates Ranked Successfully ✅"
        );

        setRankedCandidates(
          data.ranked_candidates || []
        );

      } else {

        setMessage(
          data.message || "Upload Failed ❌"
        );

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Server Connection Failed ❌"
      );

    } finally {

      setLoading(false);

    }

  };

  // =========================================
  // LOGOUT
  // =========================================

  const logout = () => {

    localStorage.removeItem("token");

    window.location.href = "/login";

  };

  // =========================================
  // UI
  // =========================================

  return (

    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-10">

      {/* HEADER */}

      <div className="bg-white shadow-lg rounded-2xl p-5 mb-10 flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-extrabold text-blue-700">
            ATS Resume Scanner 🚀
          </h1>

          <p className="text-gray-500 mt-1">
            AI Powered Resume Ranking System
          </p>

        </div>

        <div className="flex gap-4">

          <button
            onClick={() =>
              window.location.href = "/dashboard"
            }
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              window.location.href = "/login"
            }
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Login
          </button>

          <button
            onClick={() =>
              window.location.href = "/signup"
            }
            className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Signup
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Logout
          </button>

        </div>

      </div>

      {/* MAIN CARD */}

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10">

        <h1 className="text-5xl font-bold text-center mb-10 text-blue-700">

          ATS Resume Scanner 🚀

        </h1>

        {/* JOB DESCRIPTION */}

        <textarea
          placeholder="Paste Job Description Here..."
          value={jobDescription}
          onChange={(e) =>
            setJobDescription(e.target.value)
          }
          className="border-2 border-gray-300 p-4 w-full h-[150px] rounded-xl mb-6 outline-none"
        />

        {/* FILE INPUT */}

        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={(e) => {

            setFiles(e.target.files);

          }}
          className="border p-3 w-full rounded-lg mb-4"
        />

        {/* FILE COUNT */}

        {files && (

          <p className="text-green-600 font-semibold mb-4">

            Selected Files: {files.length}

          </p>

        )}

        {/* BUTTON */}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 transition-all text-white px-6 py-4 rounded-xl w-full text-xl font-bold"
        >

          {loading
            ? "Analyzing..."
            : "Rank Candidates"}

        </button>

        {/* MESSAGE */}

        {message && (

          <p className="mt-4 text-center text-blue-600 font-semibold">

            {message}

          </p>

        )}

        {/* RESULTS */}

        {rankedCandidates.length > 0 && (

          <div className="mt-10">

            <h2 className="text-3xl font-bold mb-6 text-center">

              Ranked Candidates 🏆

            </h2>

            <div className="space-y-6">

              {rankedCandidates.map(
                (candidate, index) => (

                  <div
                    key={index}
                    className="bg-gray-100 p-6 rounded-2xl shadow-lg"
                  >

                    {/* TOP */}

                    <div className="flex justify-between items-center mb-4">

                      <h3 className="text-2xl font-bold text-blue-700">

                        #{index + 1} {candidate.filename}

                      </h3>

                      <span className="bg-green-500 text-white px-4 py-2 rounded-full font-bold">

                        {candidate.ats_score.toFixed(2)}%

                      </span>

                    </div>

                    {/* ATS PROGRESS BAR */}

                    <div className="w-full bg-gray-300 rounded-full h-4 mb-6">

                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${candidate.ats_score}%`
                        }}
                      ></div>

                    </div>

                    {/* MATCHED SKILLS */}

                    <div className="mb-5">

                      <h4 className="font-bold text-green-700 mb-2">

                        Matched Skills ✅

                      </h4>

                      <div className="flex flex-wrap gap-2">

                        {candidate.matched_skills?.length > 0 ? (

                          candidate.matched_skills.map(
                            (skill, i) => (

                              <span
                                key={i}
                                className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm"
                              >

                                {skill}

                              </span>

                            )
                          )

                        ) : (

                          <p>No matched skills</p>

                        )}

                      </div>

                    </div>

                    {/* MISSING SKILLS */}

                    <div className="mb-5">

                      <h4 className="font-bold text-red-700 mb-2">

                        Missing Skills ❌

                      </h4>

                      <div className="flex flex-wrap gap-2">

                        {candidate.missing_skills?.length > 0 ? (

                          candidate.missing_skills.map(
                            (skill, i) => (

                              <span
                                key={i}
                                className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm"
                              >

                                {skill}

                              </span>

                            )
                          )

                        ) : (

                          <p>No missing skills</p>

                        )}

                      </div>

                    </div>

                    {/* AI SUGGESTIONS */}

                    <div>

                      <h4 className="font-bold text-blue-700 mb-2">

                        AI Suggestions 💡

                      </h4>

                      <ul className="list-disc pl-6 space-y-1">

                        {candidate.suggestions?.map(
                          (item, i) => (

                            <li
                              key={i}
                              className="text-gray-700"
                            >

                              {item}

                            </li>

                          )
                        )}

                      </ul>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

    </main>

  );

}