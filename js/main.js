// Äá»•i sang Ä‘á»‹nh dáº¡ng tiá»n VND
function vnd(price) {
  return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// ÄÃ³ng cá»­a sá»• popup 
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vÃ¹ng ngoÃ i sáº½ táº¯t Popup
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

// Xem chi tiáº¿t sáº£n pháº©m
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
    console.warn('[Lesac] Khong tim thay san pham voi id', index);
    toast({ title: 'Warning', message: 'San pham khong ton tai hoac da bi an.', type: 'warning', duration: 3000 });
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
            <textarea class="text-note" id="popup-detail-note" placeholder="Nháº­p thÃ´ng tin cáº§n lÆ°u Ã½..."></textarea>
    </div>
    <div class="modal-footer">
        <div class="price-total">
            <span class="thanhtien">ThÃ nh tiá»n</span>
            <span class="price">${vnd(infoProduct.price)}</span>
        </div>
        <div class="modal-footer-control">
            <button class="button-dathangngay" data-product="${infoProduct.id}">Äáº·t hÃ ng ngay</button>
            <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
        </div>
    </div>`;
  document.querySelector('#product-detail-content').innerHTML = modalHtml;
  modal.classList.add('open');
  body.style.overflow = "hidden";

  // Cáº­p nháº­t giÃ¡ tiá»n khi tÄƒng sá»‘ lÆ°á»£ng sáº£n pháº©m
  let tgbtn = document.querySelectorAll('.is-form');
  let qty = document.querySelector('.product-control .input-qty');
  let priceText = document.querySelector('.price');
  tgbtn.forEach(element => {
    element.addEventListener('click', () => {
      let price = infoProduct.price * parseInt(qty.value);
      priceText.innerHTML = vnd(price);
    });
  });

  // ThÃªm sáº£n pháº©m vÃ o giá» hÃ ng
  let productbtn = document.querySelector('.button-dat');
  productbtn.addEventListener('click', (e) => {
    if (localStorage.getItem('currentuser')) {
      addCart(infoProduct.id);
    } else {
      toast({ title: 'Warning', message: 'ChÆ°a Ä‘Äƒng nháº­p tÃ i khoáº£n !', type: 'warning', duration: 3000 });
    }
  })

  // Mua ngay sáº£n pháº©m
  dathangngay();
}

function animationCart() {
  const el = document.querySelector(".count-product-cart");
  el.style.animation = "slidein ease 1s"
  setTimeout(() => {
    el.style.animation = "none"
  }, 1000)
}

// ThÃªm SP vÃ o giá» hÃ ng (giá»¯ localStorage Ä‘á»ƒ khÃ´ng vá»¡ UI)
function addCart(index) {
  let currentuser = localStorage.getItem('currentuser') ? JSON.parse(localStorage.getItem('currentuser')) : [];
  let soluong = document.querySelector('.input-qty').value;
  let popupDetailNote = document.querySelector('#popup-detail-note').value;
  let note = popupDetailNote == "" ? "KhÃ´ng cÃ³ ghi chÃº" : popupDetailNote;
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

// Show giá» hÃ ng
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
                    <button class="cart-item-delete" onclick="deleteCartItem(${product.id},this)">XÃ³a</button>
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

// Delete cart item (fix bug so sÃ¡nh)
function deleteCartItem(id, el) {
  let cartParent = el.parentNode.parentNode;
  cartParent.remove();
  let currentUser = JSON.parse(localStorage.getItem('currentuser'));
  let vitri = currentUser.cart.findIndex(item => item.id == id); // FIX: dÃ¹ng == thay vÃ¬ =
  if (vitri > -1) currentUser.cart.splice(vitri, 1);

  // Náº¿u trá»‘ng thÃ¬ hiá»ƒn thá»‹ giá» hÃ ng trá»‘ng
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

// Láº¥y tá»•ng tiá»n Ä‘Æ¡n hÃ ng
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

// onload: dÃ¹ng event listener Ä‘á»ƒ khÃ´ng bá»‹ Ä‘Ã¨
window.addEventListener('load', updateAmount);
window.addEventListener('load', updateCartTotal);

// Láº¥y sá»‘ lÆ°á»£ng hÃ ng
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

// Save Cart Info (cáº­p nháº­t sá»‘ lÆ°á»£ng trong localStorage)
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

// Chuyá»ƒn Ä‘á»•i qua láº¡i SignUp & Login 
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

// ÄÄƒng kÃ½ & ÄÄƒng nháº­p

// Chá»©c nÄƒng Ä‘Äƒng kÃ½
let signupButton = document.getElementById('signup-button');
let loginButton = document.getElementById('login-button');

signupButton.addEventListener('click', (event) => {
  event.preventDefault();

  let fullNameUser = document.getElementById('fullname').value.trim();
  let phoneUser = document.getElementById('phone').value.trim();
  let passwordUser = document.getElementById('password').value.trim();
  let passwordConfirmation = document.getElementById('password_confirmation').value.trim();
  let checkSignup = document.getElementById('checkbox-signup').checked;

  // ====== KIá»‚M TRA Há»Œ TÃŠN ======
  if (fullNameUser.length == 0) {
    document.querySelector('.form-message-name').innerHTML = 'Vui lÃ²ng nháº­p há» vÃ  tÃªn';
    document.getElementById('fullname').focus();
  } else if (fullNameUser.length < 3) {
    document.querySelector('.form-message-name').innerHTML = 'Há» vÃ  tÃªn pháº£i cÃ³ Ã­t nháº¥t 3 kÃ½ tá»±';
    document.getElementById('fullname').value = '';
  } else {
    document.querySelector('.form-message-name').innerHTML = '';
  }

  // ====== KIá»‚M TRA Sá» ÄIá»†N THOáº I ======
  const phoneRegex = /^[0-9]{10}$/;

  if (phoneUser.length == 0) {
    document.querySelector('.form-message-phone').innerHTML = 'Vui lÃ²ng nháº­p vÃ o sá»‘ Ä‘iá»‡n thoáº¡i';
  } else if (!phoneRegex.test(phoneUser)) {
    document.querySelector('.form-message-phone').innerHTML = 'Sá»‘ Ä‘iá»‡n thoáº¡i pháº£i cÃ³ Ä‘Ãºng 10 chá»¯ sá»‘ vÃ  khÃ´ng chá»©a kÃ½ tá»± khÃ¡c';
    document.getElementById('phone').value = '';
  } else {
    document.querySelector('.form-message-phone').innerHTML = '';
  }

  // ====== KIá»‚M TRA Máº¬T KHáº¨U ======
  const passwordRegex = /^(?=.*[A-Z]).{6,}$/;

  if (passwordUser.length == 0) {
    document.querySelector('.form-message-password').innerHTML = 'Vui lÃ²ng nháº­p máº­t kháº©u';
  } else if (!passwordRegex.test(passwordUser)) {
    document.querySelector('.form-message-password').innerHTML = 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»± vÃ  chá»©a Ã­t nháº¥t 1 chá»¯ cÃ¡i viáº¿t hoa';
    document.getElementById('password').value = '';
  } else {
    document.querySelector('.form-message-password').innerHTML = '';
  }

  // ====== KIá»‚M TRA NHáº¬P Láº I Máº¬T KHáº¨U ======
  if (passwordConfirmation.length == 0) {
    document.querySelector('.form-message-password-confi').innerHTML = 'Vui lÃ²ng nháº­p láº¡i máº­t kháº©u';
  } else if (passwordConfirmation !== passwordUser) {
    document.querySelector('.form-message-password-confi').innerHTML = 'Máº­t kháº©u khÃ´ng khá»›p';
    document.getElementById('password_confirmation').value = '';
  } else {
    document.querySelector('.form-message-password-confi').innerHTML = '';
  }

  // ====== KIá»‚M TRA CHECKBOX ======
  if (!checkSignup) {
    document.querySelector('.form-message-checkbox').innerHTML = 'Vui lÃ²ng check Ä‘Äƒng kÃ½';
  } else {
    document.querySelector('.form-message-checkbox').innerHTML = '';
  }

  // ====== Náº¾U Táº¤T Cáº¢ Há»¢P Lá»† â†’ Gá»ŒI API ÄÄ‚NG KÃ + ÄÄ‚NG NHáº¬P NGAY ======
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
        if (!res.success) throw new Error(res.message || 'ÄÄƒng kÃ½ tháº¥t báº¡i');
        return fetch('./api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: phoneUser, password: passwordUser })
        }).then(r => r.json());
      })
      .then(loginRes => {
        if (!loginRes.success) throw new Error(loginRes.message || 'ÄÄƒng nháº­p sau Ä‘Äƒng kÃ½ tháº¥t báº¡i');
        localStorage.setItem('currentuser', JSON.stringify(loginRes.user));
        toast({ title: 'Thành công', message: 'Tạo tài khoản thành công!', type: 'success', duration: 3000 });
        closeModal();
        kiemtradangnhap();
        updateAmount();
      })
      .catch(err => {
        toast({ title: 'Tháº¥t báº¡i', message: err.message, type: 'error', duration: 3000 });
      });
  } else {
    console.warn("ThÃ´ng tin Ä‘Äƒng kÃ½ chÆ°a há»£p lá»‡!");
  }
});

// Dang nhap (gá»i API, khÃ´ng phá»¥ thuá»™c localStorage.accounts)
loginButton.addEventListener('click', (ev) => {
  ev.preventDefault();

  const phonelog = document.getElementById('phone-login').value.trim();
  const passlog  = document.getElementById('password-login').value.trim();

  // validate Ä‘Æ¡n giáº£n
  if (!phonelog) {
    document.querySelector('.form-message.phonelog').innerHTML = 'Vui lÃ²ng nháº­p vÃ o sá»‘ Ä‘iá»‡n thoáº¡i';
    return;
  } else if (phonelog.length !== 10) {
    document.querySelector('.form-message.phonelog').innerHTML = 'Vui lÃ²ng nháº­p vÃ o sá»‘ Ä‘iá»‡n thoáº¡i 10 sá»‘';
    document.getElementById('phone-login').value = '';
    return;
  } else {
    document.querySelector('.form-message.phonelog').innerHTML = '';
  }

  if (!passlog) {
    document.querySelector('.form-message-check-login').innerHTML = 'Vui lÃ²ng nháº­p máº­t kháº©u';
    return;
  } else if (passlog.length < 6) {
    document.querySelector('.form-message-check-login').innerHTML = 'Vui lÃ²ng nháº­p máº­t kháº©u lá»›n hÆ¡n 6 kÃ­ tá»±';
    // LÆ¯U Ã: Ä‘Ãºng id lÃ  'password-login' (trÆ°á»›c Ä‘Ã¢y báº¡n ghi nháº§m 'passwordlogin')
    document.getElementById('password-login').value = '';
    return;
  } else {
    document.querySelector('.form-message-check-login').innerHTML = '';
  }

  // gá»i API
  fetch(`./api/check_login.php?phone=${encodeURIComponent(phonelog)}&password=${encodeURIComponent(passlog)}`)
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        // LÆ°u currentuser theo Ä‘Ãºng schema cÅ© Ä‘á»ƒ cÃ¡c chá»— khÃ¡c cháº¡y y nhÆ° cÅ©
        const user = {
          fullname: data.user.fullname,
          phone:    data.user.phone,
          password: passlog,       // Ä‘ang dÃ¹ng plain trong DB máº«u
          address:  data.user.address || '',
          email:    data.user.email || '',
          status:   Number(data.user.status) === 1 ? 1 : 0,
          join:     new Date(),    // khÃ´ng cÃ³ trong DB => giáº£ láº­p Ä‘á»ƒ UI cÅ© dÃ¹ng
          cart:     [],            // giá» hiá»‡n táº¡i váº«n lÆ°u phÃ­a client theo thiáº¿t káº¿ cÅ©
          userType: Number(data.user.userType) || 0
        };

        // cáº­p nháº­t cache 'accounts' cho cÃ¡c mÃ n khÃ¡c (admin/user list)
        let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
        const i = accounts.findIndex(a => a.phone === user.phone);
        if (i === -1) accounts.push(user); else accounts[i] = {...accounts[i], ...user};
        localStorage.setItem('accounts', JSON.stringify(accounts));

        // set currentuser
        localStorage.setItem('currentuser', JSON.stringify(user));

        toast({ title: 'Success', message: 'Đăng nhập thành công', type: 'success', duration: 3000 });
        closeModal();
        kiemtradangnhap();
        checkAdmin();
        updateAmount();
      } else {
        const msg = data.msg || 'ÄÄƒng nháº­p tháº¥t báº¡i';
        toast({ title: 'Warning', message: msg, type: 'warning', duration: 3000 });
      }
    })
    .catch(err => {
      console.error(err);
      toast({ title: 'Error', message: 'Lá»—i káº¿t ná»‘i mÃ¡y chá»§', type: 'error', duration: 3000 });
    });
});


// Kiá»ƒm tra xem cÃ³ tÃ i khoáº£n Ä‘Äƒng nháº­p khÃ´ng ?
function kiemtradangnhap() {
  let currentUser = localStorage.getItem('currentuser');
  if (currentUser != null) {
    let user = JSON.parse(currentUser);
    document.querySelector('.auth-container').innerHTML = `<span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${user.fullname} <i class="fa-sharp fa-solid fa-caret-down"></span>`
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

// Chuyá»ƒn Ä‘á»•i trang chá»§ vÃ  trang thÃ´ng tin tÃ i khoáº£n
function myAccount() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('trangchu').classList.add('hide');
  document.getElementById('order-history').classList.remove('open');
  document.getElementById('account-user').classList.add('open');
  userInfo();
}

// Chuyá»ƒn Ä‘á»•i trang chá»§ vÃ  trang xem lá»‹ch sá»­ Ä‘áº·t hÃ ng 
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

// Thay Ä‘á»•i thÃ´ng tin (GIá»® NGUYÃŠN localStorage Ä‘á»ƒ khÃ´ng vá»¡ UI; náº¿u muá»‘n sync DB, táº¡o API cáº­p nháº­t)
function changeInformation() {
  let accounts = JSON.parse(localStorage.getItem('accounts') || '[]'); // váº«n giá»¯ cho tÆ°Æ¡ng thÃ­ch cÅ© náº¿u cÃ³
  let user = JSON.parse(localStorage.getItem('currentuser'));
  let infoname = document.getElementById('infoname');
  let infoemail = document.getElementById('infoemail');
  let infoaddress = document.getElementById('infoaddress');

  user.fullname = infoname.value;
  if (infoemail.value.length > 0) {
    if (!emailIsValid(infoemail.value)) {
      document.querySelector('.inforemail-error').innerHTML = 'Vui lòng nhập email !';
      infoemail.value = '';
    } else {
      user.email = infoemail.value;
    }
  }

  if (infoaddress.value.length > 0) {
    user.address = infoaddress.value;
  }

  // cáº­p nháº­t láº¡i currentuser
  localStorage.setItem('currentuser', JSON.stringify(user));

  // náº¿u trÆ°á»›c Ä‘Ã¢y cÃ²n dÃ¹ng localStorage.accounts thÃ¬ sync táº¡m cho Ä‘á»¡ lá»—i
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
  toast({ title: 'Success', message: 'Cập nhật thông tin thành công !', type: 'success', duration: 3000 });
}

// Äá»•i máº­t kháº©u (giá»¯ localStorage Ä‘á»ƒ khÃ´ng vá»¡ UI; náº¿u muá»‘n sync DB, táº¡o API update password)
function changePassword() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  let passwordCur = document.getElementById('password-cur-info');
  let passwordAfter = document.getElementById('password-after-info');
  let passwordConfirm = document.getElementById('password-comfirm-info');
  let check = true;
  if (passwordCur.value.length == 0) {
    document.querySelector('.password-cur-info-error').innerHTML = 'Vui lÃ²ng nháº­p máº­t kháº©u hiá»‡n táº¡i';
    check = false;
  } else {
    document.querySelector('.password-cur-info-error').innerHTML = '';
  }

  if (passwordAfter.value.length == 0) {
    document.querySelector('.password-after-info-error').innerHTML = 'Vui lÃ²n nháº­p máº­t kháº©u má»›i';
    check = false;
  } else {
    document.querySelector('.password-after-info-error').innerHTML = '';
  }

  if (passwordConfirm.value.length == 0) {
    document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lÃ²ng nháº­p máº­t kháº©u xÃ¡c nháº­n';
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
            document.querySelector('.password-after-info-error').innerHTML = 'Vui lÃ²ng nháº­p máº­t kháº©u má»›i cÃ³ sá»‘  kÃ­ tá»± lá»›n hÆ¡n báº±ng 6';
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
                toast({ title: 'Success', message: 'Đổi mật khẩu thành công !', type: 'success', duration: 3000 });
              } else {
                document.querySelector('.password-after-comfirm-error').innerHTML = 'Máº­t kháº©u báº¡n nháº­p khÃ´ng trÃ¹ng khá»›p';
              }
            } else {
              document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lÃ²ng xÃ¡c nháº­n máº­t kháº©u';
            }
          }
        } else {
          document.querySelector('.password-after-info-error').innerHTML = 'Vui lÃ²ng nháº­p máº­t kháº©u má»›i';
        }
      } else {
        document.querySelector('.password-cur-info-error').innerHTML = 'Báº¡n Ä‘Ã£ nháº­p sai máº­t kháº©u hiá»‡n táº¡i';
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

// Quáº£n lÃ½ Ä‘Æ¡n hÃ ng (giá»¯ theo localStorage Ä‘á»ƒ khÃ´ng vá»¡ UI cÅ©)
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
    orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>ChÆ°a cÃ³ Ä‘Æ¡n hÃ ng nÃ o</p></div>`;
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
      let textCompl = item.trangthai == 1 ? "ÄÃ£ xá»­ lÃ½" : "Äang xá»­ lÃ½";
      let classCompl = item.trangthai == 1 ? "complete" : "no-complete"
      productHtml += `<div class="order-history-control">
                <div class="order-history-status">
                    <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                    <button id="order-history-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                </div>
                <div class="order-history-total">
                    <span class="order-history-total-desc">Tá»•ng tiá»n: </span>
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

// Xem chi tiáº¿t Ä‘Æ¡n hÃ ng
function detailOrder(id) {
  let order = JSON.parse(localStorage.getItem("order"));
  let detail = order.find(item => {
    return item.id == id;
  })
  document.querySelector(".modal.detail-order").classList.add("open");
  let detailOrderHtml = `<ul class="detail-order-group">
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> NgÃ y Ä‘áº·t hÃ ng</span>
            <span class="detail-order-item-right">${formatDate(detail.thoigiandat)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> HÃ¬nh thá»©c giao</span>
            <span class="detail-order-item-right">${detail.hinhthucgiao}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> NgÃ y nháº­n hÃ ng</span>
            <span class="detail-order-item-right">${(detail.thoigiangiao == "" ? "" : (detail.thoigiangiao + " - ")) + formatDate(detail.ngaygiaohang)}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Äá»‹a Ä‘iá»ƒm nháº­n</span>
            <span class="detail-order-item-right">${detail.diachinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> NgÆ°á»i nháº­n</span>
            <span class="detail-order-item-right">${detail.tenguoinhan}</span>
        </li>
        <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Sá»‘ Ä‘iá»‡n thoáº¡i nháº­n</span>
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
          <h2><em>JOYCE THE SEASON ðŸ‚</em></h2>
          <p>
            MÃ¹a Thu/ÄÃ´ng 2025 mang Ä‘áº¿n hÆ¡i thá»Ÿ tráº§m áº¥m cá»§a sáº¯c Earth tone â€“ gam mÃ u gá»£i cáº£m giÃ¡c an yÃªn vÃ  gáº§n gÅ©i, 
            káº¿t há»£p cÃ¹ng cháº¥t liá»‡u da cao cáº¥p tÃ´n lÃªn váº» tá»± nhiÃªn, thanh lá»‹ch nhÆ°ng váº«n dá»… dÃ ng hÃ²a nhá»‹p cÃ¹ng má»i phong cÃ¡ch cuá»‘i nÄƒm.
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
  // Láº¥y giÃ¡ trá»‹ tá»« Ã´ tÃ¬m kiáº¿m
  let searchInputValue = document.querySelector('.form-search-input').value;

  // Lá»c sáº£n pháº©m theo tá»« khÃ³a
  let result = searchInputValue === "" ? productAll : productAll.filter(item => {
    return item.title.toString().toUpperCase().includes(searchInputValue.toString().toUpperCase());
  });

  // Cuá»™n tá»›i pháº§n hiá»ƒn thá»‹ káº¿t quáº£
  document.getElementById("home-service").scrollIntoView();

  // Hiá»ƒn thá»‹ káº¿t quáº£
  showHomeProduct(result);
}

// PhÃ¢n trang 
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

// Hiá»ƒn thá»‹ chuyÃªn má»¥c
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

// // --- FORCE: remove all old listeners on the login button and rebind ours ---
// const loginBtnNew = document.getElementById('login-button');
// if (loginBtnNew) {
//   // clone trick: remove ALL previous listeners bound elsewhere
//   const cloned = loginBtnNew.cloneNode(true);
//   loginBtnNew.parentNode.replaceChild(cloned, loginBtnNew);

//   // bind our API-based handler
//   cloned.addEventListener('click', handleLoginWithAPI);
//   console.log('[Lesac] Login handler: API mode');
// }









