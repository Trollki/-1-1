// Application State
let currentUser = null;
let news = [];
let likedNews = new Set();
let viewedNews = new Set();
let currentPage = 'home';
let currentFilter = 'all';
let searchQuery = '';
let currentImageIndex = 0;
let currentImageGallery = [];

// User credentials and roles
let users = {
    'Вадим': { password: 'ЗМІ11', role: 'admin' },
    'Вася': { password: 'ЗМІ1+1', role: 'journalist' }
};

// DOM Elements
const pages = {
    home: document.getElementById('homePage'),
    about: document.getElementById('aboutPage'),
    leaderboard: document.getElementById('leaderboardPage'),
    article: document.getElementById('articlePage'),
    manage: document.getElementById('manageNewsPage'),
    analytics: document.getElementById('analyticsPage'),
    admin: document.getElementById('adminPanelPage')
};

const navLinks = document.querySelectorAll('.nav-link');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadData();
    initializeEventListeners();
    checkURLForArticle();
    renderNews();
    updateStatistics();
    updateAboutStats();
});

// Load users from localStorage
function loadUsers() {
    const savedUsers = localStorage.getItem('zmi_users');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    }
}

// Save users to localStorage
function saveUsers() {
    localStorage.setItem('zmi_users', JSON.stringify(users));
}

// Load data from localStorage
function loadData() {
    const savedNews = localStorage.getItem('zmi_news');
    const savedLikes = localStorage.getItem('zmi_likes');
    const savedViews = localStorage.getItem('zmi_views');
    
    if (savedNews) {
        news = JSON.parse(savedNews);
    } else {
        // Add sample news if no data exists
        news = [
            {
                id: Date.now() + 1,
                title: "Важливі економічні зміни в Україні",
                content: "Уряд оголосив про нові економічні реформи, які мають покращити інвестиційний клімат та залучити іноземні інвестиції. Експерти позитивно оцінюють ці кроки та прогнозують зростання ВВП на 3-5% у наступному році.",
                tag: "Економіка",
                author: "Вадим",
                date: new Date().toLocaleDateString('uk-UA'),
                likes: 15,
                views: 234,
                video: null,
                images: []
            },
            {
                id: Date.now() + 2,
                title: "Культурний фестиваль у Києві",
                content: "У столиці стартував міжнародний культурний фестиваль, який триватиме тиждень. Очікується участь артистів з понад 20 країн світу. Програма включає концерти, виставки та майстер-класи.",
                tag: "Культура",
                author: "Вася",
                date: new Date().toLocaleDateString('uk-UA'),
                likes: 23,
                views: 156,
                video: null,
                images: []
            },
            {
                id: Date.now() + 3,
                title: "Прорив у сфері штучного інтелекту",
                content: "Українські вчені розробили новий алгоритм машинного навчання, який може революціонізувати медичну діагностику. Технологія вже пройшла успішні тести в провідних клініках.",
                tag: "Технології",
                author: "Вадим",
                date: new Date().toLocaleDateString('uk-UA'),
                likes: 42,
                views: 389,
                video: null,
                images: []
            }
        ];
        saveData();
    }
    
    if (savedLikes) {
        likedNews = new Set(JSON.parse(savedLikes));
    }
    
    if (savedViews) {
        viewedNews = new Set(JSON.parse(savedViews));
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('zmi_news', JSON.stringify(news));
    localStorage.setItem('zmi_likes', JSON.stringify([...likedNews]));
    localStorage.setItem('zmi_views', JSON.stringify([...viewedNews]));
}

// Initialize event listeners
function initializeEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(link.dataset.page);
        });
    });
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(link.dataset.page);
            mobileMenu.classList.remove('active');
        });
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    });
    
    // Login/Logout buttons
    document.getElementById('loginBtn').addEventListener('click', openLoginModal);
    document.getElementById('mobileLoginBtn').addEventListener('click', openLoginModal);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('mobileLogoutBtn').addEventListener('click', logout);
    
    // Journalist panel buttons
    document.getElementById('addNewsBtn').addEventListener('click', openAddNewsModal);
    document.getElementById('manageNewsBtn').addEventListener('click', () => navigateToPage('manage'));
    document.getElementById('analyticsBtn').addEventListener('click', () => navigateToPage('analytics'));
    document.getElementById('adminPanelBtn').addEventListener('click', () => navigateToPage('admin'));
    
    // Back buttons
    document.getElementById('backToHome').addEventListener('click', () => navigateToPage('home'));
    document.getElementById('backToHomeFromManage').addEventListener('click', () => navigateToPage('home'));
    document.getElementById('backToHomeFromAnalytics').addEventListener('click', () => navigateToPage('home'));
    document.getElementById('backToHomeFromAdmin').addEventListener('click', () => navigateToPage('home'));
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeModals);
    });
    
    // Modal background click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('addNewsForm').addEventListener('submit', handleAddNews);
    document.getElementById('createJournalistForm').addEventListener('submit', handleCreateJournalist);
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Tag filter buttons
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterByTag(this.dataset.tag);
            updateTagButtons(this);
        });
    });
    
    // Image preview
    document.getElementById('newsImages').addEventListener('change', handleImagePreview);
    
    // Image modal navigation
    document.getElementById('prevImage').addEventListener('click', () => navigateImage(-1));
    document.getElementById('nextImage').addEventListener('click', () => navigateImage(1));
    
    // Admin checkbox visibility
    updateAdminControls();
    
    // URL change detection
    window.addEventListener('popstate', checkURLForArticle);
}

// Navigation
function navigateToPage(pageName) {
    // Hide all pages
    Object.values(pages).forEach(page => page.classList.remove('active'));
    
    // Show selected page
    if (pages[pageName]) {
        pages[pageName].classList.add('active');
        currentPage = pageName;
        
        // Update navigation links
        updateNavLinks(pageName);
        
        // Load page-specific content
        if (pageName === 'leaderboard') {
            updateLeaderboard();
        } else if (pageName === 'manage') {
            renderManageNews();
        } else if (pageName === 'analytics') {
            renderAnalytics();
        } else if (pageName === 'admin') {
            renderAdminPanel();
        }
    }
}

function updateNavLinks(activePage) {
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === activePage);
    });
    
    mobileNavLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === activePage);
    });
}

// URL handling for direct article access
function checkURLForArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('article');
    
    if (articleId) {
        const article = news.find(item => item.id.toString() === articleId);
        if (article) {
            showArticleDetail(article);
        }
    }
}

// Login functionality
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (users[username] && users[username].password === password) {
        currentUser = { name: username, role: users[username].role };
        updateUIForLoggedInUser();
        closeModals();
        clearLoginForm();
    } else {
        alert('Невірне ім\'я користувача або пароль!');
    }
}

function logout() {
    currentUser = null;
    updateUIForLoggedOutUser();
    if (currentPage === 'leaderboard' || currentPage === 'manage') {
        navigateToPage('home');
    }
}

function updateUIForLoggedInUser() {
    // Hide login buttons, show logout buttons
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('mobileLoginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
    document.getElementById('mobileLogoutBtn').style.display = 'block';
    
    // Show journalist panel and leaderboard link
    document.getElementById('journalistPanel').style.display = 'block';
    document.getElementById('leaderboardLink').style.display = 'block';
    document.getElementById('mobileLeaderboardLink').style.display = 'block';
    
    // Show admin panel button for admins
    if (currentUser.role === 'admin') {
        document.getElementById('adminPanelBtn').style.display = 'block';
    }
    
    // Update journalist info
    document.getElementById('journalistName').textContent = currentUser.name;
    updateJournalistStats();
}

function updateAdminControls() {
    const isPinnedCheckbox = document.getElementById('isPinned');
    if (isPinnedCheckbox) {
        isPinnedCheckbox.parentElement.style.display = 
            (currentUser && currentUser.role === 'admin') ? 'block' : 'none';
    }
}

function updateUIForLoggedOutUser() {
    // Show login buttons, hide logout buttons
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('mobileLoginBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('mobileLogoutBtn').style.display = 'none';
    
    // Hide journalist panel and leaderboard link
    document.getElementById('journalistPanel').style.display = 'none';
    document.getElementById('leaderboardLink').style.display = 'none';
    document.getElementById('mobileLeaderboardLink').style.display = 'none';
    document.getElementById('adminPanelBtn').style.display = 'none';
    
    updateAdminControls();
}

function updateJournalistStats() {
    if (!currentUser) return;
    
    const userNews = news.filter(item => item.author === currentUser.name);
    const userLikes = userNews.reduce((total, item) => total + item.likes, 0);
    const userViews = userNews.reduce((total, item) => total + item.views, 0);
    
    document.getElementById('journalistPosts').textContent = userNews.length;
    document.getElementById('journalistRating').textContent = userLikes;
    document.getElementById('journalistViews').textContent = userViews;
}

// Add news functionality
function openAddNewsModal() {
    document.getElementById('addNewsModal').style.display = 'block';
}

function handleAddNews(event) {
    event.preventDefault();
    
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const tag = document.getElementById('newsTag').value;
    const video = document.getElementById('newsVideo').value.trim();
    const isPinned = document.getElementById('isPinned').checked;
    const imageFiles = document.getElementById('newsImages').files;
    
    if (!title || !content || !tag) {
        alert('Заповніть всі обов\'язкові поля!');
        return;
    }
    
    // Process images
    const images = [];
    for (let i = 0; i < imageFiles.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            images.push(e.target.result);
            
            // When all images are processed, create the news item
            if (images.length === imageFiles.length) {
                createNewsItem(title, content, tag, video, images, isPinned);
            }
        };
        reader.readAsDataURL(imageFiles[i]);
    }
    
    // If no images, create news item immediately
    if (imageFiles.length === 0) {
        createNewsItem(title, content, tag, video, [], isPinned);
    }
}

function createNewsItem(title, content, tag, video, images, isPinned = false) {
    const newNews = {
        id: Date.now(),
        title,
        content,
        tag,
        author: currentUser.name,
        date: new Date().toLocaleDateString('uk-UA'),
        likes: 0,
        views: 0,
        video: video || null,
        images: images,
        isPinned: isPinned && currentUser && currentUser.role === 'admin',
        createdAt: new Date().toISOString()
    };
    
    news.unshift(newNews);
    saveData();
    renderNews();
    updateStatistics();
    updateAboutStats();
    updateJournalistStats();
    closeModals();
    clearAddNewsForm();
    showNotification('Новину успішно опубліковано!', 'success');
}

function handleImagePreview(event) {
    const files = event.target.files;
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            
            const container = document.createElement('div');
            container.className = 'preview-image-container';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.onclick = () => container.remove();
            
            container.appendChild(img);
            container.appendChild(removeBtn);
            preview.appendChild(container);
        };
        
        reader.readAsDataURL(file);
    }
}

// Search functionality
function performSearch() {
    searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
    renderNews();
}

// News rendering
function renderNews(newsToRender = null) {
    let filteredNews = newsToRender || news;
    
    // Sort by pinned status first, then by date
    filteredNews.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
    
    // Apply tag filter
    if (currentFilter !== 'all') {
        filteredNews = filteredNews.filter(item => item.tag === currentFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredNews = filteredNews.filter(item => 
            item.title.toLowerCase().includes(searchQuery) ||
            item.content.toLowerCase().includes(searchQuery)
        );
    }
    
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '';
    
    if (filteredNews.length === 0) {
        newsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">Новин не знайдено</p>';
        return;
    }
    
    filteredNews.forEach(item => {
        const newsCard = createNewsCard(item);
        newsGrid.appendChild(newsCard);
    });
}

function createNewsCard(item) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.dataset.id = item.id;
    
    const isLiked = likedNews.has(item.id.toString());
    const canDelete = currentUser && (currentUser.name === item.author || currentUser.role === 'admin');
    
    // Convert YouTube URL to embed URL for inline viewing
    const embedVideo = item.video ? convertToEmbedURL(item.video) : null;
    
    card.innerHTML = `
        <div class="news-content">
            <div class="news-header">
                <h3 class="news-title" onclick="showArticleDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})">${item.title}</h3>
                <span class="news-tag ${item.isPinned ? 'pinned' : ''}">${item.tag}</span>
            </div>
            <div class="news-text" onclick="showArticleDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})" style="cursor: pointer;">
                ${item.content.substring(0, 150)}${item.content.length > 150 ? '...' : ''}
            </div>
            ${item.images && item.images.length > 0 ? `
                <div class="news-images">
                    ${item.images.slice(0, 2).map(img => `
                        <img src="${img}" alt="News image" class="news-image" onclick="openImageGallery(${JSON.stringify(item.images).replace(/"/g, '&quot;')}, ${item.images.indexOf(img)})">
                    `).join('')}
                    ${item.images.length > 2 ? `<div class="more-images">+${item.images.length - 2} фото</div>` : ''}
                </div>
            ` : ''}
            ${embedVideo ? `
                <iframe class="news-video" 
                    src="${embedVideo}" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                </iframe>
            ` : ''}
            <div class="news-footer">
                <div class="news-meta">
                    <div>Автор: ${item.author}</div>
                    <div>Дата: ${item.date}</div>
                    <div>Перегляди: ${item.views}</div>
                </div>
                <div class="news-actions">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${item.id})">
                        ❤️
                        <span class="like-count">${item.likes}</span>
                    </button>
                    <button class="action-btn copy-link-btn" onclick="copyArticleLink(${item.id})">
                        Копіювати посилання
                    </button>
                    ${canDelete ? `
                        <button class="action-btn delete-btn" onclick="deleteNews(${item.id})">
                            Видалити
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Article detail functionality
function showArticleDetail(article) {
    // Increment view count
    if (!viewedNews.has(article.id.toString())) {
        article.views++;
        viewedNews.add(article.id.toString());
        
        // Update the article in the news array
        const newsIndex = news.findIndex(item => item.id === article.id);
        if (newsIndex !== -1) {
            news[newsIndex] = article;
        }
        
        saveData();
        updateStatistics();
        updateAboutStats();
        updateJournalistStats();
    }
    
    const articleDetail = document.getElementById('articleDetail');
    const isLiked = likedNews.has(article.id.toString());
    const canDelete = currentUser && (currentUser.name === article.author || currentUser.role === 'admin');
    
    const embedVideo = article.video ? convertToEmbedURL(article.video) : null;
    
    articleDetail.innerHTML = `
        <div class="article-detail">
            <h1 class="article-title">${article.title}</h1>
            <div class="article-meta">
                <div class="article-author-date">
                    <div>Автор: ${article.author}</div>
                    <div>Дата: ${article.date}</div>
                    <div>Перегляди: ${article.views}</div>
                </div>
                <span class="article-tag ${article.isPinned ? 'pinned' : ''}">${article.tag}</span>
            </div>
            ${article.images && article.images.length > 0 ? `
                <div class="article-images">
                    ${article.images.map(img => `
                        <img src="${img}" alt="Article image" class="article-image" onclick="openImageGallery(${JSON.stringify(article.images).replace(/"/g, '&quot;')}, ${article.images.indexOf(img)})">
                    `).join('')}
                </div>
            ` : ''}
            ${embedVideo ? `
                <iframe class="article-video" 
                    src="${embedVideo}" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                </iframe>
            ` : ''}
            <div class="article-text">${article.content}</div>
            <div class="article-actions">
                <div class="news-actions">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${article.id})">
                        ❤️
                        <span class="like-count">${article.likes}</span>
                    </button>
                    <button class="action-btn copy-link-btn" onclick="copyArticleLink(${article.id})">
                        Копіювати посилання
                    </button>
                    ${canDelete ? `
                        <button class="action-btn delete-btn" onclick="deleteNews(${article.id})">
                            Видалити
                        </button>
                    ` : ''}
                </div>
                <div class="article-share">
                    <button class="share-btn share-facebook" onclick="shareToFacebook(${article.id})">
                        Facebook
                    </button>
                    <button class="share-btn share-twitter" onclick="shareToTwitter(${article.id})">
                        Twitter
                    </button>
                    <button class="share-btn share-telegram" onclick="shareToTelegram(${article.id})">
                        Telegram
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Update URL
    const newUrl = `${window.location.pathname}?article=${article.id}`;
    window.history.pushState({ articleId: article.id }, '', newUrl);
    
    navigateToPage('article');
}

// Copy article link
function copyArticleLink(articleId) {
    const url = `${window.location.origin}${window.location.pathname}?article=${articleId}`;
    navigator.clipboard.writeText(url).then(() => {
        showNotification('Посилання скопійовано!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Посилання скопійовано!', 'success');
    });
}

// Social sharing functions
function shareToFacebook(articleId) {
    const url = `${window.location.origin}${window.location.pathname}?article=${articleId}`;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareToTwitter(articleId) {
    const article = news.find(item => item.id === articleId);
    const url = `${window.location.origin}${window.location.pathname}?article=${articleId}`;
    const text = `${article.title} - ЗМІ 1+1`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function shareToTelegram(articleId) {
    const article = news.find(item => item.id === articleId);
    const url = `${window.location.origin}${window.location.pathname}?article=${articleId}`;
    const text = `${article.title} - ЗМІ 1+1\n${url}`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
}

// Delete news
function deleteNews(newsId) {
    if (confirm('Ви впевнені, що хочете видалити цю новину?')) {
        news = news.filter(item => item.id !== newsId);
        likedNews.delete(newsId.toString());
        viewedNews.delete(newsId.toString());
        
        saveData();
        renderNews();
        updateStatistics();
        updateAboutStats();
        updateJournalistStats();
        
        // If we're on the article page and it's the deleted article, go back to home
        if (currentPage === 'article') {
            const urlParams = new URLSearchParams(window.location.search);
            const currentArticleId = urlParams.get('article');
            if (currentArticleId === newsId.toString()) {
                window.history.pushState({}, '', window.location.pathname);
                navigateToPage('home');
            }
        }
        
        // If we're on the manage page, re-render
        if (currentPage === 'manage') {
            renderManageNews();
        }
        
        showNotification('Новину видалено!', 'info');
    }
}

// Manage news page
function renderManageNews() {
    if (!currentUser) return;
    
    const userNews = news.filter(item => 
        item.author === currentUser.name || currentUser.role === 'admin'
    );
    
    const manageGrid = document.getElementById('manageNewsGrid');
    manageGrid.innerHTML = '';
    
    if (userNews.length === 0) {
        manageGrid.innerHTML = '<p style="text-align: center; color: #666;">У вас немає опублікованих новин</p>';
        return;
    }
    
    userNews.forEach(item => {
        const manageItem = document.createElement('div');
        manageItem.className = 'manage-news-item';
        
        manageItem.innerHTML = `
            <div class="manage-news-info">
                <h3>${item.title}</h3>
                <p>Автор: ${item.author} | Дата: ${item.date} | Лайки: ${item.likes} | Перегляди: ${item.views} ${item.isPinned ? '| 📌 Закріплено' : ''}</p>
            </div>
            <div class="manage-news-actions">
                <button class="action-btn read-more-btn" onclick="showArticleDetail(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    Переглянути
                </button>
                <button class="action-btn delete-btn" onclick="deleteNews(${item.id})">
                    Видалити
                </button>
            </div>
        `;
        
        manageGrid.appendChild(manageItem);
    });
}

// Analytics page
function renderAnalytics() {
    if (!currentUser) return;
    
    const userNews = news.filter(item => item.author === currentUser.name);
    
    // Render popularity chart
    renderPopularityChart(userNews);
    
    // Render tag statistics
    renderTagStats(userNews);
    
    // Render activity chart
    renderActivityChart(userNews);
    
    // Render top articles
    renderTopArticles(userNews);
}

function renderPopularityChart(userNews) {
    const chartContainer = document.getElementById('popularityChart');
    chartContainer.innerHTML = '';
    
    if (userNews.length === 0) {
        chartContainer.innerHTML = '<p style="text-align: center; color: #666;">Немає даних для відображення</p>';
        return;
    }
    
    const maxLikes = Math.max(...userNews.map(item => item.likes), 1);
    
    userNews.slice(0, 5).forEach(item => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${(item.likes / maxLikes) * 150}px`;
        bar.setAttribute('data-value', item.likes);
        bar.title = item.title;
        chartContainer.appendChild(bar);
    });
}

function renderTagStats(userNews) {
    const tagStatsContainer = document.getElementById('tagStats');
    tagStatsContainer.innerHTML = '';
    
    const tagCounts = {};
    userNews.forEach(item => {
        tagCounts[item.tag] = (tagCounts[item.tag] || 0) + 1;
    });
    
    Object.entries(tagCounts).forEach(([tag, count]) => {
        const statItem = document.createElement('div');
        statItem.className = 'tag-stat-item';
        statItem.innerHTML = `
            <span class="tag-stat-name">${tag}</span>
            <span class="tag-stat-count">${count}</span>
        `;
        tagStatsContainer.appendChild(statItem);
    });
}

function renderActivityChart(userNews) {
    const activityContainer = document.getElementById('activityChart');
    activityContainer.innerHTML = '';
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toDateString());
    }
    
    last7Days.forEach(dateStr => {
        const dayNews = userNews.filter(item => {
            const itemDate = new Date(item.createdAt || item.date);
            return itemDate.toDateString() === dateStr;
        });
        
        const activityDay = document.createElement('div');
        activityDay.className = 'activity-day';
        
        if (dayNews.length === 0) {
            activityDay.classList.add('low');
        } else if (dayNews.length <= 2) {
            activityDay.classList.add('medium');
        } else {
            activityDay.classList.add('high');
        }
        
        activityDay.textContent = dayNews.length;
        activityDay.title = `${new Date(dateStr).toLocaleDateString('uk-UA')}: ${dayNews.length} публікацій`;
        activityContainer.appendChild(activityDay);
    });
}

function renderTopArticles(userNews) {
    const topArticlesContainer = document.getElementById('topArticles');
    topArticlesContainer.innerHTML = '';
    
    const sortedNews = [...userNews].sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
    
    sortedNews.slice(0, 5).forEach(item => {
        const articleItem = document.createElement('div');
        articleItem.className = 'top-article-item';
        articleItem.onclick = () => showArticleDetail(item);
        
        articleItem.innerHTML = `
            <div class="top-article-title">${item.title}</div>
            <div class="top-article-stats">
                <span>❤️ ${item.likes}</span>
                <span>👁️ ${item.views}</span>
            </div>
        `;
        
        topArticlesContainer.appendChild(articleItem);
    });
}

// Admin Panel functionality
function renderAdminPanel() {
    if (!currentUser || currentUser.role !== 'admin') {
        navigateToPage('home');
        return;
    }
    
    renderJournalistsList();
    updateAdminStats();
    renderRecentActivity();
}

function handleCreateJournalist(event) {
    event.preventDefault();
    
    const name = document.getElementById('newJournalistName').value.trim();
    const password = document.getElementById('newJournalistPassword').value.trim();
    const role = document.getElementById('newJournalistRole').value;
    
    if (!name || !password) {
        alert('Заповніть всі поля!');
        return;
    }
    
    if (users[name]) {
        alert('Журналіст з таким іменем вже існує!');
        return;
    }
    
    users[name] = { password, role };
    saveUsers();
    
    // Clear form
    document.getElementById('newJournalistName').value = '';
    document.getElementById('newJournalistPassword').value = '';
    document.getElementById('newJournalistRole').value = 'journalist';
    
    renderJournalistsList();
    updateAdminStats();
    updateAboutStats();
    
    showNotification(`Журналіста "${name}" успішно створено!`, 'success');
}

function renderJournalistsList() {
    const journalistsList = document.getElementById('journalistsList');
    journalistsList.innerHTML = '';
    
    Object.entries(users).forEach(([name, userData]) => {
        const journalistItem = document.createElement('div');
        journalistItem.className = 'journalist-item';
        
        const userNews = news.filter(item => item.author === name);
        const userLikes = userNews.reduce((total, item) => total + item.likes, 0);
        const userViews = userNews.reduce((total, item) => total + item.views, 0);
        
        journalistItem.innerHTML = `
            <div class="journalist-info">
                <div class="journalist-name">${name}</div>
                <div class="journalist-details">
                    Пароль: <span class="journalist-password">${userData.password}</span>
                    <span class="journalist-role ${userData.role}">${userData.role === 'admin' ? 'АДМІН' : 'ЖУРНАЛІСТ'}</span>
                </div>
                <div class="journalist-details">
                    Публікації: ${userNews.length} | Лайки: ${userLikes} | Перегляди: ${userViews}
                </div>
            </div>
            <div class="journalist-actions">
                <button class="btn btn-warning btn-small" onclick="editJournalist('${name}')">
                    Редагувати
                </button>
                ${name !== 'Вадим' ? `
                    <button class="btn btn-danger btn-small" onclick="deleteJournalist('${name}')">
                        Видалити
                    </button>
                ` : ''}
            </div>
        `;
        
        journalistsList.appendChild(journalistItem);
    });
}

function editJournalist(name) {
    const userData = users[name];
    const newPassword = prompt(`Введіть новий пароль для ${name}:`, userData.password);
    
    if (newPassword !== null && newPassword.trim() !== '') {
        users[name].password = newPassword.trim();
        saveUsers();
        renderJournalistsList();
        showNotification(`Пароль для "${name}" оновлено!`, 'success');
    }
}

function deleteJournalist(name) {
    if (name === 'Вадим') {
        alert('Неможливо видалити головного адміністратора!');
        return;
    }
    
    if (confirm(`Ви впевнені, що хочете видалити журналіста "${name}"? Це також видалить всі його публікації.`)) {
        // Delete user
        delete users[name];
        saveUsers();
        
        // Delete user's news
        news = news.filter(item => item.author !== name);
        saveData();
        
        // Update UI
        renderJournalistsList();
        updateAdminStats();
        updateAboutStats();
        updateStatistics();
        
        // If deleted user was logged in, log them out
        if (currentUser && currentUser.name === name) {
            logout();
        }
        
        showNotification(`Журналіста "${name}" видалено!`, 'info');
    }
}

function updateAdminStats() {
    const totalJournalists = Object.keys(users).length;
    const totalNewsCount = news.length;
    const totalLikesCount = news.reduce((total, item) => total + item.likes, 0);
    const totalViewsCount = news.reduce((total, item) => total + item.views, 0);
    
    document.getElementById('adminTotalJournalists').textContent = totalJournalists;
    document.getElementById('adminTotalNews').textContent = totalNewsCount;
    document.getElementById('adminTotalLikes').textContent = totalLikesCount;
    document.getElementById('adminTotalViews').textContent = totalViewsCount;
}

function renderRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    recentActivity.innerHTML = '';
    
    // Get recent news (last 10)
    const recentNews = [...news]
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
        .slice(0, 10);
    
    if (recentNews.length === 0) {
        recentActivity.innerHTML = '<p style="text-align: center; color: #666;">Немає останньої активності</p>';
        return;
    }
    
    recentNews.forEach(item => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const timeAgo = getTimeAgo(new Date(item.createdAt || item.date));
        
        activityItem.innerHTML = `
            <div class="activity-icon">📰</div>
            <div class="activity-text">
                <strong>${item.author}</strong> опублікував новину "<strong>${item.title}</strong>"
            </div>
            <div class="activity-time">${timeAgo}</div>
        `;
        
        recentActivity.appendChild(activityItem);
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
        return `${diffMinutes} хв тому`;
    } else if (diffHours < 24) {
        return `${diffHours} год тому`;
    } else if (diffDays === 1) {
        return 'Вчора';
    } else {
        return `${diffDays} днів тому`;
    }
}

// Convert YouTube URL to embed URL
function convertToEmbedURL(url) {
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1];
        return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
}

// Like functionality
function toggleLike(newsId) {
    const newsItem = news.find(item => item.id === newsId);
    const newsIdStr = newsId.toString();
    
    if (!newsItem) return;
    
    if (likedNews.has(newsIdStr)) {
        likedNews.delete(newsIdStr);
        newsItem.likes--;
    } else {
        likedNews.add(newsIdStr);
        newsItem.likes++;
    }
    
    saveData();
    renderNews();
    updateStatistics();
    updateAboutStats();
    updateJournalistStats();
    
    // Update article page if currently viewing
    if (currentPage === 'article') {
        const urlParams = new URLSearchParams(window.location.search);
        const currentArticleId = urlParams.get('article');
        if (currentArticleId === newsIdStr) {
            showArticleDetail(newsItem);
        }
    }
}

// Tag filtering
function filterByTag(tag) {
    currentFilter = tag;
    renderNews();
}

function updateTagButtons(activeButton) {
    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

// Leaderboard
function updateLeaderboard() {
    const journalists = {};
    
    // Calculate stats for each journalist
    news.forEach(item => {
        if (!journalists[item.author]) {
            journalists[item.author] = {
                name: item.author,
                posts: 0,
                likes: 0,
                views: 0
            };
        }
        
        journalists[item.author].posts++;
        journalists[item.author].likes += item.likes;
        journalists[item.author].views += item.views;
    });
    
    // Convert to array and sort by rating (likes + views/10)
    const sortedJournalists = Object.values(journalists).sort((a, b) => {
        const ratingA = a.likes + Math.floor(a.views / 10);
        const ratingB = b.likes + Math.floor(b.views / 10);
        return ratingB - ratingA;
    });
    
    const leaderboardBody = document.getElementById('leaderboardBody');
    leaderboardBody.innerHTML = '';
    
    sortedJournalists.forEach((journalist, index) => {
        const rating = journalist.likes + Math.floor(journalist.views / 10);
        const avgRating = journalist.posts > 0 ? (rating / journalist.posts).toFixed(1) : '0.0';
        const lastActivity = getLastActivity(journalist.name);
        const row = document.createElement('tr');
        
        let positionClass = '';
        if (index === 0) positionClass = 'gold';
        else if (index === 1) positionClass = 'silver';
        else if (index === 2) positionClass = 'bronze';
        
        // Add special badge for top performer
        if (index === 0 && rating > 50) positionClass += ' top-performer';
        
        const journalistBadges = getJournalistBadges(journalist.name);
        
        row.innerHTML = `
            <td><span class="position-badge ${positionClass}">${index + 1}</span></td>
            <td>${journalist.name}${journalistBadges}</td>
            <td>${journalist.posts}</td>
            <td>${journalist.likes}</td>
            <td>${journalist.views}</td>
            <td>${rating}</td>
            <td>${avgRating}</td>
            <td>${lastActivity}</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
}

function getJournalistBadges(journalistName) {
    let badges = '';
    
    // Admin badge
    if (users[journalistName] && users[journalistName].role === 'admin') {
        badges += '<span class="journalist-badge admin">АДМІН</span>';
    }
    
    // Active badge (posted in last 7 days)
    const recentNews = news.filter(item => {
        const itemDate = new Date(item.createdAt || item.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return item.author === journalistName && itemDate > weekAgo;
    });
    
    if (recentNews.length > 0) {
        badges += '<span class="journalist-badge active">АКТИВНИЙ</span>';
    }
    
    return badges;
}

function getLastActivity(journalistName) {
    const userNews = news.filter(item => item.author === journalistName);
    if (userNews.length === 0) return 'Немає активності';
    
    const lastNews = userNews.sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    )[0];
    
    const lastDate = new Date(lastNews.createdAt || lastNews.date);
    const now = new Date();
    const diffTime = Math.abs(now - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Сьогодні';
    if (diffDays === 2) return 'Вчора';
    if (diffDays <= 7) return `${diffDays} днів тому`;
    return lastDate.toLocaleDateString('uk-UA');
}

// Image gallery functionality
function openImageGallery(images, startIndex = 0) {
    currentImageGallery = images;
    currentImageIndex = startIndex;
    
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    
    modalImage.src = images[currentImageIndex];
    modal.style.display = 'block';
    
    // Update navigation buttons
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === images.length - 1;
}

function navigateImage(direction) {
    const newIndex = currentImageIndex + direction;
    
    if (newIndex >= 0 && newIndex < currentImageGallery.length) {
        currentImageIndex = newIndex;
        document.getElementById('modalImage').src = currentImageGallery[currentImageIndex];
        
        // Update navigation buttons
        document.getElementById('prevImage').disabled = currentImageIndex === 0;
        document.getElementById('nextImage').disabled = currentImageIndex === currentImageGallery.length - 1;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Statistics
function updateStatistics() {
    const totalNewsCount = news.length;
    const totalLikesCount = news.reduce((total, item) => total + item.likes, 0);
    const totalViewsCount = news.reduce((total, item) => total + item.views, 0);
    const activeJournalistsCount = new Set(news.map(item => item.author)).size;
    
    document.getElementById('totalNews').textContent = totalNewsCount;
    document.getElementById('totalLikes').textContent = totalLikesCount;
    document.getElementById('totalViews').textContent = totalViewsCount;
    document.getElementById('activeJournalists').textContent = activeJournalistsCount;
}

function updateAboutStats() {
    const totalNewsCount = news.length;
    const totalViewsCount = news.reduce((total, item) => total + item.views, 0);
    const totalJournalistsCount = Object.keys(users).length;
    
    document.getElementById('aboutTotalNews').textContent = totalNewsCount;
    document.getElementById('aboutTotalViews').textContent = totalViewsCount;
    document.getElementById('aboutTotalJournalists').textContent = totalJournalistsCount;
}

// Modal management
function closeModals() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('addNewsModal').style.display = 'none';
}

function clearLoginForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function clearAddNewsForm() {
    document.getElementById('newsTitle').value = '';
    document.getElementById('newsContent').value = '';
    document.getElementById('newsTag').value = '';
    document.getElementById('newsVideo').value = '';
    document.getElementById('newsImages').value = '';
    document.getElementById('isPinned').checked = false;
    document.getElementById('imagePreview').innerHTML = '';
}

// Make functions globally available
window.showArticleDetail = showArticleDetail;
window.toggleLike = toggleLike;
window.copyArticleLink = copyArticleLink;
window.deleteNews = deleteNews;
window.editJournalist = editJournalist;
window.deleteJournalist = deleteJournalist;