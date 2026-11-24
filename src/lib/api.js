
const API = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
)
  .trim()
  .replace(/\/+$/, "");

async function parseProductsResponse(response) {
  if (!response.ok) {
    throw new Error(
      `API request failed with status: ${response.status}`
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.products)) {
    return data.products;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  throw new Error("Invalid products API response");
}

export async function getProducts() {
  const response = await fetch(`${API}/products`, {
    cache: "no-store",
  });

  return parseProductsResponse(response);
}

export async function getProduct(slug) {
  const response = await fetch(
    `${API}/products/${encodeURIComponent(slug)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.product || data;
}
