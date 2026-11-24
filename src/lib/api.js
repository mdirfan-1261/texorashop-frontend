const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function getProducts() {
  const res = await fetch(`${API}/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function getProduct(slug) {
  const res = await fetch(`${API}/products/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}