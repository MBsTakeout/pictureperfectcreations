/* =====================================================
PICTURE PERFECT CREATIONS - SCRIPT.JS (FIXED + CLEAN)
===================================================== */

/* -------------------------
🍪 COOKIE SYSTEM (FIXED)
------------------------- */

function checkCookies() {
  const choice = localStorage.getItem("cookies");

  const banner = document.getElementById("cookieBanner");

  if (!banner) return;

  if (choice === "yes" || choice === "no") {
    banner.style.display = "none";
  } else {
    banner.style.display = "block";
  }
}

function acceptCookies() {
  localStorage.setItem("cookies", "yes");
  document.getElementById("cookieBanner").style.display = "none";
}

function rejectCookies() {
  localStorage.setItem("cookies", "no");
  document.getElementById("cookieBanner").style.display = "none";
}


/* -------------------------
🌙 DARK MODE (SAVED)
------------------------- */

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "on");
  } else {
    localStorage.setItem("darkMode", "off");
  }
}

function loadDarkMode() {
  const mode = localStorage.getItem("darkMode");

  if (mode === "on") {
    document.body.classList.add("dark-mode");
  }
}


/* -------------------------
🖼️ GALLERY FILTER
------------------------- */

function filter(category) {
  const items = document.querySelectorAll(".item");

  items.forEach((item) => {
    if (category === "all") {
      item.style.display = "block";
    } else {
      item.style.display = item.classList.contains(category)
        ? "block"
        : "none";
    }
  });
}


/* -------------------------
🔍 SEARCH FUNCTION
------------------------- */

function searchItems() {
  const input = document.getElementById("search");
  if (!input) return;

  const value = input.value.toLowerCase();
  const items = document.querySelectorAll(".item");

  items.forEach((item) => {
    const text = item.innerText.toLowerCase();

    if (text.includes(value)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}


/* -------------------------
🖼️ IMAGE POPUP (MODAL)
------------------------- */

function openModal(el) {
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (!modal || !modalImg) return;

  const img = el.querySelector("img");

  modal.style.display = "flex";
  modalImg.src = img.src;
}

function closeModal() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.style.display = "none";
  }
}


/* -------------------------
🚀 INIT (RUN ON PAGE LOAD)
------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  checkCookies();
  loadDarkMode();
});