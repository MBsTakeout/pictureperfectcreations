const firebaseConfig = {
  apiKey: "AIzaSyBFR4p-kM0vetj9dP8Q5J_ClZSFHa_ZEMM",
  authDomain: "pictureperfectcreations-5c37e.firebaseapp.com",
  projectId: "pictureperfectcreations-5c37e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const admins = ["bm015059@gmail.com"];

let authReady = false;

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  const addBtn = document.getElementById("addBtn");
  const box = document.getElementById("uploadBox");

  if (addBtn) addBtn.style.display = "none";
  if (box) box.style.display = "none";

  setupSearch();
});

/* ================= AUTH STATE ================= */

auth.onAuthStateChanged(user => {

  authReady = true;

  updateUI(user);
  loadGallery();
});

/* ================= AUTH UI ================= */

function openAuth(){
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "flex";
}

function closeAuth(){
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "none";
}

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

/* ================= SECURITY CHECK ================= */

function isAdmin(){

  const user = auth.currentUser;

  return (
    authReady &&
    user &&
    admins.includes(user.email)
  );
}

/* ================= UI ================= */

function updateUI(user){

  const btn = document.getElementById("authBtn");
  const addBtn = document.getElementById("addBtn");

  if (btn){

    if (!user){
      btn.innerHTML = "Sign in";
      btn.onclick = openAuth;
    } else {
      btn.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" class="avatar">`
        : "Profile";

      btn.onclick = logout;
    }
  }

  if (addBtn){
    addBtn.style.display = isAdmin() ? "flex" : "none";
  }
}

/* ================= CLOUDINARY UPLOAD ================= */

async function uploadImage(){

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
      createdAt: Date.now()
    });

    alert("Uploaded!");

  } catch (err){
    console.error(err);
    alert("Upload error");
  }
}

/* ================= GALLERY ================= */

function loadGallery(){

  const gallery = document.getElementById("gallery");
  const loading = document.getElementById("loadingText");

  if (!gallery) return;

  db.collection("gallery")
    .orderBy("createdAt","desc")
    .onSnapshot(snapshot => {

      gallery.innerHTML = "";

      if (loading) loading.style.display = "none";

      snapshot.forEach(doc => {

        const d = doc.data();
        const id = doc.id;

        const div = document.createElement("div");
        div.className = `item ${d.category || ""}`;

        div.innerHTML = `
          <img src="${d.imageUrl}" onclick="openModal(this)">
          <p>${d.title || ""}</p>

          <div class="admin-controls">
            <button onclick="editImage('${id}', '${d.title || ""}')">Edit</button>
            <button onclick="deleteImage('${id}')">Delete</button>
          </div>
        `;

        gallery.appendChild(div);
      });

    });
}

/* ================= EDIT / DELETE (LOCKED) ================= */

async function editImage(id, oldTitle){

  if (!isAdmin()) return alert("Not allowed");

  const newTitle = prompt("Edit title:", oldTitle);
  if (!newTitle) return;

  await db.collection("gallery").doc(id).update({
    title: newTitle
  });
}

async function deleteImage(id){

  if (!isAdmin()) return alert("Not allowed");

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

function setupSearch(){

  const searchInput = document.getElementById("searchInput");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

    document.querySelectorAll(".item").forEach(item => {

      const title = item.querySelector("p")?.innerText.toLowerCase() || "";
      const category = item.className.toLowerCase();

      const match = title.includes(value) || category.includes(value);

      item.style.display = match ? "block" : "none";
    });

  });
}

/* ================= CATEGORY FILTER ================= */

function filterCategory(category){

  document.querySelectorAll(".item").forEach(item => {

    if (category === "all") return item.style.display = "block";

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
