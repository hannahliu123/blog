// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, deleteDoc, updateDoc, addDoc, getDoc, getDocs, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
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
const auth = getAuth(app);

// Extract id
const queryString = window.location.search;     // section of URL after ?
const params = new URLSearchParams(queryString);
const postID = window.location.pathname.substring(7);   // get rid of /posts/
const commentsRef = collection(db, "posts", postID, "comments");

const commentsContainer = document.getElementById("comments-container");
const commentsForm = document.getElementById("comments-form");
const commentsHeader = document.getElementById("comments-header");
const inputHeader = document.getElementById("input-header");
const cancelBtn = document.getElementById("cancel-btn");
let commentsCnt = 0;
let allComments = [];

let deleteId = localStorage.getItem("deleteId") || null;
if (!deleteId) {
    deleteId = crypto.randomUUID();     // generate a random id
    localStorage.setItem("deleteId", deleteId);
}

async function deleteComment(commentId, user, text) {
    const result = confirm("Are you sure you want to delete this comment?");
    if (result) {
        commentsCnt -= 1;
        await deleteDoc(doc(db, "posts", postID, "comments", commentId));
        
        const deleteComment = document.getElementById(commentId);
        deleteComment.remove();
        commentsHeader.textContent = "Comments (" + commentsCnt + ")";
        updateLog(user, text, "delete comment")
        alert("Comment deleted.")
    }
}

function cancelReply() {
    commentsForm.classList.remove("reply");
    inputHeader.textContent = "Leave a Comment";
    document.getElementById("parentId").value = "";
    commentsContainer.after(commentsForm);
}

async function updateLog(user, text, desc) {
    try {
        const logsRef = collection(db, "logs");
        const logData = {
            type: desc,
            postID: postID,
            user: user, 
            content: text,
            timestamp: serverTimestamp(),
        };

        await addDoc(logsRef, logData); // use postID
        console.log("Log was sucessfully updated!");
    } catch (error) {
        console.log("Failed to log new commment:", error);
    }
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
            <img src="/icons/user-icon.png" alt="profile-picture">
        </div>
        <div class="comment-right">
            <div class="delete-div">
                <div class="name-div">
                    <p class="comment-name"></p>
                    <p class="author-tag hidden">Author</p>
                </div>
                <button class="delete-button">DELETE</button>
            </div>
            <div class="reply-div">
                <p>${date.toLocaleDateString()}</p>
                <button class="reply-button">REPLY</button>
            </div>
            <hr>
            <pre class="comment-text"></pre>
        </div>
    `;

    commentDiv.querySelector(".comment-name").textContent = comment.name.toUpperCase();
    commentDiv.querySelector(".comment-text").textContent = comment.text;

    if (comment.parentId === "null") {
        commentsContainer.prepend(commentDiv);  // always add to beginning
        const currComment = document.getElementById(comment.id);

        // Event listener for reply button
        const replyBtn = currComment.querySelector(".reply-button");
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

    const currComment = document.getElementById(comment.id);
    // Check if the user that posted the comment is the author (me)
    const isAuthor = comment.uid === "uKH0rr37KOS8Ot9zudxZioKiY2G2" || comment.uid === "AlvucUZGjVRmKejRMu4vRHtB7q32";
    if (isAuthor) {
        const authorTag = currComment.querySelector(".author-tag");
        authorTag.classList.remove("hidden");
    }

    // Check whether to show delete button (author can always delete)
    const currUid = auth.currentUser? auth.currentUser.uid : null;
    const userDeleteId = localStorage.getItem("deleteId");
    if (currUid !== null || (userDeleteId === comment.deleteId && Date.now() - comment.date.seconds*1000 < 600000)) {
        // if the delete ids match and it's been less than 10 mins (600000ms)
        const deleteBtn = currComment.querySelector(".delete-button");
        deleteBtn.classList.add("active");
        deleteBtn.addEventListener("click", () => {
            const commentId = deleteBtn.parentNode.parentNode.parentNode.id;
            // problem might be that comment.id isn't always available? just .parentNode or something to get the id based on the delete btn
            deleteComment(commentId, comment.name, comment.text)
        });
    }
}

renderAllComments();

commentsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim() || null;
    const text = document.getElementById("text").value.trim();
    const parentId = document.getElementById("parentId").value || "null";
    const uid = auth.currentUser? auth.currentUser.uid : null;

    if (!name || !text) {
        alert("Please fill in all fields marked with *");
        return;
    }

    try {
        const docData = {
            name: name,
            text: text,
            parentId: parentId,
            email: email,
            deleteId: deleteId,
            uid: uid,
            date: serverTimestamp()
        };

        const newDocRef = await addDoc(commentsRef, docData);
        await updateDoc(newDocRef, {id: newDocRef.id});

        const docSnapshot = await getDoc(newDocRef);

        // show the new comment
        if (parentId === "null") renderComment(docSnapshot.data(), null);    // top level
        else {  // is a reply
            let parentCommentSib = document.getElementById(parentId).nextSibling;
            while (parentCommentSib !== null && parentCommentSib.classList.contains("reply")) parentCommentSib = parentCommentSib.nextSibling;
            renderComment(docSnapshot.data(), parentCommentSib);
            cancelReply();
        }

        commentsHeader.textContent = "Comments (" + commentsCnt + ")";

        commentsForm.reset();
        document.getElementById("parentId").value = "";   // reset for future comments
        updateLog(name, text, "add comment");       // log comment
        alert("Comment posted! You have 10 minutes to delete your comment if necessary.");
    } catch (error) {
        console.error("Failed to post comment: ", error);
        alert("Error posting comment.")
    }
});

cancelBtn.addEventListener("click", cancelReply);

// Add Spoiler Functionality here (no longer in post.js)
const spoilers = document.querySelectorAll(".spoiler");
spoilers.forEach(spoiler => {
    spoiler.addEventListener("click", () => {
        spoiler.classList.toggle("active");
    })
});

// Authentication
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("You are logged in!")
        console.log("UID:", user.uid);
    } else {
        console.log("You are NOT logged in.")
    }
});
