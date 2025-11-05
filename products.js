// بيانات المنتجات - يتم تحميلها من localStorage
let products = [];

// تحميل المنتجات من localStorage عند بدء التشغيل
function loadProducts() {
    const savedProducts = localStorage.getItem('storeProducts');
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        // بيانات افتراضية إذا لم توجد بيانات محفوظة
        products = [
            {
                id: 1,
                name: "هاتف ذكي",
                description: "هاتف ذكي حديث بمواصفات عالية",
                price: 299.99,
                image: "https://via.placeholder.com/200"
            },
            {
                id: 2,
                name: "لابتوب",
                description: "لابتوب قوي للأعمال والألعاب",
                price: 899.99,
                image: "https://via.placeholder.com/200"
            }
        ];
        saveProducts();
    }
}

// حفظ المنتجات في localStorage
function saveProducts() {
    localStorage.setItem('storeProducts', JSON.stringify(products));
}

// الحصول على آخر ID لضمان عدم التكرار
function getNextId() {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

// تحميل المنتجات فوراً
loadProducts();
