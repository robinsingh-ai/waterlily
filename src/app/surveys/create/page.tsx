"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateSurvey() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([
    { id: 1, text: "", type: "text", options: [] }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        text: "",
        type: "text",
        options: []
      }
    ]);
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(
      questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  const addOption = (questionId: number) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId
          ? { ...q, options: [...q.options, { id: q.options.length + 1, text: "" }] }
          : q
      )
    );
  };

  const updateOption = (questionId: number, optionId: number, value: string) => {
    setQuestions(
      questions.map(q => 
        q.id === questionId
          ? {
              ...q,
              options: q.options.map(o => 
                o.id === optionId ? { ...o, text: value } : o
              )
            }
          : q
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock submit - would be replaced with actual API call
      console.log({
        title,
        description,
        questions
      });
      
      // Simulate successful creation
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error creating survey:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create a New Survey</h1>
            <p className="mt-1 text-gray-500">
              Design your survey by adding questions and customizing options.
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Survey Title & Description */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Survey Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter survey title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Provide a description for your survey"
                />
              </div>
              
              {/* Questions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Questions</h2>
                </div>
                
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Question {index + 1}
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter your question"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="radio">Multiple Choice (Single Selection)</option>
                        <option value="checkbox">Multiple Choice (Multiple Selection)</option>
                      </select>
                    </div>
                    
                    {(question.type === 'radio' || question.type === 'checkbox') && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options
                        </label>
                        {question.options.map((option) => (
                          <div key={option.id} className="flex items-center mb-2">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              placeholder={`Option ${option.id}`}
                              required
                            />
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(question.id)}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Question
                </button>
              </div>
              
              <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Survey"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 