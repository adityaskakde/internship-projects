// BookHaven - Personal Library Management System
// JavaScript functionality with ES6+ features

class BookLibrary {
    constructor() {
        this.books = [];
        this.history = [];
        this.currentSection = 'dashboard';
        this.theme = 'dark';
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.generateSampleBooks();
        this.renderDashboard();
        this.updateStats();
    }

    // Data Management
    loadData() {
        const booksData = localStorage.getItem('bookhaven_books');
        const historyData = localStorage.getItem('bookhaven_history');
        const themeData = localStorage.getItem('bookhaven_theme');

        this.books = booksData ? JSON.parse(booksData) : [];
        this.history = historyData ? JSON.parse(historyData) : [];
        this.theme = themeData || 'dark';

        this.applyTheme();
    }

    saveData() {
        localStorage.setItem('bookhaven_books', JSON.stringify(this.books));
        localStorage.setItem('bookhaven_history', JSON.stringify(this.history));
        localStorage.setItem('bookhaven_theme', this.theme);
    }

    // Theme Management
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveData();
    }

    applyTheme() {
        const root = document.documentElement;
        if (this.theme === 'light') {
            root.style.setProperty('--primary-bg', '#f8f9fa');
            root.style.setProperty('--secondary-bg', '#ffffff');
            root.style.setProperty('--accent-bg', '#e9ecef');
            root.style.setProperty('--text-primary', '#212529');
            root.style.setProperty('--text-secondary', '#6c757d');
            root.style.setProperty('--glass-bg', 'rgba(0, 0, 0, 0.05)');
            root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
        } else {
            root.style.setProperty('--primary-bg', '#0f0f0f');
            root.style.setProperty('--secondary-bg', '#1a1a1a');
            root.style.setProperty('--accent-bg', '#2a2a2a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#b0b0b0');
            root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.05)');
            root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
        }

        const themeIcon = document.querySelector('#themeToggle i');
        const themeText = document.querySelector('#themeToggle span');

        if (this.theme === 'dark') {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
        } else {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        }
    }

    // Navigation
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Add book form
        document.getElementById('addBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBook();
        });

        // Clear form
        document.getElementById('clearForm').addEventListener('click', () => {
            this.clearAddForm();
        });

        // Edit book form
        document.getElementById('editBookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateBook();
        });

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterBooks();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterBooks();
        });

        // Sorting
        document.getElementById('sortBy').addEventListener('change', () => {
            this.sortBooks();
        });

        document.getElementById('sortOrder').addEventListener('change', () => {
            this.sortBooks();
        });

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    switchSection(sectionId) {
        // Update active section in sidebar
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;

        // Render appropriate content
        switch (sectionId) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'book-list':
                this.renderBookList();
                break;
            case 'favorites':
                this.renderFavorites();
                break;
            case 'history':
                this.renderHistory();
                break;
        }
    }

    // Book CRUD Operations
    addBook() {
        const formData = new FormData(document.getElementById('addBookForm'));
        const book = {
            id: Date.now(),
            title: formData.get('title').trim(),
            author: formData.get('author').trim(),
            isbn: formData.get('isbn').trim(),
            category: formData.get('category'),
            publicationYear: formData.get('publicationYear') ? parseInt(formData.get('publicationYear')) : null,
            imageUrl: formData.get('imageUrl').trim() || this.getDefaultCover(),
            description: formData.get('description').trim(),
            status: 'available',
            isFavorite: false,
            dateAdded: new Date().toISOString()
        };

        this.books.push(book);
        this.saveData();
        this.clearAddForm();
        this.updateStats();
        this.showNotification('Book added successfully!', 'success');

        // Switch to library view
        this.switchSection('book-list');
    }

    updateBook() {
        const bookId = parseInt(document.getElementById('editBookId').value);
        const formData = new FormData(document.getElementById('editBookForm'));

        const bookIndex = this.books.findIndex(book => book.id === bookId);
        if (bookIndex !== -1) {
            this.books[bookIndex] = {
                ...this.books[bookIndex],
                title: formData.get('editTitle').trim(),
                author: formData.get('editAuthor').trim(),
                isbn: formData.get('editIsbn').trim(),
                category: formData.get('editCategory'),
                publicationYear: formData.get('editPublicationYear') ? parseInt(formData.get('editPublicationYear')) : null,
                imageUrl: formData.get('editImageUrl').trim() || this.getDefaultCover(),
                description: formData.get('editDescription').trim()
            };

            this.saveData();
            this.closeModal();
            this.renderBookList();
            this.updateStats();
            this.showNotification('Book updated successfully!', 'success');
        }
    }

    deleteBook(bookId) {
        if (confirm('Are you sure you want to delete this book?')) {
            this.books = this.books.filter(book => book.id !== bookId);
            this.saveData();
            this.renderBookList();
            this.updateStats();
            this.showNotification('Book deleted successfully!', 'success');
        }
    }

    toggleFavorite(bookId) {
        const book = this.books.find(book => book.id === bookId);
        if (book) {
            book.isFavorite = !book.isFavorite;
            this.saveData();
            this.renderBookList();
            this.renderFavorites();
            this.updateStats();
        }
    }

    borrowBook(bookId) {
        const book = this.books.find(book => book.id === bookId);
        if (book && book.status === 'available') {
            book.status = 'borrowed';
            book.borrowDate = new Date().toISOString();

            this.history.push({
                id: Date.now(),
                bookId: book.id,
                bookTitle: book.title,
                borrowDate: book.borrowDate,
                returnDate: null,
                status: 'borrowed'
            });

            this.saveData();
            this.renderBookList();
            this.renderHistory();
            this.updateStats();
            this.showNotification('Book borrowed successfully!', 'success');
        }
    }

    returnBook(bookId) {
        const book = this.books.find(book => book.id === bookId);
        if (book && book.status === 'borrowed') {
            book.status = 'available';
            const returnDate = new Date().toISOString();
            book.returnDate = returnDate;

            // Update history
            const historyItem = this.history.find(item => item.bookId === bookId && !item.returnDate);
            if (historyItem) {
                historyItem.returnDate = returnDate;
                historyItem.status = 'returned';
            }

            this.saveData();
            this.renderBookList();
            this.renderHistory();
            this.updateStats();
            this.showNotification('Book returned successfully!', 'success');
        }
    }

    // UI Rendering
    renderDashboard() {
        this.updateStats();
        this.renderRecentBooks();
    }

    updateStats() {
        const totalBooks = this.books.length;
        const availableBooks = this.books.filter(book => book.status === 'available').length;
        const borrowedBooks = this.books.filter(book => book.status === 'borrowed').length;
        const favoriteBooks = this.books.filter(book => book.isFavorite).length;

        document.getElementById('totalBooks').textContent = totalBooks;
        document.getElementById('availableBooks').textContent = availableBooks;
        document.getElementById('borrowedBooks').textContent = borrowedBooks;
        document.getElementById('favoriteBooks').textContent = favoriteBooks;
    }

    renderRecentBooks() {
        const recentBooks = this.books
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, 6);

        const container = document.getElementById('recentBooks');
        container.innerHTML = '';

        if (recentBooks.length === 0) {
            container.innerHTML = '<p class="text-center">No books added yet. Start building your library!</p>';
            return;
        }

        recentBooks.forEach(book => {
            const bookCard = this.createBookCard(book, true);
            container.appendChild(bookCard);
        });
    }

    renderBookList() {
        const container = document.getElementById('bookList');
        container.innerHTML = '';

        if (this.books.length === 0) {
            container.innerHTML = '<p class="text-center">No books in your library. Add some books to get started!</p>';
            return;
        }

        this.books.forEach(book => {
            const bookCard = this.createBookCard(book);
            container.appendChild(bookCard);
        });
    }

    renderFavorites() {
        const container = document.getElementById('favoritesList');
        const favoriteBooks = this.books.filter(book => book.isFavorite);

        container.innerHTML = '';

        if (favoriteBooks.length === 0) {
            container.innerHTML = '<p class="text-center">No favorite books yet. Mark some books as favorites!</p>';
            return;
        }

        favoriteBooks.forEach(book => {
            const bookCard = this.createBookCard(book);
            container.appendChild(bookCard);
        });
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        container.innerHTML = '';

        if (this.history.length === 0) {
            container.innerHTML = '<p class="text-center">No borrowing history yet. Borrow some books to see your history!</p>';
            return;
        }

        // Sort by most recent first
        const sortedHistory = this.history.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

        sortedHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const borrowDate = new Date(item.borrowDate).toLocaleDateString();
            const returnDate = item.returnDate ? new Date(item.returnDate).toLocaleDateString() : 'Not returned';

            historyItem.innerHTML = `
                <div class="history-book-title">${item.bookTitle}</div>
                <div class="history-details">
                    <div class="history-dates">
                        <div class="history-date">
                            <span>Borrowed:</span>
                            <span>${borrowDate}</span>
                        </div>
                        <div class="history-date">
                            <span>Returned:</span>
                            <span>${returnDate}</span>
                        </div>
                    </div>
                    <div class="history-status status-${item.status}">
                        ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                </div>
            `;

            container.appendChild(historyItem);
        });
    }

    createBookCard(book, isCompact = false) {
        const card = document.createElement('div');
        card.className = 'book-card';

        const statusClass = book.status === 'available' ? 'available' : 'borrowed';
        const favoriteClass = book.isFavorite ? 'active' : '';

        card.innerHTML = `
            <img src="${book.imageUrl}" alt="${book.title}" class="book-cover" onerror="this.src='${this.getDefaultCover()}'">
            <div class="book-status ${statusClass}">
                <i class="fas fa-${book.status === 'available' ? 'check' : 'clock'}"></i>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <span class="book-category">${book.category}</span>
                ${!isCompact ? `
                    <div class="book-actions">
                        <button class="btn-view" onclick="library.viewBook(${book.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn-edit" onclick="library.editBook(${book.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-favorite ${favoriteClass}" onclick="library.toggleFavorite(${book.id})">
                            <i class="fas fa-heart"></i> Favorite
                        </button>
                        ${book.status === 'available' ?
                            `<button class="btn-borrow" onclick="library.borrowBook(${book.id})">
                                <i class="fas fa-hand-holding"></i> Borrow
                            </button>` :
                            `<button class="btn-return" onclick="library.returnBook(${book.id})">
                                <i class="fas fa-undo"></i> Return
                            </button>`
                        }
                        <button class="btn-delete" onclick="library.deleteBook(${book.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    // Modal Management
    viewBook(bookId) {
        const book = this.books.find(book => book.id === bookId);
        if (!book) return;

        const modal = document.getElementById('bookModal');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
            <div class="book-detail">
                <div class="book-detail-cover">
                    <img src="${book.imageUrl}" alt="${book.title}" onerror="this.src='${this.getDefaultCover()}'">
                </div>
                <div class="book-detail-info">
                    <h2>${book.title}</h2>
                    <p class="book-author">by ${book.author}</p>
                    <div class="book-detail-meta">
                        <span class="book-category">${book.category}</span>
                        ${book.publicationYear ? `<span>Published: ${book.publicationYear}</span>` : ''}
                        ${book.isbn ? `<span>ISBN: ${book.isbn}</span>` : ''}
                    </div>
                    <div class="book-status-large ${book.status}">
                        <i class="fas fa-${book.status === 'available' ? 'check-circle' : 'clock'}"></i>
                        ${book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </div>
                    ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
                    <div class="book-detail-actions">
                        <button class="btn-edit" onclick="library.editBook(${book.id}); library.closeModal();">
                            <i class="fas fa-edit"></i> Edit Book
                        </button>
                        <button class="btn-favorite ${book.isFavorite ? 'active' : ''}" onclick="library.toggleFavorite(${book.id}); this.classList.toggle('active');">
                            <i class="fas fa-heart"></i> ${book.isFavorite ? 'Remove from' : 'Add to'} Favorites
                        </button>
                        ${book.status === 'available' ?
                            `<button class="btn-borrow" onclick="library.borrowBook(${book.id}); library.closeModal();">
                                <i class="fas fa-hand-holding"></i> Borrow Book
                            </button>` :
                            `<button class="btn-return" onclick="library.returnBook(${book.id}); library.closeModal();">
                                <i class="fas fa-undo"></i> Return Book
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }

    editBook(bookId) {
        const book = this.books.find(book => book.id === bookId);
        if (!book) return;

        // Populate edit form
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editTitle').value = book.title;
        document.getElementById('editAuthor').value = book.author;
        document.getElementById('editIsbn').value = book.isbn || '';
        document.getElementById('editCategory').value = book.category;
        document.getElementById('editPublicationYear').value = book.publicationYear || '';
        document.getElementById('editImageUrl').value = book.imageUrl.startsWith('data:') ? '' : book.imageUrl;
        document.getElementById('editDescription').value = book.description || '';

        // Show edit modal
        document.getElementById('editModal').classList.add('show');
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // Search and Filter
    filterBooks() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filteredBooks = this.books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                                book.author.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || book.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        this.renderFilteredBooks(filteredBooks);
    }

    sortBooks() {
        const sortBy = document.getElementById('sortBy').value;
        const sortOrder = document.getElementById('sortOrder').value;

        this.books.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'author':
                    aValue = a.author.toLowerCase();
                    bValue = b.author.toLowerCase();
                    break;
                case 'year':
                    aValue = a.publicationYear || 0;
                    bValue = b.publicationYear || 0;
                    break;
                case 'category':
                    aValue = a.category.toLowerCase();
                    bValue = b.category.toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        this.saveData();
        this.renderBookList();
    }

    renderFilteredBooks(filteredBooks) {
        const container = document.getElementById('bookList');
        container.innerHTML = '';

        if (filteredBooks.length === 0) {
            container.innerHTML = '<p class="text-center">No books match your search criteria.</p>';
            return;
        }

        filteredBooks.forEach(book => {
            const bookCard = this.createBookCard(book);
            container.appendChild(bookCard);
        });
    }

    // Utility Functions
    clearAddForm() {
        document.getElementById('addBookForm').reset();
    }

    getDefaultCover() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMmEyYTJhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2I5YjliOSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIENvdmVyPC90ZXh0Pjwvc3ZnPg==';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // Add to page
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Sample Data Generation
    generateSampleBooks() {
        if (this.books.length > 0) return; // Don't generate if books already exist

        const sampleBooks = [
            {
                title: "The Pragmatic Programmer",
                author: "Andrew Hunt and David Thomas",
                category: "Technology",
                publicationYear: 1999,
                description: "A guide to becoming a better programmer through practical advice and real-world examples.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51W1sBPO7tL._SX376_BO1,204,203,200_.jpg"
            },
            {
                title: "Clean Code",
                author: "Robert C. Martin",
                category: "Technology",
                publicationYear: 2008,
                description: "A handbook of agile software craftsmanship that teaches how to write clean, maintainable code.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51E2055ZGUL._SX376_BO1,204,203,200_.jpg"
            },
            {
                title: "JavaScript: The Good Parts",
                author: "Douglas Crockford",
                category: "Technology",
                publicationYear: 2008,
                description: "A guide to the best features of JavaScript, helping developers avoid the bad parts.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/5166ztxN-hL._SX376_BO1,204,203,200_.jpg"
            },
            {
                title: "The Lean Startup",
                author: "Eric Ries",
                category: "Business",
                publicationYear: 2011,
                description: "A methodology for developing businesses and products using validated learning and scientific experimentation.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51WIKlio9qL._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "Atomic Habits",
                author: "James Clear",
                category: "Self-Help",
                publicationYear: 2018,
                description: "An easy and proven way to build good habits and break bad ones using small, incremental changes.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51-nXsSRfZL._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "Sapiens: A Brief History of Humankind",
                author: "Yuval Noah Harari",
                category: "History",
                publicationYear: 2011,
                description: "A sweeping narrative of human history from the Stone Age to the modern age.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51Sn8PEXwcL._SX331_BO1,204,203,200_.jpg"
            },
            {
                title: "The Psychology of Money",
                author: "Morgan Housel",
                category: "Business",
                publicationYear: 2020,
                description: "Timeless lessons on wealth, greed, and happiness from the stories of some of the world's most successful investors.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/41cWqh0OeQL._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "Educated",
                author: "Tara Westover",
                category: "Biography",
                publicationYear: 2018,
                description: "A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/41qlj3qX2SL._SX327_BO1,204,203,200_.jpg"
            },
            {
                title: "The Midnight Library",
                author: "Matt Haig",
                category: "Fiction",
                publicationYear: 2020,
                description: "A novel about a woman who finds herself in a library between life and death, where she can live out different versions of her life.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51D9f0iS9GL._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "Breath: The New Science of a Lost Art",
                author: "James Nestor",
                category: "Health",
                publicationYear: 2020,
                description: "A fascinating journey through the science of breathing and its impact on our health and longevity.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/41R6FKsyVUL._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "The Alchemist",
                author: "Paulo Coelho",
                category: "Fiction",
                publicationYear: 1988,
                description: "A philosophical novel about a shepherd boy's journey to find his personal legend and treasure.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/410llGwMZGL._SX328_BO1,204,203,200_.jpg"
            },
            {
                title: "Thinking, Fast and Slow",
                author: "Daniel Kahneman",
                category: "Self-Help",
                publicationYear: 2011,
                description: "A groundbreaking exploration of how we think, make decisions, and the two systems that drive the way we think.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/41wI3RQQknL._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "The Code Breaker",
                author: "Walter Isaacson",
                category: "Biography",
                publicationYear: 2021,
                description: "The story of Jennifer Doudna and the gene-editing revolution that will forever change our lives.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/41j1YeV9z7L._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "Project Hail Mary",
                author: "Andy Weir",
                category: "Science",
                publicationYear: 2021,
                description: "A lone astronaut must save the earth from disaster in this high-stakes science fiction adventure.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51UYm0KvTIL._SX329_BO1,204,203,200_.jpg"
            },
            {
                title: "The Four Winds",
                author: "Kristin Hannah",
                category: "Fiction",
                publicationYear: 2021,
                description: "A historical novel set during the Great Depression, following a woman's struggle to keep her family alive.",
                imageUrl: "https://images-na.ssl-images-amazon.com/images/I/51X5YiR-CM L._SX329_BO1,204,203,200_.jpg"
            }
        ];

        // Add sample books with additional properties
        sampleBooks.forEach((bookData, index) => {
            const book = {
                id: Date.now() + index,
                ...bookData,
                isbn: this.generateISBN(),
                status: Math.random() > 0.7 ? 'borrowed' : 'available',
                isFavorite: Math.random() > 0.8,
                dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            this.books.push(book);

            // Add some borrowing history for borrowed books
            if (book.status === 'borrowed') {
                const borrowDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000);
                book.borrowDate = borrowDate.toISOString();

                this.history.push({
                    id: Date.now() + index + 1000,
                    bookId: book.id,
                    bookTitle: book.title,
                    borrowDate: borrowDate.toISOString(),
                    returnDate: null,
                    status: 'borrowed'
                });
            }
        });

        this.saveData();
    }

    generateISBN() {
        // Generate a random 13-digit ISBN-like number
        let isbn = '978';
        for (let i = 0; i < 10; i++) {
            isbn += Math.floor(Math.random() * 10);
        }
        return isbn;
    }
}

// Initialize the library when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.library = new BookLibrary();
});

// Global functions for onclick handlers
function closeModal() {
    window.library.closeModal();
}