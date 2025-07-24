// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, updateDoc, addDoc, getDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCs0tT5ACiOgNBkpmbgpt_9d92lfGexy0M",
    authDomain: "my-blog-986f0.firebaseapp.com",
    projectId: "my-blog-986f0",
    storageBucket: "my-blog-986f0.firebasestorage.app",
    messagingSenderId: "220461177065",
    appId: "1:220461177065:web:8be8ecf1dcb07cef657878",
    measurementId: "G-6Y79WDNFCP"
};

// Initialize Firebase & Firestore db
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);       // my connected Firestore database

// Extract id
const queryString = window.location.search;     // section of URL after ?
const params = new URLSearchParams(queryString);
const postID = params.get("id");
const commentsRef = collection(db, "posts", postID, "comments");

const commentsContainer = document.getElementById("comments-container");
const form = document.getElementById("comments-form");
const commentsHeader = document.getElementById("comments-header");
const replyBtn = document.querySelectorAll(".reply-button");
let commentsCnt = 0;
let allComments = [];

replyBtn.forEach(btn => {
    btn.addEventListener("click", () => {
        // set parentId
        // Leave a Comment -> Reply to xxx
        // Tab content forwards (the actual reply & the form)
        // hide reply button for the new comment that is replying
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const text = document.getElementById("text").value.trim();
    const parentId = document.getElementById("parentId").value || "null";

    if (!name || !text) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const docData = {
            name: name,
            text: text,
            parentId: parentId,
            date: serverTimestamp()
        };

        const newDocRef = await addDoc(commentsRef, docData);
        await updateDoc(newDocRef, {id: newDocRef.id});

        const docSnapshot = await getDoc(newDocRef);

        if (parentId === "null") renderComment(docSnapshot.data(), null);    // show new comment
        else renderComment(docSnapshot.data(), parentId);

        commentsHeader.textContent = "Comments (" + commentsCnt + ")";

        form.reset();
        document.getElementById("parentId").value = "";   // reset for future comments
        alert("Comment posted!");
    } catch (error) {
        console.error("Failed to post comment: ", error);
        alert("Error posting comment.")
    }
});

async function renderAllComments() {
    const querySnapshot = await getDocs(commentsRef);
    querySnapshot.forEach(doc => {
        allComments.push(doc.data());
    });

    allComments.sort((a, b) => {    // sort all comments by date (earliest -> most recent)
        const timeA = a.date;
        const timeB = b.date;

        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0;
    });

    const topLevel = allComments.filter(c => c.parentId === "null");
    topLevel.forEach(doc => {
        renderComment(doc, null);
    });

    commentsHeader.textContent = "Comments (" + commentsCnt + ")";
}

async function renderComment(comment, parentCommentSibling) {
    commentsCnt += 1;

    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");
    commentDiv.id = comment.id;
    const date = comment.date.toDate();
    commentDiv.innerHTML = `
        <div class="comment-left">
            <img src="../icons/user-icon.png" alt="profile-picture">
        </div>
        <div class="comment-right">
            <p>${comment.name.toUpperCase()}</p>
            <div class="reply-div">
                <p>${date.toLocaleDateString()}</p>
                <button class="reply-button">REPLY</button>
            </div>
            <hr>
            <pre class="comment-text">${comment.text}</pre>
        </div>
    `;

    if (comment.parentId === "null") {
        commentsContainer.prepend(commentDiv);  // always add to beginning

        // render replies
        const replies = allComments.filter(c => c.parentId === comment.id);
        const parentCommentSibling = document.getElementById(comment.id).nextSibling;
        replies.forEach(reply => {
            console.log(parentCommentSibling);
            renderComment(reply, parentCommentSibling);
        });
    } else {  // is a reply (neet to add in opposite order)
        commentDiv.classList.add("reply");
        commentsContainer.insertBefore(commentDiv, parentCommentSibling);
    }
}

renderAllComments();

// Authentication - UHHH let's do this later
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("You are logged in!")
        console.log("UID:", user.uid);
    } else {
        console.log("You are NOT logged in.")
    }
});
