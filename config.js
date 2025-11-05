// إعدادات GitHub API
const GITHUB_CONFIG = {
    // التوكن الذي قدمته
    TOKEN: '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',
    
    // معلومات المستودع - تأكد من أنها صحيحة
    OWNER: 'markit735',
    REPO: 'markit',
    BRANCH: 'main',
    
    // ملف البيانات
    DATA_FILE: 'products-data.json'
};

// دالة للحصول على التوكن
function getGitHubToken() {
    // أولاً جرب من localStorage (إذا عدله المستخدم)
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) return savedToken;
    
    // إذا لم يوجد، استخدم التوكن من config
    return GITHUB_CONFIG.TOKEN;
}

// تحميل الإعدادات المحفوظة
function loadGitHubConfig() {
    const savedOwner = localStorage.getItem('github_owner');
    const savedRepo = localStorage.getItem('github_repo');
    
    if (savedOwner) {
        GITHUB_CONFIG.OWNER = savedOwner;
    }
    
    if (savedRepo) {
        GITHUB_CONFIG.REPO = savedRepo;
    }
}

// التهيئة عند التحميل
loadGitHubConfig();
