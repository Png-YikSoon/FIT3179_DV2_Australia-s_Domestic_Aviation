# Up in the Air — Domestic Air Travel in Australia

FIT3179 Data Visualisation 2 (Semester 2, 2026) · P'ng Yik Soon · Monash University Malaysia

Live page: `https://<your-github-username>.github.io/<repo-name>/`

## Structure
```
index.html          page layout and story text
css/style.css       typography, colours, layout
js/main.js          embeds each chart + shared Vega-Lite config (fonts, axes)
specs/*.vg.json     one Vega-Lite spec per chart (human-readable JSON)
data/               cleaned CSVs, state boundaries (TopoJSON), data README, build script
sketch.pdf          ← add your scanned hand-drawn sketch here
```

| Section | Spec | Chart | Idiom |
|---|---|---|---|
| 1 | 01_trend | Australia’s Domestic Airline Passenger Trends, 2014–2026 | Line chart (monthly + 12-month average) |
| 1 | 04_airport_hubs | Australia’s Domestic Aviation Hubs | Proportional-symbol map (Map 1) |
| 1 | 13_recovery_diverging | Changes in Australia’s Busiest Domestic Flight Routes, 2019–2025 | Diverging bar chart |
| 1 | 15_slope_2019_vs_2025 | Changes in Australia’s Domestic Aviation Activity Between 2019 and 2025 | Slope chart (indexed, 2019 = 100) |
| 2 | 03_flow_map | Australia’s Domestic Flight Network | Flow map, routes only, with city selector (Map 2) |
| 2 | 14_route_occupancy_lollipop | Australia’s Top 10 Busiest Domestic Flight Routes | Lollipop chart (passengers) |
| 2 | 06_loadfactor_heatmap | Monthly Seat Occupancy Across Australia’s Busiest Domestic Flight Routes | Heatmap |
| 3 | 02_radial_calendar | Australia’s Domestic Air Travel Calendar: Seasonal Passenger Patterns | Radial calendar heatmap |
| 3 | 11_seasonal_small_multiples | Monthly Passenger Patterns Across Selected Domestic Flight Routes | Small multiples |
| 4 | 07_choropleth | Domestic Air Travel Growth Across Major Routes | Choropleth with trips selector (Map 3) |
| 4 | 08_waffle | Why Australians Fly: Business and Leisure Travel | Waffle chart |
| 4 | 09_purpose_trend | Diverging Trends in Domestic Air Travel by Purpose, 2025–2026 | Indexed multi-line chart |

## Page features
- Page, section and chart titles, chart subtitles and the conclusion in Times New Roman (subtitles capped at about 10 words per line); other text in Verdana.
- Each chart has the Vega-Embed three-dot menu (save as SVG/PNG, view source, open in Vega Editor).
- Sticky "jump to" bar with the current section underlined (`js/main.js`, IntersectionObserver).
- Map gestures (`js/main.js`, `enableMapGestures`): pinch the trackpad or Ctrl + scroll to zoom towards the pointer; drag, or two-finger swipe once zoomed in, to move. They set the `zoom`, `pan_x` and `pan_y` params (projection `scale` and `translate`).
- Map zoom controls on all three maps: a `zoom` slider and a `focus` menu are Vega-Lite params bound to the projection's `scale` and `center`; marks use `clip: true`. The "Reset view" buttons set both params back with `view.signal(...)`.
- Flow map city selector: a `city` param bound to a dropdown; routes linked to the selected city stay blue and the rest turn grey (`calculate`), and a note counts the selected city's routes (`filter` + `aggregate`).
- Callout annotations on the trend, diverging bar, flow map, purpose trend and slope charts.

## Run locally
The specs load CSVs by relative URL, so open the page through a local server, not by double-clicking:
```
python -m http.server 8000
```
then visit http://localhost:8000.

## Publish on GitHub Pages
1. Create a **public** repository and push these files to the `main` branch.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `root` → Save.
3. Wait a minute, then open the live URL and check every chart loads.

## Notes for editing
- Map projection (all three maps): `conicEqualArea` with parallels −18°/−36° and centre meridian 132°E (Australian Albers).
- CSV columns used for sorting or arithmetic are declared in each spec's `"format": {"parse": …}`; Vega-Lite only converts columns to numbers automatically when they are encoded as quantitative.
- Chart colours: blue `#2a78d6`, orange `#eb6834`, magenta `#c2337a`, grey `#b4b8bf`; diverging red `#e34948` – blue `#2a78d6`. No red–green pairs (colour-vision deficiency).
- Text marked **DRAFT** in `index.html` is placeholder copy: rewrite it in your own words.
