const firebaseConfig = {
  apiKey: "AIzaSyBFR4p-kM0vetj9dP8Q5J_ClZSFHa_ZEMM",
  authDomain: "pictureperfectcreations-5c37e.firebaseapp.com",
  projectId: "pictureperfectcreations-5c37e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const admins = ["bm015059@gmail.com"];

/* ================= SAFE INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  const addBtn = document.getElementById("addBtn");
  const box = document.getElementById("uploadBox");

  if (addBtn) addBtn.style.display = "none";
  if (box) box.style.display = "none";

  loadGallery();
});

/* ================= AUTH MODAL ================= */

function openAuth(mode){
  const modal = document.getElementById("authModal");
  if (!modal) return;

  modal.style.display = "flex";

  const title = modal.querySelector("h2");
  if (title){
    title.innerText = mode === "signup" ? "Create Account" : "Welcome";
  }
}

function closeAuth(){
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "none";
}

/* ================= AUTH ================= */

function emailSignup(){
  const email = document.getElementById("email")?.value;
  const pass = document.getElementById("password")?.value;

  if (!email || !pass) return alert("Fill in all fields");

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Account created!"))
    .catch(err => alert(err.message));
}

function emailLogin(){
  const email = document.getElementById("email")?.value;
  const pass = document.getElementById("password")?.value;

  auth.signInWithEmailAndPassword(email, pass)
    .then(() => closeAuth())
    .catch(err => alert(err.message));
}

function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(() => closeAuth())
    .catch(err => alert(err.message));
}

function logout(){
  auth.signOut();
}

/* ================= UI SYSTEM ================= */

auth.onAuthStateChanged(user => updateUI(user));

function updateUI(user){

  const btn = document.getElementById("authBtn");
  const addBtn = document.getElementById("addBtn");

  /* LOGIN BUTTON */
  if (btn){

    if (!user){
      btn.style.display = "inline-block";
      btn.innerHTML = "Sign in";
      btn.onclick = () => openAuth("login");
    } else {

      btn.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" class="avatar">`
        : "Profile";

      btn.onclick = toggleProfileMenu;
    }
  }

  /* ADD BUTTON ONLY ADMINS */
  if (addBtn){
    addBtn.style.display =
      (user && admins.includes(user.email)) ? "flex" : "none";
  }
}

/* ================= PROFILE DROPDOWN ================= */

function toggleProfileMenu(){
  const menu = document.getElementById("profileMenu");
  if (!menu) return;

  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
}

/* click outside closes menu */
document.addEventListener("click", (e) => {

  const menu = document.getElementById("profileMenu");
  const btn = document.getElementById("authBtn");

  if (!menu || !btn) return;

  if (!menu.contains(e.target) && !btn.contains(e.target)){
    menu.style.display = "none";
  }
});

/* ================= CLOUDINARY UPLOAD ================= */

async function uploadImage(){

  const user = auth.currentUser;

  if (!user || !admins.includes(user.email)){
    return alert("Not allowed");
  }

  const file = document.getElementById("file")?.files[0];
  const title = document.getElementById("title")?.value || "Untitled";
  const category = document.getElementById("category")?.value || "general";

  if (!file) return alert("Select a file");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "Hhggbbhj");

  try {

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlc75iidz/image/upload",
      { method: "POST", body: form }
    );

    const data = await res.json();

    if (!data.secure_url) return alert("Upload failed");

    await db.collection("gallery").add({
      title,
      category,
      imageUrl: data.secure_url,
      createdAt: Date.now(),
      uploadedBy: user.email
    });

    alert("Uploaded!");

  } catch (err){
    console.error(err);
    alert("Upload error");
  }
}

/* ================= LOAD GALLERY ================= */

function loadGallery(){

  const gallery = document.getElementById("gallery");
  const loading = document.getElementById("loadingText");

  if (!gallery) return;

  db.collection("gallery")
    .orderBy("createdAt","desc")
    .onSnapshot(snapshot => {

      gallery.innerHTML = "";

      if (loading) loading.style.display = "none";

      const user = auth.currentUser;
      const isAdmin = user && admins.includes(user.email);

      snapshot.forEach(doc => {

        const d = doc.data();
        const id = doc.id;

        const div = document.createElement("div");
        div.className = `item ${d.category || ""}`;

        div.innerHTML = `
          <img src="${d.imageUrl}" onclick="openModal(this)">
          <p>${d.title || ""}</p>
        `;

        /* ONLY ADMINS SEE CONTROLS */
        if (isAdmin){

          const controls = document.createElement("div");
          controls.className = "admin-controls";

          controls.innerHTML = `
            <button onclick="editImage('${id}', '${d.title || ""}')">Edit</button>
            <button onclick="deleteImage('${id}')">Delete</button>
          `;

          div.appendChild(controls);
        }

        gallery.appendChild(div);
      });

    });
}

/* ================= EDIT ================= */

async function editImage(id, oldTitle){

  const user = auth.currentUser;

  if (!user || !admins.includes(user.email)){
    return alert("Not allowed");
  }

  const newTitle = prompt("Edit title:", oldTitle);
  if (!newTitle) return;

  await db.collection("gallery").doc(id).update({
    title: newTitle
  });
}

/* ================= DELETE ================= */

async function deleteImage(id){

  const user = auth.currentUser;

  if (!user || !admins.includes(user.email)){
    return alert("Not allowed");
  }

  if (!confirm("Delete this image?")) return;

  await db.collection("gallery").doc(id).delete();
}

/* ================= MODAL ================= */

function openModal(img){
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");

  if (modal) modal.style.display = "flex";
  if (modalImg) modalImg.src = img.src;
}

function closeModal(){
  const modal = document.getElementById("modal");
  if (modal) modal.style.display = "none";
}

/* ================= SEARCH ================= */

document.addEventListener("DOMContentLoaded", () => {

  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    document.querySelectorAll(".item").forEach(item => {

      const text = item.innerText.toLowerCase();

      item.style.display =
        text.includes(value) ? "block" : "none";
    });

  });

});

/* ================= CATEGORY FILTER ================= */

function filterCategory(category){

  document.querySelectorAll(".item").forEach(item => {

    if (category === "all"){
      item.style.display = "block";
      return;
    }

    item.style.display =
      item.classList.contains(category) ? "block" : "none";
  });
}

/* ================= UPLOAD TOGGLE ================= */

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("addBtn");
  const box = document.getElementById("uploadBox");

  if (btn && box){

    btn.onclick = () => {
      box.style.display =
        box.style.display === "block" ? "none" : "block";
    };
  }

});
