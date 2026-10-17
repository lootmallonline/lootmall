"use client";

import { useRef, useState } from "react";
import { Star, Trash2, Upload } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { MEDIA_BUCKET } from "@/lib/site";

/** Several product images. The first one is the main image. Sent as JSON in a hidden input. */
export function MediaUploader({ name, initial }: { name: string; initial: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    const supabase = createBrowserSupabase();
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error: upError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
          contentType: file.type || undefined,
          upsert: false,
        });
        if (upError) {
          setError(upError.message);
          continue;
        }
        added.push(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
      } catch {
        setError("Upload failed. Check your internet and try again.");
      }
    }
    setUrls((prev) => [...prev, ...added]);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  function makeMain(i: number) {
    setUrls((prev) => [prev[i], ...prev.filter((_, idx) => idx !== i)]);
  }

  function removeAt(i: number) {
    setUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {urls.map((u, i) => (
          <div key={u} className="relative aspect-square overflow-hidden rounded-xl border bg-maroon-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-maroon-600 px-1.5 text-[10px] font-bold text-white">MAIN</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1">
              <button type="button" aria-label="Make main image" onClick={() => makeMain(i)} className="text-white">
                <Star className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Remove image" onClick={() => removeAt(i)} className="text-white">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn-outline px-3 py-1.5">
        <Upload className="h-4 w-4" /> {busy ? "Uploading..." : "Add images"}
      </button>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
