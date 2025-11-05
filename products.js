// رابط ملف المنتجات في GitHub - ضع رابطك الحقيقي هنا
const PRODUCTS_URL = 'https://raw.githubusercontent.com/your-username/your-repo-name/main/products-data.json';

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

// تحميل من localStorage (نسخة احتياطية عندما يكون غير متصل بالإنترنت)
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

// حفظ المنتجات - يحفظ في localStorage ويظهر رسالة للمستخدم
function saveProducts() {
    // حفظ في localStorage للزوار الحاليين
    localStorage.setItem('storeProducts', JSON.stringify(products));
    
    // إظهار رسالة للمسؤول
    if (isOnline) {
        alert('⚠️ تم حفظ المنتج محلياً\n\nلجعل المنتج يظهر للجميع:\n1. اذهب لمستودع GitHub\n2. انسخ البيانات من أدوات المطور (F12)\n3. أعد رفع products-data.json');
    } else {
        alert('✅ تم حفظ المنتج في المتصفح\nسيظهر للزوار الحاليين فقط');
    }
    
    // إظهار البيانات في console لنسخها بسهولة
    console.log('📋 انسخ هذا JSON وأعده رفعه إلى GitHub:');
    console.log(JSON.stringify({ products }, null, 2));
}

// الحصول على آخر ID
function getNextId() {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

// إضافة منتج جديد
function addProduct(product) {
    product.id = getNextId();
    products.push(product);
    saveProducts();
    return product;
}

// حذف منتج
function deleteProduct(productId) {
    products = products.filter(p => p.id !== productId);
    saveProducts();
}

// تحميل المنتجات فوراً عند تشغيل الصفحة
loadProducts();
