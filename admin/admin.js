const WORKER_URL = "https://pictureperfect-admin-api.pictureperfectcreations.workers.dev";

function login() {
  const pass = document.getElementById("pass").value;

  if (pass === "admin123") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("panel").style.display = "block";
  } else {
    alert("Wrong password");
  }
}

async function upload() {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const file = document.getElementById("image").files[0];
  const status = document.getElementById("status");

  if (!title || !category || !file) {
    alert("Fill all fields");
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

      const data = await res.json().catch(() => null);

      if (res.ok) {
        status.innerText = "✅ Uploaded successfully!";
      } else {
        status.innerText = "❌ Upload failed";
        console.log(data);
      }
    } catch (err) {
      status.innerText = "❌ Server error";
      console.error(err);
    }
  };

  reader.readAsDataURL(file);
}
