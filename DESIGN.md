# SoleStride design system

SoleStride uses a high-contrast, photography-first athletic editorial style: white canvases, cool-gray product tiles, black typography, restrained red accents, condensed uppercase display type, and rounded pill actions.

## Tokens

The canonical values live in `client/src/styles/tokens.css`: white `#fff`, surface `#f5f5f5`, black `#111`, secondary text `#707072`, border `#e5e5e5`, and accent `#d43f21`. Prices are Nepali Rupees formatted with the shared `formatPrice` utility.

## Layout

- Sticky 64px main navigation with compact utility links, category links, search, and bag count.
- Editorial dark landing hero, featured product grid, category tiles, spotlight banner, and dark footer.
- Responsive product catalog and two-column detail and checkout layouts.
- Admin routes use a dark sidebar and a light workspace.
- Product imagery is stored locally in `server/uploads/`; no remote image service is used.
