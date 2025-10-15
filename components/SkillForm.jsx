import { useState } from "react";
import {
  MagicWandIcon,
  ResetIcon,
  RocketIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

export default function SkillForm({ onRecommend, loading }) {
  const [skills, setSkills] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("intermediate");
  const [focusedField, setFocusedField] = useState(null);

  function submit(e) {
    e.preventDefault();
    const payload = {
      skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      goal,
      experience_level: level,
    };
    onRecommend(payload);
  }

  const skillExamples = [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "AWS",
    "Docker",
  ];
  const goalExamples = [
    "Full-stack Developer",
    "ML Engineer",
    "DevOps Specialist",
    "Tech Lead",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <MagicWandIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            AI Learning Path Generator
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Tell me about your skills and goals, and I'll create a personalized
          learning journey
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <form onSubmit={submit} className="space-y-6">
          {/* Skills Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <RocketIcon className="w-4 h-4" />
              Your Current Skills
            </label>
            <div className="relative">
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                onFocus={() => setFocusedField("skills")}
                onBlur={() => setFocusedField(null)}
                placeholder="React, TypeScript, Node.js, Python..."
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  focusedField === "skills"
                    ? "border-blue-500 ring-4 ring-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                } focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100`}
              />
            </div>
            <p className="text-xs text-gray-500">
              Separate multiple skills with commas
            </p>
          </div>

          {/* Goal Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <PersonIcon className="w-4 h-4" />
              Your Career Goal
            </label>
            <div className="relative">
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onFocus={() => setFocusedField("goal")}
                onBlur={() => setFocusedField(null)}
                placeholder="What role do you want to achieve?"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  focusedField === "goal"
                    ? "border-blue-500 ring-4 ring-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                } focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100`}
              />
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <RocketIcon className="w-4 h-4" />
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: "beginner",
                  label: "🚀 Beginner",
                  desc: "Just starting out",
                },
                {
                  value: "intermediate",
                  label: "⚡ Intermediate",
                  desc: "Some experience",
                },
                {
                  value: "advanced",
                  label: "🎯 Advanced",
                  desc: "Looking to master",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLevel(option.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    level === option.value
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-gray-900">
                    {option.label.split(" ")[0]}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => {
                setSkills("");
                setGoal("");
                setLevel("intermediate");
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ResetIcon className="w-4 h-4" />
              Reset
            </button>

            <button
              type="submit"
              disabled={loading || !skills.trim() || !goal.trim()}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                loading || !skills.trim() || !goal.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Your Path...
                </>
              ) : (
                <>
                  <MagicWandIcon className="w-5 h-5" />
                  Generate Learning Path
                </>
              )}
            </button>
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 rounded-xl p-4 mt-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <MagicWandIcon className="w-4 h-4" />
              Pro Tip
            </h3>
            <p className="text-blue-800 text-sm">
              Be specific about your goal for more tailored recommendations.
              Instead of "web developer", try "React frontend developer with
              TypeScript" or "Full-stack developer with Node.js and React".
            </p>
          </div>
        </form>
      </div>

      {/* Loading State Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Creating Your Learning Path
                </h3>
                <p className="text-gray-600 text-sm">
                  Our AI is analyzing your skills and goals...
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
