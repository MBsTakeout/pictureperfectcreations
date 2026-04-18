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
function openAuth(){
  document.getElementById("authModal").style.display="flex";
}

function closeAuth(){
  document.getElementById("authModal").style.display="none";
}

function emailSignup(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email,pass)
    .then(()=>alert("Account created"))
    .catch(e=>alert(e.message));
}

function emailLogin(){
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email,pass)
    .then(closeAuth)
    .catch(e=>alert(e.message));
}

function googleLogin(){
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(closeAuth);
}

function logout(){
  auth.signOut();
}

/* ================= UI ================= */
function updateUI(user){

  const btn = document.getElementById("authBtn");
  const addBtn = document.getElementById("addBtn");

  if(!user){
    btn.innerHTML="Sign in";
    btn.onclick=openAuth;
    if(addBtn) addBtn.style.display="none";
    return;
  }

  btn.innerHTML = user.photoURL
    ? `<img src="${user.photoURL}" style="width:28px;height:28px;border-radius:50%">`
    : "Profile";

  btn.onclick = toggleMenu;

  if(addBtn){
    addBtn.style.display = admins.includes(user.email) ? "flex":"none";
  }
}

function toggleMenu(){
  document.getElementById("profileMenu")?.classList.toggle("hidden");
}

auth.onAuthStateChanged(updateUI);

/* ================= UPLOAD ================= */
async function uploadImage(){

  const file = document.getElementById("file").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;

  if(!file) return alert("Select file");

  const form = new FormData();
  form.append("file",file);
  form.append("upload_preset","Hhggbbhj");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dlc75iidz/image/upload",
    {method:"POST",body:form}
  );

  const data = await res.json();

  if(!data.secure_url){
    alert("Upload failed");
    return;
  }

  await db.collection("gallery").add({
    title:title||"Untitled",
    category,
    imageUrl:data.secure_url,
    createdAt:Date.now()
  });

  alert("Uploaded!");
}

/* ================= GALLERY ================= */
function loadGallery(){

  const gallery=document.getElementById("gallery");
  if(!gallery) return;

  db.collection("gallery")
  .orderBy("createdAt","desc")
  .onSnapshot(snap=>{

    gallery.innerHTML="";

    snap.forEach(doc=>{

      const d=doc.data();

      const div=document.createElement("div");
      div.className=`item ${d.category}`;

      div.innerHTML=`
        <img src="${d.imageUrl}" onclick="openModal(this)">
        <p>${d.title}</p>

        <div class="admin-controls">
          <button onclick="editImage('${doc.id}','${d.title}')">Edit</button>
          <button onclick="deleteImage('${doc.id}')">Delete</button>
        </div>
      `;

      gallery.appendChild(div);
    });

  });
}

async function deleteImage(id){
  if(!confirm("Delete?")) return;
  await db.collection("gallery").doc(id).delete();
}

async function editImage(id,old){
  const t=prompt("Edit title",old);
  if(!t) return;
  await db.collection("gallery").doc(id).update({title:t});
}

/* ================= FILTER ================= */
function filterCategory(c){
  document.querySelectorAll(".item").forEach(i=>{
    i.style.display=(c==="all"||i.classList.contains(c))?"block":"none";
  });
}

/* ================= SEARCH ================= */
document.addEventListener("input",(e)=>{
  if(e.target.id!=="searchInput") return;

  const v=e.target.value.toLowerCase();

  document.querySelectorAll(".item").forEach(i=>{
    i.style.display=i.innerText.toLowerCase().includes(v)?"block":"none";
  });
});

/* ================= MODAL ================= */
function openModal(img){
  document.getElementById("modal").style.display="flex";
  document.getElementById("modalImg").src=img.src;
}

function closeModal(){
  document.getElementById("modal").style.display="none";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded",()=>{
  loadGallery();
});
