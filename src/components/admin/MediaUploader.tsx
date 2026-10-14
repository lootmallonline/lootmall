"use client";

import { useRef, useState } from "react";
import { Star, Trash2, Upload } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";

const BUCKET = "product-media";

export function MediaUploader({
  name,
  label,
  kind,
  multiple = false,
  initial = [],
  folder,
  help,
}: {
  name: string;
  label: string;
  kind: "image" | "video";
  multiple?: boolean;
  initial?: string[];
  folder: string;
  help?: string;
}) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const maxMb = kind === "image" ? 10 : 50;

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    const supabase = createBrowserSupabase();
    const added: string[] = [];

    for (const file of Array.from(files)) {
      const okType = kind === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/");
      if (!okType) {
        setError(`"${file.name}" is not a ${kind} file.`);
        continue;
      }
      if (file.size > maxMb * 1024 * 1024) {
        setError(`"${file.name}" is larger than ${maxMb} MB.`);
        continue;
      }
      const ext =
        file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || (kind === "image" ? "jpg" : "mp4");
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (upErr) {
        setError(`Upload failed: ${upErr.message}`);
        continue;
      }
      added.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }

    setUrls((prev) => (multiple ? [...prev, ...added].slice(0, 10) : added.length ? [added[0]] : prev));
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const value = multiple ? JSON.stringify(urls) : urls[0] ?? "";

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={value} />
      {urls.length > 0 && (
        <ul className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((u, i) => (
            <li key={u} className="relative overflow-hidden rounded-xl border border-maroon-100 bg-maroon-50">
              {kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <video src={u} controls className="aspect-video w-full bg-black" />
              )}
              <div className="flex items-center justify-between gap-1 p-1">
                {multiple && i > 0 ? (
                  <button
                    type="button"
                    onClick={() => setUrls((prev) => [prev[i], ...prev.filter((_, j) => j !== i)])}
                    className="rounded p-1 text-xs hover:bg-white"
                    title="Make main image"
                    aria-label="Make main image"
                  >
                    <Star size={14} />
                  </button>
                ) : (
                  <span className="px-1 text-[11px] font-semibold text-maroon-700">{multiple ? "Main" : ""}</span>
                )}
                <button
                  type="button"
                  onClick={() => setUrls((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded p-1 text-red-700 hover:bg-white"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/*" : "video/mp4,video/webm"}
        multiple={multiple}
        disabled={busy}
        onChange={(e) => onFiles(e.target.files)}
        className="sr-only"
        id={`${name}-file`}
      />
      <label htmlFor={`${name}-file`} className={`btn-outline cursor-pointer ${busy ? "opacity-50" : ""}`}>
        <Upload size={16} aria-hidden /> {busy ? "Uploading…" : urls.length ? "Add more" : "Choose file"}
      </label>
      <p className="mt-1 text-xs text-ink/60">{help ?? `Up to ${maxMb} MB per file.`}</p>
      {error && <p className="mt-1 text-sm text-red-700" role="alert">{error}</p>}
    </div>
  );
}
