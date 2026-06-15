"use client";

import { useState } from "react";
import { Anton } from "next/font/google";
import { ArrowRight, Heart, MessageSquare, UserPlus, Lock, CheckCircle2, Circle } from "lucide-react";
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

// Tasks: hasInput = has text field, hasInput = false = checkbox only
const X_URL = "https://x.com/nobodiesclubnft";

const tasks = [
  { label: "Follow on X",           key: "follow_on_x",       hasInput: false, link: X_URL },
  { label: "Like the announcement",  key: "like_announcement",  hasInput: false, link: X_URL },
  { label: "RT x",                   key: "rt_x",               hasInput: false, link: X_URL },
  { label: "Quote the post",         key: "quote_post",          hasInput: true,  link: null  },
  { label: "Comment & Tag 2 friend", key: "comment_tag",         hasInput: true,  link: null  },
];

const taskIcons = [XLogo, Heart, XLogo, MessageSquare, UserPlus];

type Status = "idle" | "loading" | "success" | "error";

export default function WhitelistForm() {
  const [wallet, setWallet]     = useState("");
  const [inputs, setInputs]     = useState<string[]>(tasks.map(() => ""));
  const [checks, setChecks]     = useState<boolean[]>(tasks.map(() => false));
  const [status, setStatus]     = useState<Status>("idle");
  const [errMsg, setErrMsg]     = useState("");

  function toggleCheck(i: number) {
    const next = [...checks];
    next[i] = !next[i];
    setChecks(next);
  }

  async function handleSubmit() {
    if (!wallet.trim()) {
      setErrMsg("EVM address wajib diisi.");
      return;
    }

    setStatus("loading");
    setErrMsg("");

    const payload = {
      evm_address:       wallet.trim(),
      follow_on_x:       checks[0],
      like_announcement: checks[1],
      rt_x:              checks[2],
      quote_post:        inputs[3].trim() || null,
      comment_tag:       inputs[4].trim() || null,
    };

    const { error } = await supabase
      .from("whitelist_submissions")
      .insert([payload]);

    if (error) {
      setStatus("error");
      setErrMsg(error.message);
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
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
          return (
            <div
              key={i}
              className={`group rounded-xl border bg-black p-4 text-base text-white transition-all duration-300 hover:-translate-y-0.5 ${
                !task.hasInput && checks[i]
                  ? "border-[#FF3DA5]"
                  : "border-white/20 hover:border-[#FF3DA5]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={18} className="text-white" />
                  {task.link ? (
                    <a
                      href={task.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#FF3DA5] transition-colors duration-200 underline-offset-2 hover:underline"
                      style={{ fontFamily: "var(--font-roadgeek)" }}
                    >
                      {task.label}
                    </a>
                  ) : (
                    <span style={{ fontFamily: "var(--font-roadgeek)" }}>{task.label}</span>
                  )}
                </div>

                {task.hasInput ? (
                  <ArrowRight size={18} className="text-[#FF3DA5] transition-transform duration-300 group-hover:translate-x-0.5" />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleCheck(i)}
                    className="flex items-center justify-center transition-transform duration-200 active:scale-90"
                  >
                    {checks[i] ? (
                      <CheckCircle2 size={20} className="text-[#FF3DA5]" />
                    ) : (
                      <Circle size={20} className="text-white/40" />
                    )}
                  </button>
                )}
              </div>

              {task.hasInput && (
                <input
                  type="text"
                  value={inputs[i]}
                  placeholder={i === 3 ? "Paste quote tweet link..." : "Paste comment link..."}
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
        disabled={status === "loading"}
        className={`${anton.className} mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#FF3DA5] text-2xl uppercase tracking-wide text-black shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#e63595] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100`}
      >
        {status === "loading" ? "Submitting..." : "Submit Application"}
      </button>

      <p className="mt-1.5 flex items-center justify-center gap-1.5 text-center text-sm text-black/60" style={{ fontFamily: "var(--font-roadgeek)" }}>
        <Lock size={14} className="text-black" />
        Secure Verified Whitelist Only
      </p>
    </div>
  );
}
