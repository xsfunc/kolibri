## Vite+ CLI (`vp help`).

Commands: `vp dev|build|lint|check|test|run`. Instead npm, pnpm etc.
Before starting: `vp install`. After changes: `vp check && vp test`. Debug: `vp env doctor`.

# Kolibri — Tezos DeFi (kUSD CDP vaults)

Stack: React 19 · Effector 23 · Panda CSS · @base-ui/react · Taquito · BigNumber.js

## FSD Structure

app → pages → widgets → features → entities → shared (strict downward imports)

- Barrel `index.ts` per slice — public API only, never import internal segments
- Segments: model/ · ui/ · api/ · lib/ — as needed, single-file at slice root
- Cross-entity: `@x/` dir (wallet/@x/oven.ts) — re-exports subset, avoids circular deps
- Widgets/pages: ui/ + index.ts only, no model — logic in features/entities

## Effector Conventions

- Compose with `sample()` only
- Two-layer effect: rawFx (pure async) + attachedFx via `attach({ source: $wallet, effect: rawFx, mapParams })` — injects wallet, throws if null
- Effect results → entity events via `sample({ clock: fxDoneData, target: entityEvent })`, never update stores from effects directly
- Pending: `fx.pending` exported as loading stores
- Reset: `.reset(event)` for form stores, array forEach pattern for batch reset
- Derived: `combine()` for multi-source, `store.map()` for simple transforms
- Active entity: `combine($entityMap, $activeAddress, (map, addr) => map[addr] ?? null)`
- React binding: `useUnit()` only — single or object style `{ store: s, event: e }`

## Panda CSS Conventions

- `css({...})` — primary styling, token refs via `token(colors.primary)`, `token(spacing.md)`
- `cva()` recipes in `shared/ui/styles.ts`: button · card · input · skeleton · chip · progressTrack · radioCard · dialogBackdrop · dialogPopup
- `cx()` for class merging, `grid()` from `styled-system/patterns`
- Only static object literals in css/cva/patterns — no dynamic key construction (extraction-safe)
- After panda.config.ts changes: run `panda codegen` (or `vp install` which triggers prepare)
- Responsive: object syntax `{ base: "...", md: "..." }`
- Imports: `styled-system/css`, `styled-system/patterns`

## Base UI Wrappers

- Headless primitives from `@base-ui/react` → wrappers in `shared/ui/<Component>/`
- Wrapper anatomy: import primitive → apply cva recipe from styles.ts → expose typed props
- Use `render` prop for custom elements, `Field` for form controls, `Portal` for popups
- Style via data attributes: `[data-checked]`, `[data-disabled]` etc.
- Component map: Button→Button(render) · Dialog→Dialog.{Root,Portal,Backdrop,Popup,Title,Description,Close} · Tabs→Tabs.{Root,List,Tab,Panel} · Radio→RadioGroup+Radio.Root · Progress→Progress.{Root,Label,Track,Indicator} · Input→Input+Field.{Root,Label,Description,Error}

## Domain & Shared

- Oven = CDP vault (XTZ collateral → kUSD debt)
- Wallet: Beacon wallet
- SDK: shared/api/tezos/kolibri
- BigNumber: `import { BigNumber } from "@/shared/lib/bignumber"`
- Formatters: shared/lib/format.ts — truncateAddress · formatToken · formatPercent · formatUsd
- Constants: MUTEZ=1e6 · SHARD=1e18 · COLLATERAL_DIVISOR=100
- Icons: lucide-react only
- Lazy load: dialogs via `lazy(() => import("@/features/...").then(m => ({ default: m.Dialog })))`
- Aliases: @/ → src/ · styled-system/ → generated Panda output
