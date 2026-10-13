export function PolicyPage({ title, intro, sections }: { title: string; intro: string; sections: { heading: string; body: string }[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-maroon-700">{title}</h1>
      <p className="mt-3 text-ink/80">{intro}</p>
      {sections.map((s) => (
        <section key={s.heading} className="mt-7">
          <h2 className="font-display text-xl font-bold text-maroon-700">{s.heading}</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/80">{s.body}</p>
        </section>
      ))}
    </div>
  );
}
