export default function Loading() {
  return (
    <div
      id="main"
      className="container-page space-y-6 py-16"
      role="status"
      aria-label="Memuat halaman"
    >
      <div className="skeleton h-12 w-64" />
      <div className="skeleton h-6 max-w-md" />
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-52" />
        ))}
      </div>
    </div>
  );
}
