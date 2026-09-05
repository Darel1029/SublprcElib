import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-storage.js";

// 1. Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB3hR3W2UGArgTzCmeg2nUieHhxrmL8D_o",
    authDomain: "lgprcmisocc.firebaseapp.com",
    projectId: "lgprcmisocc",
    storageBucket: "lgprcmisocc.firebasestorage.app",
    messagingSenderId: "912653825143",
    appId: "1:912653825143:web:6c36d65585684adc9e8272",
    measurementId: "G-X2MVPGXSZN"
};

// 2. Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
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
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving...'; }

    try {
        // Upload cover image if selected
        let coverImageUrl = '';
        const coverFile = document.getElementById('coverImage')?.files[0];
        if (coverFile) {
            const storageRef = ref(storage, `covers/${Date.now()}_${coverFile.name}`);
            await uploadBytes(storageRef, coverFile);
            coverImageUrl = await getDownloadURL(storageRef);
        }

        const bookData = {
            itemType: document.getElementById('itemType').value,
            coverImageUrl,
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

        await addDoc(collection(db, "books"), bookData);
        alert("Book added successfully!");
        document.querySelectorAll('.form-grid input, .form-grid select').forEach(el => el.value = '');
        const preview = document.getElementById('cover-preview');
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
    } catch (e) {
        console.error("Error: ", e);
        alert('Error saving book. Check console for details.');
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Add to Inventory'; }
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

// ===== BOOK DETAILS MODAL LOGIC =====
window.showBookDetails = (index) => {
    const book = allBooks[index];
    const modal = document.getElementById('book-modal');
    const detailsContainer = document.getElementById('book-modal-details');
    
    if (!modal || !detailsContainer) return;

    const coverHtml = book.coverImageUrl
        ? `<img src="${book.coverImageUrl}" alt="Cover">`
        : `<div style="width:100%;height:300px;background:#f8f9fa;display:flex;align-items:center;justify-content:center;color:#bbb;border-radius:12px;font-weight:600;">No Image Provided</div>`;

    detailsContainer.innerHTML = `
        <div class="modal-grid">
            <div class="modal-cover">
                ${coverHtml}
            </div>
            <div class="modal-info">
                <h2>${book.title || 'Untitled'}</h2>
                <span class="modal-subtitle">${book.author ? 'by ' + book.author : 'Unknown Author'}</span>
                
                <div class="modal-details-grid">
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Category</span>
                        <span class="modal-detail-value">${book.category || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Media Type</span>
                        <span class="modal-detail-value">${book.mediaType || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Catalog #</span>
                        <span class="modal-detail-value">${book.catalogNumber || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Publish Date</span>
                        <span class="modal-detail-value">${book.publishDate || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Volume/Version</span>
                        <span class="modal-detail-value">${book.volume || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Quantity</span>
                        <span class="modal-detail-value">${book.quantity || 0}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Location</span>
                        <span class="modal-detail-value">${book.location || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Custodian</span>
                        <span class="modal-detail-value">${book.custodian || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-item">
                        <span class="modal-detail-label">Accessibility</span>
                        <span class="modal-detail-value">${book.accessibility || 'N/A'}</span>
                    </div>
                    ${book.sourceLink ? `
                    <div class="modal-source-link">
                        <span class="modal-detail-label">Source / Link</span>
                        <a href="${book.sourceLink}" target="_blank">${book.sourceLink}</a>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
};

window.closeBookModal = () => {
    const modal = document.getElementById('book-modal');
    if (modal) modal.style.display = 'none';
};

// Shared listener for closing modals when clicking outside
window.addEventListener('click', (e) => {
    const bookModal = document.getElementById('book-modal');
    const loginModal = document.getElementById('login-modal');
    if (e.target === bookModal) bookModal.style.display = 'none';
    if (e.target === loginModal) loginModal.style.display = 'none';
});

// ===== PUBLIC: REAL-TIME LISTING (filtered by page type + URL search param) =====
const publicBookList = document.getElementById('public-book-list');
const publicResultsCount = document.getElementById('results-count');
const pageType = document.body.dataset.pageType; // 'catalog' or 'publication'

// Read ?q= URL param for pre-filtering (from homepage search)
const urlParams = new URLSearchParams(window.location.search);
const urlQuery = urlParams.get('q') ? urlParams.get('q').toLowerCase() : '';

// Pre-fill the page's own search box if query came from homepage
const pageSearchInput = document.querySelector('.search-box input');
if (pageSearchInput && urlQuery) {
    pageSearchInput.value = urlParams.get('q');
}

let allBooks = [];
let currentPage = 1;
const itemsPerPage = 5;

function renderBooks(query = '') {
    if (!publicBookList) return;
    publicBookList.innerHTML = '';
    const q = query.toLowerCase();

    // 1. Filter books first
    const filteredBooks = allBooks.filter(book => {
        const bookType = book.itemType || 'catalog';
        
        // Type filter per page
        if (pageType === 'publication' && bookType !== 'publication') return false;
        if (pageType === 'catalog' && bookType === 'publication') return false;

        // Text search filter
        if (q) {
            const searchable = `${book.title} ${book.author} ${book.category} ${book.mediaType}`.toLowerCase();
            return searchable.includes(q);
        }
        return true;
    });

    const totalItems = filteredBooks.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // 2. Adjust current page if out of bounds
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // 3. Slice for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

    paginatedBooks.forEach(book => {
        const coverHtml = book.coverImageUrl
            ? `<img src="${book.coverImageUrl}" alt="Cover" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">`
            : `<span style="font-size:11px;color:#bbb;text-align:center;">No Cover</span>`;
        
        publicBookList.innerHTML += `
            <div class="book-card" onclick="showBookDetails(${allBooks.indexOf(book)})">
                <div class="book-cover" style="display:flex;align-items:center;justify-content:center;overflow:hidden;">
                    ${coverHtml}
                </div>
                <div class="book-details">
                    <h2 class="book-title">${book.title || 'Untitled'}</h2>
                    <p class="book-subtitle">${book.author ? 'by ' + book.author : ''}</p>
                    <p class="book-author">Category: ${book.category || 'N/A'}</p>
                    <div class="book-meta">
                        <span>${book.publishDate || 'N/A'}</span> • <span>Vol: ${book.volume || '1'}</span>
                    </div>
                    <div class="tag-group">
                        <span class="tag">${book.mediaType || 'Book'}</span>
                    </div>
                    <div class="availability">
                        <span class="status available">Qty: ${book.quantity || 0}</span>
                        <span class="total">Loc: ${book.location || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    });

    if (publicResultsCount) {
        publicResultsCount.textContent = `Found ${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationContainer.innerHTML = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">Prev</button>
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next</button>
    `;
}

window.changePage = (page) => {
    currentPage = page;
    const pageSearchInput = document.querySelector('.search-box input');
    const query = pageSearchInput ? pageSearchInput.value : '';
    renderBooks(query);
    window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll back up to the catalog start
};

if (publicBookList) {
    onSnapshot(collection(db, "books"), (snapshot) => {
        allBooks = snapshot.docs.map(d => d.data());
        renderBooks(urlQuery);
    });

    // Wire up the page's own search box for live filtering
    if (pageSearchInput) {
        pageSearchInput.addEventListener('input', () => {
            currentPage = 1;
            renderBooks(pageSearchInput.value);
        });
    }
}

// ===== HOMEPAGE LIVE SEARCH =====
const homeSearchInput = document.getElementById('main-search-input');
const homeSearchBtn = document.getElementById('main-search-btn');
const resultsPanel = document.getElementById('search-results-panel');

if (homeSearchInput && resultsPanel) {
    let allBooksCache = [];

    // Load all books once for homepage search
    onSnapshot(collection(db, "books"), (snapshot) => {
        allBooksCache = snapshot.docs.map(d => d.data());
    });

    function runHomeSearch() {
        const q = homeSearchInput.value.trim().toLowerCase();
        if (!q) {
            resultsPanel.style.display = 'none';
            return;
        }

        const matches = allBooksCache.filter(book => {
            const searchable = `${book.title} ${book.author} ${book.category} ${book.mediaType}`.toLowerCase();
            return searchable.includes(q);
        });

        if (matches.length === 0) {
            resultsPanel.innerHTML = `<div style="padding:16px;color:#888;font-size:14px;">No results found for "<strong>${homeSearchInput.value}</strong>"</div>`;
            resultsPanel.style.display = 'block';
            return;
        }

        resultsPanel.innerHTML = matches.map(book => {
            const bookType = book.itemType || 'catalog';
            const targetPage = bookType === 'publication' ? 'publications.html' : 'catalog.html';
            const badgeColor = bookType === 'publication' ? '#6c5ce7' : '#00b894';
            const badgeLabel = bookType === 'publication' ? 'Publication' : 'Catalog';
            const encodedQ = encodeURIComponent(book.title);
            return `
                <a href="${targetPage}?q=${encodedQ}" style="
                    display:flex; align-items:center; gap:12px;
                    padding:12px 16px; border-bottom:1px solid #f0f0f0;
                    text-decoration:none; color:#333;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#f9f9f9'" onmouseout="this.style.background='transparent'">
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:14px;">${book.title || 'Untitled'}</div>
                        <div style="font-size:12px;color:#888;">${book.author ? 'by ' + book.author : ''} ${book.category ? '· ' + book.category : ''}</div>
                    </div>
                    <span style="
                        background:${badgeColor}; color:#fff;
                        font-size:11px; font-weight:600;
                        padding:3px 8px; border-radius:20px;
                        white-space:nowrap;
                    ">${badgeLabel}</span>
                </a>
            `;
        }).join('');

        resultsPanel.style.display = 'block';
    }

    homeSearchInput.addEventListener('input', runHomeSearch);
    homeSearchBtn.addEventListener('click', runHomeSearch);
    homeSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runHomeSearch();
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!homeSearchInput.contains(e.target) && !resultsPanel.contains(e.target)) {
            resultsPanel.style.display = 'none';
        }
    });
}