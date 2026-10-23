import Link from 'next/link';

const CONTROLS: [string, string][] = [
  ['WASD', 'move'],
  ['Mouse', 'aim'],
  ['Hold left click', 'erase'],
  ['Esc', 'pause'],
];

function Orbits() {
  return (
    <svg
      viewBox="-120 -120 240 240"
      aria-hidden="true"
      className="h-full w-full motion-safe:animate-[orbit-spin_90s_linear_infinite]"
    >
      <defs>
        <radialGradient id="menu-core">
          <stop offset="0%" stopColor="#F2FEFF" />
          <stop offset="22%" stopColor="#5CF2FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#5CF2FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="70" fill="url(#menu-core)" opacity="0.55" />
      <g fill="none" stroke="#5CF2FF" strokeWidth="0.6" opacity="0.7">
        <ellipse rx="110" ry="30" />
        <ellipse rx="110" ry="30" transform="rotate(60)" />
        <ellipse rx="110" ry="30" transform="rotate(-60)" />
      </g>
      <circle r="62" fill="none" stroke="#9B6BFF" strokeWidth="0.5" strokeDasharray="1 6" opacity="0.8" />
      <circle r="6" fill="#F2FEFF" />
    </svg>
  );
}

export default function MenuPage() {
  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-void">
      <div className="pointer-events-none absolute top-1/2 right-[-18vmin] h-[110vmin] w-[110vmin] -translate-y-1/2 opacity-80 md:right-[-8vmin]">
        <Orbits />
      </div>

      <section className="relative z-10 flex w-full max-w-3xl flex-col justify-center gap-10 px-8 py-16 md:px-20">
        <p className="font-hud text-base text-mist">Run 4,812. Containment nominal. Another quiet night.</p>

        <h1 className="font-display text-[clamp(4rem,14vw,11rem)] leading-[0.85] font-extrabold tracking-[0.08em] text-core drop-shadow-[0_0_28px_rgba(92,242,255,0.35)]">
          AXIOM
        </h1>

        <p className="max-w-md font-hud text-xl leading-relaxed text-core/85">
          You came back as light. The world will not stop answering.
        </p>

        <div>
          <Link
            href="/play"
            className="inline-block border border-unbound bg-unbound/10 px-12 py-3 font-display text-lg font-medium tracking-[0.2em] text-core shadow-[0_0_24px_rgba(92,242,255,0.25)] transition-[background-color,box-shadow] hover:bg-unbound/20 hover:shadow-[0_0_36px_rgba(92,242,255,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-unbound"
          >
            Play
          </Link>
        </div>

        <dl className="grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-hud text-sm">
          {CONTROLS.map(([key, action]) => (
            <div key={key} className="contents">
              <dt className="text-core/90">{key}</dt>
              <dd className="text-mist">{action}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
