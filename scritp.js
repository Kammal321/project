const API_URL = "http://localhost:5000"; // Change to Render URL after deployment

// ✅ User Registration
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();
    document.getElementById("message").innerText = data.message;
    if (response.ok) window.location.href = "login.html";
});

// ✅ User Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify({ username })); // ✅ Store user details
        window.location.href = "index.html";
    } else {
        document.getElementById("message").innerText = data.message;
    }
});

// ✅ Logout Function
document.getElementById("logout")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
});

// ✅ Fetch Image Feed + Comments
async function fetchImages() {
    const response = await fetch(`${API_URL}/images`);
    const images = await response.json();
    const imageFeed = document.getElementById("imageFeed");
    const user = JSON.parse(localStorage.getItem("user")); // Logged-in user info

    if (imageFeed) {
        imageFeed.innerHTML = "";
        for (const img of images) {
            let deleteButton = "";
            if (user && user.username === img.uploader) {
                deleteButton = `<button onclick="deleteImage(${img.id})">🗑️ Delete</button>`;
            }

            let comments = await fetchComments(img.id);
            let commentHTML = comments.map(c => `<p><b>${c.commenter}:</b> ${c.text}</p>`).join("");

            imageFeed.innerHTML += `
                <div class="image-card">
                    <img src="${API_URL}/static/uploads/${img.filename}" alt="Image">
                    <p>Uploaded by: ${img.uploader}</p>
                    ${deleteButton}
                    <div class="comments">
                        <h4>Comments</h4>
                        ${commentHTML}
                        <input type="text" id="comment-${img.id}" placeholder="Write a comment...">
                        <button onclick="postComment(${img.id})">Post</button>
                    </div>
                </div>`;
        }
    }
}

// ✅ Fetch Comments for an Image
async function fetchComments(imageId) {
    const response = await fetch(`${API_URL}/comments/${imageId}`);
    return await response.json();
}

// ✅ Post a Comment
async function postComment(imageId) {
    const token = localStorage.getItem("token");
    const commentInput = document.getElementById(`comment-${imageId}`);
    const commentText = commentInput.value.trim();

    if (!commentText) {
        alert("Comment cannot be empty!");
        return;
    }

    const response = await fetch(`${API_URL}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ image_id: imageId, text: commentText })
    });

    const data = await response.json();
    alert(data.message);
    commentInput.value = ""; // ✅ Clear input field
    fetchImages(); // Refresh comments
}

// ✅ Delete Image
async function deleteImage(imageId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/delete/${imageId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();
    alert(data.message);
    fetchImages(); // Refresh image feed
}

// ✅ Fetch images on page load
if (document.getElementById("imageFeed")) fetchImages();
