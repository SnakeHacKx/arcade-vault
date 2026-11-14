"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Section = "biblioteca" | "salon" | "auth";

function isActive(pathname: string | null, section: Section) {
  if (!pathname) return false;
  if (section === "biblioteca")
    return pathname === "/" || pathname.startsWith("/juegos");
  return pathname === `/${section}`;
}

/** Nav con la ruta actual resuelta (necesita <Suspense> bajo cacheComponents). */
export function Nav() {
  return <NavView pathname={usePathname()} />;
}

/** Misma Nav sin ruta activa; sirve de fallback del <Suspense> con el mismo tamaño. */
export function NavView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const cls = (section: Section) =>
    isActive(pathname, section) ? "active" : undefined;

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls("biblioteca")}>
            Biblioteca
          </Link>
          <Link href="/salon" className={cls("salon")}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        <Link href="/auth" className="btn auth-btn">
          Iniciar Sesión
        </Link>
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      ></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={cls("biblioteca")} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon" className={cls("salon")} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/auth" className={cls("auth")} onClick={close}>
          Iniciar Sesión
        </Link>
        <div style={{ flex: 1 }}></div>
        <div
          className="pixel"
          style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
