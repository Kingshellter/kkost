import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: kos, error } = await supabase
    .from("kos")
    .select("id, name, created_at")
    .order("created_at", { ascending: false });

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Daftar Kos</h1>
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      <ul>
        {kos?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}