"use client";

import { useState, useRef, useCallback } from "react";
import type { ImageProvider } from "@/lib/types";

interface BatchResult {
  ok: boolean;
  regenerated: number;
  keys?: string[];
  errors?: string[];
  done?: boolean;
  nextOffset?: number;
  total?: number;
  processed?: number;
}

export default function RegeneratePage() {
  const [projectId, setProjectId] = useState("cmmm1kmb300003aqqsz9qlu2f"); // BDESK default
  const [provider, setProvider] = useState<ImageProvider>("imagen");
  const [batchSize, setBatchSize] = useState(5);
  const [skipExisting, setSkipExisting] = useState(false);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const abortRef = useRef(false);

  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  async function runBatch() {
    setRunning(true);
    abortRef.current = false;
    setLog([]);
    setProgress({ done: 0, total: 0 });
    addLog(`Starting batch regeneration — provider: ${provider}, batchSize: ${batchSize}`);

    let offset = 0;
    let totalRegenerated = 0;
    let totalErrors = 0;

    while (!abortRef.current) {
      addLog(`Processing batch at offset ${offset}...`);

      try {
        const res = await fetch("/api/assets/regenerate-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, provider, batchSize, skipExisting, offset }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string };
          addLog(`ERROR: ${err.error ?? res.statusText}`);
          break;
        }

        const data = await res.json() as BatchResult;
        totalRegenerated += data.regenerated;
        totalErrors += (data.errors?.length ?? 0);

        if (data.keys?.length) {
          addLog(`Regenerated: ${data.keys.join(", ")}`);
        }
        if (data.errors?.length) {
          for (const e of data.errors) addLog(`ERROR: ${e}`);
        }

        setProgress({ done: data.processed ?? totalRegenerated, total: data.total ?? 0 });

        if (data.done) {
          addLog(`DONE! Total: ${totalRegenerated} regenerated, ${totalErrors} errors.`);
          break;
        }

        offset = data.nextOffset ?? offset + batchSize;

        // Small delay between batches to respect rate limits
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        addLog(`NETWORK ERROR: ${err instanceof Error ? err.message : "unknown"}`);
        break;
      }
    }

    if (abortRef.current) {
      addLog("Aborted by user.");
    }

    setRunning(false);
  }

  function abort() {
    abortRef.current = true;
    addLog("Aborting after current batch completes...");
  }

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Batch Image Regeneration</h1>
      <p className="text-sm text-gray-500">
        Regenera todas as imagens do projeto usando os prompts otimizados do brandbook.
        A logo principal nunca e sobrescrita.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
          <input
            type="text"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            disabled={running}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <select
            value={provider}
            onChange={e => setProvider(e.target.value as ImageProvider)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            disabled={running}
          >
            <option value="imagen">Google Imagen</option>
            <option value="dalle3">DALL-E 3</option>
            <option value="ideogram">Ideogram</option>
            <option value="stability">Stability AI</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size</label>
          <input
            type="number"
            value={batchSize}
            onChange={e => setBatchSize(Number(e.target.value))}
            min={1}
            max={15}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            disabled={running}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={skipExisting}
              onChange={e => setSkipExisting(e.target.checked)}
              disabled={running}
            />
            Skip keys that already have images
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        {!running ? (
          <button
            onClick={runBatch}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Start Regeneration
          </button>
        ) : (
          <button
            onClick={abort}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Abort
          </button>
        )}
      </div>

      {progress.total > 0 && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{progress.done} / {progress.total}</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
          {log.map((line, i) => (
            <div key={i} className={line.includes("ERROR") ? "text-red-400" : line.includes("DONE") ? "text-yellow-300 font-bold" : ""}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
