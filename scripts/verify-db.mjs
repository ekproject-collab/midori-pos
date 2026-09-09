// Phase 1 acceptance check — run AFTER applying migrations + seed.
//   node --env-file=.env.local scripts/verify-db.mjs
// Uses the anon key only, so it also proves RLS is doing its job.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY in .env.local");
  process.exit(1);
}
const supabase = createClient(url, key);

let pass = 0;
let fail = 0;
const check = (name, condition, detail = "") => {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
};

console.log("\nMidori POS — DB verification (anon context)\n");

// 1. Catalog reads
const cats = await supabase.from("kategori").select("*");
check(
  "read kategori",
  !cats.error && cats.data.length > 0,
  cats.error?.message,
);

const prods = await supabase.from("produk").select("*, kategori(*)");
check(
  "read produk (with kategori join)",
  !prods.error && prods.data.length > 0,
  prods.error?.message,
);

// 2. RLS blocks anon writes to produk.
// Note: for INSERT/UPDATE/DELETE, an RLS denial does NOT raise an error — it
// silently affects zero rows — so we assert by re-reading the target row.
const target = (prods.data ?? [])[0];
const wInsert = await supabase
  .from("produk")
  .insert({ id_kategori: target?.id_kategori ?? 1, nama_produk: "HACK", harga: 1 })
  .select();
check(
  "anon CANNOT insert produk",
  wInsert.error !== null || (wInsert.data?.length ?? 0) === 0,
  "insert unexpectedly succeeded",
);

await supabase.from("produk").delete().eq("id_produk", target?.id_produk);
const stillThere = await supabase
  .from("produk")
  .select("id_produk")
  .eq("id_produk", target?.id_produk)
  .maybeSingle();
check(
  "anon CANNOT delete produk",
  stillThere.data?.id_produk === target?.id_produk,
  "row disappeared after anon delete",
);

// 3. anon cannot read orders directly
const peek = await supabase.from("pesanan").select("*").limit(1);
check(
  "anon CANNOT read pesanan",
  peek.error !== null || (peek.data?.length ?? 0) === 0,
  "pesanan readable by anon",
);

// 4. create_order RPC (happy path) — uses the first two seeded products
const firstTwo = (prods.data ?? []).slice(0, 2);
if (firstTwo.length === 2) {
  const rpc = await supabase.rpc("create_order", {
    p_nama_pelanggan: "Test Verifier",
    p_tipe_pesanan: "takeaway",
    p_nomor_meja: null,
    p_metode_pembayaran: "qris",
    p_items: firstTwo.map((p) => ({ id_produk: p.id_produk, kuantitas: 1 })),
  });
  const expectedTotal = firstTwo.reduce((s, p) => s + p.harga, 0);
  check(
    "create_order RPC succeeds",
    !rpc.error && rpc.data?.id_pesanan > 0,
    rpc.error?.message,
  );
  check(
    "create_order totals from live prices",
    rpc.data?.total_harga === expectedTotal,
    `got ${rpc.data?.total_harga}, expected ${expectedTotal}`,
  );
  check(
    "new order defaults to unpaid",
    rpc.data?.status_pembayaran === "unpaid",
    `got ${rpc.data?.status_pembayaran}`,
  );
} else {
  check("create_order RPC succeeds", false, "need >=2 seeded products");
}

// 5. create_order rejects an empty cart
const empty = await supabase.rpc("create_order", {
  p_nama_pelanggan: "X",
  p_tipe_pesanan: "takeaway",
  p_nomor_meja: null,
  p_metode_pembayaran: "cash",
  p_items: [],
});
check("create_order rejects empty cart", empty.error !== null);

// 6. admin-only RPCs are not callable by anon
const recap = await supabase.rpc("get_daily_sales", {});
check(
  "anon CANNOT call get_daily_sales",
  recap.error !== null,
  "callable by anon",
);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
