"use client";

import { useState } from "react";
import { Cpu } from "lucide-react";
import { Card } from "@/components/ui";
import { testAIConnectionAction, type ConnectionTestResult } from "@/app/settings/actions";

export function AISection({
  status,
}: {
  status: { provider: string | null; model: string | null; configured: boolean };
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    const res = await testAIConnectionAction();
    setResult(res);
    setLoading(false);
  }

  return (
    <Card>
      <div className="mb-5">
        <h3 className="text-base font-semibold text-stone-950">AI Provider</h3>
        <p className="mt-1 text-sm text-stone-600">
          Configuration for the chat AI provider.
        </p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/60 p-3">
          <Cpu size={18} strokeWidth={2} className="text-stone-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Provider</p>
            <p className="mt-0.5 text-sm font-medium text-stone-800">
              {status.provider ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/60 p-3">
          <Cpu size={18} strokeWidth={2} className="text-stone-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Model</p>
            <p className="mt-0.5 text-sm font-medium text-stone-800">
              {status.model ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-stone-100 bg-stone-50/60 p-3">
          <div
            className={`size-3 rounded-full ${status.configured ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Status</p>
            <p className="mt-0.5 text-sm font-medium text-stone-800">
              {status.configured ? "Configured" : "Not configured"}
            </p>
          </div>
        </div>
      </div>

      <button
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-stone-900 px-4 text-sm font-semibold text-white hover:bg-stone-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-stone-300"
        disabled={!status.configured || loading}
        onClick={handleTest}
        type="button"
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>

      {result ? (
        <div className="mt-4 grid gap-3 rounded-lg border border-stone-200/80 bg-stone-50 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Provider</p>
              <p className="mt-0.5 font-medium text-stone-800">{result.provider}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Model</p>
              <p className="mt-0.5 font-medium text-stone-800">{result.model}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Status</p>
              <p className={`mt-0.5 font-medium ${result.success ? "text-emerald-600" : "text-red-600"}`}>
                {result.success ? "Success" : "Failed"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Response time</p>
              <p className="mt-0.5 font-medium text-stone-800">{result.responseTimeMs}ms</p>
            </div>
          </div>
          {result.error ? (
            <p className="text-sm text-red-600">{result.error}</p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}