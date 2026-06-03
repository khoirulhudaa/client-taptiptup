import { useEffect, useState } from "react";

const TILES = [
  { color: "#0a0f1e", word: null },
  { color: "#0d2137", word: "TAP" },
  { color: "#0e4f6b", word: "TIP" },
  { color: "#0891b2", word: "TUP" },
  { color: "#06b6d4", word: null },
];

export default function LoadingOverlay({ onDone }) {
  const [gone, setGone] = useState(TILES.map(() => false));

  useEffect(() => {
    const timers = TILES.map((_, i) =>
      setTimeout(() => {
        setGone((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 300 + i * 260)
    );

    const doneTimer = setTimeout(() => {
      onDone?.();
    }, 300 + (TILES.length - 1) * 260 + 400);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        zIndex: 99999,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {TILES.map((tile, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: "100%",
            backgroundColor: tile.color,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: gone[i] ? "translateY(110%)" : "translateY(0)",
            opacity: gone[i] ? 0 : 1,
            transition: gone[i]
              ? "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease"
              : "none",
          }}
        >
          {tile.word && (
            <span
              style={{
                fontSize: "clamp(5rem, 3.5vw, 64px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                color: "rgba(255,255,255,0.92)",
                userSelect: "none",
              }}
            >
              {tile.word}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}