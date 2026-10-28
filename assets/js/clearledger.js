/* Clearledger. Mechanics adapted from MIT Nookwell / Taskline Lite; complete grants retained in licenses/. */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const desktopInput = matchMedia("(hover: hover) and (pointer: fine)");
  const menuBreakpoint = matchMedia("(min-width: 900px)");
  const main = document.getElementById("main");
  const footer = document.getElementById("site-footer");
  const toggle = document.getElementById("menu-toggle");
  const panel = document.getElementById("mobile-menu");
  const menuScroll = document.getElementById("menu-scroll");
  let draftSmooth, draftBar;
  let pageSmooth,
    menuSmooth,
    menuOpen = false,
    menuClosing = false;
  let menuTimer,
    menuRevision = 0,
    lockY = 0,
    locked = false,
    savedOverflow = "";
  let pageBar, menuBar;

  // All active Lenis regions share this one millisecond animation clock.
  const scrollers = new Set();
  let clock = 0;
  function tick(time) {
    for (const scroller of scrollers) scroller.raf(time);
    clock = scrollers.size ? requestAnimationFrame(tick) : 0;
  }
  function register(scroller) {
    scrollers.add(scroller);
    if (!clock) clock = requestAnimationFrame(tick);
    return scroller;
  }
  function destroy(scroller) {
    if (!scroller) return;
    scrollers.delete(scroller);
    scroller.destroy();
    if (!scrollers.size && clock) {
      cancelAnimationFrame(clock);
      clock = 0;
    }
  }
  function smoothFor(wrapper) {
    if (
      reduced.matches ||
      !desktopInput.matches ||
      typeof window.Lenis !== "function"
    )
      return;
    try {
      return register(
        new window.Lenis({
          ...(wrapper ? { wrapper, content: wrapper.firstElementChild } : {}),
          autoRaf: false,
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.12,
          anchors: false,
          prevent: (node) =>
            node.closest?.(".scroll-rail") ||
            node.closest?.("textarea,input,[contenteditable=true]") ||
            (!wrapper && node.closest?.("#mobile-menu, #draft-scroll")),
        }),
      );
    } catch {
      return undefined;
    }
  }
  function configureMotion() {
    destroy(pageSmooth);
    destroy(menuSmooth);
    destroy(draftSmooth);
    draftSmooth = !document.getElementById("draft-result").hidden
      ? smoothFor(document.getElementById("draft-scroll"))
      : undefined;
    pageSmooth = smoothFor();
    menuSmooth = menuOpen ? smoothFor(menuScroll) : undefined;
    if (locked) pageSmooth?.stop();
  }
  configureMotion();
  reduced.addEventListener("change", configureMotion);
  desktopInput.addEventListener("change", configureMotion);

  function focusTarget(target) {
    if (target && !target.matches("a,button,input,textarea,summary,[tabindex]"))
      target.tabIndex = -1;
    target?.focus({ preventScroll: true });
  }
  function goTo(hash, focusAfter) {
    let target;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return;
    }
    if (!target) return;
    if (location.hash !== hash) history.pushState(null, "", hash);
    if (pageSmooth && !reduced.matches) {
      pageSmooth.scrollTo(target, {
        duration: 0.8,
        onComplete: () => focusTarget(focusAfter || target),
      });
    } else {
      target.scrollIntoView({
        block: "start",
        behavior: reduced.matches ? "instant" : "smooth",
      });
      focusTarget(focusAfter || target);
    }
  }

  // A replacement is installed only after its geometry and handlers exist.
  function installScrollbar(region, label, host) {
    const page = region === window;
    const rail = document.createElement("div");
    rail.className = "scroll-rail" + (page ? "" : " scroll-rail--local");
    const thumb = document.createElement("div");
    thumb.className = "scroll-thumb";
    thumb.setAttribute("role", "scrollbar");
    thumb.setAttribute("aria-label", label);
    thumb.setAttribute("aria-orientation", "vertical");
    thumb.setAttribute("aria-controls", page ? "page-scroll" : region.id);
    thumb.setAttribute("aria-valuemin", "0");
    thumb.tabIndex = 0;
    rail.append(thumb);
    host.append(rail);
    let idle,
      max = 0,
      travel = 0,
      grab = 0,
      dragging = false;
    const current = () => (page ? window.scrollY : region.scrollTop);
    function activity() {
      rail.classList.add("is-active");
      clearTimeout(idle);
      idle = setTimeout(() => rail.classList.remove("is-active"), 1000);
    }
    function update() {
      const viewport = page ? innerHeight : region.clientHeight;
      const total = page
        ? Math.max(root.scrollHeight, document.body.scrollHeight)
        : region.scrollHeight;
      max = Math.max(0, total - viewport);
      rail.hidden =
        max <= 1 ||
        (page && locked) ||
        (!page &&
          (!!region.closest("[hidden]") ||
            (!!region.closest("dialog") && !region.closest("dialog").open)));
      if (rail.hidden) {
        thumb.tabIndex = -1;
        return;
      }
      thumb.tabIndex = 0;
      const track = rail.clientHeight;
      const size = Math.min(track, Math.max(28, (track * viewport) / total));
      travel = Math.max(0, track - size);
      thumb.style.height = size + "px";
      thumb.style.transform = `translateY(${max ? Math.min(1, current() / max) * travel : 0}px)`;
      thumb.setAttribute("aria-valuemax", String(Math.round(max)));
      thumb.setAttribute(
        "aria-valuenow",
        String(Math.round(Math.min(max, Math.max(0, current())))),
      );
      thumb.setAttribute(
        "aria-valuetext",
        `${max ? Math.round((current() / max) * 100) : 0}%`,
      );
    }
    function setScroll(value) {
      const next = Math.max(0, Math.min(max, value));
      const smooth = page
        ? pageSmooth
        : region.id === "menu-scroll"
          ? menuSmooth
          : draftSmooth;
      if (smooth) smooth.scrollTo(next, { immediate: true, force: true });
      else if (page) window.scrollTo({ top: next, behavior: "instant" });
      else region.scrollTop = next;
      update();
      activity();
    }
    thumb.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      focusTarget(thumb);
      update();
      grab = event.clientY - thumb.getBoundingClientRect().top;
      dragging = true;
      rail.classList.add("is-dragging");
      thumb.setPointerCapture(event.pointerId);
      activity();
    });
    thumb.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const y = event.clientY - rail.getBoundingClientRect().top - grab;
      setScroll(travel ? (y / travel) * max : 0);
    });
    const endDrag = () => {
      dragging = false;
      rail.classList.remove("is-dragging");
      activity();
    };
    thumb.addEventListener("pointerup", endDrag);
    thumb.addEventListener("pointercancel", endDrag);
    thumb.addEventListener("lostpointercapture", endDrag);
    thumb.addEventListener("keydown", (event) => {
      const viewport = page ? innerHeight : region.clientHeight;
      const delta = {
        ArrowUp: -40,
        ArrowDown: 40,
        PageUp: -viewport * 0.85,
        PageDown: viewport * 0.85,
      };
      if (event.key in delta || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        setScroll(
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? max
              : current() + delta[event.key],
        );
      }
    });
    region.addEventListener(
      "scroll",
      () => {
        update();
        activity();
      },
      { passive: true },
    );
    window.addEventListener("resize", update, { passive: true });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(update);
      observer.observe(page ? document.body : region.firstElementChild);
    }
    update();
    (page ? root : region).classList.add(
      page ? "has-page-scrollbar" : "has-local-scrollbar",
    );
    return { update };
  }
  try {
    pageBar = installScrollbar(window, "Page scroll", document.body);
  } catch {
    root.classList.remove("has-page-scrollbar");
  }
  try {
    menuBar = installScrollbar(menuScroll, "Navigation scroll", panel);
  } catch {
    menuScroll.classList.remove("has-local-scrollbar");
  }

  function lockBackground() {
    if (locked) return;
    locked = true;
    lockY = window.scrollY;
    savedOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    pageSmooth?.stop();
    main.inert = true;
    footer.inert = true;
    document.querySelectorAll("#site-header a").forEach((link) => { link.inert = true; });
    pageBar?.update();
  }
  function unlockBackground() {
    root.style.overflow = savedOverflow;
    main.inert = false;
    footer.inert = false;
    document.querySelectorAll("#site-header a").forEach((link) => { link.inert = false; });
    locked = false;
    // No fixed-body layout substitution: native scroll position stays intact.
    if (Math.abs(window.scrollY - lockY) > 1)
      window.scrollTo({ top: lockY, behavior: "instant" });
    pageSmooth?.start();
    pageBar?.update();
  }
  function openMenu() {
    clearTimeout(menuTimer);
    ++menuRevision;
    menuOpen = true;
    menuClosing = false;
    panel.hidden = false;
    panel.inert = false;
    panel.classList.remove("is-closing");
    lockBackground();
    // Commit the offscreen start state before the reversible CSS transition.
    panel.getBoundingClientRect();
    root.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    destroy(menuSmooth);
    menuSmooth = smoothFor(menuScroll);
    menuBar?.update();
    focusTarget(panel.querySelector("nav a"));
  }
  function closeMenu(after, immediate = false) {
    if (!menuOpen && !menuClosing) {
      after?.();
      return;
    }
    clearTimeout(menuTimer);
    const revision = ++menuRevision;
    menuOpen = false;
    menuClosing = true;
    panel.classList.add("is-closing");
    panel.inert = true;
    root.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    const finish = () => {
      if (revision !== menuRevision) return;
      menuClosing = false;
      panel.hidden = true;
      panel.classList.remove("is-closing");
      destroy(menuSmooth);
      menuSmooth = undefined;
      unlockBackground();
      menuBar?.update();
      if (after) after();
      else
        focusTarget(
          toggle.offsetParent
            ? toggle
            : document.querySelector(".primary-nav a"),
        );
    };
    if (immediate || reduced.matches) finish();
    else menuTimer = setTimeout(finish, 280);
  }
  toggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener("keydown", (event) => {
    if (!menuOpen && !menuClosing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === "Tab") {
      const controls = [
        toggle,
        ...panel.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex="0"]',
        ),
      ];
      const at = controls.indexOf(document.activeElement);
      if (event.shiftKey && at <= 0) {
        event.preventDefault();
        focusTarget(controls.at(-1));
      } else if (!event.shiftKey && (at === controls.length - 1 || at < 0)) {
        event.preventDefault();
        focusTarget(toggle);
      }
    }
  });
  menuBreakpoint.addEventListener("change", () => {
    if (menuBreakpoint.matches) closeMenu(null, true);
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      !link ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    const hash = link.getAttribute("href");
    if (!hash || hash === "#") return;
    event.preventDefault();
    if (panel.contains(link)) closeMenu(() => goTo(hash));
    else goTo(hash);
  });
  // Native keyboard/drag input interrupts any in-flight eased page travel.
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        locked ||
        ![
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key) ||
        event.target.closest("input,textarea,button,summary,[role=scrollbar]")
      )
        return;
      pageSmooth?.scrollTo(window.scrollY, { immediate: true });
    },
    true,
  );
  toggle.hidden = false;
  root.classList.add("enhanced");

  document.querySelectorAll(".faq-item").forEach((details) => {
    const summary = details.querySelector("summary");
    const answer = details.querySelector(".faq-answer");
    if (!details.animate) return;
    let expanded = details.open,
      animation,
      revision = 0;
    function change(next) {
      const version = ++revision;
      const start = details.getBoundingClientRect().height;
      animation?.cancel();
      animation = undefined;
      expanded = next;
      details.open = true;
      details.dataset.expanded = String(next);
      details.style.height = "auto";
      const border =
        parseFloat(getComputedStyle(details).borderBottomWidth) || 0;
      const end = next
        ? details.getBoundingClientRect().height
        : summary.getBoundingClientRect().height + border;
      if (reduced.matches) {
        details.open = next;
        details.style.height = "";
        details.style.overflow = "";
        return;
      }
      details.style.height = start + "px";
      details.style.overflow = "hidden";
      animation = details.animate(
        [{ height: start + "px" }, { height: end + "px" }],
        {
          duration: Math.min(240, 180 + Math.abs(end - start) * 0.15),
          easing: "cubic-bezier(.22,.61,.36,1)",
          fill: "both",
        },
      );
      animation.onfinish = () => {
        if (version !== revision) return;
        details.open = expanded;
        details.style.height = "";
        details.style.overflow = "";
        animation?.cancel();
        animation = undefined;
      };
    }
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      change(!expanded);
    });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        if (animation) change(expanded);
      });
      observer.observe(answer);
      observer.observe(summary);
    }
    reduced.addEventListener("change", () => {
      if (animation) change(expanded);
    });
  });
  document.fonts?.ready.then(() => {
    pageBar?.update();
    menuBar?.update();
  });
  // Deep links work after fonts/layout settle, without a decorative entrance.
  window.addEventListener("load", () => {
    if (location.hash && location.hash !== "#top") {
      let target;
      try {
        target = document.getElementById(
          decodeURIComponent(location.hash.slice(1)),
        );
      } catch {
        return;
      }
      if (target) {
        if (pageSmooth) pageSmooth.scrollTo(target, { immediate: true });
        else target.scrollIntoView({ block: "start", behavior: "instant" });
      }
    }
  });
  const scopeChoices = document.getElementById("scope-choices");
  const scopeSummary = document.getElementById("scope-summary");
  const scopeList = document.getElementById("scope-list");
  const scopeCount = document.getElementById("scope-count");
  const useScope = document.getElementById("use-scope");
  const scopeDescription = document.getElementById("enquiry-scope");
  const form = document.getElementById("enquiry-form");
  const businessField = document.getElementById("business-type");
  const messageField = document.getElementById("enquiry-message");
  const result = document.getElementById("draft-result");
  const draftScroll = document.getElementById("draft-scroll");
  const draftText = document.getElementById("draft-text");
  const status = document.getElementById("copy-status");
  function selectedScope() {
    return [...scopeChoices.querySelectorAll("input:checked")].map((input) => input.value);
  }
  function invalidateDraft() {
    if (result.hidden) return;
    result.hidden = true;
    draftText.textContent = "";
    status.textContent = "";
    destroy(draftSmooth);
    draftSmooth = undefined;
    draftBar?.update();
    pageSmooth?.resize();
    pageBar?.update();
  }
  function updateScope() {
    const scope = selectedScope();
    scopeList.replaceChildren(...scope.map((task) => {
      const li = document.createElement("li");
      li.textContent = task;
      return li;
    }));
    document.getElementById("scope-empty").hidden = scope.length !== 0;
    const countBadge = document.createElement("span");
    countBadge.className = "scope-count-badge";
    countBadge.textContent = String(scope.length);
    scopeCount.replaceChildren(countBadge, document.createTextNode(`${scope.length === 1 ? "task" : "tasks"} selected`));
    scopeDescription.textContent = scope.length ? `Selected scope: ${scope.join(", ")}.` : "Selected scope: help me decide.";
    useScope.textContent = scope.length ? "Use this scope" : "Ask for help deciding";
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("class", "arrow");
    icon.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#icon-arrow");
    icon.append(use);
    useScope.append(icon);
    invalidateDraft();
    pageSmooth?.resize();
    pageBar?.update();
  }
  scopeSummary.hidden = false;
  scopeChoices.addEventListener("change", updateScope);
  updateScope();
  function sizeMessage() {
    messageField.style.height = "auto";
    messageField.style.height = Math.max(180, messageField.scrollHeight + 2) + "px";
  }
  window.addEventListener("resize", sizeMessage, { passive: true });
  document.fonts?.ready.then(sizeMessage);
  form.addEventListener("input", () => {
    businessField.setCustomValidity("");
    sizeMessage();
    invalidateDraft();
  });
  document.querySelectorAll("[data-arrangement]").forEach((link) => {
    link.addEventListener("click", () => {
      const choice = [...form.querySelectorAll('[name="arrangement"]')].find((input) => input.value === link.dataset.arrangement);
      if (choice) choice.checked = true;
      invalidateDraft();
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const business = String(data.get("business")).trim();
    if (!business) {
      businessField.setCustomValidity("Describe the kind of business you run.");
      businessField.reportValidity();
      return;
    }
    const scope = selectedScope();
    const message = String(data.get("message")).trim();
    draftText.textContent = `Unsent bookkeeping enquiry\n\nBusiness: ${business}\nSupport: ${data.get("arrangement")}\n\nTasks to discuss:\n${scope.length ? scope.map((task) => "- " + task).join("\n") : "- Help me decide the right starting scope"}\n\n${message || "I would like to understand the scope and next steps for bookkeeping support."}\n\nPlease confirm suitable coverage, the records needed, your fee and availability before any work is agreed. No financial records or credentials are included in this draft.\n\nThis is an unsent enquiry, not an appointment or service agreement.`;
    status.textContent = "";
    result.hidden = false;
    draftScroll.scrollTop = 0;
    destroy(draftSmooth);
    draftSmooth = smoothFor(draftScroll);
    if (!draftBar) draftBar = installScrollbar(draftScroll, "Enquiry draft scroll", draftScroll.parentElement);
    draftBar.update();
    pageSmooth?.resize();
    pageBar?.update();
    if (pageSmooth && !reduced.matches) {
      pageSmooth.scrollTo(result, { duration: 0.65, onComplete: () => focusTarget(result) });
    } else {
      result.scrollIntoView({ behavior: reduced.matches ? "instant" : "smooth", block: "nearest" });
      focusTarget(result);
    }
  });
  // Keep the default submit disabled until its preventing draft handler exists.
  // This also blocks native implicit Enter submission when JavaScript is absent.
  const prepareDraft = document.getElementById("prepare-draft");
  prepareDraft.disabled = false;
  prepareDraft.hidden = false;
  document.getElementById("copy-draft").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draftText.textContent);
      status.textContent = "Draft copied. Nothing has been sent.";
    } catch {
      focusTarget(draftScroll);
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(draftText);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Draft selected. Copy with your keyboard or device’s copy command. Nothing has been sent.";
    }
  });
  document.getElementById("edit-draft").addEventListener("click", () => goTo("#enquiry", businessField));
})();
