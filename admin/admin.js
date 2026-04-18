const repo = "MBsTakeout/pictureperfectcreations";
const token = "";

function login() {
  const pass = document.getElementById("pass").value;
  if (pass === "admin123") {
    document.getElementById("panel").style.display = "block";
  } else {
    alert("Wrong password");
  }
}

function upload() {
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const file = document.getElementById("image").files[0];

  if (!title || !file) {
    alert("Fill all fields");
    return;
  }

  const reader = new FileReader();

  reader.onload = async function () {
    const base64 = reader.result.split(",")[1];

    const filename = `content/gallery/${Date.now()}.json`;

    const data = {
      message: "Add gallery item",
      content: btoa(JSON.stringify({
        title,
        category,
        image: reader.result
      }))
    };

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filename}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      }
    );

    if (res.ok) {
      alert("✅ Uploaded successfully!");
    } else {
      alert("❌ Upload failed");
    }
  };

  reader.readAsDataURL(file);
}
