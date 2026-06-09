export default function Home() {
  return (
    <main className="min-h-screen bg-white text-navy">
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">
          AI Invention Registry
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Save thousands before you file.
        </h1>
        <p className="mt-6 text-lg text-navy/70">
          Find out if your idea is worth patenting — for $49, not $10,000.
        </p>
        <a
          href="/submit"
          className="mt-10 inline-block rounded-lg bg-navy px-8 py-4 text-lg font-semibold text-white"
        >
          Evaluate My Idea — $49
        </a>
      </section>
    </main>
  );
}
