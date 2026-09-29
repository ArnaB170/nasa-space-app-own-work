export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <h1 className="text-2xl font-bold">NASA Space Apps</h1>
      <a
        href="/post-fire-clearance"
        className="mt-6 rounded-lg bg-red-700 px-6 py-3 font-semibold text-white hover:bg-red-600"
      >
        → Open Post-Fire Clearance Dashboard
      </a>
    </main>
  );
}
