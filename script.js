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

/* ================= FILTER STATE ================= */
let currentCategory = "all";
let currentSearch = "";

/* ================= AUTH MODAL ================= */
function openAuth(){
  document.getElementById("authModal").style.display = "flex";
}

function closeAuth(){
  document.getElementById("authModal").style.display = "none";
}

/* ================= SIGN UP ================= */
function emailSignup(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Account created"))
    .catch(err => alert(err.message));
}

/* ================= LOGIN ================= */
function emailLogin(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => closeAuth())
    .catch(err => alert(err.message));
}

/* ================= GOOGLE LOGIN ================= */
function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(() => closeAuth())
    .catch(err => alert(err.message));
}

/* ================= UI UPDATE ================= */
function updateUI(user){

  const btn = document.getElementById("authBtn");
  const addBtn = document.getElementById("addBtn");

  if (!btn) return;

  if (!user){
    btn.innerHTML = "Sign in";
    btn.onclick = openAuth;
    if (addBtn) addBtn.style.display = "none";
    return;
  }

  btn.innerHTML = user.photoURL
    ? `<img src="${user.photoURL}" style="width:25px;height:25px;border-radius:50%">`
    : "Profile";

  btn.onclick = null;

  if (addBtn){
    addBtn.style.display =
      admins.includes(user.email) ? "flex" : "none";
  }

  toggleAdminControls(user);
}

/* ================= AUTH STATE ================= */
auth.onAuthStateChanged(user => {
  updateUI(user);
});

/* ================= CLOUDINARY UPLOAD ================= */
async function uploadImage(){

  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  if (!file) return alert("Select a file");

  const form = new FormData();
  form.append("file", file);
  form.append("dlc75iidz", "Hhggbbhj");

  try {

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlc75iidz/image/upload",
      { method: "POST", body: form }
    );

    const data = await res.json();

    if (!data.secure_url){
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

  } catch(err){
    console.error(err);
  }
}

/* ================= LOAD GALLERY ================= */
function loadGallery(){

  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  db.collection("gallery")
    .orderBy("createdAt","desc")
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

          <div class="admin-controls">
            <button onclick="editImage('${id}', '${d.title}')">Edit</button>
            <button onclick="deleteImage('${id}')">Delete</button>
          </div>
        `;

        gallery.appendChild(div);

        setTimeout(applyFilters, 50);
      });

    });
}

/* ================= EDIT ================= */
async function editImage(id, oldTitle){

  const newTitle = prompt("Edit title:", oldTitle);
  if (!newTitle) return;

  await db.collection("gallery").doc(id).update({
    title: newTitle
  });
}

/* ================= DELETE ================= */
async function deleteImage(id){

  if (!confirm("Delete?")) return;

  await db.collection("gallery").doc(id).delete();
}

/* ================= MODAL ================= */
function openModal(img){
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalImg").src = img.src;
}

function closeModal(){
  document.getElementById("modal").style.display = "none";
}

/* ================= ADMIN CONTROLS ================= */
function toggleAdminControls(user){

  document.querySelectorAll(".admin-controls").forEach(el => {
    el.style.display =
      user && admins.includes(user.email) ? "flex" : "none";
  });
}

/* ================= FILTER SYSTEM ================= */
function setCategory(cat){
  currentCategory = cat;
  applyFilters();
}

function setSearch(value){
  currentSearch = value.toLowerCase();
  applyFilters();
}

function applyFilters(){

  document.querySelectorAll(".item").forEach(item => {

    const text = item.innerText.toLowerCase();

    const matchSearch = text.includes(currentSearch);

    const matchCategory =
      currentCategory === "all" ||
      item.classList.contains(currentCategory);

    item.style.display =
      matchSearch && matchCategory ? "block" : "none";
  });
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("addBtn");
  const box = document.getElementById("uploadBox");

  if (btn && box){
    btn.onclick = () => {
      box.style.display =
        box.style.display === "block" ? "none" : "block";
    };
  }

  loadGallery();
});
