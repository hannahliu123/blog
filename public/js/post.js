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
    // SEO Edits
    document.title = post.title;    // title
    let ogTitle = document.querySelector('meta[property="og:title"]');  // og title
    ogTitle.content = post.title;
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');    // twitter title
    twitterTitle.content = post.title;

    let metaDesc = document.querySelector('meta[name="description"]');  // description
    let previewText = post.content[0];
    const words = previewText.split(" ");
    previewText = words.slice(0, 30).join(" ");
    metaDesc.content = previewText;
    let ogDesc = document.querySelector('meta[property="og:description"]');     // og description
    ogDesc.content = previewText;
    let twitterDesc = document.querySelector('meta[name="twitter:description"]');   // og description
    twitterDesc.content = previewText;

    const link = "https://blog.byhannahliu.com/posts/" + post.id;
    let canonical = document.querySelector('link[rel="canonical"]');    // canonical link
    canonical.setAttribute("href", link);
    let ogURL = document.querySelector('meta[property="og:url"]');    // og canonical link
    ogURL.content = link;

    // Show Blog Posts
    const container = document.getElementById("post-container");
    container.innerHTML = `
        <div id="full-logo-container"><a href="https://byhannahliu.com/" id="full-logo-link"><img src="/icons/full-logo.png" id="full-logo" alt="byhannahliu logo"></a></div><hr>
        <h1 class="title">${post.title}</h1>
        <div class="details">
            <div class="author">
                <img src="/blog-photos/author.JPG" class="author-img" alt="Author Image">
                <p class="author-name">Hannah Liu</p>
            </div>
            <p class="date">${post.date}</p>
        </div>
    `;

    post.content.forEach(block => {
        if (block.startsWith("/blog-photos/")) {        // image
            const img = document.createElement("img");
            img.src = block;
            img.alt = "blog-post-image";
            img.classList.add("content-img");
            container.appendChild(img);
        } else if (block.startsWith("HEADER")) {        // header
            const header = document.createElement("h2");
            let str = block.slice(6);
            if (str.slice(0,3) === "ID=") {
                str = str.slice(3); // get rid of "ID="
                const array = str.split("END_ID");      // seperate id value and content
                header.innerHTML = array[1];
                header.id = array[0];
            } else header.innerHTML = str;
            header.classList.add("header");
            container.appendChild(header);
        } else if (block.startsWith("SUBHEADER")) {     // subheader
            const subheader = document.createElement("h3");
            let str = block.slice(9);
            if (str.slice(0,3) === "ID=") {
                str = str.slice(3); // get rid of "ID="
                const array = str.split("END_ID");      // seperate id value and content
                subheader.innerHTML = array[1];
                subheader.id = array[0];
            } else subheader.innerHTML = str;
            subheader.classList.add("subheader");
            container.appendChild(subheader);
        } else if (block.startsWith("CONTENTS")) {      // table of contents link
            const contents = document.createElement("a");
            let str = block.slice(8);
            const array = str.split("END_HREF");        // seperate href value and text content
            contents.innerHTML = array[1];
            contents.href = array[0];
            contents.classList.add("table-of-contents");
            container.appendChild(contents);
        } else if (block.startsWith("QUOTE")) {         // blockquote
            const blockquote = document.createElement("blockquote");
            let quote = block;
            blockquote.innerHTML = `<p class="big-quote">“</p>
                                    <pre class="quote-text">${quote.slice(5)}</pre>`;
            blockquote.classList.add("quote");
            container.appendChild(blockquote);
        } else {                                        // text
            if (block !== "") { // not an empty placeholder
                const p = document.createElement("p");
                p.innerHTML = block;
                p.classList.add("content-text");
                container.appendChild(p);
            }
        }
    });
}

loadPost();
