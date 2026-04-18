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
🔐 ADMIN EMAILS
========================= */
const admins = [
  "your@email.com"
];

/* =========================
🔐 LOGIN SYSTEM
========================= */
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

/* =========================
👤 CHECK ADMIN
========================= */
auth.onAuthStateChanged(user => {
  const btn = document.getElementById("addBtn");

  if (user && admins.includes(user.email)) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
});

/* =========================
☁️ CLOUDINARY SETTINGS
========================= */
const CLOUD_NAME = "YOUR_CLOUD_NAME";
const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

/* =========================
📸 UPLOAD IMAGE (FILE → CLOUDINARY)
========================= */
async function uploadImage() {
  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  if (!file || !title || !category) {
    alert("Fill all fields");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (!data.secure_url) {
      alert("Upload failed");
      return;
    }

    // Save to Firebase
    await db.collection("gallery").add({
      title,
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

/* =========================
🖼️ LOAD GALLERY
========================= */
function loadGallery() {
  db.collection("gallery")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {

      const gallery = document.getElementById("gallery");
      gallery.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();

        const div = document.createElement("div");
        div.className = "item";

        div.innerHTML = `
          <img src="${data.imageUrl}" width="200">
          <h3>${data.title}</h3>
          <p>${data.category}</p>
        `;

        gallery.appendChild(div);
      });
    });
}

document.addEventListener("DOMContentLoaded", loadGallery);
