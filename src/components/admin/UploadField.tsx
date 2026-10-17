"use client";

import { useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/site";

/** One uploaded file (image or video). Stores its public URL in a hidden input called `name`. */
export function UploadField({
  name,
  defaultValue = "",
  accept = "image/*",
  folder = "misc",
}: {
  name: string;
  defaultValue?: string | null;
  accept?: string;
  folder?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const isVideo = accept.startsWith("video");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createBrowserSupabase();
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error: upError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });
      if (upError) {
        setError(upError.message);
      } else {
        setUrl(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
      }
    } catch {
      setError("Upload failed. Check your internet and try again.");
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      {url &&
        (isVideo ? (
          <video src={url} controls className="h-32 rounded-xl bg-black" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-32 w-32 rounded-xl border object-contain" />
        ))}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn-outline px-3 py-1.5">
          <Upload className="h-4 w-4" /> {busy ? "Uploading..." : url ? "Replace" : "Upload"}
        </button>
        {url && (
          <button type="button" onClick={() => setUrl("")} className="btn-outline px-3 py-1.5 text-red-600">
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        )}
        <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
