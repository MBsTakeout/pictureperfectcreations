const firebaseConfig = {
  apiKey: "AIzaSyBFR4p-kM0vetj9dP8Q5J_ClZSFHa_ZEMM",
  authDomain: "pictureperfectcreations-5c37e.firebaseapp.com",
  projectId: "pictureperfectcreations-5c37e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

/* ================= ADMINS ================= */
const admins = ["bm015059@gmail.com"];

/* ================= AUTH MODAL ================= */
function openAuth() {
  document.getElementById("authModal").style.display = "flex";
}

function closeAuth() {
  document.getElementById("authModal").style.display = "none";
}

/* ================= AUTH ================= */
function emailSignup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Account created. Now sign in."))
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
  const box = document.getElementById("uploadBox");

  if (!btn) return;

  if (!user) {
    btn.innerHTML = "Sign in";
    btn.onclick = openAuth;

    if (addBtn) addBtn.style.display = "none";
    return;
  }

  // PROFILE BUTTON
  btn.innerHTML = user.photoURL
    ? `<img src="${user.photoURL}" style="width:25px;height:25px;border-radius:50%">`
    : `<span style="opacity:0.6">Profile</span>`;

  btn.onclick = () => auth.signOut();

  // ADMIN + BUTTON
  if (addBtn) {
    addBtn.style.display = admins.includes(user.email) ? "flex" : "none";
  }

  toggleAdminControls(user);
}

/* ================= AUTH STATE ================= */
auth.onAuthStateChanged(user => {
  updateUI(user);
});

/* ================= CLOUDINARY UPLOAD ================= */
async function uploadImage() {

  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  if (!file) return alert("Select a file first");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "Hhggbbhj"); // MUST be unsigned

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
      category,
      imageUrl: data.secure_url,
      createdAt: Date.now()
    });

    alert("Uploaded!");

  } catch (err) {
    console.error(err);
    alert("Upload error");
  }
}

/* ================= LOAD GALLERY ================= */
function loadGallery() {

  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  db.collection("gallery")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {

      const loading = document.getElementById("loadingText");
      if (loading) loading.style.display = "none";

      gallery.innerHTML = "";

      snapshot.forEach(doc => {
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

      auth.currentUser && toggleAdminControls(auth.currentUser);
    });
}

/* ================= SEARCH ================= */
function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", e => {
    const val = e.target.value.toLowerCase();

    document.querySelectorAll(".item").forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(val) ? "block" : "none";
    });
  });
}

/* ================= CATEGORY FILTER ================= */
function filterCategory(cat) {
  document.querySelectorAll(".item").forEach(item => {
    if (cat === "all") {
      item.style.display = "block";
    } else {
      item.style.display = item.classList.contains(cat) ? "block" : "none";
    }
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
  if (!confirm("Delete image?")) return;

  await db.collection("gallery").doc(id).delete();
}

/* ================= MODAL ================= */
function openModal(img) {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalImg").src = img.src;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

/* ================= ADMIN CONTROLS ================= */
function toggleAdminControls(user) {
  document.querySelectorAll(".admin-controls").forEach(el => {
    el.style.display =
      user && admins.includes(user.email) ? "flex" : "none";
  });
}

/* ================= + BUTTON ================= */
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
  setupSearch();
});
