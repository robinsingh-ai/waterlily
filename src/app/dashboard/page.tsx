"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSurveys, Survey } from "@/lib/firestore";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const userSurveys = await getUserSurveys(currentUser.uid);
        setSurveys(userSurveys);
      } catch (error) {
        console.error("Error fetching surveys:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
            {currentUser && (
              <p className="mt-1 text-sm text-gray-500">
                Welcome, {currentUser.displayName || currentUser.email}
              </p>
            )}
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Your Surveys</h2>
                <Link
                  href="/surveys/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Survey
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                  <p className="mt-2 text-gray-500">Loading your surveys...</p>
                </div>
              ) : surveys.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {surveys.map((survey) => (
                      <li key={survey.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-indigo-600 truncate">{survey.title}</p>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <Link
                                href={`/surveys/${survey.id}`}
                                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {survey.questions?.length || 0} questions
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                Created on {survey.createdAt ? new Date(survey.createdAt.toMillis()).toLocaleDateString() : "Unknown date"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md p-10 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new survey.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/surveys/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      New Survey
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 