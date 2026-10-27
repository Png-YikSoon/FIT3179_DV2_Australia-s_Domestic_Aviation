# Data for "Domestic Air Travel in Australia" (FIT3179 DV2)

All files are cleaned from the original sources listed below. Totals are about 120 KB, well under the size limit.
Passenger counts are **revenue passengers carried, both directions combined** (BITRE).

## Sources
| Source | Publisher | Used in |
|---|---|---|
| Top Routes / City Pair Statistics, July 2014 – July 2026 | Bureau of Infrastructure and Transport Research Economics (BITRE) | 01–04, 06, 11, 13, 14 |
| Domestic Aviation Activity: Annual Summary, 1984–2025 (Domestic airlines sheet, calendar years) | BITRE | 15 |
| Domestic Tourism Statistics, June quarter 2026 | Tourism Research Australia (TRA) | 07, 08, 09, 09b |
| Airport coordinates | OurAirports (public domain), ourairports.com/data | airports.csv |
| State boundaries | rowanhogan/australian-states (GitHub), from ABS boundaries; simplified with mapshaper | australia_states.topojson |

## Files

| File | Chart | Rows | Key fields |
|---|---|---|---|
| `01_trend_monthly_passengers.csv` | 1 Line chart | 145 months | `date`, `passengers`, `seats`, `flights`, `load_factor`, `passengers_12m_avg` (12-month rolling average) |
| `02_calendar_monthly.csv` | 2 Radial calendar | 145 | `year`, `month_num`, `passengers_m` (millions), `index_vs_year_avg` (100 = that year's average month; blank for partial years 2014, 2026) |
| `03_flowmap_routes_fy2026.csv` | 3 Flow map | 62 routes | `origin_lat/lon`, `dest_lat/lon`, `passengers_fy2026` (Jul 2025–Jun 2026), `rank` |
| `04_airports_traffic_recovery.csv` | 4 Proportional symbols | 40 airports | `lat`, `lon`, `passengers_fy2019`, `passengers_fy2026`, `recovery_pct_of_2019`, `change_pct` |
| `06_heatmap_loadfactor_top15_fy2026.csv` | 6 Heatmap | 15 routes × 12 months | `route`, `route_rank`, `month`, `fy_month_order` (Jul=1), `load_factor` (%) |
| `07_choropleth_states_ye_jun2026.csv` | 7 Choropleth | 8 states | `state` (joins to topojson `name`), `overnight_trips_change_pct`, `overnight_spend_change_pct`, `all_trips_change_pct`, `small_sample_caution` |
| `australia_states.topojson` | 7 | 8 | object `states`, property `name` |
| `08_waffle_purpose_grid_ye_jun2026.csv` | 8 Waffle | 2 × 100 cells | `trip_type`, `col`, `row` (10×10 grid), `purpose` |
| `08_waffle_purpose_summary_ye_jun2026.csv` | 8 (labels) | 8 | `trips_000`, `share_pct`, `squares` |
| `09_purpose_by_quarter.csv` | 9 | 2 × 4 × 5 | `purpose`, `quarter`, `trips_000`, `index_vs_jun_q_2025` (100 = June Q 2025) |
| `09b_airfare_spend_by_quarter.csv` | 9 (alternative) | 3 × 5 | `trip_type`, `quarter`, `airfare_spend_m` ($ million) |
| `11_seasonal_selected_routes_2023_2025.csv` | 11 Small multiples | 8 routes × 12 | `route_type` (Business / Leisure / Mining FIFO), `month`, `avg_passengers`, `index_vs_route_avg` |
| `13_recovery_routes_2019_vs_2025.csv` | 3 Diverging bar | 20 routes | `route`, `passengers_2019`, `passengers_2025`, `change_pct`, `direction` (calendar years; 20 busiest routes of 2019 with complete data) |
| `14_route_seats_fy2026.csv` | 5 Lollipop | 11 | `order`, `route`, `seats`, `passengers` (top 10 routes + "Other 52 routes", July 2025 to June 2026); the chart shows passengers for the top 10 |
| `15_slope_2019_vs_2025.csv` | Slope chart | 6 measures × 2 years | `measure`, `unit`, `year`, `value`, `index` (2019 = 100), `label_y` (label position, nudged so labels do not overlap), `change_pct`. Passengers per flight = passengers ÷ departures; average trip length = RPK ÷ passengers; seats filled = BITRE passenger load factor |
| `airports.csv` | 3, 4 | 43 | `code`, `city`, `state`, `lat`, `lon` |

## Caveats to state on the page
- **"FY"** = Australian financial year (1 July – 30 June). FY2026 = July 2025 – June 2026. Explain this for Malaysian readers.
- **Withheld data.** BITRE withholds some route-months for confidentiality ("Data not available for release"). Routes with any withheld month in a period are left out of that period's comparison. Darwin–Sydney, Sydney–Townsville and Alice Springs routes are affected in recent years. "COVID19 No flights" months are counted as 0.
- **Airport totals (chart 4)** are the sum of the top routes touching each airport, not total airport traffic. Label them "passengers on major routes".
- **Distance.** `distance_km` is great-circle distance.
- **TRA trips include all transport modes** (car, bus, train, plane), not only flights. They cover Australian residents aged 14 and over. TRA changed its survey method in January 2025, so do not compare with figures before 2025.
- **Purpose shares.** Waffle shares are calculated from the four purpose groups (trips can have several reasons, so the published total is slightly lower than their sum).
- **Small states.** NT, ACT and Tasmania have higher survey error (TRA).

## Vega-Lite hints
- Projection for all maps: `{"type": "conicEqualArea", "parallels": [-18, -36], "rotate": [-132, 0]}` (Australian Albers).
- Flow map: `rule` mark with `longitude`/`latitude` and `longitude2`/`latitude2`, with `strokeWidth` encoding `passengers_fy2026`.
- Choropleth: `lookup` from the TopoJSON `properties.name` to `state` in the CSV, with a diverging scheme (`"blueorange"` or `"redblue"`) and `domainMid: 0`.
- Radial calendar: `arc` mark with `theta` = `month_num` (ordinal), `radius` = `year` (ordinal), `color` = `passengers_m`.
