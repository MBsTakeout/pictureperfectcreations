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

const admins = ["bm015059@gmail.com"];

/* ================= AUTH ================= */
function openAuth() {
  document.getElementById("authModal").style.display = "flex";
}

function closeAuth() {
  document.getElementById("authModal").style.display = "none";
}

/* ================= SIGN UP / LOGIN FIXED ================= */
function emailSignup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Account created! Now sign in"))
    .catch(err => alert(err.message));
}

function emailLogin() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => closeAuth())
    .catch(err => alert(err.message));
}

function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(() => closeAuth())
    .catch(err => alert(err.message));
}

/* ================= UI UPDATE ================= */
function updateUI(user) {
  const btn = document.getElementById("authBtn");
  const addBtn = document.getElementById("addBtn");

  if (!btn) return;

  if (!user) {
    btn.innerHTML = "Sign in";
    btn.onclick = openAuth;
    if (addBtn) addBtn.style.display = "none";
    return;
  }

  btn.innerHTML = user.photoURL
    ? `<img src="${user.photoURL}" style="width:28px;height:28px;border-radius:50%">`
    : "Profile";

  btn.onclick = closeAuth;

  if (addBtn) {
    addBtn.style.display = admins.includes(user.email) ? "flex" : "none";
  }

  toggleAdminControls(user);
}

auth.onAuthStateChanged(user => {
  updateUI(user);
});

/* ================= CLOUDINARY UPLOAD FIXED ================= */
async function uploadImage() {

  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  if (!file) return alert("Select a file first");

  const form = new FormData();
  form.append("file", file);
  form.append("dlc75iidz", "Hhggbbhj"); // MUST be unsigned in Cloudinary

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlc75iidz/image/upload",
      { method: "POST", body: form }
    );

    const data = await res.json();

    if (!data.secure_url) {
      console.log(data);
      return alert("Upload failed");
    }

    await db.collection("gallery").add({
      title: title || "Untitled",
      category: category || "uncategorized",
      imageUrl: data.secure_url,
      createdAt: Date.now()
    });

    alert("Uploaded!");
    document.getElementById("uploadBox").style.display = "none";

  } catch (err) {
    console.error(err);
    alert("Upload error");
  }
}

/* ================= LOAD GALLERY ================= */
function loadGallery() {
  const gallery = document.getElementById("gallery");
  const loading = document.getElementById("loadingText");

  if (!gallery) return;

  db.collection("gallery")
    .orderBy("createdAt", "desc")
    .onSnapshot(snap => {

      gallery.innerHTML = "";

      snap.forEach(doc => {
        const d = doc.data();
        const id = doc.id;

        const div = document.createElement("div");
        div.className = `item ${d.category}`;

        div.innerHTML = `
          <img src="${d.imageUrl}" onclick="openModal(this)">
          <p>${d.title}</p>

          <div class="admin-controls" data-id="${id}">
            <button onclick="editImage('${id}', '${d.title}')">Edit</button>
            <button onclick="deleteImage('${id}')">Delete</button>
          </div>
        `;

        gallery.appendChild(div);
      });

      if (loading) loading.style.display = "none";
    });
}

/* ================= SEARCH ================= */
function searchItems() {
  const input = document.getElementById("search");
  const value = input.value.toLowerCase();
  const items = document.querySelectorAll(".item");

  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    item.style.display = text.includes(value) ? "block" : "none";
  });
}

/* ================= CATEGORY FILTER ================= */
function filter(category) {
  const items = document.querySelectorAll(".item");

  items.forEach(item => {
    item.style.display =
      category === "all" || item.classList.contains(category)
        ? "block"
        : "none";
  });
}

/* ================= EDIT ================= */
async function editImage(id, oldTitle) {
  const newTitle = prompt("Edit title:", oldTitle);
  if (!newTitle) return;

  await db.collection("gallery").doc(id).update({
    title: newTitle
  });
}

/* ================= DELETE ================= */
async function deleteImage(id) {
  if (!confirm("Delete this image?")) return;

  await db.collection("gallery").doc(id).delete();
}

/* ================= ADMIN CONTROLS ================= */
function toggleAdminControls(user) {
  document.querySelectorAll(".admin-controls").forEach(el => {
    el.style.display =
      user && admins.includes(user.email) ? "flex" : "none";
  });
}

/* ================= MODAL ================= */
function openModal(img) {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalImg").src = img.src;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("addBtn");
  const box = document.getElementById("uploadBox");

  if (btn && box) {
    btn.onclick = () => {
      box.style.display =
        box.style.display === "block" ? "none" : "block";
    };
  }

  loadGallery();
});
