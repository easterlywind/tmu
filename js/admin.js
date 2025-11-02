// Admin dashboard logic rebuilt to support product and account management.
// The code keeps everything in plain ASCII to avoid encoding glitches.

const PRODUCT_PER_PAGE = 12;

const adminState = {
  products: [],
  filteredProducts: [],
  productPage: 1,
  editingProductId: null,
  previewUrl: null,
  accounts: [],
  filteredAccounts: [],
  accountEditingId: null
};

document.addEventListener('DOMContentLoaded', initAdminDashboard);

async function initAdminDashboard() {
  await Promise.all([loadProducts(), loadAccounts()]);
  bindProductEvents();
  bindAccountEvents();
  renderProducts();
  renderAccounts();
}

// ===== PRODUCT MANAGEMENT =====

async function loadProducts() {
  try {
    const res = await fetch('./api/get_products.php', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error('Invalid product list');
    adminState.products = list;
    adminState.filteredProducts = list.slice();
    localStorage.setItem('products', JSON.stringify(list));
  } catch (err) {
    console.warn('[Admin] loadProducts fallback', err);
    try {
      const cached = JSON.parse(localStorage.getItem('products') || '[]');
      if (Array.isArray(cached)) {
        adminState.products = cached;
        adminState.filteredProducts = cached.slice();
      } else {
        adminState.products = [];
        adminState.filteredProducts = [];
      }
    } catch (_) {
      adminState.products = [];
      adminState.filteredProducts = [];
    }
  }
}

function bindProductEvents() {
  const addBtn = document.getElementById('btn-add-product');
  addBtn?.addEventListener('click', () => openProductModal('add'));

  const addSubmit = document.getElementById('add-product-button');
  addSubmit?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    await handleCreateProduct();
  });

  const updateSubmit = document.getElementById('update-product-button');
  updateSubmit?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    await handleUpdateProduct();
  });

  const closeBtn = document.querySelector('.modal-close.product-form');
  closeBtn?.addEventListener('click', () => closeProductModal());

  const resetBtn = document.getElementById('btn-cancel-product');
  resetBtn?.addEventListener('click', (ev) => {
    ev.preventDefault();
    cancelSearchProduct();
  });

  const productModal = document.querySelector('.modal.add-product');
  if (productModal) {
    productModal.addEventListener('click', (ev) => {
      if (ev.target === productModal) closeProductModal();
    });
    const container = productModal.querySelector('.modal-container');
    container?.addEventListener('click', (ev) => ev.stopPropagation());
  }
}

function openProductModal(mode) {
  const modal = document.querySelector('.modal.add-product');
  if (!modal) return;

  if (mode === 'add') {
    adminState.editingProductId = null;
    resetProductForm();
  }

  toggleProductFormMode(mode);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modal = document.querySelector('.modal.add-product');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = 'auto';
  adminState.editingProductId = null;
  if (adminState.previewUrl) {
    URL.revokeObjectURL(adminState.previewUrl);
    adminState.previewUrl = null;
  }
}

function toggleProductFormMode(mode) {
  const addEls = document.querySelectorAll('.add-product-e');
  const editEls = document.querySelectorAll('.edit-product-e');
  addEls.forEach((el) => (el.style.display = mode === 'add' ? 'block' : 'none'));
  editEls.forEach((el) => (el.style.display = mode === 'edit' ? 'block' : 'none'));
}

function resetProductForm() {
  document.getElementById('ten-mon')?.setAttribute('value', '');
  document.getElementById('ten-mon') && (document.getElementById('ten-mon').value = '');
  document.getElementById('gia-moi') && (document.getElementById('gia-moi').value = '');
  document.getElementById('mo-ta') && (document.getElementById('mo-ta').value = '');
  document.getElementById('chon-mon') && (document.getElementById('chon-mon').value = document.getElementById('chon-mon').options[0].value);
  const preview = document.querySelector('.upload-image-preview');
  if (preview) {
    preview.src = './assets/img/blank-image.png';
    preview.dataset.imagePath = '';
  }
}

function collectProductFormData() {
  const title = document.getElementById('ten-mon')?.value.trim() || '';
  const priceValue = document.getElementById('gia-moi')?.value.trim() || '';
  const desc = document.getElementById('mo-ta')?.value.trim() || '';
  const category = document.getElementById('chon-mon')?.value || '';
  const preview = document.querySelector('.upload-image-preview');
  const img = preview?.dataset.imagePath || preview?.getAttribute('src') || '';

  if (!title || !priceValue || !desc || !category) {
    toastWarning('Vui long nhap day du thong tin san pham');
    return null;
  }

  const price = Number(priceValue);
  if (Number.isNaN(price) || price <= 0) {
    toastWarning('Gia san pham phai la so lon hon 0');
    return null;
  }

  return { title, category, price, desc, img };
}

async function handleCreateProduct() {
  const payload = collectProductFormData();
  if (!payload) return;

  const res = await sendProductRequest('add', payload);
  if (!res) return;

  toastSuccess('Them san pham thanh cong!');
  await loadProducts();
  closeProductModal();
  renderProducts();
}

async function handleUpdateProduct() {
  if (adminState.editingProductId == null) return;
  const payload = collectProductFormData();
  if (!payload) return;

  const res = await sendProductRequest('update', {
    id: adminState.editingProductId,
    ...payload
  });
  if (!res) return;

  toastSuccess('Cap nhat san pham thanh cong!');
  await loadProducts();
  closeProductModal();
  renderProducts();
}

async function sendProductRequest(action, payload) {
  try {
    const response = await fetch('./api/admin_products.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      const msg = data.message || 'Thao tac voi san pham that bai';
      toastWarning(msg);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Admin] sendProductRequest', err);
    toast({ title: 'Error', message: 'Khong the ket noi may chu!', type: 'error', duration: 3000 });
    return null;
  }
}

async function deleteProduct(id) {
  if (!confirm('Ban co chac muon an san pham nay?')) return;
  const res = await sendProductRequest('delete', { id: Number(id) });
  if (!res) return;
  toastSuccess('Da an san pham!');
  await loadProducts();
  renderProducts();
}

async function changeStatusProduct(id) {
  const res = await sendProductRequest('restore', { id: Number(id) });
  if (!res) return;
  toastSuccess('Da khoi phuc san pham!');
  await loadProducts();
  renderProducts();
}

function editProduct(id) {
  const product = adminState.products.find((item) => Number(item.id) === Number(id));
  if (!product) {
    toastWarning('Khong tim thay san pham de chinh sua');
    return;
  }
  adminState.editingProductId = product.id;
  const title = document.getElementById('ten-mon');
  const price = document.getElementById('gia-moi');
  const desc = document.getElementById('mo-ta');
  const category = document.getElementById('chon-mon');
  const preview = document.querySelector('.upload-image-preview');

  if (title) title.value = product.title || '';
  if (price) price.value = product.price || '';
  if (desc) desc.value = product.desc || '';
  if (category && product.category) category.value = product.category;
  if (preview) {
    preview.src = product.img || './assets/img/blank-image.png';
    preview.dataset.imagePath = product.img || '';
  }
  openProductModal('edit');
}

function applyProductFilters() {
  const categorySelect = document.getElementById('the-loai');
  const searchInput = document.getElementById('form-search-product');

  let defaultCategory = '';
  if (categorySelect) {
    if (!categorySelect.dataset.defaultValue) {
      categorySelect.dataset.defaultValue = categorySelect.options?.[0]?.value || '';
    }
    defaultCategory = categorySelect.dataset.defaultValue;
  }

  const category = categorySelect ? categorySelect.value : defaultCategory;
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let list = adminState.products.slice();
  if (category && category !== defaultCategory) {
    list = list.filter((item) => (item.category || '').toLowerCase() === category.toLowerCase());
  }
  if (keyword) {
    list = list.filter((item) => (item.title || '').toLowerCase().includes(keyword));
  }

  adminState.filteredProducts = list;
}

function renderProducts() {
  applyProductFilters();
  const listContainer = document.getElementById('show-product');
  if (!listContainer) return;

  const perPage = PRODUCT_PER_PAGE;
  const page = adminState.productPage;
  const list = adminState.filteredProducts;

  const start = (page - 1) * perPage;
  const items = list.slice(start, start + perPage);

  if (!items.length) {
    listContainer.innerHTML = `<div class="no-result">
      <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
      <div class="no-result-h">Khong co san pham nao phu hop</div>
    </div>`;
  } else {
    listContainer.innerHTML = items.map(renderProductCard).join('');
  }

  setupProductPagination(list.length);
}

function renderProductCard(product) {
  const price = Number(product.price || 0).toLocaleString('vi-VN');
  const statusBtn =
    Number(product.status) === 1
      ? `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-regular fa-trash"></i></button>`
      : `<button class="btn-delete" onclick="changeStatusProduct(${product.id})"><i class="fa-regular fa-eye"></i></button>`;
  const badge = Number(product.status) === 1 ? '' : '<span class="list-badge">Da an</span>';

  return `
    <div class="list">
      <div class="list-left">
        <img src="${product.img}" alt="">
        <div class="list-info">
          <h4>${product.title}</h4>
          <p class="list-note">${product.desc || ''}</p>
          <span class="list-category">${product.category || ''}</span>
          ${badge}
        </div>
      </div>
      <div class="list-right">
        <div class="list-price">
          <span class="list-current-price">${price} VND</span>
        </div>
        <div class="list-control">
          <div class="list-tool">
            <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-light fa-pen-to-square"></i></button>
            ${statusBtn}
          </div>
        </div>
      </div>
    </div>`;
}

function setupProductPagination(totalItems) {
  const pagination = document.querySelector('.page-nav-list');
  if (!pagination) return;
  pagination.innerHTML = '';

  const pageCount = Math.ceil(totalItems / PRODUCT_PER_PAGE);
  if (pageCount <= 1) return;

  for (let i = 1; i <= pageCount; i += 1) {
    const li = document.createElement('li');
    li.className = 'page-nav-item' + (i === adminState.productPage ? ' active' : '');
    li.innerHTML = `<a href="javascript:;" data-page="${i}">${i}</a>`;
    li.addEventListener('click', () => {
      adminState.productPage = i;
      renderProducts();
    });
    pagination.appendChild(li);
  }
}

function cancelSearchProduct() {
  const select = document.getElementById('the-loai');
  const searchInput = document.getElementById('form-search-product');
  if (select && select.dataset.defaultValue) select.value = select.dataset.defaultValue;
  if (searchInput) searchInput.value = '';
  adminState.productPage = 1;
  renderProducts();
}

function showProduct() {
  renderProducts();
}

function uploadImage(input) {
  const file = input.files && input.files[0];
  const preview = document.querySelector('.upload-image-preview');
  if (!preview) return;

  if (adminState.previewUrl) {
    URL.revokeObjectURL(adminState.previewUrl);
    adminState.previewUrl = null;
  }

  if (!file) {
    preview.src = './assets/img/blank-image.png';
    preview.dataset.imagePath = '';
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  adminState.previewUrl = objectUrl;
  preview.src = objectUrl;
  preview.dataset.imagePath = `./assets/img/products/${file.name}`;
}

// ===== ACCOUNT MANAGEMENT =====

async function loadAccounts() {
  try {
    const res = await fetch('./api/get_accounts.php', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch accounts');
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error('Invalid account list');
    adminState.accounts = list.map((acc) => ({
      ...acc,
      id: Number(acc.id),
      status: Number(acc.status),
      userType: Number(acc.userType || 0)
    }));
    adminState.filteredAccounts = adminState.accounts.slice();
    localStorage.setItem('accounts', JSON.stringify(adminState.accounts));
  } catch (err) {
    console.warn('[Admin] loadAccounts fallback', err);
    try {
      const cached = JSON.parse(localStorage.getItem('accounts') || '[]');
      if (Array.isArray(cached)) {
        adminState.accounts = cached;
        adminState.filteredAccounts = cached.slice();
      } else {
        adminState.accounts = [];
        adminState.filteredAccounts = [];
      }
    } catch (_) {
      adminState.accounts = [];
      adminState.filteredAccounts = [];
    }
  }
}

function bindAccountEvents() {
  const addSubmit = document.getElementById('signup-button');
  addSubmit?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    await handleCreateAccount();
  });

  const updateSubmit = document.getElementById('btn-update-account');
  updateSubmit?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    await handleUpdateAccount();
  });

  const closeBtn = document.querySelector('.modal.signup .modal-close');
  closeBtn?.addEventListener('click', () => closeAccountModal());

  const accountModal = document.querySelector('.modal.signup');
  if (accountModal) {
    accountModal.addEventListener('click', (ev) => {
      if (ev.target === accountModal) closeAccountModal();
    });
    accountModal.querySelector('.modal-container')?.addEventListener('click', (ev) => ev.stopPropagation());
  }
}

function openAccountModal(mode) {
  const modal = document.querySelector('.modal.signup');
  if (!modal) return;

  toggleAccountFormMode(mode);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAccountModal() {
  const modal = document.querySelector('.modal.signup');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = 'auto';
  adminState.accountEditingId = null;
}

function toggleAccountFormMode(mode) {
  const addEls = document.querySelectorAll('.add-account-e');
  const editEls = document.querySelectorAll('.edit-account-e');
  addEls.forEach((el) => (el.style.display = mode === 'add' ? 'block' : 'none'));
  editEls.forEach((el) => (el.style.display = mode === 'edit' ? 'block' : 'none'));
  const phoneInput = document.getElementById('phone');
  if (phoneInput) phoneInput.disabled = mode === 'edit';
}

function resetAccountForm() {
  document.getElementById('fullname') && (document.getElementById('fullname').value = '');
  const phone = document.getElementById('phone');
  if (phone) {
    phone.value = '';
    phone.disabled = false;
  }
  document.getElementById('password') && (document.getElementById('password').value = '');
  document.getElementById('email') && (document.getElementById('email').value = '');
  document.getElementById('address') && (document.getElementById('address').value = '');
  const status = document.getElementById('user-status');
  if (status) status.checked = true;
}

function collectAccountFormData() {
  const fullname = document.getElementById('fullname')?.value.trim() || '';
  const phone = document.getElementById('phone')?.value.trim() || '';
  const password = document.getElementById('password')?.value.trim() || '';
  const email = document.getElementById('email')?.value.trim() || '';
  const address = document.getElementById('address')?.value.trim() || '';
  const status = document.getElementById('user-status')?.checked ? 1 : 0;

  if (!fullname || !phone || !password) {
    toastWarning('Vui long nhap day du thong tin tai khoan');
    return null;
  }

  return { fullname, phone, password, email, address, status };
}

async function handleCreateAccount() {
  const payload = collectAccountFormData();
  if (!payload) return;

  const res = await sendAccountRequest('create', {
    ...payload,
    userType: 0
  });
  if (!res) return;

  toastSuccess('Tao tai khoan thanh cong!');
  await loadAccounts();
  closeAccountModal();
  renderAccounts();
}

async function handleUpdateAccount() {
  if (adminState.accountEditingId == null) return;
  const payload = collectAccountFormData();
  if (!payload) return;

  const res = await sendAccountRequest('update', {
    id: adminState.accountEditingId,
    ...payload,
    userType: 0
  });
  if (!res) return;

  toastSuccess('Cap nhat tai khoan thanh cong!');
  await loadAccounts();
  closeAccountModal();
  renderAccounts();
}

async function sendAccountRequest(action, payload) {
  try {
    const response = await fetch('./api/admin_accounts.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      const msg = data.message || 'Thao tac voi tai khoan that bai';
      toastWarning(msg);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Admin] sendAccountRequest', err);
    toast({ title: 'Error', message: 'Khong the ket noi may chu!', type: 'error', duration: 3000 });
    return null;
  }
}

function applyAccountFilters() {
  const searchInput = document.getElementById('form-search-user');
  const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const list = adminState.accounts.slice();

  if (!keyword) {
    adminState.filteredAccounts = list;
    return;
  }

  adminState.filteredAccounts = list.filter((acc) => {
    const haystack = `${acc.fullname || ''} ${acc.phone || ''} ${acc.email || ''}`.toLowerCase();
    return haystack.includes(keyword);
  });
}

function renderAccounts() {
  applyAccountFilters();
  const tbody = document.getElementById('show-user');
  if (!tbody) return;

  const list = adminState.filteredAccounts;
  if (!list.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">Khong co khach hang nao.</td></tr>`;
    return;
  }

  const rows = list
    .map((acc, idx) => {
      const isActive = Number(acc.status) === 1;
      const statusText = isActive ? 'Hoat dong' : 'Khoa';
      const statusClass = isActive ? 'badge-success' : 'badge-danger';
      return `<tr>
        <td>${idx + 1}</td>
        <td>${acc.fullname || ''}</td>
        <td>${acc.phone || ''}</td>
        <td>${acc.email || ''}</td>
        <td>${acc.address || ''}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-edit" onclick="editAccount(${acc.id})"><i class="fa-light fa-pen-to-square"></i></button>
          <button class="btn-delete" onclick="toggleAccountStatus(${acc.id}, ${isActive ? 0 : 1})">
            <i class="fa-regular ${isActive ? 'fa-user-slash' : 'fa-user-check'}"></i>
          </button>
        </td>
      </tr>`;
    })
    .join('');

  tbody.innerHTML = rows;
}

function showUser() {
  renderAccounts();
}

function cancelSearchUser() {
  const searchInput = document.getElementById('form-search-user');
  if (searchInput) searchInput.value = '';
  renderAccounts();
}

function openCreateAccount() {
  resetAccountForm();
  adminState.accountEditingId = null;
  openAccountModal('add');
}

function editAccount(id) {
  const account = adminState.accounts.find((acc) => Number(acc.id) === Number(id));
  if (!account) {
    toastWarning('Khong tim thay tai khoan');
    return;
  }
  adminState.accountEditingId = account.id;
  document.getElementById('fullname') && (document.getElementById('fullname').value = account.fullname || '');
  document.getElementById('phone') && (document.getElementById('phone').value = account.phone || '');
  document.getElementById('password') && (document.getElementById('password').value = account.password || '');
  document.getElementById('email') && (document.getElementById('email').value = account.email || '');
  document.getElementById('address') && (document.getElementById('address').value = account.address || '');
  const status = document.getElementById('user-status');
  if (status) status.checked = Number(account.status) === 1;
  openAccountModal('edit');
}

async function toggleAccountStatus(id, status) {
  const res = await sendAccountRequest('set_status', { id, status });
  if (!res) return;
  toastSuccess('Cap nhat trang thai tai khoan thanh cong!');
  await loadAccounts();
  renderAccounts();
}

// ===== UTILITIES =====

function toastWarning(message) {
  toast({ title: 'Warning', message, type: 'warning', duration: 3000 });
}

function toastSuccess(message) {
  toast({ title: 'Success', message, type: 'success', duration: 3000 });
}

// ===== PLACEHOLDER STUBS =====

function findOrder() {
  console.warn('[Admin] findOrder() is not implemented in this rebuild.');
}

function cancelSearchOrder() {
  console.warn('[Admin] cancelSearchOrder() is not implemented in this rebuild.');
}

function thongKe() {
  console.warn('[Admin] thongKe() is not implemented in this rebuild.');
}

// ===== EXPOSE GLOBALS FOR INLINE HANDLERS =====

window.showProduct = showProduct;
window.deleteProduct = deleteProduct;
window.changeStatusProduct = changeStatusProduct;
window.editProduct = editProduct;
window.uploadImage = uploadImage;
window.cancelSearchProduct = cancelSearchProduct;

window.showUser = showUser;
window.openCreateAccount = openCreateAccount;
window.editAccount = editAccount;
window.toggleAccountStatus = toggleAccountStatus;
window.cancelSearchUser = cancelSearchUser;

window.findOrder = findOrder;
window.cancelSearchOrder = cancelSearchOrder;
window.thongKe = thongKe;







