window.__ModuleLoader__.load({ id: 'dsh-skin-digital-arcade', factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// src/client/appearance.ts
function installSkinAppearance(ctx) {
  ctx.inject(["theme"], (scope) => {
    scope.effect(() => {
      const key = "dsh.arcade.enabled";
      const nameKey = "dsh.arcade.character-name";
      const theme = scope.theme;
      const hasBuiltin = theme.getTheme().themes.some((item) => item.id === "arcade");
      const unregister = hasBuiltin ? () => {
      } : theme.register({ id: "arcade", colorScheme: "dark", tokens: {} });
      const read = (key2) => {
        try {
          return localStorage.getItem(key2) ?? "";
        } catch {
          return "";
        }
      };
      let cube;
      let panel;
      const sync = (snapshot) => {
        const active = snapshot.active.id === "arcade";
        document.body.toggleAttribute("data-dsh-arcade", active);
        cube?.setAttribute("aria-pressed", String(active));
        try {
          localStorage.setItem(key, active ? "1" : "0");
        } catch {
        }
      };
      const disposeTheme = scope.on("theme/change", sync);
      if (!hasBuiltin && read(key) === "1") theme.setTheme("arcade");
      sync(theme.getTheme());
      const mount = () => {
        const last = document.querySelector('[role="dialog"] button[class*="themeCube"]:last-child');
        if (!last || last.closest("[data-skin-appearance]")) return;
        if (!hasBuiltin && !last.parentElement?.querySelector("[data-skin-arcade-choice]")) {
          cube = document.createElement("button");
          cube.type = "button";
          cube.className = last.className;
          cube.dataset.skinArcadeChoice = "";
          cube.textContent = "\u50CF\u7D20\u9713\u8679";
          cube.setAttribute("aria-pressed", String(theme.getTheme().active.id === "arcade"));
          cube.addEventListener("click", () => theme.setTheme("arcade"));
          last.parentElement?.append(cube);
        }
        const group = last.parentElement?.parentElement;
        if (!group || group.querySelector("[data-skin-appearance]")) return;
        panel = document.createElement("label");
        panel.dataset.skinAppearance = "";
        panel.textContent = "\u9CB8\u9C7C\u5A18\u7684\u81EA\u5B9A\u4E49\u540D\u5B57 ";
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 24;
        input.placeholder = "\u9CB8\u9C7C\u5A18";
        input.setAttribute("aria-label", "\u9CB8\u9C7C\u5A18\u7684\u81EA\u5B9A\u4E49\u540D\u5B57\uFF08\u5916\u89C2\u8BBE\u7F6E\uFF09");
        input.value = read(nameKey);
        input.addEventListener("input", () => {
          try {
            localStorage.setItem(nameKey, input.value);
          } catch {
          }
          window.dispatchEvent(new Event("dsh-character-name-change"));
        });
        panel.append(input);
        group.append(panel);
      };
      const observer = new MutationObserver(mount);
      observer.observe(document.body, { childList: true, subtree: true });
      mount();
      return () => {
        observer.disconnect();
        cube?.remove();
        panel?.remove();
        if (typeof disposeTheme === "function") disposeTheme();
        unregister();
        if (!hasBuiltin) document.body.removeAttribute("data-dsh-arcade");
      };
    }, "digital-arcade: optional theme and local display-name controls");
  });
}

// src/client/index.ts
var WINDOW_SELECTOR = '[data-dsh-detail-panel], [class*="thinkBody"], [data-dsh-code-floating]';
var WINDOW_MINIMIZED_SELECTOR = [
  '[data-dsh-detail-panel][data-dsh-panel-minimized="true"]',
  '[class*="thinkBody"][data-dsh-panel-minimized="true"]',
  '[data-dsh-code-floating][data-dsh-panel-minimized="true"]'
].join(", ");
function installArcadePointerFeedback() {
  if (typeof document === "undefined") return () => {
  };
  const onPointerDown = (event) => {
    if (!document.body.hasAttribute("data-dsh-arcade")) return;
    if (event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest("textarea, input, [contenteditable='true']") !== null) return;
    const marker = document.createElement("span");
    marker.className = "dsh-click-hit";
    marker.style.left = `${event.clientX}px`;
    marker.style.top = `${event.clientY}px`;
    marker.addEventListener("animationend", () => {
      marker.remove();
    }, { once: true });
    document.body.append(marker);
    window.setTimeout(() => {
      marker.remove();
    }, 720);
  };
  document.addEventListener("pointerdown", onPointerDown, true);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
  };
}
function installArcadePanelLayout() {
  if (typeof document === "undefined") return () => {
  };
  let frame = null;
  let disposed = false;
  const cascaded = /* @__PURE__ */ new WeakSet();
  const sync = () => {
    if (disposed) return;
    const composerTop = composerCeiling();
    document.documentElement.style.setProperty(
      "--dsh-composer-reserve",
      `${Math.max(0, Math.round(window.innerHeight - composerTop + PANEL_GAP))}px`
    );
    const stage = document.querySelector("[data-phase]");
    if (stage !== null) {
      const rect = stage.getBoundingClientRect();
      if (rect.width > 0) {
        document.documentElement.style.setProperty("--dsh-stage-centre", `${Math.round(rect.left + rect.width / 2)}px`);
        document.documentElement.style.setProperty("--dsh-stage-width", `${Math.round(rect.width)}px`);
      }
    }
    const safeHeight = `${Math.max(RESIZE_MIN_HEIGHT, Math.round(composerTop - PANEL_TOP_FLOOR - PANEL_GAP))}px`;
    const panels = document.querySelectorAll(WINDOW_SELECTOR);
    for (const panel of panels) {
      const rect = panel.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || panel.hasAttribute("data-dsh-panel-maximized")) {
        panel.style.removeProperty("--dsh-panel-safe-height");
        continue;
      }
      panel.style.setProperty("--dsh-panel-safe-height", safeHeight);
    }
    let opened = 0;
    for (const panel of floatingWindows()) {
      if (panel.closest('[data-dsh-panel-pinned="true"]') === null && !cascaded.has(panel)) {
        cascaded.add(panel);
        panel.style.setProperty("--dsh-panel-cascade", `${Math.min(opened, CASCADE_LIMIT) * CASCADE_STEP}px`);
      }
      opened += 1;
    }
  };
  const schedule = () => {
    if (typeof window === "undefined" || disposed || frame !== null) return;
    frame = window.requestAnimationFrame(() => {
      frame = null;
      sync();
    });
  };
  const resizeObserver = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver(schedule);
  const observe = () => {
    if (typeof document === "undefined") return;
    resizeObserver?.disconnect();
    const composer = document.querySelector("[data-phase] [class*='composerSeat']");
    if (composer !== null) resizeObserver?.observe(composer);
    for (const panel of document.querySelectorAll(WINDOW_SELECTOR)) {
      resizeObserver?.observe(panel);
    }
  };
  const mutationObserver = typeof MutationObserver === "undefined" ? void 0 : new MutationObserver(() => {
    observe();
    schedule();
  });
  mutationObserver?.observe(document.body, { childList: true, subtree: true });
  observe();
  window.addEventListener("resize", schedule);
  document.addEventListener("scroll", schedule, true);
  schedule();
  return () => {
    disposed = true;
    if (frame !== null) window.cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    window.removeEventListener("resize", schedule);
    document.removeEventListener("scroll", schedule, true);
  };
}
var RESIZE_EDGE = 14;
var MOBILE_BREAKPOINT = 768;
var RESIZE_MIN_WIDTH = 196;
var RESIZE_MIN_HEIGHT = 120;
var PANEL_GAP = 18;
var PANEL_TOP_FLOOR = 12;
function composerCeiling() {
  const composer = document.querySelector("[data-phase] [class*='composerSeat']");
  return composer?.getBoundingClientRect().top ?? window.innerHeight - 140;
}
var SNAP_STEP = 8;
var CASCADE_STEP = 28;
var CASCADE_LIMIT = 8;
var PANEL_BASE_Z = 41;
var topPanelZ = PANEL_BASE_Z;
function floatingWindows() {
  const out = [];
  for (const panel of document.querySelectorAll(WINDOW_SELECTOR)) {
    if (panel.hasAttribute("data-dsh-panel-minimized")) continue;
    const floats = panel.hasAttribute("data-dsh-code-floating") || panel.closest("[data-dsh-detail-overlay-root]") !== null || panel.closest('[data-dsh-panel-pinned="true"]') !== null;
    if (floats) out.push(panel);
  }
  return out;
}
function raisePanel(panel) {
  topPanelZ += 1;
  panel.style.setProperty("--dsh-panel-z", String(topPanelZ));
  for (const other of document.querySelectorAll('[data-dsh-panel-active="true"]')) {
    if (other !== panel) other.removeAttribute("data-dsh-panel-active");
  }
  panel.setAttribute("data-dsh-panel-active", "true");
}
function snapLength(value) {
  return Math.round(value / SNAP_STEP) * SNAP_STEP;
}
function resizablePanel(target) {
  if (typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT) return null;
  const panel = target.closest(WINDOW_SELECTOR);
  if (panel === null) return null;
  if (panel.hasAttribute("data-dsh-panel-maximized")) return null;
  if (panel.hasAttribute("data-dsh-code-floating")) return panel;
  if (panel.matches('[class*="thinkBody"]')) return panel;
  if (panel.closest("[data-dsh-detail-overlay-root]") !== null) return panel;
  if (panel.getAttribute("data-dsh-detail-panel") === "tool") return panel;
  return panel.closest('[data-dsh-panel-pinned="true"]') !== null ? panel : null;
}
function installArcadePanelResize() {
  if (typeof document === "undefined") return () => {
  };
  let drag = null;
  const clampToViewport = (panel, width, height, west, north) => {
    const rect = panel.getBoundingClientRect();
    const maxWidth = Math.max(RESIZE_MIN_WIDTH, (west ? rect.right : window.innerWidth) - (west ? 12 : rect.left + 12));
    const ceiling = composerCeiling();
    const maxHeight = Math.max(
      RESIZE_MIN_HEIGHT,
      (north ? rect.bottom : ceiling - rect.top) - PANEL_GAP
    );
    return { width: Math.min(width, maxWidth), height: Math.min(height, maxHeight) };
  };
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('button, [data-dsh-drag-handle], [class*="bannerWrap"], textarea, input, a') !== null) return;
    const panel = resizablePanel(target);
    if (panel === null) return;
    const rect = panel.getBoundingClientRect();
    const east = event.clientX >= rect.right - RESIZE_EDGE;
    const west = event.clientX <= rect.left + RESIZE_EDGE;
    const south = event.clientY >= rect.bottom - RESIZE_EDGE;
    const north = event.clientY <= rect.top + RESIZE_EDGE;
    if (!east && !west && !south && !north) return;
    raisePanel(panel);
    drag = {
      pointerId: event.pointerId,
      panel,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: rect.width,
      originHeight: rect.height,
      originLeft: rect.left,
      originTop: rect.top,
      lastWidth: rect.width,
      lastHeight: rect.height,
      lastLeft: rect.left,
      lastTop: rect.top,
      east,
      west,
      south,
      north
    };
    if (typeof panel.setPointerCapture === "function") panel.setPointerCapture(event.pointerId);
    panel.setAttribute("data-dsh-resizing", "true");
    event.preventDefault();
  };
  const onPointerMove = (event) => {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    let width = drag.originWidth;
    let height = drag.originHeight;
    if (drag.east) width = drag.originWidth + dx;
    if (drag.west) width = drag.originWidth - dx;
    if (drag.south) height = drag.originHeight + dy;
    if (drag.north) height = drag.originHeight - dy;
    width = Math.max(RESIZE_MIN_WIDTH, width);
    height = Math.max(RESIZE_MIN_HEIGHT, height);
    const clamped = clampToViewport(drag.panel, width, height, drag.west, drag.north);
    let left = drag.west ? drag.originLeft + (drag.originWidth - clamped.width) : drag.originLeft;
    let top = drag.north ? drag.originTop + (drag.originHeight - clamped.height) : drag.originTop;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    drag.lastWidth = clamped.width;
    drag.lastHeight = clamped.height;
    drag.lastLeft = left;
    drag.lastTop = top;
    drag.panel.style.setProperty("--dsh-panel-width", `${Math.round(clamped.width)}px`);
    drag.panel.style.setProperty("--dsh-panel-height", `${Math.round(clamped.height)}px`);
    drag.panel.style.setProperty("--dsh-panel-max-height", `${Math.round(clamped.height)}px`);
    if (drag.west) drag.panel.style.setProperty("--dsh-panel-left", `${Math.round(left)}px`);
    if (drag.north) drag.panel.style.setProperty("--dsh-panel-top", `${Math.round(top)}px`);
  };
  const onPointerUp = (event) => {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    const { panel, lastWidth, lastHeight, lastLeft, lastTop, west, north } = drag;
    drag = null;
    if (typeof panel.hasPointerCapture === "function" && panel.hasPointerCapture(event.pointerId)) {
      panel.releasePointerCapture(event.pointerId);
    }
    panel.removeAttribute("data-dsh-resizing");
    if (!panel.isConnected) return;
    panel.dispatchEvent(new CustomEvent("dsh-panel-resized", {
      bubbles: true,
      detail: {
        width: Math.round(lastWidth),
        height: Math.round(lastHeight),
        // A west or north drag moved the window's own edge, so the product has
        // to store the new position too or the next render snaps it back.
        ...west ? { left: Math.round(lastLeft) } : {},
        ...north ? { top: Math.round(lastTop) } : {}
      }
    }));
  };
  const onHoverMove = (event) => {
    if (drag !== null) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const panel = resizablePanel(target);
    if (panel === null) return;
    const rect = panel.getBoundingClientRect();
    const east = event.clientX >= rect.right - RESIZE_EDGE;
    const west = event.clientX <= rect.left + RESIZE_EDGE;
    const south = event.clientY >= rect.bottom - RESIZE_EDGE;
    const north = event.clientY <= rect.top + RESIZE_EDGE;
    const cursor = east && south ? "nwse-resize" : west && south ? "nesw-resize" : east && north ? "nesw-resize" : west && north ? "nwse-resize" : east || west ? "ew-resize" : south || north ? "ns-resize" : "";
    panel.style.cursor = cursor;
    if (cursor === "") {
      panel.style.removeProperty("cursor");
    }
  };
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("pointercancel", onPointerUp, true);
  document.addEventListener("pointermove", onHoverMove, true);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("pointerup", onPointerUp, true);
    document.removeEventListener("pointercancel", onPointerUp, true);
    document.removeEventListener("pointermove", onHoverMove, true);
  };
}
function installArcadePanelFocus() {
  if (typeof document === "undefined") return () => {
  };
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const panel = target.closest(WINDOW_SELECTOR);
    if (panel === null) return;
    raisePanel(panel);
  };
  document.addEventListener("pointerdown", onPointerDown, true);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
  };
}
function installArcadeWindowChrome() {
  if (typeof document === "undefined") return () => {
  };
  const entries = /* @__PURE__ */ new WeakMap();
  let dockLeft = null;
  let dockRight = null;
  let listOpen = null;
  const dockFor = (side) => {
    if (side === "left" && dockLeft !== null) return dockLeft;
    if (side === "right" && dockRight !== null) return dockRight;
    const dock = document.createElement("div");
    dock.className = "rizen-dock";
    dock.setAttribute("data-side", side);
    dock.setAttribute("data-empty", "true");
    document.body.appendChild(dock);
    if (side === "left") dockLeft = dock;
    else dockRight = dock;
    return dock;
  };
  const panelTitle = (panel) => {
    const row = panel.closest('[data-tool], [data-variant="think"]');
    const title = row === null ? null : row.querySelector('[class*="title"]');
    const text = title !== null ? title.textContent.trim() : row !== null ? row.textContent.trim() : panel.textContent.trim();
    return text.slice(0, 24) || "\u9762\u677F";
  };
  const panelSideOf = (panel) => {
    const row = panel.closest("[data-dsh-panel-side]");
    if (row?.getAttribute("data-dsh-panel-side") === "right") return "right";
    const rect = panel.getBoundingClientRect();
    if (rect.width > 0) {
      return rect.left + rect.width / 2 < window.innerWidth / 2 ? "left" : "right";
    }
    return "left";
  };
  const minimizedPanels = (side) => {
    const out = [];
    for (const panel of document.querySelectorAll(WINDOW_MINIMIZED_SELECTOR)) {
      const panelSide = entries.get(panel)?.side ?? "left";
      if (panelSide === side) out.push(panel);
    }
    return out;
  };
  const restore = (panel) => {
    panel.removeAttribute("data-dsh-panel-minimized");
    entries.delete(panel);
  };
  const toggleList = (side) => {
    listOpen = listOpen === side ? null : side;
    syncDock();
  };
  const syncDock = () => {
    if (typeof document === "undefined") return;
    for (const side of ["left", "right"]) {
      const dock = dockFor(side);
      const parked = minimizedPanels(side);
      dock.setAttribute("data-empty", parked.length === 0 ? "true" : "false");
      dock.textContent = "";
      if (parked.length === 0) continue;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rizen-dock-button";
      button.textContent = `${parked.length} \u25A4`;
      button.setAttribute("aria-label", `\u6700\u5C0F\u5316\u9762\u677F ${parked.length} \u4E2A`);
      button.setAttribute("data-open", listOpen === side ? "true" : "false");
      button.addEventListener("click", () => {
        toggleList(side);
      });
      dock.appendChild(button);
      if (listOpen === side) {
        const list = document.createElement("div");
        list.className = "rizen-dock-list";
        for (const panel of parked) {
          const item = document.createElement("button");
          item.type = "button";
          item.className = "rizen-dock-item";
          item.textContent = entries.get(panel)?.title ?? panelTitle(panel);
          item.addEventListener("click", () => {
            restore(panel);
            toggleList(side);
          });
          list.appendChild(item);
        }
        dock.appendChild(list);
      }
    }
  };
  const onCommand = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const panel = target.closest(WINDOW_SELECTOR);
    if (panel === null) return;
    const command = event.detail;
    if (command?.command === "minimize") {
      if (!entries.has(panel)) {
        entries.set(panel, { side: panelSideOf(panel), title: panelTitle(panel) });
      }
      panel.setAttribute("data-dsh-panel-minimized", "true");
      listOpen = null;
      syncDock();
    } else if (command?.command === "maximize") {
      if (panel.hasAttribute("data-dsh-panel-maximized")) {
        panel.removeAttribute("data-dsh-panel-maximized");
      } else {
        panel.setAttribute("data-dsh-panel-maximized", "true");
        panel.scrollTop = 0;
      }
    }
  };
  const onOutsidePointer = (event) => {
    if (listOpen === null) return;
    const target = event.target;
    if (target instanceof Element && target.closest(".rizen-dock") !== null) return;
    listOpen = null;
    syncDock();
  };
  const mutationObserver = typeof MutationObserver === "undefined" ? void 0 : new MutationObserver(() => {
    syncDock();
  });
  mutationObserver?.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["data-dsh-panel-minimized"] });
  document.addEventListener("dsh-panel-command", onCommand, true);
  document.addEventListener("pointerdown", onOutsidePointer, true);
  syncDock();
  return () => {
    mutationObserver?.disconnect();
    document.removeEventListener("dsh-panel-command", onCommand, true);
    document.removeEventListener("pointerdown", onOutsidePointer, true);
    dockLeft?.remove();
    dockRight?.remove();
    dockLeft = null;
    dockRight = null;
  };
}
var BODY_DRAG_THRESHOLD = 6;
function installArcadePanelBodyDrag() {
  if (typeof document === "undefined") return () => {
  };
  let drag = null;
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('button, [data-dsh-drag-handle], textarea, input, a, pre, code, [data-dsh-content-area], [class*="code"]') !== null) return;
    const panel = target.closest(WINDOW_SELECTOR);
    if (panel === null) return;
    const rect = panel.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const onEdge = event.clientX <= rect.left + RESIZE_EDGE || event.clientX >= rect.right - RESIZE_EDGE || event.clientY <= rect.top + RESIZE_EDGE || event.clientY >= rect.bottom - RESIZE_EDGE;
    if (onEdge) return;
    drag = {
      pointerId: event.pointerId,
      panel,
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false
    };
    event.preventDefault();
  };
  const onPointerMove = (event) => {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.abs(dx) < BODY_DRAG_THRESHOLD && Math.abs(dy) < BODY_DRAG_THRESHOLD) return;
    drag.moved = true;
    const panel = drag.panel;
    const rect = panel.getBoundingClientRect();
    const left = Math.min(Math.max(0, drag.originX + dx), Math.max(0, window.innerWidth - rect.width));
    const top = Math.min(Math.max(0, drag.originY + dy), Math.max(0, composerCeiling() - PANEL_GAP - rect.height));
    panel.style.position = "fixed";
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.margin = "0";
    panel.style.zIndex = "40";
    panel.style.userSelect = "none";
    panel.setAttribute("data-dsh-body-dragging", "true");
  };
  const finishDrag = (event) => {
    if (drag === null || event.pointerId !== drag.pointerId) return;
    const { panel } = drag;
    drag = null;
    panel.style.removeProperty("userSelect");
    panel.removeAttribute("data-dsh-body-dragging");
    if (!panel.isConnected) return;
    const placed = panel.getBoundingClientRect();
    panel.style.left = `${Math.min(Math.max(0, snapLength(placed.left)), Math.max(0, window.innerWidth - placed.width))}px`;
    panel.style.top = `${Math.max(0, snapLength(placed.top))}px`;
    const pinButton = panel.querySelector('button[aria-label="\u56FA\u5B9A\u9762\u677F"]');
    if (pinButton === null) {
      const settled = panel.getBoundingClientRect();
      panel.dispatchEvent(new CustomEvent("dsh-panel-moved", {
        bubbles: true,
        detail: { left: Math.round(settled.left), top: Math.round(settled.top) }
      }));
    } else {
      pinButton.click();
    }
    window.setTimeout(() => {
      if (!panel.isConnected) return;
      panel.style.removeProperty("position");
      panel.style.removeProperty("left");
      panel.style.removeProperty("top");
      panel.style.removeProperty("right");
      panel.style.removeProperty("bottom");
      panel.style.removeProperty("margin");
      panel.style.removeProperty("zIndex");
    }, 60);
  };
  const onPointerUp = (event) => {
    finishDrag(event);
  };
  const onPointerCancel = (event) => {
    finishDrag(event);
  };
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("pointercancel", onPointerCancel, true);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("pointerup", onPointerUp, true);
    document.removeEventListener("pointercancel", onPointerCancel, true);
  };
}
function installArcadeCodeFloat() {
  if (typeof document === "undefined") return () => {
  };
  let gesture = null;
  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("button") !== null) return;
    const banner = target.closest('[class*="bannerWrap"] > [class*="banner"]');
    if (banner === null) return;
    const block = banner.closest(".md-code-block");
    if (block === null) return;
    const rect = block.getBoundingClientRect();
    gesture = {
      block,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false
    };
  };
  const onPointerMove = (event) => {
    if (gesture === null || event.pointerId !== gesture.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.moved && Math.abs(dx) < BODY_DRAG_THRESHOLD && Math.abs(dy) < BODY_DRAG_THRESHOLD) return;
    if (!gesture.block.hasAttribute("data-dsh-code-floating")) return;
    gesture.moved = true;
    const block = gesture.block;
    const rect = block.getBoundingClientRect();
    const left = Math.min(Math.max(0, gesture.startLeft + dx), Math.max(0, window.innerWidth - rect.width));
    const top = Math.min(Math.max(0, gesture.startTop + dy), Math.max(0, composerCeiling() - PANEL_GAP - rect.height));
    block.style.setProperty("--dsh-panel-left", `${Math.round(left)}px`);
    block.style.setProperty("--dsh-panel-top", `${Math.round(top)}px`);
  };
  const onPointerUp = (event) => {
    if (gesture === null || event.pointerId !== gesture.pointerId) return;
    const { block, moved } = gesture;
    gesture = null;
    if (moved) return;
    if (block.hasAttribute("data-dsh-code-floating")) {
      block.removeAttribute("data-dsh-code-floating");
      block.style.removeProperty("--dsh-panel-cascade");
      return;
    }
    block.setAttribute("data-dsh-code-floating", "");
  };
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("pointercancel", onPointerUp, true);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("pointerup", onPointerUp, true);
    document.removeEventListener("pointercancel", onPointerUp, true);
  };
}
var ARCADE_RUNTIME_INSTALLERS = [
  installArcadePointerFeedback,
  installArcadePanelLayout,
  installArcadePanelResize,
  installArcadePanelFocus,
  installArcadeWindowChrome,
  installArcadePanelBodyDrag,
  installArcadeCodeFloat
];
var ARCADE_RUNTIME_FLAG = "__dshArcadeWindowRuntime";
var name = "dsh-skin-digital-arcade-windows";
var inject = [];
function apply(ctx) {
  installSkinAppearance(ctx);
  const host = globalThis;
  if (host[ARCADE_RUNTIME_FLAG] === true) return;
  host[ARCADE_RUNTIME_FLAG] = true;
  ctx.effect(() => {
    const disposers = ARCADE_RUNTIME_INSTALLERS.map((install) => install());
    return () => {
      for (const dispose of disposers) dispose();
      delete host[ARCADE_RUNTIME_FLAG];
    };
  }, "dsh-skin-digital-arcade: window runtime");
}
return module.exports; } });
