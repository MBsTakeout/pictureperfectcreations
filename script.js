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

/* ================= ADMINS ================= */
const admins = ["bm015059@gmail.com"];

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
    .then(() => alert("Account created! Now sign in."))
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

/* ================= PROFILE UI ================= */
function updateAuthUI(user) {
  const btn = document.getElementById("authBtn");
  if (!btn) return;

  if (!user) {
    btn.innerHTML = "Sign in";
    btn.onclick = openAuth;
    return;
  }

  if (user.photoURL) {
    btn.innerHTML = `
      <img src="${user.photoURL}" 
      style="width:25px;height:25px;border-radius:50%;vertical-align:middle;">
    `;
  } else {
    btn.innerHTML = "Profile";
  }

  btn.onclick = null;
}

/* ================= AUTH STATE (FIXED - ONLY ONE) ================= */
auth.onAuthStateChanged(user => {

  updateAuthUI(user);

  const addBtn = document.getElementById("addBtn");

  if (!addBtn) return;

  if (user && admins.includes(user.email)) {
    addBtn.style.display = "flex";
  } else {
    addBtn.style.display = "none";
  }
});

/* ================= UPLOAD IMAGE (FIXED CLOUDINARY) ================= */
async function uploadImage(){

  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  if (!file) return alert("Select a file first");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", "ml_default"); // FIXED

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/YOUR_CLOUD/image/upload",
    { method:"POST", body:form }
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
function loadGallery(){

  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  db.collection("gallery")
    .orderBy("createdAt","desc")
    .onSnapshot(snapshot => {

      gallery.innerHTML = "";

      snapshot.forEach(doc => {
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
function openModal(img){
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalImg").src = img.src;
}

function closeModal(){
  document.getElementById("modal").style.display = "none";
}

/* ================= + BUTTON TOGGLE ================= */
document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("addBtn");
  const box = document.getElementById("uploadBox");

  if (!btn || !box) return;

  btn.onclick = () => {
    box.style.display =
      box.style.display === "block" ? "none" : "block";
  };

});
