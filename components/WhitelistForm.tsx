"use client";

import { useState } from "react";
import { Anton } from "next/font/google";
import { ArrowRight, Heart, MessageSquare, UserPlus, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
});

function XLogo({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const X_URL = "https://x.com/nobodiesclubnft";

const tasks = [
  { label: "Follow on X",             key: "follow_on_x",       hasInput: false, link: X_URL },
  { label: "Like & RT the announcement", key: "like_announcement", hasInput: false, link: X_URL },
  { label: "Quote the post",           key: "quote_post",         hasInput: true,  link: null  },
  { label: "Comment & Tag 2 friend",   key: "comment_tag",        hasInput: true,  link: null  },
];

const taskIcons = [XLogo, Heart, MessageSquare, UserPlus];

// Per-task click state: "idle" | "verifying" | "done"
type TaskState = "idle" | "verifying" | "done";
type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function WhitelistForm() {
  const [wallet, setWallet]       = useState("");
  const [inputs, setInputs]       = useState<string[]>(tasks.map(() => ""));
  const [taskStates, setTaskStates] = useState<TaskState[]>(tasks.map(() => "idle"));
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errMsg, setErrMsg]       = useState("");

  function handleTaskClick(i: number) {
    const task = tasks[i];
    if (!task.link || taskStates[i] !== "idle") return;

    // Open X in new tab
    window.open(task.link, "_blank", "noopener,noreferrer");

    // Set verifying
    const next = [...taskStates];
    next[i] = "verifying";
    setTaskStates(next);

    // Auto-checklist after 2.5s
    setTimeout(() => {
      setTaskStates((prev) => {
        const updated = [...prev];
        updated[i] = "done";
        return updated;
      });
    }, 2500);
  }

  async function handleSubmit() {
    if (!wallet.trim()) {
      setErrMsg("EVM address is required.");
      return;
    }

    setSubmitStatus("loading");
    setErrMsg("");

    const payload = {
      evm_address:       wallet.trim(),
      follow_on_x:       taskStates[0] === "done",
      like_announcement: taskStates[1] === "done",
      rt_x:              taskStates[1] === "done", // same action as like
      quote_post:        inputs[2].trim() || null,
      comment_tag:       inputs[3].trim() || null,
    };

    const { error } = await supabase
      .from("whitelist_submissions")
      .insert([payload]);

    if (error) {
      setSubmitStatus("error");
      setErrMsg(error.message);
    } else {
      setSubmitStatus("success");
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="w-full md:max-w-[360px] px-5 py-8 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 size={52} className="text-[#FF3DA5]" />
        <p className={`${anton.className} text-3xl text-black leading-tight`}>YOU'RE IN!</p>
        <p className="text-sm text-black/70" style={{ fontFamily: "var(--font-roadgeek)" }}>
          Application submitted. We'll reach out soon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full md:max-w-[360px] px-5 py-3 md:px-5 md:py-3">
      <div className={`${anton.className} leading-none tracking-tight`}>
        <span className="text-6xl text-black">SUBMIT</span>
        <br />
        <span className="text-6xl text-[#FF3DA5]">WHITELIST</span>
      </div>

      <div className="mt-1 mb-2 h-0.5 w-10 bg-black" />

      <p className="text-base leading-tight text-black/80" style={{ fontFamily: "var(--font-roadgeek)" }}>
        Join the founding <span className="text-[#FF3DA5] font-semibold">NOBODIES</span>
        <br />
        Complete a few simple tasks to secure your early access
      </p>

      <div className="mt-2 flex flex-col gap-1.5">
        {tasks.map((task, i) => {
          const Icon = taskIcons[i];
          const state = taskStates[i];
          const isDone      = state === "done";
          const isVerifying = state === "verifying";

          return (
            <div
              key={i}
              onClick={() => handleTaskClick(i)}
              className={`group rounded-xl border bg-black p-4 text-base text-white transition-all duration-300 select-none ${
                task.link
                  ? isDone
                    ? "border-[#FF3DA5] cursor-default"
                    : isVerifying
                    ? "border-white/40 cursor-wait"
                    : "border-white/20 hover:-translate-y-0.5 hover:border-[#FF3DA5] cursor-pointer"
                  : "border-white/20 hover:-translate-y-0.5 hover:border-[#FF3DA5]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    size={18}
                    className={isDone ? "text-[#FF3DA5]" : "text-white"}
                  />
                  <span
                    className={isDone ? "text-white" : isVerifying ? "text-white/60" : "text-white"}
                    style={{ fontFamily: "var(--font-roadgeek)" }}
                  >
                    {task.label}
                  </span>
                </div>

                {/* Right side indicator */}
                {task.link ? (
                  isDone ? (
                    <CheckCircle2 size={20} className="text-[#FF3DA5]" />
                  ) : isVerifying ? (
                    <Loader2 size={20} className="text-[#FF3DA5] animate-spin" />
                  ) : (
                    <ArrowRight size={18} className="text-[#FF3DA5] transition-transform duration-300 group-hover:translate-x-0.5" />
                  )
                ) : (
                  <ArrowRight size={18} className="text-[#FF3DA5] transition-transform duration-300 group-hover:translate-x-0.5" />
                )}
              </div>

              {/* Verifying label */}
              {isVerifying && (
                <p className="mt-1 text-xs text-white/40" style={{ fontFamily: "var(--font-roadgeek)" }}>
                  Verifying...
                </p>
              )}

              {/* Text input for tasks with hasInput */}
              {task.hasInput && (
                <input
                  type="text"
                  value={inputs[i]}
                  placeholder={i === 2 ? "Paste quote tweet link..." : "Paste comment link..."}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const next = [...inputs];
                    next[i] = e.target.value;
                    setInputs(next);
                  }}
                  className="mt-1.5 w-full rounded-lg border border-white/20 bg-black px-3 py-1.5 text-base text-white outline-none ring-0 transition-all duration-200 focus:border-[#FF3DA5] focus:ring-1 focus:ring-[#FF3DA5] placeholder:text-white/30"
                  style={{ fontFamily: "var(--font-roadgeek)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm font-medium uppercase tracking-wider text-[#b8226e]" style={{ fontFamily: "var(--font-roadgeek)" }}>
        Submit your EVM address
      </p>

      <input
        type="text"
        value={wallet}
        placeholder="0x..."
        onChange={(e) => setWallet(e.target.value)}
        className="mt-0.5 w-full rounded-xl border border-white/10 bg-black px-4 py-2 text-base text-white outline-none ring-0 transition-all duration-200 focus:border-[#FF3DA5] focus:ring-1 focus:ring-[#FF3DA5] placeholder:text-white/30"
        style={{ fontFamily: "var(--font-roadgeek)" }}
      />

      {errMsg && (
        <p className="mt-1.5 text-sm text-red-400" style={{ fontFamily: "var(--font-roadgeek)" }}>
          {errMsg}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitStatus === "loading"}
        className={`${anton.className} mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#FF3DA5] text-2xl uppercase tracking-wide text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#e63595] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
      >
        {submitStatus === "loading" ? "Submitting..." : "Submit Application"}
      </button>

      <p className="mt-1.5 flex items-center justify-center gap-1.5 text-center text-sm text-black/60" style={{ fontFamily: "var(--font-roadgeek)" }}>
        <Lock size={14} className="text-black" />
        Secure Verified Whitelist Only
      </p>
    </div>
  );
}
