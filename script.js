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

/* =========================
CLOUDINARY
========================= */
const CLOUD_NAME = "dlc75iidz";
const UPLOAD_PRESET = "ml_default";

/* =========================
ADMINS
========================= */
const admins = ["your@email.com"];

/* =========================
LOGIN
========================= */
function login() {
  auth.signInWithEmailAndPassword(
    email.value,
    password.value
  );
}

function logout() {
  auth.signOut();
}

/* =========================
ADMIN CHECK
========================= */
auth.onAuthStateChanged(user => {
  const btn = document.getElementById("addBtn");

  if (user && admins.includes(user.email)) {
    btn.style.display = "flex";
  } else {
    btn.style.display = "none";
  }
});

/* =========================
UPLOAD IMAGE
========================= */
async function uploadImage() {
  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  if (!file || !title) return alert("Fill all fields");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
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

/* =========================
LOAD GALLERY
========================= */
function loadGallery() {
  db.collection("gallery")
    .orderBy("createdAt", "desc")
    .onSnapshot(snap => {
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = "";

      snap.forEach(doc => {
        const d = doc.data();

        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          <img src="${d.imageUrl}" onclick="openImg('${d.imageUrl}')">
          <h3>${d.title}</h3>
          <p>${d.category}</p>
        `;

        gallery.appendChild(div);
      });
    });
}

loadGallery();

/* =========================
MODALS
========================= */
function openLogin() {
  loginModal.style.display = "flex";
}

function closeLogin() {
  loginModal.style.display = "none";
}

function openImg(src) {
  imgModal.style.display = "flex";
  modalImg.src = src;
}

function closeImg() {
  imgModal.style.display = "none";
}

/* =========================
UPLOAD TOGGLE
========================= */
addBtn.onclick = () => {
  uploadBox.style.display =
    uploadBox.style.display === "block" ? "none" : "block";
};
