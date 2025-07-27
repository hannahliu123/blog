// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

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

async function loadPost() {
    if (!postID) {  // null
        console.log("Post ID missing.");
        return;
    }

    const docRef = doc(db, "posts", postID);    // reference to desired document
    const docSnapshop = await getDoc(docRef);   // snapshot of current data

    if (!docSnapshop.exists()) {
        console.log("No document found.");
        return;
    }

    const post = docSnapshop.data();
    showPost(post);
}

async function showPost(post) {
    document.title = post.title;
    const container = document.getElementById("post-container");

    container.innerHTML = `
        <h1 class="title">${post.title}</h1>
        <div class="details">
            <div class="author">
                <img src="blog-photos/author.JPG" class="author-img" alt="Author Image">
                <p class="author-name">Hannah Liu</p>
            </div>
            <p class="date">${post.date}</p>
        </div>
        <img src="${post.coverImg}" class="cover-img" alt="Cover Image">
    `;

    let headerId = 1;
    post.content.forEach(block => {
        if (block.startsWith("/blog-photos/")) { // image
            const img = document.createElement("img");
            img.src = block;
            img.classList.add("content-img");
            container.appendChild(img);
        } else if (block.startsWith("HEADER")) {      // header
            const header = document.createElement("h2");
            let str = block;
            header.innerHTML = str.slice(6);
            header.classList.add("header");
            container.appendChild(header);
            header.id = headerId;
            headerId += 1;
        } else if (block.startsWith("SUBHEADER")) {      // subheader
            const subheader = document.createElement("h3");
            let str = block;
            subheader.innerHTML = str.slice(9);
            subheader.classList.add("subheader");
            container.appendChild(subheader);
        } else if (block.startsWith("CONTENTS")) {      // table of contents link
            const contents = document.createElement("a");
            let str = block;
            contents.innerHTML = str.slice(8);
            contents.classList.add("table-of-contents");
            container.appendChild(contents);
        } else if (block.startsWith("QUOTE")) {      // table of contents link
            const blockquote = document.createElement("blockquote");
            let quote = block;
            const byIndex = quote.indexOf("QUOTEBY");
            blockquote.innerHTML = `<p class="quote-text"><span class="big-quote">“</span>
                                        ${quote.slice(5, byIndex)}
                                    <span class="big-quote">”</span></p>
                                    <p class="quote-credit">— ${quote.slice(byIndex+7)}</p>`;
            blockquote.classList.add("quote");
            container.appendChild(blockquote);
        } else {    // text
            const p = document.createElement("p");
            p.innerHTML = block;
            p.classList.add("content-text");
            container.appendChild(p);
        }
    });

    const spoilers = document.querySelectorAll(".spoiler");
    spoilers.forEach(spoiler => {
        spoiler.addEventListener("click", () => {
            spoiler.classList.toggle("active");
        })
    });

    let linkCount = 1;
    const tableOfContents = document.querySelectorAll(".table-of-contents");
    tableOfContents.forEach(link => {
        link.href = "#" + linkCount.toString();
        linkCount += 1;
    });
}

loadPost();
