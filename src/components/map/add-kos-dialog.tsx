"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";
import {
  isSupabaseConfigured,
  saveKos,
  type NewKosInput,
  type SaveResult,
} from "@/lib/kos-repository";

const schema = z.object({
  name: z.string().trim().min(3, "Nama kos minimal 3 karakter"),
  area: z.string().trim().min(2, "Area wajib diisi"),
  city: z.string().trim().min(2, "Kota wajib diisi"),
  // Optional: not every kos is near a campus, and kkost covers all of Indonesia.
  campus: z.string().trim().max(120, "Nama kampus terlalu panjang"),
  price: z
    .number({ message: "Harga harus berupa angka" })
    .int("Harga harus bilangan bulat")
    .min(1, "Harga harus lebih dari 0"),
  distance: z
    .number({ message: "Jarak harus berupa angka" })
    .int("Jarak harus bilangan bulat")
    .min(0, "Jarak tidak boleh negatif")
    .max(50_000, "Jarak maksimal 50.000 m"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  position: [number, number];
  onCancel: () => void;
  onSaved: (input: NewKosInput, result: SaveResult) => void;
};

export function AddKosDialog({ position, onCancel, onSaved }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", area: "", city: "", campus: "", price: 0, distance: 0 },
  });

  // Escape closes the dialog, like any modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

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

          <div className="grid gap-4 sm:grid-cols-2">
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

            <Field
              label="Jarak ke kampus (m)"
              hint="jalan kaki"
              error={errors.distance?.message}
            >
              <input
                {...register("distance", { valueAsNumber: true })}
                type="number"
                inputMode="numeric"
                min={0}
                step={50}
                placeholder="700"
                className={inputClass}
              />
            </Field>
          </div>
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
