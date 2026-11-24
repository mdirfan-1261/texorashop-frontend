const categories = [
  { name: "Shoes", emoji: "👟" },
  { name: "Clothing", emoji: "👕" },
  { name: "Electronics", emoji: "🎧" },
  { name: "Bags", emoji: "🎒" },
];

export default function CategorySection() {
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-2xl font-bold">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c) => (
          <div
            key={c.name}
            className="flex flex-col items-center rounded-xl border bg-gray-50 py-6 transition hover:border-indigo-600 hover:bg-white"
          >
            <span className="text-4xl">{c.emoji}</span>
            <span className="mt-2 font-medium">{c.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}