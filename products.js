// نظام إدارة المنتجات الكامل - إصدار وائل
console.log('🛍️ نظام المتجر - تم التحميل');

// بيانات المنتجات
let storeProducts = [];
let storeIsOnline = true;

// تحميل المنتجات من GitHub
async function loadStoreProducts() {
    try {
        console.log('🔗 جاري تحميل المنتجات من GitHub...');
        const response = await fetch('https://raw.githubusercontent.com/wacelalorshe/markit/main/products-data.json?t=' + Date.now());
        
        if (response.ok) {
            const data = await response.json();
            storeProducts = data.products || [];
            storeIsOnline = true;
            console.log('✅ تم تحميل ' + storeProducts.length + ' منتج من GitHub');
        } else {
            throw new Error('فشل في التحميل من GitHub: ' + response.status);
        }
    } catch (error) {
        console.log('📱 استخدام البيانات المحلية:', error.message);
        storeIsOnline = false;
        loadFromLocalStorage();
    }
}

// تحميل من localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('myStoreProducts');
    if (saved) {
        storeProducts = JSON.parse(saved);
        console.log('💾 تم تحميل ' + storeProducts.length + ' منتج من التخزين المحلي');
    } else {
        storeProducts = [];
        console.log('🆕 لا توجد منتجات محفوظة');
    }
}

// إنشاء ID جديد
function createNewId() {
    if (storeProducts.length === 0) return 1;
    const maxId = Math.max(...storeProducts.map(p => p.id));
    return maxId + 1;
}

// إضافة منتج جديد
function addNewProduct(productInfo) {
    console.log('🎯 بدء إضافة منتج جديد...');
    
    // التحقق من البيانات
    if (!productInfo.name || !productInfo.description || !productInfo.price) {
        throw new Error('بيانات المنتج غير مكتملة');
    }
    
    // إنشاء المنتج
    const newProduct = {
        id: createNewId(),
        name: productInfo.name.trim(),
        description: productInfo.description.trim(),
        price: parseFloat(productInfo.price),
        image: productInfo.image?.trim() || 'https://via.placeholder.com/200'
    };
    
    // الإضافة للمصفوفة
    storeProducts.push(newProduct);
    console.log('➕ تمت إضافة المنتج:', newProduct.name);
    
    // الحفظ في التخزين المحلي
    localStorage.setItem('myStoreProducts', JSON.stringify(storeProducts));
    console.log('💾 تم الحفظ في التخزين المحلي');
    
    return newProduct;
}

// حذف منتج
function removeProduct(productId) {
    console.log('🗑️ محاولة حذف منتج رقم:', productId);
    
    const initialLength = storeProducts.length;
    storeProducts = storeProducts.filter(p => p.id !== productId);
    
    if (storeProducts.length < initialLength) {
        localStorage.setItem('myStoreProducts', JSON.stringify(storeProducts));
        console.log('✅ تم حذف المنتج بنجاح');
        return true;
    } else {
        console.log('❌ المنتج غير موجود');
        return false;
    }
}

// ✅ نظام الرفع المحسن مع معالجة الأخطاء
async function uploadToGitHubAuto() {
    console.log('🚀 بدء الرفع التلقائي إلى GitHub...');
    
    // قائمة بالتوكنات الاحتياطية (يمكن إضافة توكنات جديدة هنا)
    const possibleTokens = [
        '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'  // التوكن الحالي
    ];
    
    let lastError = '';
    
    // تجربة كل توكن
    for (const token of possibleTokens) {
        console.log(`🔑 تجربة التوكن: ${token.substring(0, 10)}...`);
        
        try {
            // 1. أولاً: اختبار صلاحية التوكن
            const testResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!testResponse.ok) {
                lastError = `التوكن غير صالح: ${testResponse.status}`;
                continue; // جرب التوكن التالي
            }
            
            console.log('✅ التوكن صالح، متابعة الرفع...');
            
            // 2. الحصول على الملف الحالي
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
                console.log('✅ تم الحصول على الملف الحالي');
            } else if (getResponse.status === 404) {
                console.log('📄 الملف غير موجود، سيتم إنشاؤه جديد');
            } else {
                lastError = `فشل في جلب الملف: ${getResponse.status}`;
                continue;
            }

            // 3. تحضير البيانات للرفع
            console.log('📦 تحضير البيانات للرفع...');
            const content = { products: storeProducts };
            const contentString = JSON.stringify(content, null, 2);
            const contentBase64 = btoa(unescape(encodeURIComponent(contentString)));
            
            // 4. رفع الملف المحدث
            console.log('🔼 جاري رفع الملف...');
            const updateResponse = await fetch(
                'https://api.github.com/repos/wacelalorshe/markit/contents/products-data.json',
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `🛍️ تحديث المنتجات - ${new Date().toLocaleString('ar-SA')}`,
                        content: contentBase64,
                        sha: sha,
                        branch: 'main'
                    })
                }
            );

            if (updateResponse.ok) {
                const result = await updateResponse.json();
                console.log('✅ تم الرفع بنجاح إلى GitHub');
                return { 
                    success: true, 
                    message: 'تم الرفع التلقائي بنجاح!',
                    url: result.content.html_url
                };
            } else {
                const errorData = await updateResponse.json();
                lastError = errorData.message || `خطأ في الرفع: ${updateResponse.status}`;
                continue;
            }
            
        } catch (error) {
            lastError = error.message;
            continue;
        }
    }
    
    // إذا وصلنا هنا، فكل التوكنات فشلت
    console.error('❌ فشل جميع التوكنات:', lastError);
    return { 
        success: false, 
        message: `فشل الرفع: ${lastError}`,
        data: JSON.stringify({ products: storeProducts }, null, 2)
    };
}

// الحصول على جميع المنتجات
function getAllProducts() {
    return storeProducts;
}

// التحميل التلقائي عند بدء التشغيل
loadStoreProducts();

