/* =========================================================================
   Admin (gi? nguyên thi?t k? cu) nhung dùng API th?t thay vì hardcode
   APIs s? d?ng:
     - ./api/get_products.php
     - ./api/admin_products.php (add/update/delete/restore)
     - ./api/get_accounts.php
     - ./api/admin_accounts.php (create/update/set_status)
     - ./api/get_order.php
   Ghi chú:
     - Gi? nguyên tên hàm & hành vi d? h?p v?i HTML cu.
     - Cache d? li?u vào localStorage nhu key cu ("products", "accounts", "order", "orderDetails")
       d? các hàm/flow cu ch?y tron tru, nhung ngu?n g?c là t? API.
   ======================================================================= */

/* ----------------------- Utils & State ----------------------- */
function vnd(price) {
  const n = Number(price || 0);
  return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
function formatDate(date) {
  if (!date) return "";
  const fm = new Date(date);
  const yyyy = fm.getFullYear();
  let mm = fm.getMonth() + 1;
  let dd = fm.getDate();
  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;
  return dd + "/" + mm + "/" + yyyy;
}
function toastWarning(message) {
  toast({ title: "Warning", message, type: "warning", duration: 3000 });
}
function toastSuccess(message) {
  toast({ title: "Success", message, type: "success", duration: 3000 });
}

/* Chu?n hoá don hàng t? get_order.php d? kh?p c?u trúc cu */
function normalizeOrders(raw) {
  let list = [];
  if (Array.isArray(raw)) list = raw;
  else if (Array.isArray(raw?.orders)) list = raw.orders;
  else if (Array.isArray(raw?.data)) list = raw.data;
  else if (raw?.ok && Array.isArray(raw?.data)) list = raw.data;

  // Tr? v?:
  // - orders: [{id, khachhang, thoigiandat, tongtien, trangthai, ...}]
  // - orderDetails: [{madon, id(product_id), price, soluong, note, time, product_title, product_img}, ...]
  const orders = [];
  const details = [];

  list.forEach((o) => {
    const id = o.id ?? o.order_id ?? o.code ?? "";
    const receiverName =
      o.khachhang ??
      o.fullname ??
      o.receiver_name ??
      o.customer_name ??
      "";
    const createdAt = o.thoigiandat ?? o.created_at ?? o.date ?? o.time ?? "";
    const total = Number(o.tongtien ?? o.total ?? 0);
    const statusRaw = o.trangthai ?? o.status ?? 0;
    // Quy u?c: 0 = chua x? ly, 1 = da x? ly
    const trangthai =
      (statusRaw === 1 || statusRaw === "1" || statusRaw === "done" || statusRaw === "completed") ? 1 : 0;

    const itemArray = Array.isArray(o.items)
      ? o.items
      : (Array.isArray(o.order_items) ? o.order_items : []);

    let shippingMethod = o.hinhthucgiao ?? o.shipping_method ?? "";
    let deliveryDate = o.ngaygiaohang ?? o.delivery_date ?? "";
    let deliveryTime = o.thoigiangiao ?? o.delivery_time ?? "";
    let noteText = o.ghichu ?? "";
    const parsedNote = {};

    if (typeof o.note === "string" && o.note.trim() !== "") {
      o.note.split("|").forEach((chunk) => {
        const [label, ...rest] = chunk.split(":");
        if (!label || rest.length === 0) return;
        const key = label.trim().toLowerCase();
        const value = rest.join(":").trim();
        parsedNote[key] = value;
      });

      if (noteText === "" && parsedNote["note"]) noteText = parsedNote["note"];
      if (!shippingMethod && parsedNote["shipping"]) shippingMethod = parsedNote["shipping"];
      if (!deliveryDate && parsedNote["delivery date"]) deliveryDate = parsedNote["delivery date"];
      if (!deliveryTime && parsedNote["delivery time"]) deliveryTime = parsedNote["delivery time"];
    }

    if (noteText === "") noteText = o.note ?? "";

    orders.push({
      id,
      khachhang: receiverName,
      thoigiandat: createdAt,
      tongtien: total,
      trangthai,
      // gi? l?i v?i tru?ng c?n cho detail modal
      tenguoinhan: o.tenguoinhan ?? o.receiver_name ?? receiverName ?? "",
      sdtnhan: o.sdtnhan ?? o.receiver_phone ?? o.phone ?? "",
      hinhthucgiao: shippingMethod,
      ngaygiaohang: deliveryDate || createdAt || "",
      thoigiangiao: deliveryTime || "",
      diachinhan: o.diachinhan ?? o.receiver_address ?? o.address ?? "",
      ghichu: noteText,
      items: itemArray
    });

    // Chu?n ho? chi ti?t don -> orderDetails (d? th?ng k? & modal chi ti?t)
    itemArray.forEach((it) => {
      const productId = Number(it.product_id ?? it.id ?? it.productId ?? 0);
      const productTitle = it.product_title ?? it.title ?? it.productName ?? "";
      const productImg = it.product_img ?? it.img ?? it.image ?? "";

      details.push({
        madon: id,
        id: productId,
        price: Number(it.price ?? 0),
        soluong: Number(it.quantity ?? it.qty ?? 0),
        note: it.note ?? "",
        time: createdAt,
        product_title: productTitle,
        product_img: productImg
      });
    });
  });

  return { orders, details };
}

/* M?t s? state c?c b? kh?p design cu */
let perPage = 12;
let currentPage = 1;

/* ----------------------- LOGIN CHECK + NAV ----------------------- */
function checkLogin() {
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));
  if (currentUser == null || currentUser.userType == 0) {
    document.querySelector("body").innerHTML = `<div class="access-denied-section">
        <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
    </div>`;
  } else {
    document.getElementById("name-acc").innerHTML = currentUser.fullname;
  }
}
window.onload = checkLogin;

const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

// tab section cu
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");
for (let i = 0; i < sidebars.length; i++) {
  sidebars[i].onclick = function () {
    document.querySelector(".sidebar-list-item.active")?.classList.remove("active");
    document.querySelector(".section.active")?.classList.remove("active");
    sidebars[i].classList.add("active");
    sections[i].classList.add("active");
  };
}
document.querySelectorAll(".section").forEach((sec) => {
  sec.addEventListener("click", () => sidebar?.classList.add("open"));
});

/* ----------------------- BOOT: hydrate t? API ----------------------- */
(async function boot() {
  try {
    // PRODUCTS
    try {
      const r = await fetch("./api/get_products.php", { cache: "no-store" });
      const products = (await r.json()) ?? [];
      // Ð?m b?o có status d? filter "Ðã xóa"/"T?t c?"
      const norm = Array.isArray(products)
        ? products.map((p) => ({
            ...p,
            id: Number(p.id),
            status: Number(p.status ?? 1),
            price: Number(p.price ?? 0)
          }))
        : [];
      localStorage.setItem("products", JSON.stringify(norm));
    } catch (e) {
      console.warn("get_products fail -> dùng cache n?u có", e);
    }

    // ACCOUNTS
    try {
      const r = await fetch("./api/get_accounts.php", { cache: "no-store" });
      const accounts = (await r.json()) ?? [];
      const norm = Array.isArray(accounts)
        ? accounts.map((a) => ({
            ...a,
            id: Number(a.id ?? 0),
            status: Number(a.status ?? 1),
            userType: Number(a.userType ?? 0),
            join: a.join ?? a.created_at ?? new Date().toISOString()
          }))
        : [];
      localStorage.setItem("accounts", JSON.stringify(norm));
    } catch (e) {
      console.warn("get_accounts fail -> dùng cache n?u có", e);
    }

    // ORDERS
    try {
      const r = await fetch("./api/get_order.php", { cache: "no-store" });
      const raw = await r.json();
      const { orders, details } = normalizeOrders(raw);
      localStorage.setItem("order", JSON.stringify(orders));
      localStorage.setItem("orderDetails", JSON.stringify(details));
    } catch (e) {
      console.warn("get_order fail -> dùng cache n?u có", e);
      if (!localStorage.getItem("order")) localStorage.setItem("order", "[]");
      if (!localStorage.getItem("orderDetails")) localStorage.setItem("orderDetails", "[]");
    }

    // Dashboard (gi? c?u trúc cu)
    document.getElementById("amount-user").innerHTML = getAmoumtUser();
    document.getElementById("amount-product").innerHTML = getAmoumtProduct();
    document.getElementById("doanh-thu").innerHTML = vnd(getMoney());

    // Render l?n d?u
    showProduct();
    showUser();
    showOrder(getOrdersLS());
    showThongKe(createObj()); // th?ng kê theo thi?t k? cu
  } catch (err) {
    console.error("BOOT error", err);
  }
})();

/* ----------------------- DASHBOARD helpers (gi? tên cu) ----------------------- */
function getAmoumtProduct() {
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  return products.filter((p) => Number(p.status) === 1).length;
}
function getAmoumtUser() {
  let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  return accounts.filter((item) => Number(item.userType) == 0).length;
}
function getMoney() {
  let tongtien = 0;
  let orders = getOrdersLS();
  orders.forEach((item) => {
    tongtien += Number(item.tongtien || 0);
  });
  return tongtien;
}
function getOrdersLS() {
  return JSON.parse(localStorage.getItem("order") || "[]");
}

/* ----------------------- PHÂN TRANG (gi? nguyên) ----------------------- */
function displayList(productAll, perPage, currentPage) {
  let start = (currentPage - 1) * perPage;
  let end = start + perPage;
  let productShow = productAll.slice(start, end);
  showProductArr(productShow);
}
function setupPagination(productAll, perPage) {
  const ul = document.querySelector(".page-nav-list");
  if (!ul) return;
  ul.innerHTML = "";
  let page_count = Math.ceil(productAll.length / perPage);
  for (let i = 1; i <= page_count; i++) {
    let li = paginationChange(i, productAll, currentPage);
    ul.appendChild(li);
  }
}
function paginationChange(page, productAll) {
  let node = document.createElement("li");
  node.classList.add("page-nav-item");
  node.innerHTML = `<a href="#">${page}</a>`;
  if (currentPage == page) node.classList.add("active");
  node.addEventListener("click", function () {
    currentPage = page;
    displayList(productAll, perPage, currentPage);
    document.querySelectorAll(".page-nav-item.active").forEach((n) => n.classList.remove("active"));
    node.classList.add("active");
  });
  return node;
}

/* ----------------------- S?N PH?M ----------------------- */
function showProductArr(arr) {
  let productHtml = "";
  if (arr.length == 0) {
    productHtml = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div><div class="no-result-h">Không có s?n ph?m d? hi?n th?</div></div>`;
  } else {
    arr.forEach((product) => {
      let btnCtl =
        Number(product.status) == 1
          ? `<button class="btn-delete" onclick="deleteProduct(${product.id})"><i class="fa-regular fa-trash"></i></button>`
          : `<button class="btn-delete" onclick="changeStatusProduct(${product.id})"><i class="fa-regular fa-eye"></i></button>`;
      productHtml += `
      <div class="list">
        <div class="list-left">
          <img src="${product.img}" alt="">
          <div class="list-info">
            <h4>${product.title}</h4>
            <p class="list-note">${product.desc ?? ""}</p>
            <span class="list-category">${product.category ?? ""}</span>
          </div>
        </div>
        <div class="list-right">
          <div class="list-price">
            <span class="list-current-price">${vnd(product.price)}</span>
          </div>
          <div class="list-control">
            <div class="list-tool">
              <button class="btn-edit" onclick="editProduct(${product.id})"><i class="fa-light fa-pen-to-square"></i></button>
              ${btnCtl}
            </div>
          </div>
        </div>
      </div>`;
    });
  }
  document.getElementById("show-product").innerHTML = productHtml;
}

function showProduct() {
  let selectOp = document.getElementById("the-loai").value;
  let valeSearchInput = document.getElementById("form-search-product").value.trim();
  let products = JSON.parse(localStorage.getItem("products") || "[]");

  let result;
  if (selectOp == "T?t c?") {
    result = products.filter((item) => Number(item.status) == 1);
  } else if (selectOp == "Ðã xóa") {
    result = products.filter((item) => Number(item.status) == 0);
  } else {
    result = products.filter((item) => (item.category || "") == selectOp);
  }

  if (valeSearchInput) {
    result = result.filter((item) =>
      (item.title ?? "").toString().toUpperCase().includes(valeSearchInput.toUpperCase())
    );
  }

  displayList(result, perPage, currentPage);
  setupPagination(result, perPage, currentPage);
}

function cancelSearchProduct() {
  let products = (JSON.parse(localStorage.getItem("products") || "[]")).filter((i) => Number(i.status) == 1);
  document.getElementById("the-loai").value = "T?t c?";
  document.getElementById("form-search-product").value = "";
  displayList(products, perPage, currentPage);
  setupPagination(products, perPage, currentPage);
}

function createId(arr) {
  let id = arr.length;
  let check = arr.find((item) => Number(item.id) == id);
  while (check != null) {
    id++;
    check = arr.find((item) => Number(item.id) == id);
  }
  return id;
}

async function deleteProduct(id) {
  if (!confirm("B?n có ch?c mu?n xóa?")) return;
  try {
    const res = await fetch("./api/admin_products.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id: Number(id) })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Delete failed");
    toastSuccess("Xóa s?n ph?m thành công !");
  } catch (e) {
    toastWarning("Không th? xóa trên máy ch?. Ðang c?p nh?t local d? t?m hi?n th?.");
  }
  // fallback: c?p nh?t local d? UI dúng
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  const idx = products.findIndex((p) => Number(p.id) === Number(id));
  if (idx > -1) products[idx].status = 0;
  localStorage.setItem("products", JSON.stringify(products));
  showProduct();
}

async function changeStatusProduct(id) {
  if (!confirm("B?n có ch?c ch?n mu?n h?y xóa?")) return;
  try {
    const res = await fetch("./api/admin_products.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore", id: Number(id) })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Restore failed");
    toastSuccess("Khôi ph?c s?n ph?m thành công !");
  } catch (e) {
    toastWarning("Không th? khôi ph?c trên máy ch?. Ðang c?p nh?t local d? t?m hi?n th?.");
  }
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  const idx = products.findIndex((p) => Number(p.id) === Number(id));
  if (idx > -1) products[idx].status = 1;
  localStorage.setItem("products", JSON.stringify(products));
  showProduct();
}

let indexCur;
function editProduct(id) {
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  let index = products.findIndex((item) => Number(item.id) == Number(id));
  if (index < 0) return toastWarning("Không tìm th?y s?n ph?m!");
  indexCur = index;
  document.querySelectorAll(".add-product-e").forEach((item) => (item.style.display = "none"));
  document.querySelectorAll(".edit-product-e").forEach((item) => (item.style.display = "block"));
  document.querySelector(".add-product").classList.add("open");
  document.querySelector(".upload-image-preview").src = products[index].img;
  document.getElementById("ten-mon").value = products[index].title;
  document.getElementById("gia-moi").value = products[index].price;
  document.getElementById("mo-ta").value = products[index].desc;
  document.getElementById("chon-mon").value = products[index].category;
}

function getPathImage(path) {
  let patharr = path.split("/");
  return "./assets/img/products/" + patharr[patharr.length - 1];
}

document.getElementById("update-product-button")?.addEventListener("click", async (e) => {
  e.preventDefault();
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  if (indexCur == null || !products[indexCur]) return;

  const idProduct = Number(products[indexCur].id);
  const imgProductCur = getPathImage(document.querySelector(".upload-image-preview").src);
  const titleProductCur = document.getElementById("ten-mon").value.trim();
  const curProductCur = document.getElementById("gia-moi").value.trim();
  const descProductCur = document.getElementById("mo-ta").value.trim();
  const categoryText = document.getElementById("chon-mon").value;

  if (!titleProductCur || !curProductCur || isNaN(Number(curProductCur))) {
    return toastWarning("Vui lòng nh?p tên & giá h?p l?!");
  }

  // g?i API update
  try {
    const res = await fetch("./api/admin_products.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        id: idProduct,
        title: titleProductCur,
        img: imgProductCur,
        category: categoryText,
        price: Number(curProductCur),
        desc: descProductCur
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Update failed");
    toastSuccess("S?a s?n ph?m thành công!");
  } catch (err) {
    toastWarning("Không th? c?p nh?t trên máy ch?. Ðang c?p nh?t local d? t?m hi?n th?.");
  }

  // c?p nh?t local d? UI ph?n ánh ngay
  products[indexCur] = {
    ...products[indexCur],
    title: titleProductCur,
    img: imgProductCur,
    category: categoryText,
    price: Number(curProductCur),
    desc: descProductCur,
    status: 1
  };
  localStorage.setItem("products", JSON.stringify(products));

  setDefaultValue();
  document.querySelector(".add-product").classList.remove("open");
  showProduct();
});

document.getElementById("add-product-button")?.addEventListener("click", async (e) => {
  e.preventDefault();
  const imgProduct = getPathImage(document.querySelector(".upload-image-preview").src);
  const tenMon = document.getElementById("ten-mon").value.trim();
  const price = document.getElementById("gia-moi").value.trim();
  const moTa = document.getElementById("mo-ta").value.trim();
  const categoryText = document.getElementById("chon-mon").value;

  if (!tenMon || !price || !moTa) {
    return toast({ title: "Chú ý", message: "Vui lòng nh?p d?y d? thông tin món!", type: "warning", duration: 3000 });
  }
  if (isNaN(Number(price))) {
    return toast({ title: "Chú ý", message: "Giá ph?i ? d?ng s?!", type: "warning", duration: 3000 });
  }

  // g?i API add
  try {
    const res = await fetch("./api/admin_products.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add",
        title: tenMon,
        img: imgProduct,
        category: categoryText,
        price: Number(price),
        desc: moTa
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Add failed");
    toastSuccess("Thêm s?n ph?m thành công!");
  } catch (err) {
    toastWarning("Không th? thêm trên máy ch?. Ðang thêm local d? t?m hi?n th?.");
  }

  // c?p nh?t local ngay (d? UI l?p t?c có)
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  products.unshift({
    id: createId(products),
    title: tenMon,
    img: imgProduct,
    category: categoryText,
    price: Number(price),
    desc: moTa,
    status: 1
  });
  localStorage.setItem("products", JSON.stringify(products));
  showProduct();
  document.querySelector(".add-product").classList.remove("open");
  setDefaultValue();
});

document.querySelector(".modal-close.product-form")?.addEventListener("click", () => {
  setDefaultValue();
});

function setDefaultValue() {
  document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
  document.getElementById("ten-mon").value = "";
  document.getElementById("gia-moi").value = "";
  document.getElementById("mo-ta").value = "";
  // GI? nguyên category m?c d?nh theo thi?t k? cu (tu? b?n set l?i option mong mu?n)
  document.getElementById("chon-mon").value = document.getElementById("chon-mon").options?.[0]?.value || "T?t c?";
}

// Open/Close Modal Add Product gi? nguyên
document.getElementById("btn-add-product")?.addEventListener("click", () => {
  document.querySelectorAll(".add-product-e").forEach((item) => (item.style.display = "block"));
  document.querySelectorAll(".edit-product-e").forEach((item) => (item.style.display = "none"));
  document.querySelector(".add-product").classList.add("open");
});
document.querySelectorAll(".modal-close").forEach((btn, i) => {
  btn.onclick = () => document.querySelectorAll(".modal")[i]?.classList.remove("open");
});

// On change Image (gi? nguyên)
function uploadImage(el) {
  let path = "./assets/img/products/" + (el.value.split("\\")[2] || "");
  document.querySelector(".upload-image-preview").setAttribute("src", path);
}

/* ----------------------- ÐON HÀNG ----------------------- */
function changeStatus(id, el) {
  let orders = getOrdersLS();
  let order = orders.find((item) => item.id == id);
  if (!order) return;
  order.trangthai = 1;
  el.classList.remove("btn-chuaxuly");
  el.classList.add("btn-daxuly");
  el.innerHTML = "Ðã x? lý";
  localStorage.setItem("order", JSON.stringify(orders));
  findOrder();
}

function showOrder(arr) {
  let orderHtml = "";
  if (arr.length == 0) {
    orderHtml = `<td colspan="6">Không có d? li?u</td>`;
  } else {
    arr.forEach((item) => {
      let status =
        item.trangthai == 0
          ? `<span class="status-no-complete">Chua x? lý</span>`
          : `<span class="status-complete">Ðã x? lý</span>`;
      let date = formatDate(item.thoigiandat);
      orderHtml += `
      <tr>
        <td>${item.id}</td>
        <td>${item.khachhang || ""}</td>
        <td>${date}</td>
        <td>${vnd(item.tongtien)}</td>
        <td>${status}</td>
        <td class="control">
          <button class="btn-detail" onclick="detailOrder('${item.id}')"><i class="fa-regular fa-eye"></i> Chi ti?t</button>
        </td>
      </tr>`;
    });
  }
  document.getElementById("showOrder").innerHTML = orderHtml;
}

window.addEventListener("load", () => showOrder(getOrdersLS())); // gi? call cu

/* L?y chi ti?t don t? localStorage (dã sync t? API n?u có items) */
function getOrderDetails(madon) {
  let orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "[]");
  return orderDetails.filter((item) => item.madon == madon);
}

function detailOrder(id) {
  document.querySelector(".modal.detail-order").classList.add("open");
  let orders = getOrdersLS();
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  let order = orders.find((item) => item.id == id);
  let ctDon = getOrderDetails(id);

  let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;
  ctDon.forEach((item) => {
    let detaiSP = products.find((product) => Number(product.id) == Number(item.id));
    const productImg = detaiSP?.img || item.product_img || "./assets/img/blank-image.png";
    const productTitle = detaiSP?.title || item.product_title || ("SP #" + item.id);
    const productNote = item.note || "Khong co ghi chu";
    const productPrice = Number(item.price ?? detaiSP?.price ?? 0);
    const productQty = Number(item.soluong ?? item.quantity ?? 0) || 1;
    spHtml += `<div class="order-product">
      <div class="order-product-left">
        <img src="${productImg}" alt="">
        <div class="order-product-info">
          <h4>${productTitle}</h4>
          <p class="order-product-note"><i class="fa-light fa-pen"></i> ${productNote}</p>
          <p class="order-product-quantity">SL: ${productQty}<p>
        </div>
      </div>
      <div class="order-product-right">
        <div class="order-product-price">
          <span class="order-product-current-price">${vnd(productPrice)}</span>
        </div>
      </div>
    </div>`;
  });
  spHtml += `</div></div>`;

  const ngaygiao = order?.ngaygiaohang ? formatDate(order.ngaygiaohang) : "";
  const thoigiangiao = order?.thoigiangiao ? order.thoigiangiao + " - " : "";

  spHtml += `<div class="modal-detail-right">
    <ul class="detail-order-group">
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày d?t hàng</span>
        <span class="detail-order-item-right">${formatDate(order?.thoigiandat)}</span>
      </li>
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình th?c giao</span>
        <span class="detail-order-item-right">${order.hinhthucgiao || ""}</span>
      </li>
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Ngu?i nh?n</span>
        <span class="detail-order-item-right">${order?.tenguoinhan || order?.khachhang || ""}</span>
      </li>
      <li class="detail-order-item">
        <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> S? di?n tho?i</span>
        <span class="detail-order-item-right">${order?.sdtnhan || ""}</span>
      </li>
      <li class="detail-order-item tb">
        <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Th?i gian giao</span>
        <p class="detail-order-item-b">${thoigiangiao}${ngaygiao}</p>
      </li>
      <li class="detail-order-item tb">
        <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Ð?a ch? nh?n</span>
        <p class="detail-order-item-b">${order?.diachinhan || ""}</p>
      </li>
      <li class="detail-order-item tb">
        <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
        <p class="detail-order-item-b">${order?.ghichu || ""}</p>
      </li>
    </ul>
  </div>`;
  document.querySelector(".modal-detail-order").innerHTML = spHtml;

  let classDetailBtn = order?.trangthai == 0 ? "btn-chuaxuly" : "btn-daxuly";
  let textDetailBtn = order?.trangthai == 0 ? "Chua x? lý" : "Ðã x? lý";
  document.querySelector(".modal-detail-bottom").innerHTML = `
    <div class="modal-detail-bottom-left">
      <div class="price-total">
        <span class="thanhtien">Thành ti?n</span>
        <span class="price">${vnd(order?.tongtien || 0)}</span>
      </div>
    </div>
    <div class="modal-detail-bottom-right">
      <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${order?.id}',this)">${textDetailBtn}</button>
    </div>`;
}

function findOrder() {
  let tinhTrang = parseInt(document.getElementById("tinh-trang").value);
  let ct = document.getElementById("form-search-order").value;
  let timeStart = document.getElementById("time-start").value;
  let timeEnd = document.getElementById("time-end").value;

  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("L?a ch?n th?i gian sai !");
    return;
  }
  let orders = getOrdersLS();
  let result = tinhTrang == 2 ? orders : orders.filter((item) => Number(item.trangthai) == tinhTrang);
  result =
    ct == ""
      ? result
      : result.filter((item) => {
          return (
            (item.khachhang || "").toLowerCase().includes(ct.toLowerCase()) ||
            item.id.toString().toLowerCase().includes(ct.toLowerCase())
          );
        });

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0);
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59);
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showOrder(result);
}

function cancelSearchOrder() {
  let orders = getOrdersLS();
  document.getElementById("tinh-trang").value = 2;
  document.getElementById("form-search-order").value = "";
  document.getElementById("time-start").value = "";
  document.getElementById("time-end").value = "";
  showOrder(orders);
}

/* ----------------------- TH?NG KÊ (gi? API cu -> local) ----------------------- */
function createObj() {
  let orders = JSON.parse(localStorage.getItem("order") || "[]");
  let products = JSON.parse(localStorage.getItem("products") || "[]");
  let orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "[]");
  let result = [];

  orderDetails.forEach((item) => {
    let prod = products.find((product) => Number(product.id) == Number(item.id)) || {};
    let obj = {
      id: item.id,
      madon: item.madon,
      price: Number(item.price || 0),
      quantity: Number(item.soluong || 0),
      category: prod.category || "",
      title: prod.title || ("SP #" + item.id),
      img: prod.img || "./assets/img/blank-image.png",
      time: (orders.find((order) => order.id == item.madon) || {}).thoigiandat
    };
    result.push(obj);
  });
  return result;
}

function thongKe(mode) {
  let categoryTk = document.getElementById("the-loai-tk").value;
  let ct = document.getElementById("form-search-tk").value;
  let timeStart = document.getElementById("time-start-tk").value;
  let timeEnd = document.getElementById("time-end-tk").value;

  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("L?a ch?n th?i gian sai !");
    return;
  }

  let arrDetail = createObj();
  let result = categoryTk == "T?t c?" ? arrDetail : arrDetail.filter((item) => item.category == categoryTk);

  result =
    ct == "" ? result : result.filter((item) => (item.title || "").toLowerCase().includes(ct.toLowerCase()));

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return new Date(item.time) > new Date(timeStart).setHours(0, 0, 0);
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59);
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showThongKe(result, mode);
}

function showOverview(arr) {
  document.getElementById("quantity-product").innerText = arr.length;
  document.getElementById("quantity-order").innerText = arr.reduce((sum, cur) => sum + parseInt(cur.quantity || 0), 0);
  document.getElementById("quantity-sale").innerText = vnd(
    arr.reduce((sum, cur) => sum + Number(cur.doanhthu || 0), 0)
  );
}

function mergeObjThongKe(arr) {
  let result = [];
  arr.forEach((item) => {
    let check = result.find((i) => Number(i.id) == Number(item.id));
    if (check) {
      check.quantity = parseInt(check.quantity) + parseInt(item.quantity);
      check.doanhthu += Number(item.price) * Number(item.quantity);
    } else {
      const newItem = { ...item };
      newItem.doanhthu = Number(newItem.price) * Number(newItem.quantity);
      result.push(newItem);
    }
  });
  return result;
}

function showThongKe(arr, mode) {
  let orderHtml = "";
  let mergeObj = mergeObjThongKe(arr);
  showOverview(mergeObj);

  switch (mode) {
    case 0:
      mergeObj = mergeObjThongKe(createObj());
      showOverview(mergeObj);
      document.getElementById("the-loai-tk").value = "T?t c?";
      document.getElementById("form-search-tk").value = "";
      document.getElementById("time-start-tk").value = "";
      document.getElementById("time-end-tk").value = "";
      break;
    case 1:
      mergeObj.sort((a, b) => parseInt(a.quantity) - parseInt(b.quantity));
      break;
    case 2:
      mergeObj.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
      break;
  }

  for (let i = 0; i < mergeObj.length; i++) {
    orderHtml += `
    <tr>
      <td>${i + 1}</td>
      <td><div class="prod-img-title"><img class="prd-img-tbl" src="${mergeObj[i].img}" alt=""><p>${mergeObj[i].title}</p></div></td>
      <td>${mergeObj[i].quantity}</td>
      <td>${vnd(mergeObj[i].doanhthu)}</td>
      <td><button class="btn-detail product-order-detail" data-id="${mergeObj[i].id}"><i class="fa-regular fa-eye"></i> Chi ti?t</button></td>
    </tr>`;
  }
  document.getElementById("showTk").innerHTML = orderHtml;
  document.querySelectorAll(".product-order-detail").forEach((item) => {
    let idProduct = item.getAttribute("data-id");
    item.addEventListener("click", () => {
      detailOrderProduct(arr, idProduct);
    });
  });
}

// g?i 1 l?n sau boot dã g?i ? trên
// showThongKe(createObj())

function detailOrderProduct(arr, id) {
  let orderHtml = "";
  arr.forEach((item) => {
    if (Number(item.id) == Number(id)) {
      orderHtml += `<tr>
        <td>${item.madon}</td>
        <td>${item.quantity}</td>
        <td>${vnd(item.price)}</td>
        <td>${formatDate(item.time)}</td>
      </tr>`;
    }
  });
  document.getElementById("show-product-order-detail").innerHTML = orderHtml;
  document.querySelector(".modal.detail-order-product").classList.add("open");
}

/* ----------------------- USER ----------------------- */
const addAccount = document.getElementById("signup-button");
const updateAccount = document.getElementById("btn-update-account");

document.querySelector(".modal.signup .modal-close")?.addEventListener("click", () => {
  signUpFormReset();
});

function openCreateAccount() {
  document.querySelector(".signup").classList.add("open");
  document.querySelectorAll(".edit-account-e").forEach((item) => (item.style.display = "none"));
  document.querySelectorAll(".add-account-e").forEach((item) => (item.style.display = "block"));
}

function signUpFormReset() {
  document.getElementById("fullname").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("password").value = "";
  document.querySelector(".form-message-name").innerHTML = "";
  document.querySelector(".form-message-phone").innerHTML = "";
  document.querySelector(".form-message-password").innerHTML = "";
}

function showUserArr(arr) {
  let accountHtml = "";
  if (arr.length == 0) {
    accountHtml = `<td colspan="5">Không có d? li?u</td>`;
  } else {
    arr.forEach((account, index) => {
      let tinhtrang =
        Number(account.status) == 0
          ? `<span class="status-no-complete">B? khóa</span>`
          : `<span class="status-complete">Ho?t d?ng</span>`;
      accountHtml += ` <tr>
        <td>${index + 1}</td>
        <td>${account.fullname || ""}</td>
        <td>${account.phone || ""}</td>
        <td>${formatDate(account.join)}</td>
        <td>${tinhtrang}</td>
        <td class="control control-table">
          <button class="btn-edit" onclick='editAccount(${JSON.stringify(account.phone)})' ><i class="fa-light fa-pen-to-square"></i></button>
          <button class="btn-delete" onclick="deleteAcount(${index})"><i class="fa-regular fa-trash"></i></button>
        </td>
      </tr>`;
    });
  }
  document.getElementById("show-user").innerHTML = accountHtml;
}

function showUser() {
  let tinhTrang = parseInt(document.getElementById("tinh-trang-user").value);
  let ct = document.getElementById("form-search-user").value;
  let timeStart = document.getElementById("time-start-user").value;
  let timeEnd = document.getElementById("time-end-user").value;

  if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
    alert("L?a ch?n th?i gian sai !");
    return;
  }

  let accounts = (JSON.parse(localStorage.getItem("accounts") || "[]")).filter((item) => Number(item.userType) == 0);
  let result = tinhTrang == 2 ? accounts : accounts.filter((item) => Number(item.status) == tinhTrang);

  result =
    ct == ""
      ? result
      : result.filter((item) => {
          return (
            (item.fullname || "").toLowerCase().includes(ct.toLowerCase()) ||
            (item.phone || "").toString().toLowerCase().includes(ct.toLowerCase())
          );
        });

  if (timeStart != "" && timeEnd == "") {
    result = result.filter((item) => {
      return new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0);
    });
  } else if (timeStart == "" && timeEnd != "") {
    result = result.filter((item) => {
      return new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59);
    });
  } else if (timeStart != "" && timeEnd != "") {
    result = result.filter((item) => {
      return (
        new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0) &&
        new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59)
      );
    });
  }
  showUserArr(result);
}

function cancelSearchUser() {
  let accounts = (JSON.parse(localStorage.getItem("accounts") || "[]")).filter((item) => Number(item.userType) == 0);
  showUserArr(accounts);
  document.getElementById("tinh-trang-user").value = 2;
  document.getElementById("form-search-user").value = "";
  document.getElementById("time-start-user").value = "";
  document.getElementById("time-end-user").value = "";
}

window.addEventListener("load", showUser);

function deleteAcount(index) {
  let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  if (!accounts[index]) return;
  if (confirm("B?n có ch?c mu?n xóa?")) {
    // Không có API xoá user -> xóa local d? ph?n ánh UI (tu? b?n b? sung API sau)
    accounts.splice(index, 1);
    localStorage.setItem("accounts", JSON.stringify(accounts));
    showUser();
  }
}

let indexFlag;
function editAccount(phone) {
  document.querySelector(".signup").classList.add("open");
  document.querySelectorAll(".add-account-e").forEach((item) => (item.style.display = "none"));
  document.querySelectorAll(".edit-account-e").forEach((item) => (item.style.display = "block"));
  let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  let index = accounts.findIndex((item) => (item.phone || "").toString() == (phone || "").toString());
  if (index < 0) return toastWarning("Không tìm th?y tài kho?n!");
  indexFlag = index;
  document.getElementById("fullname").value = accounts[index].fullname || "";
  document.getElementById("phone").value = accounts[index].phone || "";
  document.getElementById("password").value = accounts[index].password || "";
  document.getElementById("user-status").checked = Number(accounts[index].status) == 1;
}

updateAccount?.addEventListener("click", async (e) => {
  e.preventDefault();
  let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  if (indexFlag == null || !accounts[indexFlag]) return;

  let fullname = document.getElementById("fullname").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let password = document.getElementById("password").value.trim();
  let status = document.getElementById("user-status").checked ? 1 : 0;

  if (!fullname || !phone || !password) {
    return toast({ title: "Chú ý", message: "Vui lòng nh?p d?y d? thông tin !", type: "warning", duration: 3000 });
  }

  // g?i API update
  try {
    const res = await fetch("./api/admin_accounts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update",
        id: Number(accounts[indexFlag].id || 0),
        fullname,
        phone,
        password,
        status,
        userType: 0
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Update account failed");
    toastSuccess("Thay d?i thông tin thành công !");
  } catch (err) {
    toastWarning("Không th? c?p nh?t trên máy ch?. Ðang c?p nh?t local d? t?m hi?n th?.");
  }

  // c?p nh?t local
  accounts[indexFlag].fullname = fullname;
  accounts[indexFlag].phone = phone;
  accounts[indexFlag].password = password;
  accounts[indexFlag].status = status;
  localStorage.setItem("accounts", JSON.stringify(accounts));
  document.querySelector(".signup").classList.remove("open");
  signUpFormReset();
  showUser();
});

addAccount?.addEventListener("click", async (e) => {
  e.preventDefault();
  let fullNameUser = document.getElementById("fullname").value.trim();
  let phoneUser = document.getElementById("phone").value.trim();
  let passwordUser = document.getElementById("password").value.trim();

  let fullNameIP = document.getElementById("fullname");
  let formMessageName = document.querySelector(".form-message-name");
  let formMessagePhone = document.querySelector(".form-message-phone");
  let formMessagePassword = document.querySelector(".form-message-password");

  // validate nhu cu
  if (fullNameUser.length == 0) {
    formMessageName.innerHTML = "Vui lòng nh?p h? vâ tên";
    fullNameIP.focus();
    return;
  } else if (fullNameUser.length < 3) {
    fullNameIP.value = "";
    formMessageName.innerHTML = "Vui lòng nh?p h? và tên l?n hon 3 kí t?";
    return;
  }
  if (phoneUser.length == 0) {
    formMessagePhone.innerHTML = "Vui lòng nh?p vào s? di?n tho?i";
    return;
  } else if (phoneUser.length != 10) {
    formMessagePhone.innerHTML = "Vui lòng nh?p vào s? di?n tho?i 10 s?";
    document.getElementById("phone").value = "";
    return;
  }
  if (passwordUser.length == 0) {
    formMessagePassword.innerHTML = "Vui lòng nh?p m?t kh?u";
    return;
  } else if (passwordUser.length < 6) {
    formMessagePassword.innerHTML = "Vui lòng nh?p m?t kh?u l?n hon 6 kí t?";
    document.getElementById("password").value = "";
    return;
  }

  // G?i API t?o
  try {
    const res = await fetch("./api/admin_accounts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        fullname: fullNameUser,
        phone: phoneUser,
        password: passwordUser,
        address: "",
        email: "",
        status: 1,
        userType: 0
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Create account failed");
    toastSuccess("T?o thành công tài kho?n !");
  } catch (err) {
    toastWarning("Không th? t?o trên máy ch?. Ðang t?o local d? t?m hi?n th?.");
  }

  // c?p nh?t local ngay
  let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
  let checkloop = accounts.some((account) => (account.phone || "").toString() == phoneUser.toString());
  if (!checkloop) {
    accounts.push({
      fullname: fullNameUser,
      phone: phoneUser,
      password: passwordUser,
      address: "",
      email: "",
      status: 1,
      join: new Date(),
      cart: [],
      userType: 0
    });
    localStorage.setItem("accounts", JSON.stringify(accounts));
    document.querySelector(".signup").classList.remove("open");
    showUser();
    signUpFormReset();
  } else {
    toast({ title: "C?nh báo !", message: "Tài kho?n dã t?n t?i !", type: "error", duration: 3000 });
  }
});

document.getElementById("logout-acc")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("currentuser");
  window.location = "/";
});





