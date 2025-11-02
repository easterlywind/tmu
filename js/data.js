function deleteDb(){
    if(localStorage.getItem('products')!=null){
        localStorage.removeItem('products')
        console.log("ok")
    }
}
// deleteDb()
//Khoi tao danh sach san pham
async function createProduct() {
  const res = await fetch('./api/get_products.php');
  const products = await res.json();
  localStorage.setItem('products', JSON.stringify(products));
}

// Create admin account 
async function createAdminAccount() {
  // lấy toàn bộ accounts từ DB (bao gồm admin) để admin.js dùng như cũ
  const res = await fetch('./api/get_accounts.php'); // bạn tạo api nhỏ này (select * from accounts)
  const accounts = await res.json();
  localStorage.setItem('accounts', JSON.stringify(accounts));
}


window.addEventListener('load', createProduct);
window.addEventListener('load', createAdminAccount);


// // ---- One-time migration: clear old localStorage keys once (only first run) ----
// (function runOneTimeMigration() {
//   const MIGRATION_VERSION = 'lesac-v2';
//   const K = 'lesac_migration';
//   if (localStorage.getItem(K) !== MIGRATION_VERSION) {
//     const OLD_KEYS = ['products', 'accounts', 'order', 'orderDetails', 'currentuser'];
//     OLD_KEYS.forEach(k => localStorage.removeItem(k));
//     localStorage.setItem(K, MIGRATION_VERSION);
//     console.log('[Lesac] Migrated: cleared old LS keys once.');
//   }
// })();

// // ---- Hydrate helpers ----
// async function createProduct() {
//   try {
//     const res = await fetch('./api/get_products.php', { cache: 'no-store' });
//     const products = await res.json();
//     localStorage.setItem('products', JSON.stringify(products));
//   } catch (e) {
//     console.error('get_products failed', e);
//   }
// }

// async function createAdminAccount() {
//   try {
//     const res = await fetch('./api/get_accounts.php', { cache: 'no-store' });
//     const accounts = await res.json();
//     localStorage.setItem('accounts', JSON.stringify(accounts));
//   } catch (e) {
//     console.error('get_accounts failed', e);
//   }
// }

// // ---- Public ready Promise: các file khác chờ promise này trước khi đọc LS ----
// window.lesacReady = (async () => {
//   await Promise.all([createProduct(), createAdminAccount()]);
//   console.log('[Lesac] Hydrated localStorage from DB.');
// })();
