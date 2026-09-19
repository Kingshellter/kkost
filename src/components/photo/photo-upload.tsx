"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  checkPhotoFile,
  PHOTO_TYPES,
  uploadKosPhoto,
} from "@/lib/kos-photo-repository";
import { isSupabaseConfigured } from "@/lib/kos-repository";
import { createClient } from "@/utils/supabase/client";

type Status =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/**
 * Upload a photo of a kos. The browser client uploads straight to Storage —
 * the bucket's own limits and the `kos_photos` trigger (0009) are the
 * boundary; the checks here only fail faster.
 */
export function PhotoUpload({ kosId }: { kosId: string }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function pick(picked: File | null) {
    setFile(picked);
    const invalid = picked && checkPhotoFile(picked);
    setStatus(invalid ? { kind: "error", message: invalid } : { kind: "idle" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus({ kind: "uploading" });
    const result = await uploadKosPhoto(
      isSupabaseConfigured ? createClient() : null,
      kosId,
      file,
    );

    if (result.status === "error") {
      setStatus({ kind: "error", message: result.message });
      return;
    }
    if (result.status === "unconfigured") {
      setStatus({
        kind: "error",
        message: "Supabase belum dikonfigurasi, jadi foto tidak bisa disimpan.",
      });
      return;
    }

    setStatus({ kind: "saved" });
    setFile(null);
    if (input.current) input.current.value = "";
    // The banner is server-rendered from kos_photos; pull the new row in.
    router.refresh();
  }

  const invalid = status.kind === "error" && file !== null;

  return (
    <form
      onSubmit={submit}
      className="rounded-[var(--radius-panel)] bg-white p-7 shadow-[var(--shadow-lift)] sm:p-8"
    >
      <h2 className="text-xl font-extrabold text-ink">Punya foto kos ini?</h2>
      <p className="mt-2 text-[15px] font-medium text-muted">
        JPG, PNG, atau WebP, maksimal 2 MB. Foto yang sudah diunggah tidak bisa
        dihapus atau ditimpa lewat situs — pastikan tidak memuat wajah atau data
        pribadi orang lain.
      </p>

      <label className="mt-5 block">
        <span className="sr-only">Pilih foto</span>
        <input
          ref={input}
          type="file"
          accept={Object.keys(PHOTO_TYPES).join(",")}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          className="block w-full text-sm font-medium text-muted file:mr-4 file:rounded-full file:border-0 file:bg-cream file:px-5 file:py-3 file:text-[15px] file:font-extrabold file:text-ink hover:file:bg-cream-deep"
        />
      </label>

      {status.kind === "error" && (
        <p
          role="alert"
          className="mt-4 rounded-2xl bg-rose/10 px-4 py-3 text-sm font-bold break-words text-rose"
        >
          {status.message}
        </p>
      )}
      {status.kind === "saved" && (
        <p
          role="status"
          className="mt-4 rounded-2xl bg-sky/20 px-4 py-3 text-sm font-bold text-ink"
        >
          Foto tersimpan dan kini tampil di atas halaman ini.
        </p>
      )}

      <button
        type="submit"
        disabled={!file || invalid || status.kind === "uploading"}
        className="mt-5 w-full rounded-full bg-ink py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {status.kind === "uploading" ? "Mengunggah…" : "Unggah foto"}
      </button>
    </form>
  );
}
