const firebaseConfig = {
  apiKey: "AIzaSyBFR4p-kM0vetj9dP8Q5J_ClZSFHa_ZEMM",
  authDomain: "pictureperfectcreations-5c37e.firebaseapp.com",
  projectId: "pictureperfectcreations-5c37e"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const admins = ["bm015059@gmail.com"];

/* ================= AUTH MODAL ================= */

function openAuth(){
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "flex";
}

function closeAuth(){
  const modal = document.getElementById("authModal");
  if (modal) modal.style.display = "none";
}

/* ================= SIGN UP ================= */

function emailSignup(){

  const email = document.getElementById("email")?.value;
  const pass = document.getElementById("password")?.value;

  if (!email || !pass) return alert("Fill in all fields");

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Account created! Now sign in."))
    .catch(err => alert(err.message));
}

/* ================= LOGIN ================= */

function emailLogin(){

  const email = document.getElementById("email")?.value;
  const pass = document.getElementById("password")?.value;

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

/* ================= LOGOUT ================= */

function logout(){
  auth.signOut();
}

/* ================= UI UPDATE ================= */

function updateUI(user){

  const btn = document.getElementById("authBtn");
  const addBtn = document.getElementById("addBtn");

  if (btn){

    if (!user){
      btn.innerHTML = "Sign in";
      btn.onclick = openAuth;
    } else {
      btn.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" style="width:25px;height:25px;border-radius:50%">`
        : "Profile";

      btn.onclick = logout;
    }
  }

  if (addBtn){
    addBtn.style.display =
      user && admins.includes(user.email) ? "flex" : "none";
  }
}

/* ================= AUTH STATE ================= */

auth.onAuthStateChanged(user => {
  updateUI(user);
});

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

    if (!data.secure_url){
      console.log(data);
      return alert("Upload failed");
    }

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

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  loadGallery();

  const btn = document.getElementById("addBtn");
  const box = document.getElementById("uploadBox");

  if (btn && box){
    btn.onclick = () => {
      box.style.display =
        box.style.display === "block" ? "none" : "block";
    };
  }

});
