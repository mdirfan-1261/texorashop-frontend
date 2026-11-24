const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Uploads a (compressed) data URL to Cloudinary through our backend.
// Returns the permanent https image URL.
export async function uploadImage(dataUrl) {
  const saved = localStorage.getItem("texora_admin");
  const token = saved ? JSON.parse(saved).token : "";

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ image: dataUrl }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Image upload failed");
  }
  return data.url;
}