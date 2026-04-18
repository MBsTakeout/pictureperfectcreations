function login() {
  const pass = document.getElementById("pass").value;

  console.log("Login clicked:", pass);

  if (pass === "admin123") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("panel").style.display = "block";
  } else {
    alert("Wrong password");
  }
}

function upload() {
  alert("Upload button works — next step we connect GitHub");
}
