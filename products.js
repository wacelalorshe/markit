// رابط ملف المنتجات في GitHub
const PRODUCTS_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/main/products-data.json`;

let products = [];
let isOnline = true;

// تحميل المنتجات من GitHub
async function loadProducts() {
    try {
        console.log('جاري تحميل المنتجات من GitHub...');
        
        // إضافة timestamp لمنع التخزين المؤقت
        const response = await fetch(PRODUCTS_URL + '?t=' + Date.now());
        
        if (!response.ok) {
            throw new Error('فشل في تحميل البيانات من GitHub');
        }
        
        const data = await response.json();
        products = data.products || [];
        isOnline = true;
        
        console.log('تم تحميل المنتجات من GitHub:', products.length, 'منتج');
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات من GitHub:', error);
        isOnline = false;
        loadFromLocalStorage();
    }
}

// تحميل من localStorage (نسخة احتياطية)
function loadFromLocalStorage() {
    const savedProducts = localStorage.getItem('storeProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
        console.log('تم تحميل المنتجات من localStorage:', products.length, 'منتج');
    } else {
        // بيانات افتراضية إذا لم توجد أي بيانات
        products = [
            {
                id: 1,
                name: "هاتف ذكي",
                description: "هاتف ذكي حديث بمواصفات عالية",
                price: 299.99,
                image: "https://via.placeholder.com/200"
            }
        ];
        console.log('تم تحميل البيانات الافتراضية');
    }
}

// الحصول على آخر ID
function getNextId() {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

// دوال GitHub API للرفع التلقائي
async function updateGitHubFile() {
    const token = getGitHubToken();
    
    if (!token) {
        throw new Error('❌ لم يتم إعداد GitHub Token');
    }

    try {
        // 1. الحصول على SHA الخاص بالملف الحالي
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.DATA_FILE}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        let sha = '';
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }

        // 2. تحضير البيانات للرفع
        const content = {
            products: products
        };
        
        const contentBase64 = btoa(JSON.stringify(content, null, 2));
        
        // 3. رفع الملف المحدث
        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.DATA_FILE}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `🛍️ تحديث المنتجات - ${new Date().toLocaleString()}`,
                    content: contentBase64,
                    sha: sha,
                    branch: GITHUB_CONFIG.BRANCH
                })
            }
        );

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'فشل في رفع الملف');
        }

        return true;
        
    } catch (error) {
        console.error('GitHub API Error:', error);
        throw error;
    }
}

// دالة محسنة لحفظ المنتجات مع الرفع التلقائي
async function saveProductsWithUpload() {
    // حفظ في localStorage أولاً
    localStorage.setItem('storeProducts', JSON.stringify(products));
    
    try {
        // محاولة الرفع التلقائي
        await updateGitHubFile();
        return { success: true, method: 'auto' };
        
    } catch (error) {
        console.log('الرفع التلقائي فشل، استخدام النسخ اليدوي:', error);
        
        // العودة للطريقة اليدوية
        const jsonString = JSON.stringify({ products }, null, 2);
        navigator.clipboard.writeText(jsonString);
        
        return { 
            success: false, 
            method: 'manual',
            error: error.message,
            data: jsonString
        };
    }
}

// دالة الحفظ الرئيسية
async function saveProducts() {
    return await saveProductsWithUpload();
}

// إضافة منتج جديد
function addProduct(product) {
    product.id = getNextId();
    products.push(product);
    return product;
}

// حذف منتج
function deleteProduct(productId) {
    products = products.filter(p => p.id !== productId);
}

// تحميل المنتجات فوراً عند تشغيل الصفحة
loadProducts();
