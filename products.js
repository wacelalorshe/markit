// نظام مبسط يعمل 100% - إصدار Wael
const PRODUCTS_URL = 'https://raw.githubusercontent.com/wacelalorshe/markit/main/products-data.json';

let products = [];
let isOnline = true;

// تحميل المنتجات
async function loadProducts() {
    try {
        console.log('🔄 جاري تحميل المنتجات من GitHub...');
        const response = await fetch(PRODUCTS_URL + '?t=' + Date.now());
        
        if (response.ok) {
            const data = await response.json();
            products = data.products || [];
            isOnline = true;
            console.log('✅ تم تحميل ' + products.length + ' منتج من GitHub');
        } else {
            throw new Error('فشل في التحميل من GitHub');
        }
    } catch (error) {
        console.log('📱 استخدام البيانات المحلية');
        isOnline = false;
        loadFromLocalStorage();
    }
}

// تحميل من localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('storeProducts');
    if (saved) {
        products = JSON.parse(saved);
        console.log('📦 تم تحميل ' + products.length + ' منتج من التخزين المحلي');
    } else {
        products = [];
        console.log('🆕 لا توجد منتجات محفوظة');
    }
}

// الحصول على ID جديد
function getNextId() {
    if (products.length === 0) return 1;
    const maxId = Math.max(...products.map(p => p.id));
    return maxId + 1;
}

// ✅ الدالة الأساسية لإضافة منتج - هذه التي يجب أن تعمل
function addNewProduct(productData) {
    console.log('🎯 بدء إضافة منتج جديد...', productData);
    
    // إنشاء المنتج الجديد
    const newProduct = {
        id: getNextId(),
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image || 'https://via.placeholder.com/200'
    };
    
    // إضافة للمصفوفة
    products.push(newProduct);
    console.log('➕ تم إضافة المنتج للمصفوفة:', newProduct);
    
    // حفظ في localStorage
    localStorage.setItem('storeProducts', JSON.stringify(products));
    console.log('💾 تم الحفظ في localStorage');
    
    // عرض المصفوفة الحالية
    console.log('📊 المنتجات الحالية:', products);
    
    return newProduct;
}

// ✅ دالة الحذف
function deleteProductById(productId) {
    console.log('🗑️ محاولة حذف منتج رقم:', productId);
    
    const initialLength = products.length;
    products = products.filter(p => p.id !== productId);
    
    if (products.length < initialLength) {
        localStorage.setItem('storeProducts', JSON.stringify(products));
        console.log('✅ تم حذف المنتج بنجاح');
        return true;
    } else {
        console.log('❌ المنتج غير موجود');
        return false;
    }
}

// ✅ دالة الحفظ للرفع لـ GitHub
async function saveProductsToGitHub() {
    const token = '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';
    
    try {
        console.log('🚀 محاولة الرفع لـ GitHub...');
        
        // الحصول على SHA الحالي
        const getResponse = await fetch(
            'https://api.github.com/repos/wacelalorshe/markit/contents/products-data.json',
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

        // تحضير المحتوى
        const content = { products: products };
        const contentBase64 = btoa(JSON.stringify(content, null, 2));
        
        // الرفع
        const updateResponse = await fetch(
            'https://api.github.com/repos/wacelalorshe/markit/contents/products-data.json',
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `تحديث المنتجات - ${new Date().toLocaleString('ar-SA')}`,
                    content: contentBase64,
                    sha: sha
                })
            }
        );

        if (updateResponse.ok) {
            console.log('✅ تم الرفع لـ GitHub بنجاح');
            return { success: true };
        } else {
            throw new Error('فشل في الرفع');
        }
        
    } catch (error) {
        console.log('❌ فشل الرفع التلقائي:', error);
        return { 
            success: false, 
            error: error.message,
            data: JSON.stringify({ products: products }, null, 2)
        };
    }
}

// التحميل الأولي
loadProducts();
