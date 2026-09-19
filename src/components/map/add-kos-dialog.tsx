"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { reverseGeocode } from "@/lib/geocode";
import { createClient } from "@/utils/supabase/client";
import {
  isSupabaseConfigured,
  saveKos,
  type NewKosInput,
  type SaveResult,
} from "@/lib/kos-repository";

// Limits mirror the CHECK constraints in 0008_kos_constraints.sql — the
// database is the real boundary; this only gives the error before a round trip.
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nama kos minimal 3 karakter")
    .max(120, "Nama kos maksimal 120 karakter"),
  area: z
    .string()
    .trim()
    .min(2, "Area wajib diisi")
    .max(120, "Area maksimal 120 karakter"),
  city: z
    .string()
    .trim()
    .min(2, "Kota wajib diisi")
    .max(80, "Kota maksimal 80 karakter"),
  // Optional: not every kos is near a campus, and kkost covers all of Indonesia.
  // Empty becomes null on submit; one character would fail the database check.
  campus: z
    .string()
    .trim()
    .max(120, "Nama kampus terlalu panjang")
    .refine((v) => v.length !== 1, "Nama kampus minimal 2 karakter"),
  price: z
    .number({ message: "Harga harus berupa angka" })
    .int("Harga harus bilangan bulat")
    .min(1, "Harga harus lebih dari 0")
    .max(100_000_000, "Harga maksimal Rp100.000.000"),
});

/** Same box as the kos_in_indonesia constraint. */
function inIndonesia([lat, lng]: [number, number]) {
  return lat >= -11.5 && lat <= 6.5 && lng >= 94 && lng <= 141.5;
}

type FormValues = z.infer<typeof schema>;

type Props = {
  position: [number, number];
  onCancel: () => void;
  onSaved: (input: NewKosInput, result: SaveResult) => void;
  /**
   * Where focus goes when the dialog closes. The "+ Tambah kos" button that
   * opened it lives in a map popup that is gone by then, so it is the map.
   */
  returnFocusRef: RefObject<HTMLElement | null>;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AddKosDialog({
  position,
  onCancel,
  onSaved,
  returnFocusRef,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", area: "", city: "", campus: "", price: 0 },
  });

  /** "loading" while the clicked point is being looked up; "done" after. */
  const [locating, setLocating] = useState<"loading" | "done">("loading");

  // Pre-fill area and city from the point that was clicked. Only into fields
  // still empty — someone who started typing keeps what they typed — and
  // always editable, because a geocoder's idea of an "area" is not always the
  // name people use for it.
  useEffect(() => {
    const controller = new AbortController();
    reverseGeocode(position, { signal: controller.signal }).then((found) => {
      if (controller.signal.aborted) return;
      for (const key of ["area", "city"] as const) {
        const value = found?.[key]?.slice(0, key === "city" ? 80 : 120);
        if (value && !getValues(key).trim()) {
          setValue(key, value, { shouldValidate: true });
        }
      }
      setLocating("done");
    });
    return () => controller.abort();
  }, [position, getValues, setValue]);

  // Escape closes the dialog, like any modal; Tab cycles inside it, so a
  // keyboard user cannot wander onto the page that aria-modal says is inert.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab" || !formRef.current) return;

      const items = [
        ...formRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = formRef.current.contains(document.activeElement);

      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  // Hand focus back to the map on close, whether cancelled or saved.
  useEffect(() => {
    const box = returnFocusRef;
    return () => {
      const target =
        box.current?.querySelector<HTMLElement>(".leaflet-container") ??
        box.current;
      target?.focus({ preventScroll: true });
    };
  }, [returnFocusRef]);

  // Freeze the page behind the dialog. Overflow on the root element always
  // applies to the viewport; the padding compensates for the vanishing
  // scrollbar so the layout underneath does not jump sideways.
  useEffect(() => {
    const root = document.documentElement;
    const { body } = document;
    const scrollbar = window.innerWidth - root.clientWidth;
    const prevOverflow = root.style.overflow;
    const prevPadding = body.style.paddingRight;

    root.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      root.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, []);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    if (!inIndonesia(position)) {
      setServerError(
        "Titik ini di luar Indonesia. kkost hanya mencakup kos di Indonesia.",
      );
      return;
    }
    const input: NewKosInput = {
      ...values,
      campus: values.campus || null,
      lat: position[0],
      lng: position[1],
    };
    const result = await saveKos(
      isSupabaseConfigured ? createClient() : null,
      input,
    );
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    onSaved(input, result);
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-kos-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="my-auto w-full max-w-[440px] rounded-[var(--radius-panel)] bg-white p-8 shadow-[var(--shadow-float)]"
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
          Tambah kos
        </p>
        <h2
          id="add-kos-title"
          className="mt-3 text-[26px] font-extrabold leading-tight text-ink"
        >
          Kos baru di titik ini
        </h2>
        <p className="mt-2 text-sm font-medium text-muted">
          {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </p>

        <div className="mt-6 space-y-4">
          <Field label="Nama kos" error={errors.name?.message}>
            <input
              {...register("name")}
              autoFocus
              placeholder="Kos Puri Melati"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area" error={errors.area?.message}>
              <input
                {...register("area")}
                placeholder="Tembalang"
                className={inputClass}
              />
            </Field>

            <Field label="Kota" error={errors.city?.message}>
              <input
                {...register("city")}
                placeholder="Semarang"
                className={inputClass}
              />
            </Field>
          </div>
          <p className="-mt-2 text-xs font-medium text-muted" aria-live="polite">
            {locating === "loading"
              ? "Mendeteksi area dan kota dari titik di peta…"
              : "Area dan kota diisi dari titik di peta — ubah bila kurang tepat."}
          </p>

          <Field
            label="Kampus terdekat"
            hint="opsional"
            error={errors.campus?.message}
          >
            <input
              {...register("campus")}
              placeholder="Universitas Diponegoro"
              className={inputClass}
            />
          </Field>

          <Field label="Harga per bulan (Rp)" error={errors.price?.message}>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min={0}
              step={50000}
              placeholder="950000"
              className={inputClass}
            />
          </Field>
        </div>

        {serverError && (
          <p className="mt-4 rounded-2xl bg-rose/10 px-4 py-3 text-sm font-bold break-words text-rose">
            {serverError}
          </p>
        )}

        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-2xl bg-amber/15 px-4 py-3 text-sm font-medium text-ink">
            Supabase belum dikonfigurasi, jadi kos ini hanya muncul di peta
            selama sesi ini dan <strong>belum tersimpan ke database</strong>.
          </p>
        )}

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full bg-cream py-3.5 text-[15px] font-extrabold text-ink transition-colors hover:bg-cream-deep"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-rose py-3.5 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Menyimpan…" : "Simpan kos"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "mt-2 w-full rounded-full border border-cream-deep bg-cream px-5 py-3.5 text-[15px] font-bold text-ink outline-none transition-colors placeholder:text-muted focus:border-rose";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[15px] font-extrabold text-ink">
        {label}
        {hint && <span className="font-medium text-muted"> ({hint})</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-sm font-bold text-rose">{error}</span>}
    </label>
  );
}
