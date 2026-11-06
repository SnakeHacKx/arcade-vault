"use client";

import { useRef } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import type { Game } from "@/lib/games";
import { formatNumber } from "@/lib/scores";

export function GameCard({ game }: { game: Game }) {
  const tiltRef = useRef<HTMLAnchorElement>(null);

  // Tilt 3D: mutación directa de style.transform, sin estado de React.
  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-6px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg)`;
  };
  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "";
  };

  const btnColor =
    game.color === "magenta" ? " magenta" : game.color === "yellow" ? " yellow" : "";

  return (
    <Link
      ref={tiltRef}
      href={`/juegos/${game.id}`}
      className="card"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="cover">
        <div className={"cover-bg " + game.cover}></div>
        <div className="label">{game.cat}</div>
      </div>
      <div className="meta">
        <div className="title">{game.title}</div>
        <div className="desc">{game.short}</div>
        <div className="row">
          <div className="score-badge">
            <span>MEJOR PUNTUACIÓN</span>
            <b>{formatNumber(game.best)}</b>
          </div>
          {/* span y no <button>/<a>: la tarjeta entera ya es el enlace */}
          <span className={"btn" + btnColor}>JUGAR</span>
        </div>
      </div>
    </Link>
  );
}
