// Firebase Realtime Database, used through its REST API (plain fetch — no SDK to install).
// The database URL is public by design; access is protected by the rules in
// database.rules.json, which must be published in the Firebase console.

export const DATABASE_URL = "https://wuxing-match-default-rtdb.asia-southeast1.firebasedatabase.app";

export const firebaseReady = DATABASE_URL.startsWith("https://") && !DATABASE_URL.includes("PASTE_");
