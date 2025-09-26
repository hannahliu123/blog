import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCs0tT5ACiOgNBkpmbgpt_9d92lfGexy0M",
    authDomain: "my-blog-986f0.firebaseapp.com",
    projectId: "my-blog-986f0",
    storageBucket: "my-blog-986f0.appspot.app",
    messagingSenderId: "220461177065",
    appId: "1:220461177065:web:8be8ecf1dcb07cef657878",
    measurementId: "G-6Y79WDNFCP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("You are logged in!")
        console.log("UID:", user.uid);
        document.body.innerHTML = `
            <h1 id="header">Notifications</h1>
            <div id="notif-container"></div>
        `;

        const notifContainer = document.getElementById("notif-container");
        const logsRef = collection(db, "logs");
        const snapshot = await getDocs(logsRef);
        let allNotifs = []; // array of all the notifications

        snapshot.forEach(doc => {
            allNotifs.push(doc.data());
        });

        // sort all notifs from oldest -> most recent
        allNotifs.sort((a, b) => {
            const timeA = a.timestamp;
            const timeB = b.timestamp;

            if (timeA < timeB) return -1;   // neg value means a should come BEFORE b
            if (timeA > timeB) return 1;    // pos value means a should come AFTER b
            return 0;       // 0 or NaN means a and b are considered EQUAL
        });

        var add_cnt = 1;
        allNotifs.forEach(notif => {
            const container = document.createElement("div");
            container.classList.add("notif");
            container.innerHTML = `
                <h2 class="count"></h2>
                <p><span class="bold">User: </span>
                    <span class="user"></span></p>
                <p><span class="bold">Date: </span>
                    <span class="date"></span></p>
                <p><span class="bold">Post: </span>
                    <a class="post"></a></p>
                <p><span class="bold">Content: </span>
                    <span class="content"></span></p>
            `;

            if (notif.type === "add comment") {
                container.querySelector(".count").textContent = "Add Comment #" + add_cnt;
                add_cnt++;
            } else container.querySelector(".count").textContent = "Remove Comment";
            container.querySelector(".user").textContent = notif.user;
            container.querySelector(".date").textContent = notif.timestamp.toDate();
            container.querySelector(".post").textContent = notif.postID;
            container.querySelector(".post").setAttribute("href", "https://blog.byhannahliu.com/posts/" + notif.postID);
            container.querySelector(".content").textContent = notif.content;

            notifContainer.prepend(container);
        });

        console.log(allNotifs);
    } else {
        console.log("You are NOT logged in.")
    }
});
