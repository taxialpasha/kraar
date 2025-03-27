// search-posts-integration.js
// هذا الملف يقوم بدمج نظام البحث مع نظام المنشورات الحالي

/**
 * دمج نظام البحث في المنشورات
 * يجب استدعاء هذه الدالة بعد تهيئة نظام المنشورات ونظام البحث
 */
window.initializePostsSearchIntegration = function() {
    // التحقق من وجود مدير المنشورات ومدير البحث
    if (!window.postsManager || !window.postsSearchManager) {
        console.error('لم يتم العثور على مدير المنشورات أو مدير البحث');
        return false;
    }

    // تحديث البيانات عند إضافة منشورات جديدة
    document.addEventListener('posts-updated', function() {
        window.postsSearchManager.loadPosts();
    });

    // ربط دالة عرض المنشور من خلال البحث
    window.postsSearchManager.showPost = function(postId) {
        // إغلاق نافذة البحث
        const searchModal = document.getElementById('searchModal');
        if (searchModal) {
            bootstrap.Modal.getInstance(searchModal)?.hide();
        }

        // فتح صفحة المنشورات إذا كنا في صفحة أخرى
        navigateToPostsPage();

        // تأخير قصير للتأكد من انتهاء تحميل المنشورات
        setTimeout(() => {
            // عرض المنشور المحدد
            window.postsManager.showPostDetails(postId);
        }, 300);
    };

    // ربط خاصية البحث بنظام التنقل
    const searchBtn = document.querySelector('[data-bs-target="#searchModal"]');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            // تنفيذ بحث أولي لإظهار آخر المنشورات
            setTimeout(() => {
                window.postsSearchManager.performSearch('');
            }, 300);
        });
    }

    // إضافة طريقة لتحديث المنشورات مع نتائج البحث
    window.updatePostsWithSearchResults = function(query) {
        // تنفيذ البحث
        window.postsSearchManager.performSearch(query);
        
        // الحصول على نتائج البحث وعرضها في صفحة المنشورات
        const searchResults = window.postsSearchManager.searchResults;
        
        // تحديث المنشورات المعروضة
        window.postsManager.updateVisiblePosts(searchResults);
        
        // إضافة شريط عنوان البحث
        addSearchBanner(query, searchResults.length);
    };

    return true;
};

/**
 * إضافة شريط عنوان البحث في صفحة المنشورات
 */
function addSearchBanner(query, resultsCount) {
    // إزالة الشريط القديم إن وجد
    const oldBanner = document.querySelector('.search-results-banner');
    if (oldBanner) {
        oldBanner.remove();
    }

    // إنشاء شريط جديد
    const banner = document.createElement('div');
    banner.className = 'search-results-banner';
    banner.innerHTML = `
        <div class="search-banner-content">
            <div class="search-query">
                <i class="fas fa-search"></i>
                <span>نتائج البحث عن: "${query}"</span>
            </div>
            <div class="search-stats">
                <span>${resultsCount} نتيجة</span>
            </div>
        </div>
        <button class="clear-search-btn" onclick="clearPostsSearch()">
            <i class="fas fa-times"></i> إلغاء البحث
        </button>
    `;

    // إضافة الشريط إلى الصفحة
    const postsContainer = document.querySelector('.posts-container');
    if (postsContainer) {
        postsContainer.parentNode.insertBefore(banner, postsContainer);
    }
}

/**
 * الانتقال إلى صفحة المنشورات
 */
function navigateToPostsPage() {
    // التحقق إذا كنا في صفحة أخرى
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        window.location.href = '/#posts';
    }
}

/**
 * إلغاء البحث والعودة إلى جميع المنشورات
 */
window.clearPostsSearch = function() {
    // إزالة شريط البحث
    const banner = document.querySelector('.search-results-banner');
    if (banner) {
        banner.remove();
    }

    // إعادة تحميل جميع المنشورات
    if (window.postsManager) {
        window.postsManager.loadPosts();
    }
};

/**
 * تحديث البحث في الفهرس عند إضافة منشور جديد
 */
window.updateSearchIndexForNewPost = function(postData) {
    if (window.postsSearchManager) {
        // إضافة المنشور الجديد إلى الفهرس
        window.postsSearchManager.posts.unshift(postData);
    }
};

/**
 * البحث السريع في المنشورات
 */
window.quickSearchPosts = function(query) {
    // إظهار نافذة البحث
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        const modalInstance = new bootstrap.Modal(searchModal);
        modalInstance.show();
    }

    // تعيين النص في حقل البحث
    const searchInput = document.getElementById('navbarSearchInput');
    if (searchInput) {
        searchInput.value = query;
    }

    // تنفيذ البحث
    setTimeout(() => {
        window.postsSearchManager.performSearch(query);
    }, 300);
};

// تنفيذ دمج نظام البحث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // انتظار تحميل المكونات الأخرى
    const initInterval = setInterval(() => {
        if (window.postsManager && window.postsSearchManager) {
            clearInterval(initInterval);
            window.initializePostsSearchIntegration();
            console.log('تم دمج نظام البحث مع نظام المنشورات');
        }
    }, 500);
    
    // توقف بعد 10 ثوانٍ في حالة عدم تحميل المكونات
    setTimeout(() => {
        clearInterval(initInterval);
    }, 10000);
});