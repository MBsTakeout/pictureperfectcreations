const WORKER_URL = "https://pictureperfect-admin-api.pictureperfectcreations.workers.dev";

// LOGIN
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

// UPLOAD
async function upload() {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const file = document.getElementById("image").files[0];
  const status = document.getElementById("status");

  if (!title || !category || !file) {
    alert("Please fill all fields");
    return;
  }

  status.innerText = "Uploading...";

  const reader = new FileReader();

  reader.onload = async function () {
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          category,
          image: reader.result
        })
      });

      if (res.ok) {
        status.innerText = "✅ Successfully uploaded!";
        document.getElementById("title").value = "";
        document.getElementById("image").value = "";
      } else {
        status.innerText = "❌ Upload failed";
      }
    } catch (err) {
      console.error(err);
      status.innerText = "❌ Error connecting to server";
    }
  };

  reader.readAsDataURL(file);
}
