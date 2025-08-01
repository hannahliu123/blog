import admin from "firebase-admin";     // needed because this runs in Node.js, not browser
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };    // must explicitly use
import fs from "fs";        // Node.js filesystem module to add .html file
import puppeteer from "puppeteer";

const credentials = {
    credential: admin.credential.cert(serviceAccount)
};

admin.initializeApp(credentials);
const db = admin.firestore();
const postsFolder = "./public/posts/";
const postIDs = [];

async function getPostIDs() {
    const snapshot = await db.collection("posts").get();
    snapshot.forEach(doc => {
        postIDs.push(doc.data().id);
    });
}

async function createPosts() {
    await getPostIDs();
    console.log("Found post IDs:", postIDs);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Make sure posts folder exists
    if (!fs.existsSync(postsFolder)) {
        fs.mkdirSync(postsFolder);  // make directory synchronously
    }

    for (const id of postIDs) {   // because async
        const url = `https://blog.byhannahliu.com/post?id=${id}`;
        console.log(`Generating snapshot for post: ${id}...`);

        await page.goto(url, {
            waitUntil: "networkidle0",
            timeout: 120000     // 2 mins
        });    // Wait for network to be idle (fully loaded)

        // Remove post.js
        await page.evaluate(() => {
            const scriptTag = document.querySelector('script[src="/js/post.js"]');
            scriptTag.src = "/js/comments.js";
            console.log("Script tag sucessfully updated.");
        });

        const html = await page.content();

        // Write to local file
        fs.writeFileSync(`${postsFolder}${id}.html`, html);
        console.log(`Saved ${postsFolder}${id}.html`);
    }

    await browser.close();
}

createPosts();
