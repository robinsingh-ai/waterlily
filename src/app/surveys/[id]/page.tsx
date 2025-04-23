"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSurvey, getSurveyResponses, Survey, Response } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/app/loading";

export default function SurveyDetail() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchSurveyData = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const surveyId = Array.isArray(params.id) ? params.id[0] : params.id;
        
        // Fetch survey data
        const surveyData = await getSurvey(surveyId);
        setSurvey(surveyData);
        
        if (surveyData) {
          // Fetch responses for this survey
          const responseData = await getSurveyResponses(surveyId);
          setResponses(responseData);
        }
      } catch (error) {
        console.error("Error fetching survey:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [params.id]);

  // Handle unauthorized access or redirect if user is not logged in
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/signin');
    } else if (!loading && survey && currentUser && survey.createdBy !== currentUser.uid) {
      // Only allow survey creator to view details
      router.push('/dashboard');
    }
  }, [loading, currentUser, survey, router]);

  if (loading) {
    return <Loading />;
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Survey not found</h2>
          <p className="mt-2 text-gray-600">The survey you're looking for doesn't exist or has been removed.</p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format the creation date
  const formattedDate = survey.createdAt 
    ? new Date(survey.createdAt.toMillis()).toLocaleDateString() 
    : "Unknown date";

  // Determine survey status - active by default
  const surveyStatus = "Active";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-tight text-gray-900">
                {survey.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Created on {formattedDate} · {responses.length} responses
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Dashboard
              </Link>
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => {
                  const url = `${window.location.origin}/surveys/respond/${survey.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Survey link copied to clipboard!');
                }}
              >
                Share Survey
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "questions"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("questions")}
              >
                Questions
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "responses"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("responses")}
              >
                Responses
              </button>
              <button
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Survey Details</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Overview of your survey and basic analytics.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Title</dt>
                      <dd className="mt-1 text-sm text-gray-900">{survey.title}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {surveyStatus}
                        </span>
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formattedDate}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Responses</dt>
                      <dd className="mt-1 text-sm text-gray-900">{responses.length}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{survey.description}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Survey Link</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="flex">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/surveys/respond/${survey.id}`}
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => {
                              const url = `${window.location.origin}/surveys/respond/${survey.id}`;
                              navigator.clipboard.writeText(url);
                              alert('Survey link copied to clipboard!');
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === "questions" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Survey Questions</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {survey.questions.length} questions in this survey
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {survey.questions.map((question, index) => (
                      <li key={question.id} className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Question {index + 1}</h3>
                          <p className="text-sm text-gray-500">{question.text}</p>
                        </div>
                        <p className="mt-2 text-sm text-gray-900">{question.question}</p>
                        
                        {question.text === 'multipleChoice' && question.options && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">Options:</p>
                            <ul className="pl-5 list-disc text-sm text-gray-600">
                              {question.options.map((option, idx) => (
                                <li key={idx}>{option}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "responses" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Survey Responses</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {responses.length} responses collected
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  {responses.length > 0 ? (
                    <div>
                      <ul className="divide-y divide-gray-200">
                        {responses.map((response) => (
                          <li key={response.id} className="py-4">
                            <div className="flex space-x-3">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium">{response.respondedEmail || 'Anonymous'}</h3>
                                  <p className="text-sm text-gray-500">
                                    {response.createdAt 
                                      ? new Date(response.createdAt.toMillis()).toLocaleString() 
                                      : 'Unknown date'}
                                  </p>
                                </div>
                                <div className="mt-3">
                                  <h4 className="text-xs font-medium text-gray-500">Answers:</h4>
                                  <ul className="mt-1 pl-5 list-disc text-sm text-gray-600">
                                    {response.answers.map((answer, idx) => {
                                      // Find the corresponding question
                                      const question = survey.questions.find(q => q.id === answer.questionId);
                                      return (
                                        <li key={idx}>
                                          <span className="font-medium">{question?.question || `Question ${idx+1}`}: </span>
                                          {Array.isArray(answer.answer) 
                                            ? answer.answer.join(', ')
                                            : answer.answer}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-10">
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
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No responses yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Share your survey with participants to start collecting responses.
                      </p>
                      <div className="mt-6">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            const url = `${window.location.origin}/surveys/respond/${survey.id}`;
                            navigator.clipboard.writeText(url);
                            alert('Survey link copied to clipboard!');
                          }}
                        >
                          Copy Survey Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Survey Settings</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage your survey settings and options.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Delete Survey</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Once you delete a survey, all of its data will be permanently removed.
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
                              // TODO: Add delete functionality
                              router.push('/dashboard');
                            }
                          }}
                        >
                          Delete Survey
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 