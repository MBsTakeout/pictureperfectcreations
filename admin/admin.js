const PASSWORD = "admin123";

function login() {
  const pass = document.getElementById("pass").value;
  if (pass === PASSWORD) {
    document.getElementById("panel").style.display = "block";
  } else {
    alert("Wrong password");
  }
}

function upload() {
  alert("Next step: connect GitHub (we will do this next)");
}
