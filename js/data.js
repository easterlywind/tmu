async function createProduct() {
  const res = await fetch('./api/get_products.php');
  const products = await res.json();
  localStorage.setItem('products', JSON.stringify(products));
}

async function createAdminAccount() {
  const res = await fetch('./api/get_accounts.php'); 
  const accounts = await res.json();
  localStorage.setItem('accounts', JSON.stringify(accounts));
}


window.addEventListener('load', createProduct);
window.addEventListener('load', createAdminAccount);

