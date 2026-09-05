import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// 1. Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDKsIzd41uTJ0mVlXSqs_nCcy52wLPJx3o",
    authDomain: "elibrary-sublgrrcrx.firebaseapp.com",
    databaseURL: "https://elibrary-sublgrrcrx-default-rtdb.firebaseio.com",
    projectId: "elibrary-sublgrrcrx",
    storageBucket: "elibrary-sublgrrcrx.firebasestorage.app",
    messagingSenderId: "1009977350331",
    appId: "1:1009977350331:web:c0e4102ad02cb19aefb19e",
    measurementId: "G-7Z8RK2K625"
};

// 2. Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const bookTableBody = document.getElementById('book-list-table');

// ===== LOGIN LOGIC (Existing) =====
const loginForm = document.getElementById("login-form");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        signInWithEmailAndPassword(auth, email, password)
            .then(() => { window.location.href = "admin.html"; })
            .catch((error) => { alert(error.message); });
    });
}

// ===== ADMIN: ADD BOOK =====
window.addBook = async () => {
    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        quantity: document.getElementById('quantity').value,
        category: document.getElementById('category').value,
        mediaType: document.getElementById('mediaType').value,
        catalogNumber: document.getElementById('catalogNumber').value,
        sourceLink: document.getElementById('sourceLink').value,
        publishDate: document.getElementById('publishDate').value,
        volume: document.getElementById('volume').value,
        accessibility: document.getElementById('accessibility').value,
        location: document.getElementById('location').value,
        custodian: document.getElementById('custodian').value,
        timestamp: new Date()
    };

    try {
        await addDoc(collection(db, "books"), bookData);
        alert("Book added successfully!");
        document.querySelectorAll('input').forEach(input => input.value = '');
    } catch (e) {
        console.error("Error: ", e);
    }
};

// ===== ADMIN: REAL-TIME TABLE =====
if (bookTableBody) {
    onSnapshot(collection(db, "books"), (snapshot) => {
        bookTableBody.innerHTML = ''; 
        snapshot.forEach((docSnap) => {
            const book = docSnap.data();
            const id = docSnap.id;
            bookTableBody.innerHTML += `
                <tr>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.quantity}</td>
                    <td>${book.category}</td>
                    <td>${book.mediaType}</td>
                    <td>${book.catalogNumber}</td>
                    <td><a href="${book.sourceLink}" target="_blank">Link</a></td>
                    <td>${book.publishDate}</td>
                    <td>${book.volume}</td>
                    <td>${book.accessibility}</td>
                    <td>${book.location}</td>
                    <td>${book.custodian}</td>
                    <td><button class="delete-btn" onclick="deleteBook('${id}')">Delete</button></td>
                </tr>`;
        });
    });
}

// ===== ADMIN: DELETE BOOK =====
window.deleteBook = async (id) => {
    if (confirm("Delete this book?")) {
        try {
            await deleteDoc(doc(db, "books", id));
        } catch (e) { console.error(e); }
    }
};// Function to handle the Mobile Menu toggle
window.toggleMenu = () => {
    const nav = document.getElementById('nav-links');
    nav.classList.toggle('active');
};

// Ensure modal opens as 'flex' to center the login box
window.openLoginModal = () => {
    document.getElementById('login-modal').style.display = 'flex';
};

window.closeLoginModal = () => {
    document.getElementById('login-modal').style.display = 'none';
};