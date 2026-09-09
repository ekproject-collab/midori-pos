import { getSupabaseClient } from "./client";
import { fail, ok, type Result } from "./result";

const BUCKET = "produk-images";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Upload a product image and return its public URL. */
export async function uploadProductImage(
  file: File,
): Promise<Result<string>> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return fail("Format gambar harus JPG, PNG, atau WebP.");
  }
  if (file.size > MAX_BYTES) {
    return fail("Ukuran gambar maksimal 2 MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return fail(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return ok(data.publicUrl);
}

/** Best-effort removal of an uploaded image, given its public URL. */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  try {
    await getSupabaseClient().storage.from(BUCKET).remove([path]);
  } catch {
    // non-fatal — an orphaned file is harmless
  }
}
