/* =========================
🔥 FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyBFR4p-kM0vetj9dP8Q5J_ClZSFHa_ZEMM",
  authDomain: "pictureperfectcreations-5c37e.firebaseapp.com",
  projectId: "pictureperfectcreations-5c37e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/* ================= CLOUDINARY ================= */
const CLOUD_NAME = "dlc75iidz";
const UPLOAD_PRESET = "ml_default";

/* ================= ADMINS ================= */
const admins = ["your@email.com"];

/* ================= AUTH ================= */
function openAuth() {
  authModal.style.display = "flex";
}

function closeAuth() {
  authModal.style.display = "none";
}

function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(closeAuth);
}

function emailLogin() {
  auth.signInWithEmailAndPassword(email.value, password.value)
    .then(closeAuth);
}

function emailSignup() {
  auth.createUserWithEmailAndPassword(email.value, password.value);
}

/* ================= ADMIN CHECK ================= */
auth.onAuthStateChanged(user => {
  const btn = document.getElementById("addBtn");
  if (!btn) return;

  if (user && admins.includes(user.email)) {
    btn.style.display = "flex";
  } else {
    btn.style.display = "none";
  }
});

/* ================= UPLOAD ================= */
async function uploadImage() {
  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );

  const data = await res.json();

  await db.collection("gallery").add({
    title,
    category,
    imageUrl: data.secure_url,
    createdAt: Date.now()
  });

  alert("Uploaded!");
}

/* ================= LOAD GALLERY ================= */
function loadGallery() {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  db.collection("gallery")
    .orderBy("createdAt", "desc")
    .onSnapshot(snap => {

      gallery.innerHTML = "";

      snap.forEach(doc => {
        const d = doc.data();

        const div = document.createElement("div");
        div.className = `item ${d.category}`;

        div.innerHTML = `
          <img src="${d.imageUrl}" onclick="openModal(this)">
          <p>${d.title}</p>
        `;

        gallery.appendChild(div);
      });
    });
}

document.addEventListener("DOMContentLoaded", loadGallery);

/* ================= MODAL ================= */
function openModal(img) {
  modal.style.display = "flex";
  modalImg.src = img.src;
}

function closeModal() {
  modal.style.display = "none";
}

/* ================= UPLOAD TOGGLE ================= */
if (document.getElementById("addBtn")) {
  addBtn.onclick = () => {
    uploadBox.style.display =
      uploadBox.style.display === "block" ? "none" : "block";
  };
}
