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

  if (!title || !category || !file) {
    alert("Please fill all fields");
    return;
  }

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
        alert("✅ Successfully uploaded!");
        document.getElementById("title").value = "";
        document.getElementById("image").value = "";
      } else {
        alert("❌ Upload failed (Worker error)");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Connection error");
    }
  };

  reader.readAsDataURL(file);
}

function login() {
  const pass = document.getElementById("pass").value;

  if (pass === "admin123") {
    document.getElementById("panel").style.display = "block";
    document.getElementById("loginBox").style.display = "none";
  } else {
    alert("Wrong password");
  }
}

async function upload() {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const file = document.getElementById("image").files[0];

  if (!title || !category || !file) {
    alert("Please fill all fields");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function () {
    const imageData = reader.result;

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          category,
          image: imageData
        })
      });

      if (res.ok) {
        alert("✅ Successfully uploaded!");
        document.getElementById("title").value = "";
        document.getElementById("image").value = "";
      } else {
        alert("❌ Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Server error");
    }
  };

  reader.readAsDataURL(file);
}
