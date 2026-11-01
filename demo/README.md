# iban-ts playground

Interactive demo for [iban-ts](https://www.npmjs.com/package/iban-ts), deployed to
[altrim.github.io/iban.js](https://altrim.github.io/iban.js/).

It exercises the whole public API in the browser: `isValid`, `printFormat`, `electronicFormat`, `toBBAN`,
`fromBBAN`, `isValidBBAN`, the `countries` table and the `Specification` metadata (`official`, `sepa`).

## Stack

Vue 3.5, Vite 8, Tailwind CSS 4 (via `@tailwindcss/vite`), reka-ui, VueUse, Lucide.

`vue-tsc` needs the TypeScript JavaScript API, which TypeScript 7 no longer ships, so this package aliases
`typescript` to `@typescript/typescript6` (the compatibility package recommended by the TypeScript team).

## Develop

```bash
# from the repository root: build the library first, the demo depends on ../dist
npm install && npm run build

cd demo
npm install
npm run dev        # http://localhost:5173/iban.js/
npm run build      # typecheck with vue-tsc, then bundle
npm run preview
```
