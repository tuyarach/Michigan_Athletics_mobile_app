const state = { route: "seat", stepFree: false, modal: null, navigating: false, warmupsPromptSeen: false, preferences: { stepFree: false, largeText: false, widePaths: false, restrooms: false, lowCrowd: false } };
const routes = {
  seat: {
    title: "Club 320 · Row 4", detail: "Light foot traffic via South concourse", time: 3, kicker: "YOUR ROUTE",
    steps: ["Continue through Gate 4 and keep right past guest services.", "Turn left and you'll see the South Concourse. Follow it toward Club 320.", "Enter Club 320; your seat is on the aisle in Row 4."]
  },
  field: {
    title: "Pregame field access", detail: "Enter through Tunnel 1", time: 5, kicker: "FIELD ACCESS",
    steps: ["Turn toward the South Concourse and follow it toward Section 1.", "You'll see Tunnel 1 on your right; enter with your digital pass ready.", "Follow the field-access signs; access closes at 11:45 AM."]
  }
};
const passes = {
  gerald: { holder: "Gerald Price", ticket: "TKT 8472 0194", seat: "CLUB 320 · ROW 4 · SEAT 8", stepFree: false },
  alex: { holder: "Alex Price", ticket: "TKT 8472 0195", seat: "CLUB 320 · ROW 4 · SEAT 9", stepFree: true },
  morgan: { holder: "Morgan Price", ticket: "TKT 8472 0196", seat: "CLUB 320 · ROW 4 · SEAT 10", stepFree: false },
};
state.pass = "gerald";
const views = [...document.querySelectorAll(".view")];
const navItems = [...document.querySelectorAll(".nav-item")];
const scrim = document.querySelector(".scrim");
const toast = document.querySelector(".toast");
const ticketCarousel = document.querySelector("#ticket-carousel");
const routeSheet = document.querySelector(".route-sheet");
const sheetHandle = document.querySelector(".sheet-line");
let toastTimer;
function showScreen(id) { views.forEach((view) => { const active = view.id === id; view.hidden = !active; view.classList.toggle("active", active); }); navItems.forEach((item) => item.classList.toggle("active", item.dataset.screen === id)); }
function renderRouteDirections(steps) {
  const directions = document.querySelector("#route-directions");
  directions.innerHTML = steps.map((step, index) => `<li><span>${index + 1}</span><p>${step}</p></li>`).join("");
}
function updateRoutePath() {
  document.querySelector(".route-path").classList.toggle("accessible", state.stepFree);
}
function setRoute(route, showMap = true) {
  state.route = route;
  const current = routes[route];
  document.querySelector("#route-kicker").textContent = current.kicker;
  document.querySelector("#route-title").textContent = current.title;
  document.querySelector("#route-description").textContent = state.stepFree ? `${current.detail} · Accessible path` : current.detail;
  document.querySelector("#route-time").innerHTML = `${current.time + (state.stepFree ? 1 : 0)}<span>min</span>`;
  updateRoutePath();
  renderRouteDirections(current.steps);
  document.querySelector("#route-directions").hidden = true;
  document.querySelector(".route-sheet").classList.remove("directions-active");
  routeSheet?.style.removeProperty("height");
  routeSheet?.classList.remove("is-expanded");
  state.navigating = false;
  document.querySelector("#cancel-route").hidden = true;
  document.querySelector("#start-route").innerHTML = 'Start route <svg><use href="#arrow"></use></svg>';
  if (showMap) showScreen("map-view");
}
function scrollToSelectedTicket(behavior = "smooth") {
  const ticket = ticketCarousel?.querySelector(`[data-ticket="${state.pass}"]`);
  if (!ticket) return;
  ticketCarousel.scrollTo({ left: ticket.offsetLeft - (ticketCarousel.clientWidth - ticket.clientWidth) / 2, behavior });
  requestAnimationFrame(updateTicketDepth);
}
function openModal(id) { closeModal(); const modal = document.querySelector(`#${id}`); state.modal = id; scrim.hidden = false; modal.hidden = false; if (id === "pass-modal") requestAnimationFrame(() => scrollToSelectedTicket("auto")); modal.querySelector("[data-close]").focus(); }
function closeModal() {
  if (!state.modal) return;
  const closedModal = state.modal;
  document.querySelector(`#${closedModal}`).hidden = true;
  scrim.hidden = true;
  state.modal = null;
  if (closedModal === "pass-modal" && !state.warmupsPromptSeen) {
    state.warmupsPromptSeen = true;
    window.setTimeout(() => openModal("warmups-modal"), 220);
  }
}
function showToast(message) { clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false; toastTimer = setTimeout(() => { toast.hidden = true; }, 2800); }
function updatePassPreferences() {
  const labels = passes[state.pass].stepFree
    ? ["Accessible route", ...[["widePaths", "WIDE PATHS"], ["restrooms", "ACCESSIBLE RESTROOMS"], ["lowCrowd", "LOWER-CROWD ROUTES"]]
      .filter(([key]) => state.preferences[key]).map(([, label]) => label)]
    : [];
  const passPreferences = document.querySelector("#pass-preferences");
  passPreferences.hidden = labels.length === 0;
  passPreferences.textContent = labels.join(" · ");
}
document.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.screen)));
document.querySelectorAll("[data-route]").forEach((button) => button.addEventListener("click", () => setRoute(button.dataset.route)));
function selectPass(passId) {
  state.pass = passId;
  const pass = passes[passId];
  document.querySelectorAll(".pass-person").forEach((button) => {
    const active = button.dataset.pass === passId;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelector("#pass-ticket-number").textContent = pass.ticket;
  document.querySelector("#pass-seat").textContent = pass.seat;
  ticketCarousel?.querySelectorAll(".digital-ticket").forEach((ticket) => ticket.classList.toggle("active", ticket.dataset.ticket === passId));
  state.stepFree = pass.stepFree;
  document.querySelector("#step-free").checked = state.stepFree;
  document.querySelector("#preference-step-free").checked = state.stepFree;
  updatePassPreferences();
  setRoute(state.route, false);
}
document.querySelectorAll(".pass-person").forEach((button) => button.addEventListener("click", () => selectPass(button.dataset.pass)));
function getClosestTicket() {
  if (!ticketCarousel) return null;
  const center = ticketCarousel.scrollLeft + ticketCarousel.clientWidth / 2;
  const tickets = [...ticketCarousel.querySelectorAll(".digital-ticket")];
  return tickets.reduce((best, ticket) => (
    Math.abs(ticket.offsetLeft + ticket.clientWidth / 2 - center) < Math.abs(best.offsetLeft + best.clientWidth / 2 - center) ? ticket : best
  ));
}
function updateTicketDepth() {
  if (!ticketCarousel) return;
  const center = ticketCarousel.scrollLeft + ticketCarousel.clientWidth / 2;
  const tickets = [...ticketCarousel.querySelectorAll(".digital-ticket")];
  tickets.forEach((ticket) => {
    const distance = Math.min(Math.abs(ticket.offsetLeft + ticket.clientWidth / 2 - center) / (ticketCarousel.clientWidth * 0.65), 1);
    ticket.style.setProperty("--ticket-scale", String(1 - distance * 0.12));
    ticket.style.setProperty("--ticket-opacity", String(1 - distance * 0.38));
    ticket.style.setProperty("--ticket-brightness", String(1 - distance * 0.22));
  });
}
let ticketSettleTimer;
function settleTicketSelection() {
  clearTimeout(ticketSettleTimer);
  ticketSettleTimer = setTimeout(() => {
    if (ticketDrag) return;
    const closest = getClosestTicket();
    if (closest && closest.dataset.ticket !== state.pass) selectPass(closest.dataset.ticket);
  }, 720);
}
ticketCarousel?.addEventListener("scroll", () => { updateTicketDepth(); settleTicketSelection(); }, { passive: true });
let ticketDrag;
ticketCarousel?.addEventListener("pointerdown", (event) => {
  ticketDrag = { x: event.clientX, scrollLeft: ticketCarousel.scrollLeft, pointerId: event.pointerId };
  ticketCarousel.setPointerCapture(event.pointerId);
  ticketCarousel.classList.add("is-dragging");
});
ticketCarousel?.addEventListener("pointermove", (event) => {
  if (!ticketDrag || event.pointerId !== ticketDrag.pointerId) return;
  ticketCarousel.scrollLeft = ticketDrag.scrollLeft - (event.clientX - ticketDrag.x) * 0.7;
});
function finishTicketDrag(event) {
  if (!ticketDrag || event.pointerId !== ticketDrag.pointerId) return;
  if (ticketCarousel.hasPointerCapture(event.pointerId)) ticketCarousel.releasePointerCapture(event.pointerId);
  ticketCarousel.classList.remove("is-dragging");
  ticketDrag = null;
  const closest = getClosestTicket();
  if (closest) ticketCarousel.scrollTo({ left: closest.offsetLeft - (ticketCarousel.clientWidth - closest.clientWidth) / 2, behavior: "smooth" });
  settleTicketSelection();
}
ticketCarousel?.addEventListener("pointerup", finishTicketDrag);
ticketCarousel?.addEventListener("pointercancel", finishTicketDrag);
document.querySelectorAll("[data-modal]").forEach((button) => button.addEventListener("click", () => openModal(button.dataset.modal)));
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal)); scrim.addEventListener("click", closeModal);
document.querySelectorAll("[data-toast]").forEach((button) => button.addEventListener("click", () => showToast(button.dataset.toast)));
function syncStepFree(checked) { state.stepFree = checked; passes[state.pass].stepFree = checked; state.preferences.stepFree = checked; document.querySelector("#step-free").checked = checked; document.querySelector("#preference-step-free").checked = checked; updatePassPreferences(); setRoute(state.route, false); showToast(checked ? "Step-free routing is now preferred." : "Standard routing is now preferred."); }
document.querySelector("#step-free").addEventListener("change", (event) => syncStepFree(event.target.checked));
document.querySelector("#preference-step-free").addEventListener("change", (event) => syncStepFree(event.target.checked));
document.querySelector("#preference-large-text").addEventListener("change", (event) => {
  state.preferences.largeText = event.target.checked;
  document.documentElement.classList.toggle("large-text", event.target.checked);
  showToast(event.target.checked ? "Larger text is on." : "Larger text is off.");
});
[["#preference-wide-paths", "widePaths", "Wide paths preference saved."], ["#preference-restrooms", "restrooms", "Accessible restrooms preference saved."], ["#preference-low-crowd", "lowCrowd", "Lower-crowd routes preference saved."]].forEach(([selector, key, message]) => {
  document.querySelector(selector).addEventListener("change", (event) => { state.preferences[key] = event.target.checked; updatePassPreferences(); showToast(message); });
});
document.querySelector(".locate").addEventListener("click", () => showToast("Map centered on your location near Gate 4."));
const startRouteButton = document.querySelector("#start-route");
const cancelRouteButton = document.querySelector("#cancel-route");
startRouteButton.addEventListener("click", (event) => {
  if (state.navigating) { openModal("pass-modal"); return; }
  renderRouteDirections(routes[state.route].steps);
  document.querySelector("#route-directions").hidden = false;
  document.querySelector(".route-sheet").classList.add("directions-active");
  setSheetExpanded(false);
  routeSheet.style.removeProperty("height");
  state.navigating = true;
  cancelRouteButton.hidden = false;
  event.currentTarget.innerHTML = 'View open ticket <svg><use href="#pass"></use></svg>';
  showToast("Navigation started. We’ll keep your route calm and clear.");
});
document.querySelector("#warmups-navigate").addEventListener("click", () => {
  closeModal();
  setRoute("field", true);
  startRouteButton.click();
});
cancelRouteButton.addEventListener("click", () => {
  state.navigating = false;
  document.querySelector("#route-directions").hidden = true;
  routeSheet.classList.remove("directions-active");
  routeSheet.style.removeProperty("height");
  cancelRouteButton.hidden = true;
  startRouteButton.innerHTML = 'Start route <svg><use href="#arrow"></use></svg>';
  showToast("Navigation cancelled.");
});
const countdownTime = document.querySelector("#field-countdown-time");
let fieldAccessRemaining = 105 * 60;
function updateFieldCountdown() {
  const hours = Math.floor(fieldAccessRemaining / 3600);
  const minutes = Math.floor((fieldAccessRemaining % 3600) / 60);
  const seconds = fieldAccessRemaining % 60;
  countdownTime.textContent = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  if (fieldAccessRemaining > 0) fieldAccessRemaining -= 1;
}
updateFieldCountdown();
setInterval(updateFieldCountdown, 1000);
const stadiumOrbit = document.querySelector(".stadium-orbit");
let orbitRotation = 0;
function renderOrbit() {
  stadiumOrbit.style.setProperty("--orbit-z", `${orbitRotation}deg`);
  stadiumOrbit.setAttribute("aria-valuenow", String(orbitRotation));
  stadiumOrbit.setAttribute("aria-valuetext", orbitRotation === 0 ? "Facing center" : `${Math.abs(orbitRotation)} degrees ${orbitRotation > 0 ? "right" : "left"}`);
}
function setOrbitRotation(nextRotation) { orbitRotation = ((Math.round(nextRotation) + 180) % 360 + 360) % 360 - 180; renderOrbit(); }
function orbitAngle(event) {
  const bounds = stadiumOrbit.getBoundingClientRect();
  return Math.atan2(event.clientY - (bounds.top + bounds.height / 2), event.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI;
}
function normalizedAngleDelta(nextAngle, startAngle) { return ((nextAngle - startAngle + 540) % 360) - 180; }
let orbitDrag;
stadiumOrbit.addEventListener("pointerdown", (event) => {
  orbitDrag = { startAngle: orbitAngle(event), rotation: orbitRotation, pointerId: event.pointerId };
  stadiumOrbit.setPointerCapture(event.pointerId);
  stadiumOrbit.classList.add("is-rotating");
});
stadiumOrbit.addEventListener("pointermove", (event) => {
  if (!orbitDrag || event.pointerId !== orbitDrag.pointerId) return;
  setOrbitRotation(orbitDrag.rotation + normalizedAngleDelta(orbitAngle(event), orbitDrag.startAngle));
});
function finishOrbit(event) {
  if (!orbitDrag || event.pointerId !== orbitDrag.pointerId) return;
  if (stadiumOrbit.hasPointerCapture(event.pointerId)) stadiumOrbit.releasePointerCapture(event.pointerId);
  stadiumOrbit.classList.remove("is-rotating");
  orbitDrag = null;
}
stadiumOrbit.addEventListener("pointerup", finishOrbit);
stadiumOrbit.addEventListener("pointercancel", finishOrbit);
stadiumOrbit.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") { event.preventDefault(); setOrbitRotation(orbitRotation - 15); }
  if (event.key === "ArrowRight") { event.preventDefault(); setOrbitRotation(orbitRotation + 15); }
  if (event.key === "Home") { event.preventDefault(); setOrbitRotation(0); }
});
renderOrbit();
function setSheetExpanded(expanded) {
  routeSheet.classList.toggle("is-expanded", expanded);
  routeSheet.style.removeProperty("height");
  sheetHandle.setAttribute("aria-expanded", String(expanded));
  sheetHandle.setAttribute("aria-label", expanded ? "Collapse route details" : "Expand route details");
}
let suppressSheetClick = false;
sheetHandle.addEventListener("click", () => {
  if (suppressSheetClick) { suppressSheetClick = false; return; }
  setSheetExpanded(!routeSheet.classList.contains("is-expanded"));
});
let sheetDrag;
sheetHandle.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  sheetDrag = { startY: event.clientY, startHeight: routeSheet.getBoundingClientRect().height, pointerId: event.pointerId };
  sheetHandle.setPointerCapture(event.pointerId);
  routeSheet.classList.add("is-dragging");
});
sheetHandle.addEventListener("pointermove", (event) => {
  if (!sheetDrag || event.pointerId !== sheetDrag.pointerId) return;
  const mapHeight = routeSheet.parentElement.clientHeight;
  const minimumHeight = 260;
  const maximumHeight = Math.max(minimumHeight, mapHeight - 16);
  const nextHeight = Math.min(maximumHeight, Math.max(minimumHeight, sheetDrag.startHeight + sheetDrag.startY - event.clientY));
  routeSheet.classList.remove("is-expanded");
  routeSheet.style.height = `${nextHeight}px`;
  sheetHandle.setAttribute("aria-expanded", "false");
  if (Math.abs(event.clientY - sheetDrag.startY) > 4) sheetDrag.moved = true;
});
function finishSheetDrag(event) {
  if (!sheetDrag || event.pointerId !== sheetDrag.pointerId) return;
  suppressSheetClick = Boolean(sheetDrag.moved);
  if (sheetHandle.hasPointerCapture(event.pointerId)) sheetHandle.releasePointerCapture(event.pointerId);
  routeSheet.classList.remove("is-dragging");
  sheetDrag = null;
}
sheetHandle.addEventListener("pointerup", finishSheetDrag);
sheetHandle.addEventListener("pointercancel", finishSheetDrag);
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
selectPass("gerald");
updatePassPreferences();
updateTicketDepth();

if (document.documentElement.classList.contains("is-app-launching")) {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      document.documentElement.classList.add("is-app-revealing");
      window.setTimeout(() => {
        document.documentElement.classList.remove("is-app-launching", "is-app-revealing");
        window.history.replaceState({}, "", window.location.pathname);
      }, 950);
    }, 160);
  });
}

// Digital passes are the first thing members see after entering the app.
window.setTimeout(() => openModal("pass-modal"), document.documentElement.classList.contains("is-app-launching") ? 1110 : 0);

