// Đổi sang định dạng tiền VND
function vnd(price) {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Đóng cửa sổ popup 
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach(item => {
  item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
  item.addEventListener('click', function (event) {
    event.stopPropagation();
  })
});

function closeModal() {
  modalContainer.forEach(item => {
    item.classList.remove('open');
  });
  body.style.overflow = "auto";
}

function increasingNumber(e) {
  let qty = e.parentNode.querySelector('.input-qty');
  if (parseInt(qty.value) < qty.max) {
    qty.value = parseInt(qty.value) + 1;
  } else {
    qty.value = qty.max;
  }
}

function decreasingNumber(e) {
  let qty = e.parentNode.querySelector('.input-qty');
  if (qty.value > qty.min) {
    qty.value = parseInt(qty.value) - 1;
  } else {
    qty.value = qty.min;
  }
}

// Xem chi tiết sản phẩm
async function detailProduct(index) {
  let modal = document.querySelector('.modal.product-detail');
  if (typeof event !== 'undefined' && event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  let products = [];
  try {
    products = JSON.parse(localStorage.getItem('products')) || [];
  } catch (_) {
    products = [];
  }

  let infoProduct = products.find(sp => Number(sp.id) === Number(index));

  if (!infoProduct) {
    try {
      const res = await fetch('./api/get_products.php', { cache: 'no-store' });
      if (res.ok) {
        const fresh = await res.json();
        if (Array.isArray(fresh)) {
          localStorage.setItem('products', JSON.stringify(fresh));
          infoProduct = fresh.find(sp => Number(sp.id) === Number(index));
          products = fresh;
        }
      }
    } catch (err) {
      console.error('[Lesac] refresh products failed', err);
    }
  }

  if (!infoProduct) {
    console.warn('[Lesac] Không tìm thấy sản phẩm với id', index);
    toast({ title: 'Cảnh báo', message: 'Sản phẩm không tồn tại hoặc đã bị ẩn.', type: 'warning', duration: 3000 });
    return;
  }

  let modalHtml = `<div class="modal-header">
    <img class="product-image" src="${infoProduct.img}" alt="">
    </div>
    <div class="modal-body">
        <h2 class="product-title">${infoProduct.title}</h2>
        <div class="product-control">
            <div class="priceBox">
                <span class="current-price">${vnd(infoProduct.price)}</span>
            </div>
            <div class="buttons_added">
                <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
            </div>
        </div>
        <p class="product-description">${infoProduct.desc}</p>
    </div>
    <div class="notebox">
            <p class="notebox-title">Ghi chú</p>
            <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
    </div>
    <div class="modal-footer">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(infoProduct.price)}</span>
        </div>
        <div class="modal-footer-control">
            <button class="button-dathangngay" data-product="${infoProduct.id}">Đặt hàng ngay</button>
            <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
        </div>
    </div>`;
  document.querySelector('#product-detail-content').innerHTML = modalHtml;
  modal.classList.add('open');
  body.style.overflow = "hidden";

  // Cập nhật giá tiền khi tăng số lượng sản phẩm
  let tgbtn = document.querySelectorAll('.is-form');
  let qty = document.querySelector('.product-control .input-qty');
  let priceText = document.querySelector('.price');
  tgbtn.forEach(element => {
    element.addEventListener('click', () => {
      let price = infoProduct.price * parseInt(qty.value);
      priceText.innerHTML = vnd(price);
    });
  });

  // Thêm sản phẩm vào giỏ hàng
  let productbtn = document.querySelector('.button-dat');
  productbtn.addEventListener('click', (e) => {
    if (localStorage.getItem('currentuser')) {
      addCart(infoProduct.id);
    } else {
      toast({ title: 'Cảnh báo', message: 'Chưa đăng nhập tài khoản!', type: 'warning', duration: 3000 });
    }
  })

  // Mua ngay sản phẩm
  dathangngay();
}

function animationCart() {
  const el = document.querySelector(".count-product-cart");
  el.style.animation = "slidein ease 1s"
  setTimeout(() => {
    el.style.animation = "none"
  }, 1000)
}

// Thêm SP vào giỏ hàng (giữ localStorage để không vỡ UI)
function addCart(index) {
  let currentuser = localStorage.getItem('currentuser') ? JSON.parse(localStorage.getItem('currentuser')) : [];
  let soluong = document.querySelector('.input-qty').value;
  let popupDetailNote = document.querySelector('#popup-detail-note').value;
  let note = popupDetailNote == "" ? "Không có ghi chú" : popupDetailNote;
  let productcart = {
    id: index,
    soluong: parseInt(soluong),
    note: note
  }
  if (!currentuser.cart) currentuser.cart = [];
  let vitri = currentuser.cart.findIndex(item => item.id == productcart.id);
  if (vitri == -1) {
    currentuser.cart.push(productcart);
  } else {
    currentuser.cart[vitri].soluong = parseInt(currentuser.cart[vitri].soluong) + parseInt(productcart.soluong);
  }
  localStorage.setItem('currentuser', JSON.stringify(currentuser));
  updateAmount();
  closeModal();
}

// Show giỏ hàng
function showCart() {
  if (localStorage.getItem('currentuser') != null) {
    let currentuser = JSON.parse(localStorage.getItem('currentuser'));
    if (currentuser.cart && currentuser.cart.length != 0) {
      document.querySelector('.gio-hang-trong').style.display = 'none';
      document.querySelector('button.thanh-toan').classList.remove('disabled');
      let productcarthtml = '';
      currentuser.cart.forEach(item => {
        let product = getProduct(item);
        productcarthtml += `<li class="cart-item" data-id="${product.id}">
                <div class="cart-item-info">
                    <p class="cart-item-title">
                        ${product.title}
                    </p>
                    <span class="cart-item-price price" data-price="${product.price}">
                    ${vnd(parseInt(product.price))}
                    </span>
                </div>
                <p class="product-note"><i class="fa-light fa-pencil"></i><span>${product.note}</span></p>
                <div class="cart-item-control">
                    <button class="cart-item-delete" onclick="deleteCartItem(${product.id},this)">Xóa</button>
                    <div class="buttons_added">
                        <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                        <input class="input-qty" max="100" min="1" name="" type="number" value="${product.soluong}">
                        <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                    </div>
                </div>
            </li>`
      });
      document.querySelector('.cart-list').innerHTML = productcarthtml;
      updateCartTotal();
      saveAmountCart();
    } else {
      document.querySelector('.gio-hang-trong').style.display = 'flex'
    }
  }
  let modalCart = document.querySelector('.modal-cart');
  let containerCart = document.querySelector('.cart-container');
  let themmon = document.querySelector('.them-mon');
  modalCart.onclick = function () {
    closeCart();
  }
  themmon.onclick = function () {
    closeCart();
  }
  containerCart.addEventListener('click', (e) => {
    e.stopPropagation();
  })
}

// Delete cart item (fix bug so sánh)
function deleteCartItem(id, el) {
  let cartParent = el.parentNode.parentNode;
  cartParent.remove();
  let currentUser = JSON.parse(localStorage.getItem('currentuser'));
  let vitri = currentUser.cart.findIndex(item => item.id == id); // FIX: dùng == thay vì =
  if (vitri > -1) currentUser.cart.splice(vitri, 1);

  // Nếu trống thì hiển thị giỏ hàng trống
  if (!currentUser.cart || currentUser.cart.length == 0) {
    document.querySelector('.gio-hang-trong').style.display = 'flex';
    document.querySelector('button.thanh-toan').classList.add('disabled');
  }
  localStorage.setItem('currentuser', JSON.stringify(currentUser));
  updateCartTotal();
}

// Update cart total
function updateCartTotal() {
  document.querySelector('.text-price').innerText = vnd(getCartTotal());
}

// Lấy tổng tiền đơn hàng
function getCartTotal() {
  let currentUser = JSON.parse(localStorage.getItem('currentuser'));
  let tongtien = 0;
  if (currentUser && currentUser.cart) {
    currentUser.cart.forEach(item => {
      let product = getProduct(item);
      tongtien += (parseInt(product.soluong) * parseInt(product.price));
    });
  }
  return tongtien;
}

// Get Product 
function getProduct(item) {
  let products = JSON.parse(localStorage.getItem('products'));
  let infoProductCart = products.find(sp => item.id == sp.id)
  let product = {
    ...infoProductCart,
    ...item
  }
  return product;
}

// onload: dùng event listener để không bị đè
window.addEventListener('load', updateAmount);
window.addEventListener('load', updateCartTotal);

// Lấy số lượng hàng
function getAmountCart() {
  let currentuser = JSON.parse(localStorage.getItem('currentuser'))
  let amount = 0;
  if (currentuser && currentuser.cart) {
    currentuser.cart.forEach(element => {
      amount += parseInt(element.soluong);
    });
  }
  return amount;
}

// Update Amount Cart 
function updateAmount() {
  if (localStorage.getItem('currentuser') != null) {
    let amount = getAmountCart();
    const el = document.querySelector('.count-product-cart');
    if (el) el.innerText = amount;
  }
}

// Save Cart Info (cập nhật số lượng trong localStorage)
function saveAmountCart() {
  let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form");
  let listProduct = document.querySelectorAll('.cart-item');
  let currentUser = JSON.parse(localStorage.getItem('currentuser'));
  cartAmountbtn.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      let id = listProduct[parseInt(index / 2)].getAttribute("data-id");
      let productId = currentUser.cart.find(item => {
        return item.id == id;
      });
      productId.soluong = parseInt(listProduct[parseInt(index / 2)].querySelector(".input-qty").value);
      localStorage.setItem('currentuser', JSON.stringify(currentUser));
      updateCartTotal();
    })
  });
}

// Open & Close Cart
function openCart() {
  showCart();
  document.querySelector('.modal-cart').classList.add('open');
  body.style.overflow = "hidden";
}

function closeCart() {
  document.querySelector('.modal-cart').classList.remove('open');
  body.style.overflow = "auto";
  updateAmount();
}

// Open Search Advanced
document.querySelector(".filter-btn").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelector(".advanced-search").classList.toggle("open");
  document.getElementById("home-service").scrollIntoView();
})

document.querySelector(".form-search-input").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("home-service").scrollIntoView();
})

function closeSearchAdvanced() {
  document.querySelector(".advanced-search").classList.toggle("open");
}

// Open Search Mobile 
function openSearchMb() {
  document.querySelector(".header-middle-left").style.display = "none";
  document.querySelector(".header-middle-center").style.display = "block";
  document.querySelector(".header-middle-right-item.close").style.display = "block";
  let liItem = document.querySelectorAll(".header-middle-right-item.open");
  for (let i = 0; i < liItem.length; i++) {
    liItem[i].style.setProperty("display", "none", "important")
  }
}

// Close Search Mobile 
function closeSearchMb() {
  document.querySelector(".header-middle-left").style.display = "block";
  document.querySelector(".header-middle-center").style.display = "none";
  document.querySelector(".header-middle-right-item.close").style.display = "none";
  let liItem = document.querySelectorAll(".header-middle-right-item.open");
  for (let i = 0; i < liItem.length; i++) {
    liItem[i].style.setProperty("display", "block", "important")
  }
}

// Signup && Login Form

// Chuyển đổi qua lại SignUp & Login 
let signup = document.querySelector('.signup-link');
let login = document.querySelector('.login-link');
let container = document.querySelector('.signup-login .modal-container');
login.addEventListener('click', () => {
  container.classList.add('active');
})

signup.addEventListener('click', () => {
  container.classList.remove('active');
})

let signupbtn = document.getElementById('signup');
let loginbtn = document.getElementById('login');
let formsg = document.querySelector('.modal.signup-login')
signupbtn.addEventListener('click', () => {
  formsg.classList.add('open');
  container.classList.remove('active');
  body.style.overflow = "hidden";
})

loginbtn.addEventListener('click', () => {
  document.querySelector('.form-message-check-login').innerHTML = '';
  formsg.classList.add('open');
  container.classList.add('active');
  body.style.overflow = "hidden";
})

// Đăng ký & Đăng nhập

// Chức năng đăng ký
let signupButton = document.getElementById('signup-button');
let loginButton = document.getElementById('login-button');

signupButton.addEventListener('click', (event) => {
  event.preventDefault();

  let fullNameUser = document.getElementById('fullname').value.trim();
  let phoneUser = document.getElementById('phone').value.trim();
  let passwordUser = document.getElementById('password').value.trim();
  let passwordConfirmation = document.getElementById('password_confirmation').value.trim();
  let checkSignup = document.getElementById('checkbox-signup').checked;

  // ====== KIỂM TRA HỌ TÊN ======
  if (fullNameUser.length == 0) {
    document.querySelector('.form-message-name').innerHTML = 'Vui lòng nhập họ và tên';
    document.getElementById('fullname').focus();
  } else if (fullNameUser.length < 3) {
    document.querySelector('.form-message-name').innerHTML = 'Họ và tên phải có ít nhất 3 ký tự';
    document.getElementById('fullname').value = '';
  } else {
    document.querySelector('.form-message-name').innerHTML = '';
  }

  // ====== KIỂM TRA SỐ ĐIỆN THOẠI ======
  const phoneRegex = /^[0-9]{10}$/;

  if (phoneUser.length == 0) {
    document.querySelector('.form-message-phone').innerHTML = 'Vui lòng nhập vào số điện thoại';
  } else if (!phoneRegex.test(phoneUser)) {
    document.querySelector('.form-message-phone').innerHTML = 'Số điện thoại phải có đúng 10 chữ số và không chứa ký tự khác';
    document.getElementById('phone').value = '';
  } else {
    document.querySelector('.form-message-phone').innerHTML = '';
  }

  // ====== KIỂM TRA MẬT KHẨU ======
  const passwordRegex = /^(?=.*[A-Z]).{6,}$/;

  if (passwordUser.length == 0) {
    document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu';
  } else if (!passwordRegex.test(passwordUser)) {
    document.querySelector('.form-message-password').innerHTML = 'Mật khẩu phải có ít nhất 6 ký tự và chứa ít nhất 1 chữ cái viết hoa';
    document.getElementById('password').value = '';
  } else {
    document.querySelector('.form-message-password').innerHTML = '';
  }

  // ====== KIỂM TRA NHẬP LẠI MẬT KHẨU ======
  if (passwordConfirmation.length == 0) {
    document.querySelector('.form-message-password-confi').innerHTML = 'Vui lòng nhập lại mật khẩu';
  } else if (passwordConfirmation !== passwordUser) {
    document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu không khớp';
    document.getElementById('password_confirmation').value = '';
  } else {
    document.querySelector('.form-message-password-confi').innerHTML = '';
  }

  // ====== KIỂM TRA CHECKBOX ======
  if (!checkSignup) {
    document.querySelector('.form-message-checkbox').innerHTML = 'Vui lòng check đồng ý đăng ký';
  } else {
    document.querySelector('.form-message-checkbox').innerHTML = '';
  }

  // ====== NẾU TẤT CẢ HỢP LỆ → GỌI API ĐĂNG KÝ + ĐĂNG NHẬP NGAY ======
  if (
    fullNameUser &&
    phoneRegex.test(phoneUser) &&
    passwordRegex.test(passwordUser) &&
    passwordConfirmation === passwordUser &&
    checkSignup
  ) {
    const user = {
      fullname: fullNameUser,
      phone: phoneUser,
      password: passwordUser,
      address: '',
      email: ''
    };

    fetch('./api/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
      .then(r => r.json())
      .then(res => {
        if (!res.success) throw new Error(res.message || 'Đăng ký thất bại');
        return fetch('./api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneUser, password: passwordUser })
        }).then(r => r.json());
      })
      .then(loginRes => {
        if (!loginRes.success) throw new Error(loginRes.message || 'Đăng nhập sau đăng ký thất bại');
        localStorage.setItem('currentuser', JSON.stringify(loginRes.user));
        toast({ title: 'Thành công', message: 'Tạo tài khoản thành công!', type: 'success', duration: 3000 });
        closeModal();
        kiemtradangnhap();
        updateAmount();
      })
      .catch(err => {
        toast({ title: 'Thất bại', message: err.message, type: 'error', duration: 3000 });
      });
  } else {
    console.warn("Thông tin đăng ký chưa hợp lệ!");
  }
});

// Đăng nhập (gọi API, không phụ thuộc localStorage.accounts)
loginButton.addEventListener('click', (ev) => {
  ev.preventDefault();

  const phonelog = document.getElementById('phone-login').value.trim();
  const passlog  = document.getElementById('password-login').value.trim();

  // validate đơn giản
  if (!phonelog) {
    document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại';
    return;
  } else if (phonelog.length !== 10) {
    document.querySelector('.form-message.phonelog').innerHTML = 'Vui lòng nhập vào số điện thoại 10 số';
    document.getElementById('phone-login').value = '';
    return;
  } else {
    document.querySelector('.form-message.phonelog').innerHTML = '';
  }

  if (!passlog) {
    document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu';
    return;
  } else if (passlog.length < 6) {
    document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
    // LƯU Ý: đúng id là 'password-login' (trước đây bạn ghi nhầm 'passwordlogin')
    document.getElementById('password-login').value = '';
    return;
  } else {
    document.querySelector('.form-message-check-login').innerHTML = '';
  }

  // gọi API
  fetch(`./api/check_login.php?phone=${encodeURIComponent(phonelog)}&password=${encodeURIComponent(passlog)}`)
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        // Lưu currentuser theo đúng schema cũ để các chỗ khác chạy y như cũ
        const user = {
          fullname: data.user.fullname,
          phone:    data.user.phone,
          password: passlog,       // đang dùng plain trong DB mẫu
          address:  data.user.address || '',
          email:    data.user.email || '',
          status:   Number(data.user.status) === 1 ? 1 : 0,
          join:     new Date(),    // không có trong DB => giả lập để UI cũ dùng
          cart:     [],            // giỏ hiện tại vẫn lưu phía client theo thiết kế cũ
          userType: Number(data.user.userType) || 0
        };

        // cập nhật cache 'accounts' cho các màn khác (admin/user list)
        let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
        const i = accounts.findIndex(a => a.phone === user.phone);
        if (i === -1) accounts.push(user); else accounts[i] = {...accounts[i], ...user};
        localStorage.setItem('accounts', JSON.stringify(accounts));

        // set currentuser
        localStorage.setItem('currentuser', JSON.stringify(user));

        toast({ title: 'Thành công', message: 'Đăng nhập thành công', type: 'success', duration: 3000 });
        closeModal();
        kiemtradangnhap();
        checkAdmin();
        updateAmount();
      } else {
        const msg = data.msg || 'Đăng nhập thất bại';
        toast({ title: 'Cảnh báo', message: msg, type: 'warning', duration: 3000 });
      }
    })
    .catch(err => {
      console.error(err);
      toast({ title: 'Lỗi', message: 'Lỗi kết nối máy chủ', type: 'error', duration: 3000 });
    });
});


// Kiểm tra xem có tài khoản đăng nhập không?
function kiemtradangnhap() {
  let currentUser = localStorage.getItem('currentuser');
  if (currentUser != null) {
    let user = JSON.parse(currentUser);
    document.querySelector('.auth-container').innerHTML = `<span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down"></i></span>`
    document.querySelector('.header-middle-right-menu').innerHTML = `<li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i>Thông tin tài khoản</a></li>
            <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i>Đơn hàng đã mua</a></li>
            <li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i>Thoát tài khoản</a></li>`
    document.querySelector('#logout').addEventListener('click', logOut)
  }
}

function logOut() {
  localStorage.removeItem('currentuser');
  window.location = "./";
}

function checkAdmin() {
  let user = JSON.parse(localStorage.getItem('currentuser'));
  if (user && user.userType == 1) {
    let node = document.createElement(`li`);
    node.innerHTML = `<a href="./admin.html"><i class="fa-light fa-gear"></i>Quản lý cửa hàng</a>`
    document.querySelector('.header-middle-right-menu').prepend(node);
  }
}

window.addEventListener('load', kiemtradangnhap);
window.addEventListener('load', checkAdmin);

// Chuyển đổi trang chủ và trang thông tin tài khoản
function myAccount() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('trangchu').classList.add('hide');
  document.getElementById('order-history').classList.remove('open');
  document.getElementById('account-user').classList.add('open');
  userInfo();
}

// Chuyển đổi trang chủ và trang xem lịch sử đặt hàng 
function orderHistory() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('account-user').classList.remove('open');
  document.getElementById('trangchu').classList.add('hide');
  document.getElementById('order-history').classList.add('open');
  renderOrderProduct();
}

function emailIsValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function userInfo() {
  let user = JSON.parse(localStorage.getItem('currentuser'));
  document.getElementById('infoname').value = user.fullname;
  document.getElementById('infophone').value = user.phone;
  document.getElementById('infoemail').value = user.email || '';
  document.getElementById('infoaddress').value = user.address || '';
  if (user.email == undefined) {
    infoemail.value = '';
  }
  if (user.address == undefined) {
    infoaddress.value = '';
  }
}

// Thay đổi thông tin (GIỮ NGUYÊN localStorage để không vỡ UI; nếu muốn sync DB, tạo API cập nhật)
function changeInformation() {
  let accounts = JSON.parse(localStorage.getItem('accounts') || '[]'); // vẫn giữ cho tương thích cũ nếu có
  let user = JSON.parse(localStorage.getItem('currentuser'));
  let infoname = document.getElementById('infoname');
  let infoemail = document.getElementById('infoemail');
  let infoaddress = document.getElementById('infoaddress');

  user.fullname = infoname.value;
  if (infoemail.value.length > 0) {
    if (!emailIsValid(infoemail.value)) {
      document.querySelector('.inforemail-error').innerHTML = 'Vui lòng nhập email hợp lệ!';
      infoemail.value = '';
    } else {
      user.email = infoemail.value;
    }
  }

  if (infoaddress.value.length > 0) {
    user.address = infoaddress.value;
  }

  // cập nhật lại currentuser
  localStorage.setItem('currentuser', JSON.stringify(user));

  // nếu trước đây còn dùng localStorage.accounts thì sync tạm cho đỡ lỗi
  if (accounts && accounts.length) {
    let vitri = accounts.findIndex(item => item.phone == user.phone)
    if (vitri > -1) {
      accounts[vitri].fullname = user.fullname;
      accounts[vitri].email = user.email;
      accounts[vitri].address = user.address;
      localStorage.setItem('accounts', JSON.stringify(accounts));
    }
  }

  kiemtradangnhap();
  toast({ title: 'Thành công', message: 'Cập nhật thông tin thành công!', type: 'success', duration: 3000 });
}

// Đổi mật khẩu (giữ localStorage để không vỡ UI; nếu muốn sync DB, tạo API update password)
function changePassword() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let passwordCur = document.getElementById('password-cur-info');
  let passwordAfter = document.getElementById('password-after-info');
  let passwordConfirm = document.getElementById('password-comfirm-info');
  let check = true;
  if (passwordCur.value.length == 0) {
    document.querySelector('.password-cur-info-error').innerHTML = 'Vui lòng nhập mật khẩu hiện tại';
    check = false;
  } else {
    document.querySelector('.password-cur-info-error').innerHTML = '';
  }

  if (passwordAfter.value.length == 0) {
    document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
    check = false;
  } else {
    document.querySelector('.password-after-info-error').innerHTML = '';
  }

  if (passwordConfirm.value.length == 0) {
    document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng nhập mật khẩu xác nhận';
    check = false;
  } else {
    document.querySelector('.password-after-comfirm-error').innerHTML = '';
  }

  if (check == true) {
    if (passwordCur.value.length > 0) {
      if (passwordCur.value == currentUser.password) {
        document.querySelector('.password-cur-info-error').innerHTML = '';
        if (passwordAfter.value.length > 0) {
          if (passwordAfter.value.length < 6) {
            document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới có số ký tự lớn hơn hoặc bằng 6';
          } else {
            document.querySelector('.password-after-info-error').innerHTML = '';
            if (passwordConfirm.value.length > 0) {
              if (passwordConfirm.value == passwordAfter.value) {
                document.querySelector('.password-after-comfirm-error').innerHTML = '';
                currentUser.password = passwordAfter.value;
                localStorage.setItem('currentuser', JSON.stringify(currentUser));
                let userChange = JSON.parse(localStorage.getItem('currentuser'));
                let accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
                let accountChange = accounts.find(acc => acc.phone == userChange.phone);
                if (accountChange) {
                  accountChange.password = userChange.password;
                  localStorage.setItem('accounts', JSON.stringify(accounts));
                }
                toast({ title: 'Thành công', message: 'Đổi mật khẩu thành công!', type: 'success', duration: 3000 });
              } else {
                document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu bạn nhập không trùng khớp';
              }
            } else {
              document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng xác nhận mật khẩu';
            }
          }
        } else {
          document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        }
      } else {
        document.querySelector('.password-cur-info-error').innerHTML = 'Bạn đã nhập sai mật khẩu hiện tại';
      }
    }
  }
}

function getProductInfo(id) {
  let products = JSON.parse(localStorage.getItem('products'));
  return products.find(item => {
    return item.id == id;
  })
}

// Quản lý đơn hàng (giữ theo localStorage để không vỡ UI cũ)
function renderOrderProduct() {
  let currentUser = JSON.parse(localStorage.getItem('currentuser'));
  let order = localStorage.getItem('order') ? JSON.parse(localStorage.getItem('order')) : [];
  let orderHtml = "";
  let arrDonHang = [];
  for (let i = 0; i < order.length; i++) {
    if (order[i].khachhang === currentUser.phone) {
      arrDonHang.push(order[i]);
    }
  }
  if (arrDonHang.length == 0) {
    orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
  } else {
    arrDonHang.forEach(item => {
      let productHtml = `<div class="order-history-group">`;
      let chiTietDon = getOrderDetails(item.id);
      chiTietDon.forEach(sp => {
        let infosp = getProductInfo(sp.id);
        productHtml += `<div class="order-history">
                    <div class="order-history-left">
                        <img src="${infosp.img}" alt="">
                        <div class="order-history-info">
                            <h4>${infosp.title}!</h4>
                            <p class="order-history-note"><i class="fa-light fa-pen"></i> ${sp.note}</p>
                            <p class="order-history-quantity">x${sp.soluong}</p>
                        </div>
                    </div>
                    <div class="order-history-right">
                        <div class="order-history-price">
                            <span class="order-history-current-price">${vnd(sp.price)}</span>
                        </div>                         
                    </div>
                </div>`;
      });
      let textCompl = item.trangthai == 1 ? "Đã xử lý" : "Đang xử lý";
      let classCompl = item.trangthai == 1 ? "complete" : "no-complete"
      productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                    <button id="order-history-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tổng tiền: </span>
                    <span class="order-history-toltal-price">${vnd(item.tongtien)}</span>
                </div>
            </div>`;
      productHtml += `</div>`;
      orderHtml += productHtml;
    });
  }
  document.querySelector(".order-history-section").innerHTML = orderHtml;
}

// Get Order Details
function getOrderDetails(madon) {
  let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : [];
  let ctDon = [];
  orderDetails.forEach(item => {
    if (item.madon == madon) {
      ctDon.push(item);
    }
  });
  return ctDon;
}

// Format Date
function formatDate(date) {
  let fm = new Date(date);
  let yyyy = fm.getFullYear();
  let mm = fm.getMonth() + 1;
  let dd = fm.getDate();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  return dd + '/' + mm + '/' + yyyy;
}

// Xem chi tiết đơn hàng
function detailOrder(id) {
  let order = JSON.parse(localStorage.getItem("order"));
  let detail = order.find(item => {
    return item.id == id;
  })
  document.querySelector(".modal.detail-order").classList.add("open");
  let detailOrderHtml = `<ul class="detail-order-group">
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
            <span class="detail-order-item-right">${formatDate(detail.thoigiandat)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
            <span class="detail-order-item-right">${detail.hinhthucgiao}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
            <span class="detail-order-item-right">${(detail.thoigiangiao == "" ? "" : (detail.thoigiangiao + " - ")) + formatDate(detail.ngaygiaohang)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
            <span class="detail-order-item-right">${detail.diachinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${detail.tenguoinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
            <span class="detail-order-item-right">${detail.sdtnhan}</span>
        </li>
    </ul>`;
  document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
}

// Create id order 
function createId(arr) {
  let id = arr.length + 1;
  let check = arr.find(item => item.id == "DH" + id)
  while (check != null) {
    id++;
    check = arr.find(item => item.id == "DH" + id)
  }
  return "DH" + id;
}

// Back to top
window.onscroll = () => {
  let backtopTop = document.querySelector(".back-to-top")
  if (document.documentElement.scrollTop > 100) {
    backtopTop.classList.add("active");
  } else {
    backtopTop.classList.remove("active");
  }
}

// Auto hide header on scroll
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (lastScrollY < window.scrollY) {
    headerNav.classList.add("hide")
  } else {
    headerNav.classList.remove("hide")
  }
  lastScrollY = window.scrollY;
})

// Page
function renderProducts(showProduct) {
  let productHtml = '';
  if (showProduct.length == 0) {
    document.getElementById("home-title").style.display = "none";
    productHtml = `
    <div class="joyce-section">
      <div class="joyce-container">
        <div class="joyce-left">
          <h1>Joyce the Season</h1>
        </div>
        <div class="joyce-right">
          <h2><em>JOYCE THE SEASON 🍂</em></h2>
          <p>
            Mùa Thu/Đông 2025 mang đến hơi thở trầm ấm của sắc Earth tone – gam màu gợi cảm giác an yên và gần gũi, 
            kết hợp cùng chất liệu da cao cấp tôn lên vẻ tự nhiên, thanh lịch nhưng vẫn dễ dàng hòa nhịp cùng mọi phong cách cuối năm.
          </p>
        </div>
      </div>
      <div class="joyce-images">
        <img src="./assets/img/products/anh1.png" alt="Joyce 1">
        <img src="./assets/img/products/anh2.png" alt="Joyce 2">
        <img src="./assets/img/products/anh3.png" alt="Joyce 3">
        <img src="./assets/img/products/anh4.png" alt="Joyce 4">
        <img src="./assets/img/products/anh5.png" alt="Joyce 5">
      </div>
    </div>
  `;
  } else {
    document.getElementById("home-title").style.display = "block";
    showProduct.forEach((product) => {
      productHtml += `<div class="col-product">
            <article class="card-product" >
                <div class="card-header">
                    <a href="#" class="card-image-link" onclick="detailProduct(${product.id})">
                    <img class="card-image" src="${product.img}" alt="${product.title}">
                    </a>
                </div>
                <div class="food-info">
                    <div class="card-content">
                        <div class="card-title">
                            <a href="#" class="card-title-link" onclick="detailProduct(${product.id})">${product.title}</a>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="product-price">
                            <span class="current-price">${vnd(product.price)}</span>
                        </div>
                    <div class="product-buy">
                        <button onclick="detailProduct(${product.id})" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i>Đặt hàng</button>
                    </div> 
                </div>
                </div>
            </article>
        </div>`;
    });
  }
  document.getElementById('home-products').innerHTML = productHtml;
}

// Find Product
var productAll = JSON.parse(localStorage.getItem('products')).filter(item => item.status == 1);
function searchProducts() {
  // Lấy giá trị từ ô tìm kiếm
  let searchInputValue = document.querySelector('.form-search-input').value;

  // Lọc sản phẩm theo từ khóa
  let result = searchInputValue === "" ? productAll : productAll.filter(item => {
    return item.title.toString().toUpperCase().includes(searchInputValue.toString().toUpperCase());
  });

  // Cuộn tới phần hiển thị kết quả
  document.getElementById("home-service").scrollIntoView();

  // Hiển thị kết quả
  showHomeProduct(result);
}

// Phân trang 
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

function displayList(productAll, perPage, currentPage) {
  let start = (currentPage - 1) * perPage;
  let end = (currentPage - 1) * perPage + perPage;
  let productShow = productAll.slice(start, end);
  renderProducts(productShow);
}

function showHomeProduct(products) {
  let productAll = products.filter(item => item.status == 1)
  displayList(productAll, perPage, currentPage);
  setupPagination(productAll, perPage, currentPage);
}

window.addEventListener('load', () => {
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  showHomeProduct(products);
});

function setupPagination(productAll, perPage) {
  document.querySelector('.page-nav-list').innerHTML = '';
  let page_count = Math.ceil(productAll.length / perPage);
  for (let i = 1; i <= page_count; i++) {
    let li = paginationChange(i, productAll, currentPage);
    document.querySelector('.page-nav-list').appendChild(li);
  }
}

function paginationChange(page, productAll, currentPageNow) {
  let node = document.createElement(`li`);
  node.classList.add('page-nav-item');
  node.innerHTML = `<a href="javascript:;">${page}</a>`;
  if (currentPageNow == page) node.classList.add('active');
  node.addEventListener('click', function () {
    currentPage = page;
    displayList(productAll, perPage, currentPage);
    let t = document.querySelectorAll('.page-nav-item.active');
    for (let i = 0; i < t.length; i++) {
      t[i].classList.remove('active');
    }
    node.classList.add('active');
    document.getElementById("home-service").scrollIntoView();
  })
  return node;
}

// Hiển thị chuyên mục
function showCategory(category) {
  document.getElementById('trangchu').classList.remove('hide');
  document.getElementById('account-user').classList.remove('open');
  document.getElementById('order-history').classList.remove('open');
  let productSearch = productAll.filter(value => {
    return value.category.toString().toUpperCase().includes(category.toUpperCase());
  })
  let currentPageSeach = 1;
  displayList(productSearch, perPage, currentPageSeach);
  setupPagination(productSearch, perPage, currentPageSeach);
  document.getElementById("home-title").scrollIntoView();
}

