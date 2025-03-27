// posts-search.js - نظام البحث في المنشورات

// إنشاء كلاس لإدارة البحث في المنشورات
class PostsSearchManager {
    constructor() {
        this.posts = []; // سيتم تعبئتها من قاعدة البيانات
        this.searchResults = []; // نتائج البحث
        this.searchOptions = {
            type: 'all', // all, driver, content, location, date
            sortBy: 'date', // date, relevance, likes
            order: 'desc', // asc, desc
            dateRange: null // { start: Date, end: Date } أو null للكل
        };
        this.initSearchSystem();
    }

    // تهيئة نظام البحث
    initSearchSystem() {
        // إضافة عناصر البحث في الواجهة
        this.createSearchUI();
        
        // ربط أحداث البحث
        this.attachSearchEvents();
        
        // تحميل المنشورات عند بدء التشغيل
        this.loadPosts();
        
        console.log('تم تهيئة نظام البحث في المنشورات بنجاح');
    }

    // إنشاء واجهة البحث
    createSearchUI() {
        // التحقق من وجود حقل البحث الأساسي
        const searchInputContainer = document.querySelector('.search-input-wrapper');
        if (!searchInputContainer) return;

        // تحديث مؤشر النص في حقل البحث
        const searchInput = document.getElementById('navbarSearchInput');
        if (searchInput) {
            searchInput.placeholder = 'ابحث في المنشورات، السائقين، المحتوى...';
        }

        // إضافة خيارات البحث المتقدمة
        const advancedOptions = `
            <div class="advanced-search-options" id="advancedSearchOptions" style="display: none;">
                <div class="search-filters">
                    <div class="filter-section">
                        <h6>نوع البحث</h6>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="searchPostsType" id="searchPostsAll" checked>
                            <label class="btn btn-outline-primary" for="searchPostsAll">الكل</label>

                            <input type="radio" class="btn-check" name="searchPostsType" id="searchPostsDriver">
                            <label class="btn btn-outline-primary" for="searchPostsDriver">السائق</label>

                            <input type="radio" class="btn-check" name="searchPostsType" id="searchPostsContent">
                            <label class="btn btn-outline-primary" for="searchPostsContent">المحتوى</label>

                            <input type="radio" class="btn-check" name="searchPostsType" id="searchPostsLocation">
                            <label class="btn btn-outline-primary" for="searchPostsLocation">الموقع</label>
                        </div>
                    </div>

                    <div class="filter-section">
                        <h6>ترتيب حسب</h6>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="searchPostsSort" id="searchPostsDate" checked>
                            <label class="btn btn-outline-primary" for="searchPostsDate">التاريخ</label>

                            <input type="radio" class="btn-check" name="searchPostsSort" id="searchPostsRelevance">
                            <label class="btn btn-outline-primary" for="searchPostsRelevance">الصلة</label>

                            <input type="radio" class="btn-check" name="searchPostsSort" id="searchPostsLikes">
                            <label class="btn btn-outline-primary" for="searchPostsLikes">الإعجابات</label>
                        </div>
                    </div>

                    <div class="filter-section">
                        <h6>الترتيب</h6>
                        <div class="btn-group w-100" role="group">
                            <input type="radio" class="btn-check" name="searchPostsOrder" id="searchPostsDesc" checked>
                            <label class="btn btn-outline-primary" for="searchPostsDesc">تنازلي</label>

                            <input type="radio" class="btn-check" name="searchPostsOrder" id="searchPostsAsc">
                            <label class="btn btn-outline-primary" for="searchPostsAsc">تصاعدي</label>
                        </div>
                    </div>

                    <div class="filter-section">
                        <h6>نطاق التاريخ</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <input type="date" class="form-control" id="searchStartDate">
                                <label class="small text-muted">من</label>
                            </div>
                            <div class="col-md-6">
                                <input type="date" class="form-control" id="searchEndDate">
                                <label class="small text-muted">إلى</label>
                            </div>
                        </div>
                    </div>

                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-sm btn-primary" id="applyFiltersBtn">
                            <i class="fas fa-filter me-1"></i> تطبيق الفلترة
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" id="resetFiltersBtn">
                            <i class="fas fa-undo me-1"></i> إعادة تعيين
                        </button>
                    </div>
                </div>
            </div>
        `;

        // إضافة زر البحث المتقدم
        const toggleAdvancedSearch = document.createElement('button');
        toggleAdvancedSearch.id = 'toggleAdvancedSearch';
        toggleAdvancedSearch.className = 'btn btn-sm btn-outline-secondary ms-2';
        toggleAdvancedSearch.innerHTML = '<i class="fas fa-sliders-h"></i>';
        toggleAdvancedSearch.title = 'خيارات البحث المتقدمة';
        
        // إضافة الزر بعد حقل البحث
        if (searchInput && searchInput.parentNode) {
            searchInput.parentNode.appendChild(toggleAdvancedSearch);
        }

        // إضافة خيارات البحث المتقدمة بعد حقل البحث
        const advancedOptionsContainer = document.createElement('div');
        advancedOptionsContainer.innerHTML = advancedOptions;
        searchInputContainer.appendChild(advancedOptionsContainer.firstElementChild);
    }

    // ربط أحداث البحث
    attachSearchEvents() {
        // مستمع على حقل البحث للبحث الفوري
        const searchInput = document.getElementById('navbarSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(searchInput.value);
                }, 300);
            });
        }

        // مستمع لزر البحث المتقدم
        const toggleBtn = document.getElementById('toggleAdvancedSearch');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const options = document.getElementById('advancedSearchOptions');
                if (options) {
                    options.style.display = options.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        // مستمع لزر تطبيق الفلترة
        const applyBtn = document.getElementById('applyFiltersBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.updateSearchOptions();
                this.performSearch(document.getElementById('navbarSearchInput').value);
            });
        }

        // مستمع لزر إعادة تعيين الفلترة
        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSearchOptions();
                this.performSearch(document.getElementById('navbarSearchInput').value);
            });
        }

        // مستمع لتغيير نوع البحث
        document.querySelectorAll('input[name="searchPostsType"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.searchOptions.type = radio.id.replace('searchPosts', '').toLowerCase();
                }
            });
        });

        // مستمع لتغيير طريقة الترتيب
        document.querySelectorAll('input[name="searchPostsSort"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.searchOptions.sortBy = radio.id.replace('searchPosts', '').toLowerCase();
                }
            });
        });

        // مستمع لتغيير اتجاه الترتيب
        document.querySelectorAll('input[name="searchPostsOrder"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.searchOptions.order = radio.id.replace('searchPosts', '').toLowerCase();
                }
            });
        });
    }

    // تحديث خيارات البحث من الواجهة
    updateSearchOptions() {
        // تحديث نوع البحث
        const typeRadio = document.querySelector('input[name="searchPostsType"]:checked');
        if (typeRadio) {
            this.searchOptions.type = typeRadio.id.replace('searchPosts', '').toLowerCase();
        }

        // تحديث طريقة الترتيب
        const sortRadio = document.querySelector('input[name="searchPostsSort"]:checked');
        if (sortRadio) {
            this.searchOptions.sortBy = sortRadio.id.replace('searchPosts', '').toLowerCase();
        }

        // تحديث اتجاه الترتيب
        const orderRadio = document.querySelector('input[name="searchPostsOrder"]:checked');
        if (orderRadio) {
            this.searchOptions.order = orderRadio.id.replace('searchPosts', '').toLowerCase();
        }

        // تحديث نطاق التاريخ
        const startDate = document.getElementById('searchStartDate').value;
        const endDate = document.getElementById('searchEndDate').value;
        
        if (startDate || endDate) {
            this.searchOptions.dateRange = {
                start: startDate ? new Date(startDate) : null,
                end: endDate ? new Date(endDate) : null
            };
        } else {
            this.searchOptions.dateRange = null;
        }

        console.log('تم تحديث خيارات البحث:', this.searchOptions);
    }

    // إعادة تعيين خيارات البحث للقيم الافتراضية
    resetSearchOptions() {
        this.searchOptions = {
            type: 'all',
            sortBy: 'date',
            order: 'desc',
            dateRange: null
        };

        // إعادة تعيين عناصر الواجهة
        document.getElementById('searchPostsAll').checked = true;
        document.getElementById('searchPostsDate').checked = true;
        document.getElementById('searchPostsDesc').checked = true;
        document.getElementById('searchStartDate').value = '';
        document.getElementById('searchEndDate').value = '';

        console.log('تم إعادة تعيين خيارات البحث');
    }

    // تحميل المنشورات من قاعدة البيانات
    async loadPosts() {
        try {
            const postsRef = firebase.database().ref('posts');
            const snapshot = await postsRef.once('value');
            const postsData = snapshot.val() || {};
            
            this.posts = Object.keys(postsData).map(key => ({
                id: key,
                ...postsData[key]
            }));
            
            console.log(`تم تحميل ${this.posts.length} منشور`);
        } catch (error) {
            console.error('حدث خطأ أثناء تحميل المنشورات:', error);
            this.posts = [];
        }
    }

    // تنفيذ البحث
    performSearch(searchQuery) {
        if (!searchQuery.trim() && !this.searchOptions.dateRange) {
            // عرض جميع المنشورات إذا كان البحث فارغًا وبدون فلتر تاريخ
            this.searchResults = [...this.posts];
        } else {
            searchQuery = searchQuery.trim().toLowerCase();
            
            // تطبيق فلتر نوع البحث
            this.searchResults = this.posts.filter(post => {
                let matchFound = false;
                
                // فلترة حسب المحتوى
                if (this.searchOptions.type === 'all' || this.searchOptions.type === 'content') {
                    // البحث في نص المنشور
                    if (post.content && post.content.toLowerCase().includes(searchQuery)) {
                        matchFound = true;
                    }
                }
                
                // فلترة حسب اسم السائق
                if ((this.searchOptions.type === 'all' || this.searchOptions.type === 'driver') && !matchFound) {
                    // البحث في اسم السائق
                    if (post.driverName && post.driverName.toLowerCase().includes(searchQuery)) {
                        matchFound = true;
                    }
                }
                
                // فلترة حسب الموقع
                if ((this.searchOptions.type === 'all' || this.searchOptions.type === 'location') && !matchFound) {
                    // البحث في الموقع
                    if (post.location && post.location.toLowerCase().includes(searchQuery)) {
                        matchFound = true;
                    }
                }
                
                // فلترة حسب التاريخ
                if (this.searchOptions.dateRange) {
                    const postDate = new Date(post.timestamp);
                    
                    if (this.searchOptions.dateRange.start && postDate < this.searchOptions.dateRange.start) {
                        return false;
                    }
                    
                    if (this.searchOptions.dateRange.end) {
                        // إضافة يوم كامل للتاريخ النهائي للشمول
                        const endDate = new Date(this.searchOptions.dateRange.end);
                        endDate.setDate(endDate.getDate() + 1);
                        
                        if (postDate > endDate) {
                            return false;
                        }
                    }
                }
                
                return matchFound || (searchQuery === '' && this.searchOptions.dateRange);
            });
        }
        
        // تطبيق الترتيب
        this.sortResults();
        
        // عرض النتائج
        this.displaySearchResults();
    }

    // ترتيب نتائج البحث
    sortResults() {
        this.searchResults.sort((a, b) => {
            let compareValue = 0;
            
            // ترتيب حسب الخيار المحدد
            switch (this.searchOptions.sortBy) {
                case 'date':
                    compareValue = (a.timestamp || 0) - (b.timestamp || 0);
                    break;
                    
                case 'likes':
                    const aLikes = a.likes ? Object.keys(a.likes).length : 0;
                    const bLikes = b.likes ? Object.keys(b.likes).length : 0;
                    compareValue = aLikes - bLikes;
                    break;
                    
                case 'relevance':
                    // حساب مدى الصلة (يتطلب تنفيذ خوارزمية صلة)
                    // مثال بسيط: الطول المتطابق مع كلمات البحث
                    const searchQuery = document.getElementById('navbarSearchInput').value.toLowerCase();
                    const aMatches = this.countMatches(a, searchQuery);
                    const bMatches = this.countMatches(b, searchQuery);
                    compareValue = aMatches - bMatches;
                    break;
            }
            
            // تطبيق اتجاه الترتيب
            return this.searchOptions.order === 'asc' ? compareValue : -compareValue;
        });
    }

    // حساب عدد المطابقات في المنشور
    countMatches(post, searchQuery) {
        let count = 0;
        
        // البحث في المحتوى
        if (post.content) {
            const contentMatches = post.content.toLowerCase().split(searchQuery).length - 1;
            count += contentMatches;
        }
        
        // البحث في اسم السائق
        if (post.driverName) {
            const nameMatches = post.driverName.toLowerCase().split(searchQuery).length - 1;
            count += nameMatches * 2; // إعطاء وزن أكبر لاسم السائق
        }
        
        // البحث في الموقع
        if (post.location) {
            const locationMatches = post.location.toLowerCase().split(searchQuery).length - 1;
            count += locationMatches;
        }
        
        return count;
    }

    // عرض نتائج البحث
    displaySearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;
        
        if (this.searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results text-center py-4">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <p>لم يتم العثور على نتائج مطابقة</p>
                </div>
            `;
            return;
        }
        
        // بناء عناصر HTML لنتائج البحث
        let resultsHTML = `
            <div class="search-results-header">
                <h6>نتائج البحث (${this.searchResults.length})</h6>
            </div>
            <div class="search-results-list">
        `;
        
        // عرض أول 10 نتائج فقط
        const displayResults = this.searchResults.slice(0, 10);
        
        // إنشاء عنصر HTML لكل نتيجة بحث
        displayResults.forEach(post => {
            // تنسيق التاريخ
            const postDate = new Date(post.timestamp);
            const formattedDate = postDate.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // حساب عدد الإعجابات
            const likesCount = post.likes ? Object.keys(post.likes).length : 0;
            
            // إنشاء معاينة للمحتوى
            const contentPreview = post.content ? 
                `${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}` : '';
            
            // إضافة عنصر النتيجة
            resultsHTML += `
                <div class="search-result-item" onclick="showPost('${post.id}')">
                    <div class="search-result-header">
                        <div class="search-result-driver">
                            <img src="${post.driverImage || 'default-avatar.png'}" alt="${post.driverName || 'سائق'}">
                            <span>${post.driverName || 'سائق'}</span>
                        </div>
                        <div class="search-result-meta">
                            <span class="search-result-date">
                                <i class="far fa-clock"></i> ${formattedDate}
                            </span>
                            <span class="search-result-likes">
                                <i class="far fa-heart"></i> ${likesCount}
                            </span>
                        </div>
                    </div>
                    <div class="search-result-content">
                        <p>${this.highlightSearchText(contentPreview)}</p>
                    </div>
                    ${post.location ? `
                        <div class="search-result-location">
                            <i class="fas fa-map-marker-alt"></i> ${post.location}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        // إضافة زر لعرض المزيد من النتائج إذا كان هناك أكثر من 10
        if (this.searchResults.length > 10) {
            resultsHTML += `
                <div class="load-more-results">
                    <button class="btn btn-outline-primary btn-sm w-100" onclick="loadMoreSearchResults()">
                        عرض المزيد (${this.searchResults.length - 10} متبقية)
                    </button>
                </div>
            `;
        }
        
        resultsHTML += '</div>';
        resultsContainer.innerHTML = resultsHTML;
    }

    // تمييز نص البحث في النتائج
    highlightSearchText(text) {
        const searchQuery = document.getElementById('navbarSearchInput').value.trim();
        if (!searchQuery) return text;
        
        // استبدال كلمات البحث بنفس النص ولكن بتمييز
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        return text.replace(regex, '<span class="highlight-text">$1</span>');
    }

    // تحميل المزيد من نتائج البحث
    loadMoreResults(count = 10) {
        const resultsContainer = document.querySelector('.search-results-list');
        if (!resultsContainer) return;
        
        // تحديد عدد النتائج المعروضة حاليًا
        const currentCount = resultsContainer.querySelectorAll('.search-result-item').length;
        
        // عرض المزيد من النتائج
        const moreResults = this.searchResults.slice(currentCount, currentCount + count);
        
        // إزالة زر "عرض المزيد" الحالي
        const loadMoreButton = resultsContainer.querySelector('.load-more-results');
        if (loadMoreButton) {
            loadMoreButton.remove();
        }
        
        // إضافة النتائج الجديدة
        moreResults.forEach(post => {
            // تنسيق التاريخ
            const postDate = new Date(post.timestamp);
            const formattedDate = postDate.toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // حساب عدد الإعجابات
            const likesCount = post.likes ? Object.keys(post.likes).length : 0;
            
            // إنشاء معاينة للمحتوى
            const contentPreview = post.content ? 
                `${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}` : '';
            
            // إنشاء عنصر للنتيجة
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.setAttribute('onclick', `showPost('${post.id}')`);
            resultElement.innerHTML = `
                <div class="search-result-header">
                    <div class="search-result-driver">
                        <img src="${post.driverImage || 'default-avatar.png'}" alt="${post.driverName || 'سائق'}">
                        <span>${post.driverName || 'سائق'}</span>
                    </div>
                    <div class="search-result-meta">
                        <span class="search-result-date">
                            <i class="far fa-clock"></i> ${formattedDate}
                        </span>
                        <span class="search-result-likes">
                            <i class="far fa-heart"></i> ${likesCount}
                        </span>
                    </div>
                </div>
                <div class="search-result-content">
                    <p>${this.highlightSearchText(contentPreview)}</p>
                </div>
                ${post.location ? `
                    <div class="search-result-location">
                        <i class="fas fa-map-marker-alt"></i> ${post.location}
                    </div>
                ` : ''}
            `;
            
            resultsContainer.appendChild(resultElement);
        });
        
        // إضافة زر "عرض المزيد" الجديد إذا كان هناك المزيد من النتائج
        const remaining = this.searchResults.length - (currentCount + moreResults.length);
        if (remaining > 0) {
            const loadMoreElement = document.createElement('div');
            loadMoreElement.className = 'load-more-results';
            loadMoreElement.innerHTML = `
                <button class="btn btn-outline-primary btn-sm w-100" onclick="loadMoreSearchResults()">
                    عرض المزيد (${remaining} متبقية)
                </button>
            `;
            resultsContainer.appendChild(loadMoreElement);
        }
    }

    // عرض تفاصيل المنشور المحدد
    showPost(postId) {
        // البحث عن المنشور في النتائج
        const post = this.searchResults.find(p => p.id === postId);
        if (!post) return;
        
        // إغلاق نافذة البحث
        const searchModal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
        if (searchModal) {
            searchModal.hide();
        }
        
        // إظهار المنشور المحدد (يمكن تنفيذ هذا بعدة طرق)
        if (typeof window.postsManager !== 'undefined' && window.postsManager.showPostDetails) {
            window.postsManager.showPostDetails(postId);
        } else {
            // تنفيذ بديل إذا لم يكن مدير المنشورات متاحًا
            Swal.fire({
                title: post.driverName || 'منشور',
                html: `
                    <div class="post-details">
                        <div class="post-content">${post.content}</div>
                        ${post.location ? `<div class="post-location"><i class="fas fa-map-marker-alt"></i> ${post.location}</div>` : ''}
                        <div class="post-time">
                            <i class="far fa-clock"></i> ${new Date(post.timestamp).toLocaleString('ar-SA')}
                        </div>
                    </div>
                `,
                showConfirmButton: true,
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#FFD700'
            });
        }
    }
}

// تصدير دالة إعادة تعيين مدير البحث
window.resetPostsSearchManager = function() {
    window.postsSearchManager = new PostsSearchManager();
    return window.postsSearchManager;
};

// دالة لتحميل المزيد من نتائج البحث
window.loadMoreSearchResults = function(count = 10) {
    if (window.postsSearchManager) {
        window.postsSearchManager.loadMoreResults(count);
    }
};

// دالة لتنفيذ البحث يدويًا
window.performPostsSearch = function(query) {
    if (window.postsSearchManager) {
        window.postsSearchManager.performSearch(query);
    }
};

// تهيئة مدير البحث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    window.postsSearchManager = new PostsSearchManager();
});