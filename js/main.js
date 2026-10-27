// Embeds every chart. Each spec lives in specs/ as a readable JSON file.
// The shared config below sets fonts and axis styling for all charts in one place.

const config = {
  font: "Verdana, Geneva, DejaVu Sans, sans-serif",
  background: null,
  view: { stroke: null },
  axis: {
    labelColor: "#52514e", titleColor: "#52514e", labelFontSize: 12, titleFontSize: 12,
    titleFontWeight: 500, gridColor: "#e1e0d9", domainColor: "#c3c2b7", tickColor: "#c3c2b7"
  },
  legend: { labelColor: "#52514e", titleColor: "#52514e", labelFontSize: 12, titleFontSize: 12, titleFontWeight: 500 },
  header: { labelColor: "#0b0b0b", labelFont: "Verdana, Geneva, DejaVu Sans, sans-serif" },
  text: { font: "Verdana, Geneva, DejaVu Sans, sans-serif" }
};

const charts = {
  // Section 1: the big picture
  vis01: "specs/01_trend.vg.json",
  vis04: "specs/04_airport_hubs.vg.json",
  vis13: "specs/13_recovery_diverging.vg.json",
  // Section 2: the flight network
  vis03: "specs/03_flow_map.vg.json",
  vis14: "specs/14_route_occupancy_lollipop.vg.json",
  vis06: "specs/06_loadfactor_heatmap.vg.json",
  // Section 3: the travel calendar
  vis02: "specs/02_radial_calendar.vg.json",
  vis11: "specs/11_seasonal_small_multiples.vg.json",
  // Section 4: where and why Australians travel
  vis07: "specs/07_choropleth.vg.json",
  vis08: "specs/08_waffle.vg.json",
  vis09: "specs/09_purpose_trend.vg.json",
  vis15: "specs/15_slope_2019_vs_2025.vg.json"
};

// Embed every chart and keep its Vega view, so the map "Reset view" buttons can change its params.
const views = {};
for (const [id, spec] of Object.entries(charts)) {
  vegaEmbed("#" + id, spec, { actions: { export: true, source: true, compiled: true, editor: true }, renderer: "svg", config })
    .then(result => {
      views[id] = result.view;
      if (document.getElementById(id).classList.contains("vis-map")) enableMapGestures(id, result.view);
    })
    .catch(err => console.error(id, err));
}

// "Reset view" buttons under the maps: set the zoom, focus (and city) params back to their defaults.
document.querySelectorAll(".reset").forEach(button => {
  button.addEventListener("click", () => {
    const view = views[button.dataset.vis];
    if (!view) return;
    view.signal("zoom", 1).signal("focus", "Australia").signal("pan_x", 0).signal("pan_y", 0);
    try { view.signal("city", "All airports"); } catch (e) { /* only the flow map has a city selector */ }
    view.runAsync();
  });
});

// ------------------------------------------------------------------
// Map gestures (the three maps): pinch / Ctrl + scroll zooms towards the pointer,
// drag (or two-finger swipe once zoomed in) moves the map.
// They only change the maps' Vega-Lite params: zoom (projection scale) and pan_x / pan_y (projection translate).
// ------------------------------------------------------------------
const MIN_ZOOM = 1, MAX_ZOOM = 8;
// default projection "translate" of each map (from its spec): the point that pan_x / pan_y shift
const MAP_TRANSLATE = { vis04: [330, 280], vis03: [330, 280], vis07: [290, 240] };

function enableMapGestures(id, view) {
  const box = document.getElementById(id);
  const svg = () => box.querySelector("svg");
  let busy = false;                       // true while our own code changes zoom

  // pointer position inside the map, relative to the projection's default translate point
  function pointer(evt) {
    const r = svg().getBoundingClientRect(), o = view.origin();
    const t = MAP_TRANSLATE[id];
    return [evt.clientX - r.left - o[0] - t[0], evt.clientY - r.top - o[1] - t[1]];
  }
  // zoom by factor f, keeping point p (relative to the default translate point) fixed on screen
  function zoomAt(f, p) {
    const z0 = view.signal("zoom"), z1 = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z0 * f));
    if (z1 === z0) return;
    const k = z1 / z0, px = view.signal("pan_x"), py = view.signal("pan_y");
    busy = true;
    view.signal("zoom", z1).signal("pan_x", p[0] + (px - p[0]) * k).signal("pan_y", p[1] + (py - p[1]) * k);
    if (z1 === MIN_ZOOM) view.signal("pan_x", 0).signal("pan_y", 0);   // fully zoomed out: re-centre
    view.runAsync().then(() => { busy = false; });
  }
  function panBy(dx, dy) {
    view.signal("pan_x", view.signal("pan_x") + dx).signal("pan_y", view.signal("pan_y") + dy).runAsync();
  }
  const onMap = evt => svg() && svg().contains(evt.target);

  // trackpad pinch (Chrome, Edge, Firefox send it as Ctrl + wheel) and two-finger swipe
  box.addEventListener("wheel", evt => {
    if (!onMap(evt)) return;
    if (evt.ctrlKey) {
      evt.preventDefault();
      const d = Math.max(-60, Math.min(60, evt.deltaY));   // a mouse-wheel notch is much bigger than a pinch step
      zoomAt(Math.exp(-d * 0.006), pointer(evt));
    } else if (view.signal("zoom") > MIN_ZOOM) {   // only capture the swipe when zoomed in, so the page still scrolls
      evt.preventDefault();
      panBy(-evt.deltaX, -evt.deltaY);
    }
  }, { passive: false });

  // Safari trackpad pinch
  let lastScale = 1;
  box.addEventListener("gesturestart", evt => { if (onMap(evt)) { evt.preventDefault(); lastScale = 1; } });
  box.addEventListener("gesturechange", evt => {
    if (!onMap(evt)) return;
    evt.preventDefault();
    zoomAt(evt.scale / lastScale, pointer(evt));
    lastScale = evt.scale;
  });

  // drag to move (mouse, pen or one finger)
  let drag = null;
  box.addEventListener("pointerdown", evt => {
    if (!onMap(evt) || evt.button !== 0) return;
    evt.preventDefault();
    drag = { x: evt.clientX, y: evt.clientY };
    box.classList.add("dragging");
  });
  window.addEventListener("pointermove", evt => {
    if (!drag) return;
    panBy(evt.clientX - drag.x, evt.clientY - drag.y);
    drag = { x: evt.clientX, y: evt.clientY };
  });
  window.addEventListener("pointerup", () => { drag = null; box.classList.remove("dragging"); });

  // zoom slider: zoom around the map centre; Map focus menu: clear any panning
  let lastZoom = view.signal("zoom");
  view.addSignalListener("zoom", (name, z) => {
    if (!busy && lastZoom) {
      const k = z / lastZoom;
      view.signal("pan_x", view.signal("pan_x") * k).signal("pan_y", view.signal("pan_y") * k).runAsync();
    }
    lastZoom = z;
  });
  view.addSignalListener("focus", () => { view.signal("pan_x", 0).signal("pan_y", 0).runAsync(); });
}

// Sticky jump-to bar: underline the section currently on screen.
const links = document.querySelectorAll(".jump a");
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section").forEach(section => observer.observe(section));
