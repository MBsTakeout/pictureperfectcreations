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

function googleLogin(){
const provider=new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider).then(closeAuth);
}

function emailSignup(){
const email=document.getElementById("email").value;
const pass=document.getElementById("password").value;
auth.createUserWithEmailAndPassword(email,pass);
}

function emailLogin(){
const email=document.getElementById("email").value;
const pass=document.getElementById("password").value;
auth.signInWithEmailAndPassword(email,pass).then(closeAuth);
}

function logout(){
auth.signOut();
}

/* ================= UI ================= */

function updateUI(user){

const btn=document.getElementById("authBtn");
const add=document.getElementById("addBtn");

if(btn){
if(!user){
btn.innerText="Sign in";
btn.onclick=openAuth;
}else{
btn.innerText="Profile";
btn.onclick=logout;
}
}

if(add){
add.style.display=(user && admins.includes(user.email))?"flex":"none";
}

}

auth.onAuthStateChanged(updateUI);

/* ================= UPLOAD ================= */

async function uploadImage(){

const file=document.getElementById("file").files[0];
const title=document.getElementById("title").value;
const category=document.getElementById("category").value;

if(!file)return alert("No file");

const form=new FormData();
form.append("file",file);
form.append("dlc75iidz","Hhggbbhj");

const res=await fetch("https://api.cloudinary.com/v1_1/dlc75iidz/image/upload",{method:"POST",body:form});
const data=await res.json();

await db.collection("gallery").add({
title,
category,
imageUrl:data.secure_url,
createdAt:Date.now()
});

}

/* ================= LOAD GALLERY ================= */

function loadGallery(){

const gallery=document.getElementById("gallery");
if(!gallery)return;

db.collection("gallery").orderBy("createdAt","desc").onSnapshot(snap=>{

gallery.innerHTML="";

snap.forEach(doc=>{
const d=doc.data();

const div=document.createElement("div");
div.className="item "+d.category;

div.innerHTML=`
<img src="${d.imageUrl}" onclick="openModal(this)">
<p style="padding:10px">${d.title}</p>
`;

gallery.appendChild(div);
});

});

}

function openModal(img){
document.getElementById("modal").style.display="flex";
document.getElementById("modalImg").src=img.src;
}

function closeModal(){
document.getElementById("modal").style.display="none";
}

document.addEventListener("DOMContentLoaded",loadGallery);
