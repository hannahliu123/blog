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
const commentsForm = document.getElementById("comments-form");
const commentsHeader = document.getElementById("comments-header");
const inputHeader = document.getElementById("input-header");
const cancelBtn = document.getElementById("cancel-btn");
let commentsCnt = 0;
let allComments = [];

function cancelReply() {
    commentsForm.classList.remove("reply");
    inputHeader.textContent = "Leave a Comment";
    document.getElementById("parentId").value = "";
    commentsContainer.after(commentsForm);
}

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
            <p class="comment-name">${comment.name.toUpperCase()}</p>
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
        const currComment = document.getElementById(comment.id);

        // Event listener for reply button
        const commentContainer = document.getElementById(comment.id);
        const replyBtn = commentContainer.querySelector(".reply-button");
        replyBtn.addEventListener("click", () => {
            commentsForm.classList.add("reply");
            currComment.after(commentsForm);

            let parentName = comment.name.toLowerCase();    // get the name of user you're replying to in good format
            const firstLetter = parentName.charAt(0).toUpperCase();
            const spaceIndex = parentName.indexOf(" ");
            if (spaceIndex === -1)  parentName = parentName.substring(1);
            else parentName = parentName.substring(1, spaceIndex);
            if (parentName.length >= 15) parentName = parentName.substring(1, 15) + "...";
            inputHeader.textContent = "Reply to " + firstLetter + parentName;

            document.getElementById("parentId").value = replyBtn.parentNode.parentNode.parentNode.id;   // next comment is considered a reply
        });

        // render replies
        const replies = allComments.filter(c => c.parentId === comment.id);
        const parentCommentSib = currComment.nextSibling;
        replies.forEach(reply => {
            renderComment(reply, parentCommentSib);
        });
    } else {  // is a reply (need to add in opposite order)
        commentDiv.classList.add("reply");
        commentsContainer.insertBefore(commentDiv, parentCommentSibling);
    }
}

renderAllComments();

commentsForm.addEventListener("submit", async (event) => {
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
        else {
            let parentCommentSib = document.getElementById(parentId).nextSibling;
            console.log(parentCommentSib);
            while (parentCommentSib !== null && parentCommentSib.classList.contains("reply")) parentCommentSib = parentCommentSib.nextSibling;
            console.log(parentCommentSib);
            renderComment(docSnapshot.data(), parentCommentSib);
            cancelReply();
        }

        commentsHeader.textContent = "Comments (" + commentsCnt + ")";

        commentsForm.reset();
        document.getElementById("parentId").value = "";   // reset for future comments
        alert("Comment posted!");
    } catch (error) {
        console.error("Failed to post comment: ", error);
        alert("Error posting comment.")
    }
});

cancelBtn.addEventListener("click", cancelReply);

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
