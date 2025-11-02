const PHIVANCHUYEN = 30000;
let priceFinal = document.getElementById("checkout-cart-price-final");

/* =========================
   TRANG THANH TOÁN / CHECKOUT
   ========================= */
function thanhtoanpage(option, product) {
  // Xử lý ngày nhận hàng
  let today = new Date();
  let ngaymai = new Date();
  let ngaykia = new Date();
  ngaymai.setDate(today.getDate() + 1);
  ngaykia.setDate(today.getDate() + 2);

  const fmtDate = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
  const toISO = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();

  let dateorderhtml = `
    <a href="javascript:;" class="pick-date active" data-date="${toISO(today)}">
      <span class="text">Hôm nay</span>
      <span class="date">${fmtDate(today)}</span>
    </a>
    <a href="javascript:;" class="pick-date" data-date="${toISO(ngaymai)}">
      <span class="text">Ngày mai</span>
      <span class="date">${fmtDate(ngaymai)}</span>
    </a>
    <a href="javascript:;" class="pick-date" data-date="${toISO(ngaykia)}">
      <span class="text">Ngày kia</span>
      <span class="date">${fmtDate(ngaykia)}</span>
    </a>`;
  document.querySelector(".date-order").innerHTML = dateorderhtml;

  let pickdate = document.getElementsByClassName("pick-date");
  for (let i = 0; i < pickdate.length; i++) {
    pickdate[i].onclick = function () {
      document.querySelector(".pick-date.active").classList.remove("active");
      this.classList.add("active");
    };
  }

  let totalBillOrder = document.querySelector(".total-bill-order");
  let totalBillOrderHtml;

  // Xử lý đơn hàng
  switch (option) {
    case 1: // Thanh toán các SP trong giỏ
      showProductCart();
      totalBillOrderHtml = `
        <div class="priceFlx">
          <div class="text">
            Tiền hàng 
            <span class="count">${getAmountCart()} món</span>
          </div>
          <div class="price-detail">
            <span id="checkout-cart-total">${vnd(getCartTotal())}</span>
          </div>
        </div>
        <div class="priceFlx chk-ship">
          <div class="text">Phí vận chuyển</div>
          <div class="price-detail chk-free-ship">
            <span>${vnd(PHIVANCHUYEN)}</span>
          </div>
        </div>`;
      priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
      break;

    case 2: // Mua ngay
      showProductBuyNow(product);
      totalBillOrderHtml = `
        <div class="priceFlx">
          <div class="text">
            Tiền hàng 
            <span class="count">${product.soluong} món</span>
          </div>
          <div class="price-detail">
            <span id="checkout-cart-total">${vnd(product.soluong * product.price)}</span>
          </div>
        </div>
        <div class="priceFlx chk-ship">
          <div class="text">Phí vận chuyển</div>
          <div class="price-detail chk-free-ship">
            <span>${vnd(PHIVANCHUYEN)}</span>
          </div>
        </div>`;
      priceFinal.innerText = vnd(product.soluong * product.price + PHIVANCHUYEN);
      break;
  }

  totalBillOrder.innerHTML = totalBillOrderHtml;

  // Hình thức giao
  let giaotannoi = document.querySelector("#giaotannoi");
  let tudenlay = document.querySelector("#tudenlay");
  let tudenlayGroup = document.querySelector("#tudenlay-group");
  let chkShip = document.querySelectorAll(".chk-ship");

  tudenlay.addEventListener("click", () => {
    giaotannoi.classList.remove("active");
    tudenlay.classList.add("active");
    chkShip.forEach((item) => (item.style.display = "none"));
    tudenlayGroup.style.display = "block";
    switch (option) {
      case 1:
        priceFinal.innerText = vnd(getCartTotal());
        break;
      case 2:
        priceFinal.innerText = vnd(product.soluong * product.price);
        break;
    }
  });

  giaotannoi.addEventListener("click", () => {
    tudenlay.classList.remove("active");
    giaotannoi.classList.add("active");
    tudenlayGroup.style.display = "none";
    chkShip.forEach((item) => (item.style.display = "flex"));
    switch (option) {
      case 1:
        priceFinal.innerText = vnd(getCartTotal() + PHIVANCHUYEN);
        break;
      case 2:
        priceFinal.innerText = vnd(product.soluong * product.price + PHIVANCHUYEN);
        break;
    }
  });

  // Nút hoàn tất
  document.querySelector(".complete-checkout-btn").onclick = () => {
    switch (option) {
      case 1:
        xulyDathang(); // từ giỏ
        break;
      case 2:
        xulyDathang(product); // mua ngay
        break;
    }
  };
}

/* ===== Hiển thị hàng trong giỏ ===== */
function showProductCart() {
  let currentuser = JSON.parse(localStorage.getItem("currentuser"));
  let listOrder = document.getElementById("list-order-checkout");
  let listOrderHtml = "";
  currentuser.cart.forEach((item) => {
    let product = getProduct(item);
    listOrderHtml += `<div class="food-total">
        <div class="count">${product.soluong}x</div>
        <div class="info-food">
          <div class="name-food">${product.title}</div>
        </div>
      </div>`;
  });
  listOrder.innerHTML = listOrderHtml;
}

/* ===== Hiển thị hàng mua ngay ===== */
function showProductBuyNow(product) {
  let listOrder = document.getElementById("list-order-checkout");
  let listOrderHtml = `<div class="food-total">
      <div class="count">${product.soluong}x</div>
      <div class="info-food">
        <div class="name-food">${product.title}</div>
      </div>
    </div>`;
  listOrder.innerHTML = listOrderHtml;
}

/* ===== Mở trang Checkout từ giỏ ===== */
let nutthanhtoan = document.querySelector(".thanh-toan");
let checkoutpage = document.querySelector(".checkout-page");
nutthanhtoan.addEventListener("click", () => {
  checkoutpage.classList.add("active");
  thanhtoanpage(1);
  closeCart();
  body.style.overflow = "hidden";
});

/* ===== “Đặt hàng ngay” từ popup chi tiết ===== */
function dathangngay() {
  let productInfo = document.getElementById("product-detail-content");
  let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
  datHangNgayBtn.onclick = () => {
    if (localStorage.getItem("currentuser")) {
      let productId = datHangNgayBtn.getAttribute("data-product");
      let soluong = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
      let notevalue = productInfo.querySelector("#popup-detail-note").value;
      let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
      let products = JSON.parse(localStorage.getItem("products"));
      let a = products.find((item) => item.id == productId);
      a.soluong = parseInt(soluong);
      a.note = ghichu;
      checkoutpage.classList.add("active");
      thanhtoanpage(2, a);
      closeCart();
      body.style.overflow = "hidden";
    } else {
      toast({ title: "Warning", message: "Chưa đăng nhập tài khoản !", type: "warning", duration: 3000 });
    }
  };
}

/* ===== Đóng trang Checkout ===== */
function closecheckout() {
  checkoutpage.classList.remove("active");
  body.style.overflow = "auto";
}

/* =========================================================
   XỬ LÝ ĐẶT HÀNG – BRIDGE VỀ PHP (create_order.php)
   =========================================================
   - Không ghi trực tiếp localStorage như bản cũ.
   - Gửi payload sang API.
   - Nếu thành công: cập nhật lại localStorage.order & orderDetails
     để các trang cũ (order history / admin) vẫn dùng được ngay.
   ========================================================= */
async function xulyDathang(product) {
  let giaotannoi = document.querySelector("#giaotannoi");
  let tudenlay = document.querySelector("#tudenlay");
  let giaongay = document.querySelector("#giaongay");
  let giaovaogio = document.querySelector("#deliverytime");
  let currentUser = JSON.parse(localStorage.getItem("currentuser"));

  // Hình thức giao + địa chỉ
  let diachinhan = "";
  let hinhthucgiao = "";
  if (giaotannoi.classList.contains("active")) {
    diachinhan = document.querySelector("#diachinhan").value.trim();
    hinhthucgiao = giaotannoi.innerText.trim();
  }
  if (tudenlay.classList.contains("active")) {
    // nếu bạn có nhiều chi nhánh, tuỳ UI bạn set vào đây
    hinhthucgiao = tudenlay.innerText.trim();
    diachinhan = ""; // tự đến lấy thì không cần địa chỉ nhận
  }

  // Thời gian giao
  let thoigiangiao = "";
  if (giaongay.checked) thoigiangiao = "Giao ngay khi xong";
  if (giaovaogio.checked) thoigiangiao = document.querySelector(".choise-time").value;

  // Validate tối thiểu
  let tennguoinhan = document.querySelector("#tennguoinhan").value.trim();
  let sdtnhan = document.querySelector("#sdtnhan").value.trim();
  let ngaygiaohangISO = document.querySelector(".pick-date.active").getAttribute("data-date"); // ISO yyyy-mm-ddT00:00:00.000Z
  if (tennguoinhan == "" || sdtnhan == "" || (hinhthucgiao !== "Tự đến lấy" && diachinhan == "")) {
    toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin !", type: "warning", duration: 4000 });
    return;
  }

  // Chuẩn bị items
  let items = [];
  let tongtien = 0;

  if (product == undefined) {
    // đặt từ giỏ
    let cart = (currentUser?.cart || []).map((it) => {
      const price = getpriceProduct(it.id);
      tongtien += price * Number(it.soluong || 1);
      return {
        product_id: it.id,
        quantity: Number(it.soluong || 1),
        note: it.note || "",
        price: price
      };
    });
    items = cart;
  } else {
    // mua ngay
    const price = getpriceProduct(product.id);
    tongtien = price * Number(product.soluong || 1);
    items = [
      {
        product_id: product.id,
        quantity: Number(product.soluong || 1),
        note: product.note || "",
        price: price
      }
    ];
  }

  // Nếu giao tận nơi, cộng phí ship vào tổng (server cũng có thể tự tính, tuỳ bạn)
  if (giaotannoi.classList.contains("active")) tongtien += PHIVANCHUYEN;

  // Payload gửi server
  const payload = {
    // tuỳ create_order.php nhận gì: dùng phone cho đơn giản
    account_phone: currentUser.phone,
    receiver_name: tennguoinhan,
    receiver_phone: sdtnhan,
    address: diachinhan,
    shipping_method: hinhthucgiao, // "Giao tận nơi" / "Tự đến lấy"
    delivery_date: ngaygiaohangISO, // ISO date string
    delivery_time: thoigiangiao,
    note: document.querySelector(".note-order").value || "",
    total: tongtien,
    items // [{product_id, quantity, note, price}]
  };

  try {
    const res = await fetch("./api/create_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data || data.success === false) {
      toast({
        title: "Lỗi",
        message: data?.message || "Tạo đơn hàng thất bại!",
        type: "error",
        duration: 3000
      });
      return;
    }

    // ---- Đồng bộ lại localStorage để các màn history/admin cũ chạy y như trước ----
    // Server nên trả {success:true, order:{...}, order_items:[...]}.
    // Nếu không có, mình sẽ tự map từ payload.
    let orders = JSON.parse(localStorage.getItem("order") || "[]");
    let orderDetails = JSON.parse(localStorage.getItem("orderDetails") || "[]");

    // Tạo mã đơn giống format cũ "DH<n>"
    const createId = (arr) => {
      let id = arr.length + 1;
      let check = arr.find((item) => item.id == "DH" + id);
      while (check != null) {
        id++;
        check = arr.find((item) => item.id == "DH" + id);
      }
      return "DH" + id;
    };

    const newId = createId(orders);

    // Bản ghi đơn theo schema cũ
    const donhang = {
      id: newId,
      khachhang: currentUser.phone,
      hinhthucgiao: payload.shipping_method,
      ngaygiaohang: payload.delivery_date,
      thoigiangiao: payload.delivery_time,
      ghichu: payload.note,
      tenguoinhan: payload.receiver_name,
      sdtnhan: payload.receiver_phone,
      diachinhan: payload.address,
      thoigiandat: new Date().toISOString(),
      tongtien: payload.total,
      trangthai: 0
    };
    orders.unshift(donhang);

    // Chi tiết đơn giống cấu trúc cũ
    items.forEach((it) => {
      orderDetails.push({
        madon: newId,
        id: it.product_id,
        soluong: it.quantity,
        price: it.price,
        note: it.note || "Không có ghi chú"
      });
    });

    // Nếu đặt từ giỏ → clear giỏ của current user
    if (product == undefined) {
      currentUser.cart = [];
      localStorage.setItem("currentuser", JSON.stringify(currentUser));
    }

    localStorage.setItem("order", JSON.stringify(orders));
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails));

    toast({ title: "Thành công", message: "Đặt hàng thành công !", type: "success", duration: 1000 });
    setTimeout(() => {
      window.location.href = "./"; // giữ nguyên điều hướng
    }, 2000);
  } catch (e) {
    console.error(e);
    toast({ title: "Lỗi", message: "Không thể kết nối máy chủ!", type: "error", duration: 3000 });
  }
}

/* ===== Lấy giá SP từ localStorage.products (UI cũ dùng) ===== */
function getpriceProduct(id) {
  let products = JSON.parse(localStorage.getItem("products"));
  let sp = products.find((item) => item.id == id);
  return Number(sp?.price || 0);
}

/* ===== Các hàm cũ dùng chung từ main.js: 
   - getAmountCart(), getCartTotal(), getProduct() …
   Vẫn giữ nguyên, không sửa ở đây. ===== */

