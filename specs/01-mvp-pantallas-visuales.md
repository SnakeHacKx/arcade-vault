# SPEC 01 — MVP visual: las 5 pantallas de Arcade Vault

> **Status:** implementado
> **Depends on:** Ninguna (el tema y las fuentes ya están en `app/globals.css` y `app/layout.tsx`)
> **Date:** 2026-11-05
> **Objective:** Portar a Next.js (App Router, TypeScript) las 5 pantallas de `references/templates/` — Biblioteca, Detalle, Reproductor, Auth y Salón de la Fama — como maquetas visuales con datos mock y sin lógica de juego ni sesión.

---

## Por qué existe esta spec

`references/templates/` es un prototipo en React UMD + Babel con un router falso basado en `location.hash` y sesión en `localStorage`. El repo es un scaffold de Create Next App con los estilos ya portados. Esta spec convierte el prototipo en rutas reales de App Router sin cambiar el aspecto visual.

---

## Scope

**In:**

- 5 rutas reales: `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`.
- Layout global con `Nav` (desktop + panel móvil), `<main className="av-main">` y footer, reemplazando el contenido de `app/page.tsx` actual.
- Datos mock tipados en TypeScript: 8 juegos, categorías y `seededScores()` determinista.
- Interactividad puramente visual en el cliente: búsqueda y filtro por categoría en Biblioteca, tilt 3D de las tarjetas, pestañas Iniciar sesión / Crear cuenta en Auth, pestañas de juego en el Salón, menú hamburguesa.
- Reproductor como maqueta estática: HUD con valores fijos y pantalla CRT decorativa.
- Estado "sin resultados" en Biblioteca y `notFound()` para ids de juego inexistentes.
- Textos en español, tal como en el template.

**Out of scope (para futuras specs):**

- Cualquier juego jugable (lógica, canvas, input).
- Sesión real o simulada: no hay `localStorage`, cookies ni contexto de usuario. La Nav siempre muestra "Iniciar Sesión".
- Backend, base de datos y puntuaciones persistentes.
- Timers y puntuación que sube sola en el Reproductor; botones PAUSA y FIN funcionales; modal "FIN DEL JUEGO" y guardado de puntuación.
- Bloque "Tu mejor marca" del Salón (depende de sesión).
- Login social real (GOOGLE / GITHUB son botones decorativos).
- Tests automatizados (el proyecto no tiene test runner).
- Cambios en `globals.css` salvo ajustes mínimos de compatibilidad que surjan al portar.

---

## Data model

Datos mock en TypeScript. Sin persistencia.

```ts
// lib/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type FilterCategory = "TODOS" | Category;
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;        // slug de URL, p. ej. "bloque-buster"
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;     // clase CSS ya existente en globals.css, p. ej. "cover-bricks"
  color: AccentColor;
  best: number;
  plays: string;     // texto ya formateado, p. ej. "12.4K"
}

export const GAMES: Game[];                  // los 8 juegos de references/templates/data.jsx
export const CATS: FilterCategory[];         // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
export function getGame(id: string): Game | undefined;
```

```ts
// lib/scores.ts
export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;      // "DD/MM/2026"
}

export function seededScores(seed: number, count?: number): ScoreRow[];
```

Convenciones:

- `seededScores` conserva el algoritmo del template (LCG `9301 / 49297 / 233280`) para que el ranking sea determinista por `seed`.
- Las semillas se mantienen: Detalle usa `id.length * 17 + 3` con 10 filas; Salón usa `id.length * 23 + 7` con 12 filas.
- Los números se formatean con `toLocaleString("es-ES")`. El formateo se hace en un solo punto compartido para evitar diferencias de hidratación.

Estructura de archivos resultante:

```text
app/
  layout.tsx                      (modificar: Nav, main.av-main, footer)
  page.tsx                        (reemplazar: Biblioteca)
  auth/page.tsx
  salon/page.tsx
  juegos/[id]/page.tsx            (Detalle)
  juegos/[id]/jugar/page.tsx      (Reproductor)
components/
  nav.tsx                         (client)
  game-card.tsx                   (client: tilt)
  library.tsx                     (client: búsqueda + chips)
  auth-form.tsx                   (client: pestañas)
  hall-of-fame.tsx                (client: pestañas de juego)
  footer.tsx
lib/
  games.ts
  scores.ts
```

---

## Implementation plan

1. Crear `lib/games.ts` y `lib/scores.ts` portando `data.jsx` a TypeScript. Verificación: `npm run lint` y `npx tsc --noEmit` pasan.
2. Crear `components/footer.tsx` y `components/nav.tsx` (client, con estado de menú móvil). Actualizar `app/layout.tsx` para renderizar `Nav`, `<main className="av-main">{children}</main>` y `Footer` dentro de `#root`. Verificación: `npm run dev` muestra Nav y footer sobre la página scaffold.
3. Crear `components/game-card.tsx` (client, tilt con `onMouseMove` / `onMouseLeave`) y `components/library.tsx` (client, búsqueda + chips + estado vacío). Reemplazar `app/page.tsx` con el hero y `<Library />`. Cada tarjeta y botón JUGAR enlaza a `/juegos/[id]` con `next/link`. Verificación: `/` muestra 8 tarjetas y filtra.
4. Crear `app/juegos/[id]/page.tsx` (Server Component): portada, tags, estadísticas, ranking de 10 filas con `seededScores`, botones `▶ JUGAR AHORA` → `/juegos/[id]/jugar` y `VOLVER AL VAULT` → `/`. Exportar `generateStaticParams` con los 8 ids y llamar a `notFound()` si el id no existe. Verificación: `/juegos/caida` renderiza; `/juegos/xyz` da 404.
5. Crear `app/juegos/[id]/jugar/page.tsx` (Server Component): HUD estático (JUGADOR `INVITADO`, puntuación `0`, vidas `♥ ♥ ♥`, nivel `01`), botones PAUSA / FIN presentes pero sin comportamiento, SALIR → `/juegos/[id]`, pantalla CRT con arena decorativa y barra inferior con el título del juego. Misma validación de id que el paso 4. Verificación: `/juegos/caida/jugar` renderiza sin errores.
6. Crear `components/auth-form.tsx` (client, pestañas `in` / `up`, campo correo solo en registro) y `app/auth/page.tsx`. El envío del formulario y JUGAR COMO INVITADO navegan a `/` con `router.push`, sin guardar nada. Verificación: `/auth` alterna pestañas y ambos botones llevan a `/`.
7. Crear `components/hall-of-fame.tsx` (client, pestañas por juego, podio 2-1-3 y tabla) y `app/salon/page.tsx`. Sin bloque "Tu mejor marca". El botón final lleva a `/`. Verificación: `/salon` cambia ranking al cambiar de pestaña.
8. Revisar estado activo de la Nav por ruta con `usePathname()` (Biblioteca activa en `/` y `/juegos/*`; Salón en `/salon`; Auth en `/auth`) y eliminar del scaffold lo que quede sin usar (`next.svg` en `app/page.tsx` ya no se importa). Verificación: recorrer las 5 rutas con la Nav.

---

## Acceptance criteria

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] Existen las rutas `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth` y `/salon`, y cada una renderiza sin errores en la consola del navegador.
- [ ] `/` muestra exactamente 8 tarjetas de juego con título, descripción corta, categoría y mejor puntuación.
- [ ] En `/`, escribir "caí" muestra solo CAÍDA; elegir el chip SHOOTER muestra solo INVASORES y ROCAS.
- [ ] En `/`, una búsqueda sin coincidencias muestra el texto "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta o en su botón JUGAR navega a `/juegos/<id>` con el id de ese juego.
- [ ] `/juegos/bloque-buster` muestra descripción larga, tira de estadísticas y un ranking de 10 filas con los 3 primeros resaltados.
- [ ] Recargar `/juegos/bloque-buster` muestra el mismo ranking (nombres, puntuaciones y fechas idénticos).
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` devuelven 404.
- [ ] `▶ JUGAR AHORA` lleva a `/juegos/<id>/jugar` y SALIR en esa pantalla vuelve a `/juegos/<id>`.
- [ ] `/juegos/<id>/jugar` muestra el HUD con `INVITADO`, `0`, `♥ ♥ ♥` y `01`, y la pantalla CRT; no hay timers ni modal.
- [ ] `/auth` alterna entre INICIAR SESIÓN y CREAR CUENTA; el campo "Correo electrónico" solo aparece en CREAR CUENTA.
- [ ] Enviar el formulario de `/auth` y pulsar JUGAR COMO INVITADO navegan a `/` y no escriben nada en `localStorage`.
- [ ] La Nav muestra siempre el botón "Iniciar Sesión" que lleva a `/auth`.
- [ ] `/salon` muestra el podio (02 - 01 - 03) y 12 filas; cambiar de pestaña cambia los nombres y puntuaciones.
- [ ] `/salon` no muestra el bloque "TU MEJOR MARCA".
- [ ] En un ancho de 375 px, la Nav muestra el botón hamburguesa y el panel móvil se abre y se cierra al pulsar el fondo o un enlace.
- [ ] El enlace activo de la Nav coincide con la ruta actual (Biblioteca en `/` y `/juegos/*`, Salón de la Fama en `/salon`).
- [ ] El footer "© 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0" aparece en las 5 rutas.
- [ ] La carga de `/` no produce warnings de hidratación en la consola.

---

## Decisions

- **Yes:** rutas reales de App Router. Dan URLs compartibles y permiten prefetch; el router por hash del template no es idiomático en Next.
- **No:** una sola página con estado (réplica literal del template). Pierde SSR, prefetch y deep links.
- **Yes:** `/juegos/[id]` y `/juegos/[id]/jugar` como rutas anidadas. Reflejan la relación detalle → jugar y simplifican `generateStaticParams`.
- **Yes:** páginas como Server Components y componentes `"use client"` solo donde hay estado o eventos (Nav, tarjetas, filtros, pestañas). Reduce JS en cliente.
- **Yes:** `generateStaticParams` con los 8 ids y `notFound()` para ids inválidos. Evita acceso dinámico fuera de `Suspense` bajo `cacheComponents: true`.
- **Yes:** datos mock en `lib/games.ts` y `lib/scores.ts`, con `seededScores` determinista. Evita diferencias de hidratación y facilita sustituirlos por datos reales después.
- **Yes:** reutilizar `app/globals.css` tal cual. Ya es idéntico a `references/templates/styles.css` salvo las variables de fuente de `next/font`.
- **No:** sesión simulada con `localStorage`. Decisión del usuario: esta spec es solo visual. El bloque "Tu mejor marca" y el nombre en la Nav quedan fuera hasta una spec de autenticación.
- **No:** reproductor con timers, pausa y modal de guardado. Decisión del usuario: maqueta estática. Se pospone a la spec del primer juego.
- **No:** mezclar puntuaciones guardadas con los rankings mock. No hay guardado en esta spec.
- **Yes:** botones PAUSA y FIN visibles pero sin comportamiento, para conservar el layout del HUD del diseño.
- **Yes:** textos en español, como el template y el `lang="es"` del layout.

---

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| `cacheComponents: true` cambia las reglas de acceso a datos y `params` dinámicos. | Leer la guía en `node_modules/next/dist/docs/` antes del paso 4. Usar `generateStaticParams` para que las rutas se prerendericen. |
| Diferencias de hidratación por `toLocaleString("es-ES")` o por `Math.random()`. | No usar `Math.random()` en render; formatear números con un helper único; los datos son deterministas. |
| El tilt 3D de las tarjetas y las animaciones CSS pueden degradar el rendimiento. | Mantener el tilt como mutación directa de `style.transform` vía `ref`, sin estado de React, como en el template. |
| Nav como Client Component dentro de un layout con `cacheComponents` y `usePathname()`. | Si `usePathname()` exige `Suspense` según la documentación, envolver la Nav en `<Suspense>` con un fallback del mismo tamaño. |
| El scaffold actual (`app/page.tsx`) usa clases Tailwind y `next/image` que ya no aplican. | Reemplazar el archivo completo en el paso 3. |

---

## What is **not** in this spec

- Ningún juego jugable ni lógica de puntuación.
- Sesión, registro o login (reales o simulados).
- Backend, base de datos o persistencia de puntuaciones.
- Modal de fin de juego y guardado de puntuación.
- Bloque "Tu mejor marca" del Salón.
- Tests automatizados.

Cada uno de estos puntos, si se aborda, va en su propia spec.
