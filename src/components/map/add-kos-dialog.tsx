"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  buttonClass,
  INPUT_CLASS,
  NOTICE_CLASS,
} from "@/components/ui/controls";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { formatRupiah } from "@/lib/format";
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    // No price: an empty field reads better than a "0" to delete first.
    defaultValues: { name: "", area: "", city: "", campus: "" },
  });
  const price = useWatch({ control, name: "price" });

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
      className="fixed inset-0 z-(--z-dialog) flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-kos-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* noValidate: every message comes from the zod schema, in
          Indonesian, instead of the browser's own bubbles. */}
      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="relative my-auto w-full max-w-[440px] rounded-panel bg-white p-6 shadow-float sm:p-8"
      >
        {/* On a phone the form is taller than the screen and "Batal" sits
            below the fold; this is the way out from the top. */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted transition-colors duration-(--duration-fast) hover:bg-cream hover:text-ink sm:right-4 sm:top-4"
        >
          <X aria-hidden className="size-5" strokeWidth={2.5} />
        </button>

        <h2
          id="add-kos-title"
          className="pr-10 text-2xl font-extrabold leading-tight text-ink"
        >
          Tambah kos di titik ini
        </h2>
        {/* Not the coordinates: they mean nothing to a person, and the area
            and city below are filled from them anyway. */}
        <p className="mt-2 text-base font-medium text-muted">
          Kos langsung muncul di peta setelah disimpan.
        </p>

        <div className="mt-6 space-y-4">
          <Field label="Nama kos" error={errors.name?.message}>
            <input
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
              autoFocus
              placeholder="Kos Puri Melati"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area" error={errors.area?.message}>
              <input
                {...register("area")}
                aria-invalid={Boolean(errors.area)}
                placeholder="Tembalang"
                className={inputClass}
              />
            </Field>

            <Field label="Kota" error={errors.city?.message}>
              <input
                {...register("city")}
                aria-invalid={Boolean(errors.city)}
                placeholder="Semarang"
                className={inputClass}
              />
            </Field>
          </div>
          <p className="-mt-2 text-sm font-medium text-muted" aria-live="polite">
            {locating === "loading"
              ? "Mendeteksi area dan kota dari titik di peta…"
              : "Area dan kota diisi dari titik di peta. Ubah bila kurang tepat."}
          </p>

          <Field
            label="Kampus terdekat"
            hint="opsional"
            error={errors.campus?.message}
          >
            <input
              {...register("campus")}
              aria-invalid={Boolean(errors.campus)}
              placeholder="Universitas Diponegoro"
              className={inputClass}
            />
          </Field>

          {/* Text, not type="number": its `step` made the browser reject
              any price that was not a multiple of it, and it cannot take
              "950.000". Digits are pulled out here; zod checks the rest. */}
          <Field label="Harga per bulan" error={errors.price?.message}>
            <input
              {...register("price", {
                setValueAs: (v) => Number(String(v).replace(/\D/g, "")),
              })}
              aria-invalid={Boolean(errors.price)}
              aria-describedby="add-kos-price-preview"
              inputMode="numeric"
              autoComplete="off"
              placeholder="950.000"
              className={inputClass}
            />
            <span
              id="add-kos-price-preview"
              className="mt-1.5 block text-sm font-medium text-muted"
            >
              {price > 0
                ? `${formatRupiah(price)} / bulan`
                : "Tulis angkanya saja, tanpa Rp."}
            </span>
          </Field>
        </div>

        {serverError && (
          <p className={`mt-4 break-words ${NOTICE_CLASS.error}`}>
            {serverError}
          </p>
        )}

        {!isSupabaseConfigured && (
          <p className={`mt-4 ${NOTICE_CLASS.warning}`}>
            Supabase belum dikonfigurasi, jadi kos ini hanya muncul di peta
            selama sesi ini dan <strong>belum tersimpan ke database</strong>.
          </p>
        )}

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={buttonClass("soft", "md", "flex-1")}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={buttonClass("primary", "md", "flex-1")}
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Menyimpan…" : "Simpan kos"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass = INPUT_CLASS;
