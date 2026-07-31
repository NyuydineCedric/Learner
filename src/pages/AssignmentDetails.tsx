import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  ChevronLeft,
  Bot,
  ListChecks,
  MessageCircle,
  Users,
  AlertCircle,
} from "lucide-react";
import { getAssignment, submitAssignment } from "../lib/api";

interface AssignmentSummary {
  id: string;
  title: string;
  max_marks?: number;
  instructions?: string;
  submission?: {
    status?: string;
    content?: string;
  };
}

const AssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<AssignmentSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No assignment selected.");
      return;
    }

    getAssignment(id)
      .then((detail) => setAssignment(detail as AssignmentSummary))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load assignment."),
      );
  }, [id]);

  const handleSubmit = async () => {
    if (!assignment) return;
    setSubmitting(true);
    try {
      await submitAssignment(assignment.id, "Submitted via Smart School AI");
      setAssignment({
        ...assignment,
        submission: {
          status: "Submitted",
          content: "Submitted via Smart School AI",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="assignments" />
      <main className="flex-1 overflow-y-auto p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500"
        >
          <ChevronLeft size={14} /> Back to Assignments
        </button>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-rose-600">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {assignment && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">{assignment.title}</h2>
              <p className="mb-1 text-xs text-slate-400">Max Marks</p>
              <p className="mb-6 text-sm font-medium text-slate-700">{assignment.max_marks}</p>

              <h3 className="mb-2 text-sm font-semibold text-slate-700">Instructions</h3>
              <p className="mb-6 text-sm text-slate-500">{assignment.instructions}</p>

              <h3 className="mb-2 text-sm font-semibold text-slate-700">Your Submission</h3>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${assignment.submission?.status === "Submitted" ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {assignment.submission?.status ?? "Not Submitted"}
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || assignment.submission?.status === "Submitted"}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting…"
                    : assignment.submission?.status === "Submitted"
                      ? "Submitted"
                      : "Start Assignment"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-1 flex items-center gap-2">
                  <Bot size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Ask AI for Help</h3>
                </div>
                <p className="mb-4 text-xs text-slate-400">Need a hint or explanation?</p>
                <button
                  type="button"
                  onClick={() => navigate(`/student/assignments/${assignment.id}/ai-tutor`)}
                  className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Ask AI Tutor
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Quick Actions</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <ListChecks size={15} className="text-slate-400" /> View Rubric
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={15} className="text-slate-400" /> Discussion
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-slate-400" /> Ask Teacher
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssignmentDetails;
