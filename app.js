// Initialize syntax highlighting (only if hljs is loaded on this page)
if (typeof hljs !== "undefined") hljs.highlightAll();

// ── Sidebar toggle ────────────────────────────────────────────
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const overlay = document.getElementById("sidebarOverlay");
const isMobile = () => window.innerWidth <= 900;

let sidebarOpen = !isMobile();

function setSidebar(open) {
  sidebarOpen = open;
  sidebar.classList.toggle("collapsed", !open);
  document.body.classList.toggle("sidebar-open", open);
  // Show/hide overlay on mobile
  if (overlay) {
    if (open && isMobile()) {
      overlay.style.display = "block";
      requestAnimationFrame(() => overlay.classList.add("visible"));
    } else {
      overlay.classList.remove("visible");
      // Wait for fade-out transition before hiding
      setTimeout(() => {
        if (overlay.classList.contains("visible") === false) overlay.style.display = "none";
      }, 220);
    }
  }
  localStorage.setItem("sidebarOpen", open ? "1" : "0");
}

// Restore state — but always collapse on mobile regardless of saved state
const savedState = localStorage.getItem("sidebarOpen");
if (isMobile()) {
  setSidebar(false);
} else if (savedState === null) {
  setSidebar(true);
} else {
  setSidebar(savedState === "1");
}

sidebarToggle.addEventListener("click", () => setSidebar(!sidebarOpen));

// Close sidebar when clicking the overlay
if (overlay) {
  overlay.addEventListener("click", () => setSidebar(false));
}

// Close on nav link click (mobile)
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    if (isMobile()) setSidebar(false);
  });
});

// Re-evaluate on window resize
window.addEventListener("resize", () => {
  if (!isMobile() && !sidebarOpen) {
    setSidebar(true);
  } else if (isMobile() && sidebarOpen) {
    setSidebar(false);
  }
});

// ── Progress bar ──────────────────────────────────────────────
const progressBar = document.getElementById("progressBar");
const main = document.getElementById("main");

if (main && progressBar) {
  main.addEventListener("scroll", () => {
    const scrollTop = main.scrollTop;
    const scrollHeight = main.scrollHeight - main.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = progress + "%";
  }, { passive: true });
}

// ── Active nav link on scroll ─────────────────────────────────
const sections = Array.from(document.querySelectorAll(".section[id], .hero[id]"));
const navLinks = document.querySelectorAll(".nav-link[data-section]");

if (sections.length > 0 && navLinks.length > 0 && main) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle("active", link.dataset.section === entry.target.id);
          });
        }
      });
    },
    {
      root: main,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    }
  );
  sections.forEach(s => observer.observe(s));
}

// ── Smooth scroll for nav links (scroll inside .main) ─────────
document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ── Q&A accordion ─────────────────────────────────────────────
document.querySelectorAll(".qa-item").forEach(item => {
  const question = item.querySelector(".qa-question");
  if (!question) return;
  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".qa-item.open").forEach(i => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  });
});

// ── Search ────────────────────────────────────────────────────
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    navLinks.forEach(link => {
      if (!query) {
        link.classList.remove("hidden");
      } else {
        const text = link.textContent.toLowerCase();
        link.classList.toggle("hidden", !text.includes(query));
      }
    });

    document.querySelectorAll(".nav-section").forEach(section => {
      const visibleLinks = section.querySelectorAll(".nav-link:not(.hidden)");
      section.style.display = visibleLinks.length === 0 && query ? "none" : "";
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === "Escape") {
      searchInput.blur();
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
    }
  });
}

// ── Scroll main to top on page load ───────────────────────────
window.addEventListener("load", () => {
  if (main) main.scrollTop = 0;
});
