// ONLY FOR THE AUTHOR NOT FOR PUBLIC

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCs0tT5ACiOgNBkpmbgpt_9d92lfGexy0M",
    authDomain: "my-blog-986f0.firebaseapp.com",
    projectId: "my-blog-986f0",
    storageBucket: "my-blog-986f0.firebasestorage.app",
    messagingSenderId: "220461177065",
    appId: "1:220461177065:web:8be8ecf1dcb07cef657878",
    measurementId: "G-6Y79WDNFCP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// async function login(email, password) {
//     try {
//         const cred = await signInWithEmailAndPassword(auth, email, password);
//         console.log("You are logged in! UID:", cred.user.uid);
//     } catch (error) {
//         console.log("Login Failed");
//     }
// }
