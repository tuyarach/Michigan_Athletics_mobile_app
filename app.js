const tickets = {
  gerald: {
    label: "Gerald",
    holder: "Gerald Price",
    section: "Club 320",
    row: "4",
    seat: "8",
    accessible: false,
    scanned: false,
    inWallet: false,
    passNumber: "#MICH-208744",
  },
  alex: {
    label: "Alex",
    holder: "Gerald Price",
    section: "Club 320",
    row: "4",
    seat: "9",
    accessible: true,
    scanned: true,
    inWallet: false,
    passNumber: "#MICH-208745",
  },
  morgan: {
    label: "Morgan",
    holder: "Gerald Price",
    section: "Club 320",
    row: "4",
    seat: "10",
    accessible: false,
    scanned: false,
    inWallet: false,
    passNumber: "#MICH-208746",
  },
};

const routes = {
  seat: {
    title: "Club 320 · Row 4",
    subtitle: "Via south concourse · Light foot traffic",
    eta: 3,
    steps: [
      ["Continue through Gate 4", "Stay right past guest services"],
      ["Follow the south concourse", "Walk about 180 feet"],
      ["Enter Club 320", "Your seat is on the aisle"],
    ],
  },
  field: {
    title: "Pregame field entrance",
    subtitle: "Via Tunnel 1 · Moderate foot traffic",
    eta: 5,
    steps: [
      ["Continue to the south concourse", "Follow signs toward Section 1"],
      ["Meet Maya at Tunnel 1", "Have your digital pass ready"],
      ["Enter the field access lane", "Access closes at 11:45 AM"],
    ],
  },
};

const appState = {
  screen: "tickets",
  selectedTicket: "gerald",
  destination: "seat",
  preferences: readPreferences(),
  openSheet: null,
};

const screenElements = [...document.querySelectorAll(".screen")];
const navigationButtons = [...document.querySelectorAll(".nav-item[data-screen-target], .profile-shortcut-button[data-screen-target]")];
const screenTargetButtons = [...document.querySelectorAll("[data-screen-target]")];
const destinationButtons = [...document.querySelectorAll(".destination-tab")];
const ticketButtons = [...document.querySelectorAll(".person-chip")];
const scrim = document.querySelector(".scrim");
const mapLayout = document.querySelector(".map-layout");
const routeDrawer = document.querySelector(".route-drawer");
const routeDrawerHandle = document.querySelector(".route-drawer-handle");
const accessibleRouteToggle = document.querySelector("#accessible-route-toggle");
const pageRegions = [
  document.querySelector(".top-bar"),
  document.querySelector("#main-content"),
  document.querySelector(".bottom-nav"),
];
const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");
const toast = document.querySelector(".toast");
let toastTimer;
let focusBeforeSheet;
let routeDrawerHasCustomHeight = false;
let routeDrawerDragStartY = 0;
let routeDrawerDragStartHeight = 0;
let routeDrawerIsDragging = false;
let routeDrawerWasDragged = false;

const routeDrawerCollapsedHeight = 128;
const routeDrawerTopGap = 16;

function readPreferences() {
  const defaults = { stepFree: false, wideDoorframes: true, largeText: false };

  try {
    const stored = JSON.parse(localStorage.getItem("michigan-premier-preferences"));
    return {
      stepFree: Boolean(stored?.stepFree ?? defaults.stepFree),
      wideDoorframes: Boolean(stored?.wideDoorframes ?? defaults.wideDoorframes),
      largeText: Boolean(stored?.largeText ?? defaults.largeText),
    };
  } catch {
    return defaults;
  }
}

function savePreferences() {
  try {
    localStorage.setItem("michigan-premier-preferences", JSON.stringify(appState.preferences));
  } catch {
    // The prototype still works when a browser blocks local storage.
  }
}

function showScreen(screenName) {
  appState.screen = screenName;

  screenElements.forEach((screen) => {
    const isActive = screen.dataset.screen === screenName;
    screen.hidden = !isActive;
    screen.classList.toggle("active", isActive);
  });

  navigationButtons.forEach((button) => {
    const isActive = button.dataset.screenTarget === screenName;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

function setPageInert(isInert) {
  pageRegions.forEach((region) => {
    region.inert = isInert;
  });
}

function enableTabKeyboardNavigation(buttons) {
  buttons.forEach((button, index) => {
    button.addEventListener("keydown", (event) => {
      let nextIndex;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (nextIndex === undefined) return;

      event.preventDefault();
      buttons[nextIndex].focus();
      buttons[nextIndex].click();
    });
  });
}

function selectTicket(ticketId) {
  const ticket = tickets[ticketId];
  appState.selectedTicket = ticketId;

  ticketButtons.forEach((button) => {
    const isActive = button.dataset.ticket === ticketId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  document.querySelector("#ticket-panel").setAttribute("aria-labelledby", `ticket-tab-${ticketId}`);

  document.querySelector("#ticket-holder").textContent = ticket.holder;
  document.querySelector("#ticket-section").textContent = ticket.section;
  document.querySelector("#ticket-row").textContent = ticket.row;
  document.querySelector("#ticket-seat").textContent = ticket.seat;
  document.querySelector("#ticket-number").textContent = ticket.passNumber;
  document.querySelector("#pass-sheet-title").textContent = ticket.holder;
  document.querySelector("#pass-sheet-seat").textContent = `${ticket.section} · Row ${ticket.row} · Seat ${ticket.seat}`;
  document.querySelector("#accommodation-badge").hidden = !ticket.accessible;

  const scanStatus = document.querySelector("#ticket-scan-status");
  scanStatus.dataset.scanned = String(ticket.scanned);
  scanStatus.querySelector("use").setAttribute("href", ticket.scanned ? "#icon-check" : "#icon-clock");
  document.querySelector("#ticket-scan-label").textContent = ticket.scanned ? "Scanned" : "Not scanned";

  const walletButton = document.querySelector("#add-to-wallet-button");
  walletButton.disabled = ticket.inWallet;
  document.querySelector("#wallet-button-label").textContent = ticket.inWallet ? "Added to Wallet" : "Add to Apple Wallet";

  if (ticket.accessible) {
    accessibleRouteToggle.checked = true;
    updateAccessibleRoute(true, false);
    showToast("Step-free navigation is ready for Alex’s pass.");
  }
}

function chooseDestination(destination) {
  appState.destination = destination;
  const route = routes[destination];

  destinationButtons.forEach((button) => {
    const isActive = button.dataset.destination === destination;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  document.querySelector("#route-panel").setAttribute("aria-labelledby", `destination-tab-${destination}`);

  document.querySelector("#route-title").textContent = route.title;
  document.querySelector("#route-subtitle").textContent = route.subtitle;
  document.querySelector("#route-eta").textContent = String(route.eta + (accessibleRouteToggle.checked ? 1 : 0));
  document.querySelector("#directions-list").innerHTML = route.steps
    .map(
      ([title, detail], index) =>
        `<li><span>${index + 1}</span><p><strong>${title}</strong><small>${detail}</small></p></li>`,
    )
    .join("");

  const destinationIcon = document.querySelector(".destination-marker use");
  destinationIcon.setAttribute("href", destination === "seat" ? "#icon-seat" : "#icon-field");
}

function navigateTo(destination) {
  showScreen("map");
  chooseDestination(destination);
  showToast(destination === "seat" ? "Route to your seat is ready." : "Route to pregame field access is ready.");
}

function updateAccessibleRoute(isEnabled, announce = true) {
  accessibleRouteToggle.checked = isEnabled;
  mapLayout.classList.toggle("accessible-active", isEnabled);
  document.querySelector("#route-option-copy").textContent = isEnabled
    ? "Elevators and gentle grades selected"
    : "Avoid stairs and steep grades";
  document.querySelector("#route-eta").textContent = String(routes[appState.destination].eta + (isEnabled ? 1 : 0));

  if (announce) {
    showToast(isEnabled ? "Step-free route selected." : "Standard route selected.");
  }
}

function getRouteDrawerLimits() {
  const maxHeight = Math.max(routeDrawerCollapsedHeight, mapLayout.getBoundingClientRect().height - routeDrawerTopGap);
  return { min: routeDrawerCollapsedHeight, max: maxHeight };
}

function setRouteDrawerHeight(height) {
  const { min, max } = getRouteDrawerLimits();
  const nextHeight = Math.min(max, Math.max(min, height));
  const isCollapsed = nextHeight <= min + 2;

  mapLayout.style.setProperty("--route-drawer-height", `${nextHeight}px`);
  routeDrawerHasCustomHeight = true;
  routeDrawerHandle.setAttribute("aria-expanded", String(!isCollapsed));
  routeDrawerHandle.setAttribute("aria-label", isCollapsed ? "Expand route details" : "Minimize route details");
}

function toggleRouteDrawer() {
  const { min, max } = getRouteDrawerLimits();
  const isCollapsed = routeDrawer.getBoundingClientRect().height <= min + 2;
  setRouteDrawerHeight(isCollapsed ? max : min);
}

routeDrawerHandle.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  routeDrawerIsDragging = true;
  routeDrawerWasDragged = false;
  routeDrawerDragStartY = event.clientY;
  routeDrawerDragStartHeight = routeDrawer.getBoundingClientRect().height;
  routeDrawer.classList.add("is-dragging");
  routeDrawerHandle.setPointerCapture(event.pointerId);
  event.preventDefault();
});

routeDrawerHandle.addEventListener("pointermove", (event) => {
  if (!routeDrawerIsDragging) return;

  const dragDistance = routeDrawerDragStartY - event.clientY;
  if (Math.abs(dragDistance) > 4) routeDrawerWasDragged = true;
  setRouteDrawerHeight(routeDrawerDragStartHeight + dragDistance);
});

function finishRouteDrawerDrag(event) {
  if (!routeDrawerIsDragging) return;

  routeDrawerIsDragging = false;
  routeDrawer.classList.remove("is-dragging");
  if (routeDrawerHandle.hasPointerCapture(event.pointerId)) routeDrawerHandle.releasePointerCapture(event.pointerId);
}

routeDrawerHandle.addEventListener("pointerup", finishRouteDrawerDrag);
routeDrawerHandle.addEventListener("pointercancel", finishRouteDrawerDrag);
routeDrawerHandle.addEventListener("click", () => {
  if (routeDrawerWasDragged) {
    routeDrawerWasDragged = false;
    return;
  }
  toggleRouteDrawer();
});

window.addEventListener("resize", () => {
  if (!routeDrawerHasCustomHeight || !mapLayout.offsetParent) return;
  setRouteDrawerHeight(routeDrawer.getBoundingClientRect().height);
});

function openSheet(sheetId) {
  const trigger = document.activeElement;
  closeSheet(false);
  const sheet = document.querySelector(`#${sheetId}`);
  if (!sheet) return;

  appState.openSheet = sheetId;
  focusBeforeSheet = trigger;
  scrim.hidden = false;
  scrim.dataset.state = "open";
  sheet.hidden = false;
  sheet.dataset.state = "open";
  document.querySelector(".app-frame").classList.add("sheet-is-open");
  document.querySelectorAll(`[data-sheet-open="${sheetId}"]`).forEach((button) => {
    button.setAttribute("aria-expanded", "true");
  });
  sheet.querySelector(focusableSelector)?.focus();
  setPageInert(true);
}

function closeSheet(restoreFocus = true) {
  if (!appState.openSheet) return;
  const sheet = document.querySelector(`#${appState.openSheet}`);
  if (sheet) {
    sheet.hidden = true;
    sheet.dataset.state = "closed";
  }
  document.querySelectorAll(`[data-sheet-open="${appState.openSheet}"]`).forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
  scrim.hidden = true;
  scrim.dataset.state = "closed";
  setPageInert(false);
  document.querySelector(".app-frame").classList.remove("sheet-is-open");
  appState.openSheet = null;
  if (restoreFocus && focusBeforeSheet instanceof HTMLElement) focusBeforeSheet.focus();
  focusBeforeSheet = null;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function initializePreferences() {
  document.querySelectorAll("[data-preference]").forEach((input) => {
    input.checked = Boolean(appState.preferences[input.dataset.preference]);
  });
  document.documentElement.classList.toggle("large-text", appState.preferences.largeText);
  updateAccessibleRoute(appState.preferences.stepFree, false);
}

screenTargetButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.screenTarget));
});

ticketButtons.forEach((button) => {
  button.addEventListener("click", () => selectTicket(button.dataset.ticket));
});
enableTabKeyboardNavigation(ticketButtons);

destinationButtons.forEach((button) => {
  button.addEventListener("click", () => chooseDestination(button.dataset.destination));
});
enableTabKeyboardNavigation(destinationButtons);

document.querySelectorAll("[data-navigate]").forEach((button) => {
  button.addEventListener("click", () => navigateTo(button.dataset.navigate));
});

document.querySelectorAll("[data-sheet-open]").forEach((button) => {
  button.setAttribute("aria-controls", button.dataset.sheetOpen);
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => openSheet(button.dataset.sheetOpen));
});

document.querySelectorAll("[data-sheet-close]").forEach((button) => {
  button.addEventListener("click", () => closeSheet());
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

scrim.addEventListener("click", () => closeSheet());

accessibleRouteToggle.addEventListener("change", () => {
  updateAccessibleRoute(accessibleRouteToggle.checked);
});

document.querySelectorAll("[data-preference]").forEach((input) => {
  input.addEventListener("change", () => {
    const preference = input.dataset.preference;
    appState.preferences[preference] = input.checked;
    savePreferences();

    if (preference === "largeText") {
      document.documentElement.classList.toggle("large-text", input.checked);
    }

    if (preference === "stepFree") {
      updateAccessibleRoute(input.checked, false);
    }

    showToast("Your accessibility preference was saved.");
  });
});

document.querySelector(".recenter-button").addEventListener("click", () => {
  showToast("Map centered on your location near Gate 4.");
});

document.querySelector("#start-route-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isActive = button.dataset.active === "true";
  button.dataset.active = String(!isActive);
  button.innerHTML = isActive
    ? '<svg><use href="#icon-route"></use></svg> Start route'
    : '<svg><use href="#icon-check"></use></svg> Route in progress';
  showToast(isActive ? "Navigation paused." : "Navigation started. Watch for live crowd updates.");
});

document.querySelector("#confirm-escort-button").addEventListener("click", () => {
  document.querySelector("#concierge-availability").hidden = false;
  closeSheet();
  showToast("Escort requested. Maya will meet you near Gate 4 in 2 minutes.");
});

document.querySelector("#add-to-wallet-button").addEventListener("click", () => {
  const ticket = tickets[appState.selectedTicket];
  ticket.inWallet = true;
  selectTicket(appState.selectedTicket);
  showToast(`${ticket.label}’s ticket was added to Apple Wallet.`);
});

document.querySelector("#send-ticket-button").addEventListener("click", async () => {
  const ticket = tickets[appState.selectedTicket];
  const shareData = {
    title: "Michigan Football ticket",
    text: `${ticket.label}’s ticket — MI State vs Michigan, ${ticket.section}, Row ${ticket.row}, Seat ${ticket.seat}. Held by ${ticket.holder}.`,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      showToast(`${ticket.label}’s ticket was shared.`);
    } catch (error) {
      if (error.name !== "AbortError") showToast("Ticket sharing is unavailable right now.");
    }
    return;
  }

  showToast(`${ticket.label}’s ticket is ready to send from a supported mobile device.`);
});

document.querySelector("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#chat-input");
  const text = input.value.trim();
  if (!text) return;

  const message = document.createElement("div");
  message.className = "message sent";
  message.textContent = text;
  const time = document.createElement("time");
  time.textContent = "Now";
  message.append(time);
  document.querySelector("#chat-messages").append(message);
  message.scrollIntoView({ behavior: "smooth", block: "end" });
  input.value = "";
});

document.addEventListener("keydown", (event) => {
  if (!appState.openSheet) return;

  if (event.key === "Escape") {
    closeSheet();
    return;
  }

  if (event.key === "Tab") {
    const sheet = document.querySelector(`#${appState.openSheet}`);
    const focusableElements = [...sheet.querySelectorAll(focusableSelector)].filter(
      (element) => !element.closest("[hidden]"),
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
});

initializePreferences();
selectTicket("gerald");
chooseDestination("seat");
