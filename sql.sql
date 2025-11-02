-- ==============================================================
-- LESAC DATABASE - FULL SIMPLE STRUCTURE
-- Dùng cho dự án HTML + CSS + JS + PHP (Localhost)
-- ==============================================================
USE hello;

-- ==============================================================
-- 1. BẢNG TÀI KHOẢN (accounts)
--    Lưu admin và user thường
-- ==============================================================
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  email VARCHAR(100),
  status TINYINT DEFAULT 1,
  userType TINYINT DEFAULT 0
);

INSERT INTO accounts (fullname, phone, password, address, email, status, userType) VALUES
('ADMIN', '0900000000', '123456', '', '', 1, 1),
('Khách hàng test', '0123456789', '123456', 'Hà Nội', 'khach@test.com', 1, 0);

-- ==============================================================
-- 2. BẢNG SẢN PHẨM (products)
--    Bám sát file data.js trong source
-- ==============================================================
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id INT PRIMARY KEY,
  status TINYINT DEFAULT 1,
  title VARCHAR(100) NOT NULL,
  img VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  description TEXT
);

INSERT INTO products (id, status, title, img, category, price, description) VALUES
(1,1,'Jojo','./assets/img/products/sp1.png','Túi xách',610000,'Kiểu dáng: Phom gối nắp sập<br>Kiểu quai: Đeo vai và đeo chéo <br>Kiểu khoá: Khoá kéo miệng túi kim loại<br>Chất liệu: Da PU bóng vân nhăn mờ<br>Màu sắc: Đen | Trắng<br>Kích cỡ: (Dài) 26 - (Rộng) 8 - (Cao) 13,5cm<br>Xuất xứ: Việt Nam'),
(2,1,'XINH','./assets/img/products/sp2.png','Túi xách',650000,'Kiểu dáng: Dáng hobo, miệng võng<br>Chất liệu: Da PU bóng vân nhăn mờ<br>Kiểu khoá: Khoá kéo miệng túi<br>Màu sắc: Đen | Trắng<br>Kích cỡ: (Dài) 31 x (Rộng) 12 x (Cao) 21cm<br>Xuất xứ: Việt Nam'),
(3,1,'LUNA BAG','./assets/img/products/sp3.png','Túi xách',650000,'Đang Cập Nhật....'),
(4,1,'Crystal Bag','./assets/img/products/sp4.png','Túi xách',932000,'Đang cập nhật ...'),
(5,1,'Bloom Bag','./assets/img/products/sp5.png','Túi xách',650000,'Kiểu dáng: Dáng hobo, miệng võng<br>Chất liệu: Da PU bóng vân nhăn mờ<br>Kiểu khóa: Khóa kéo miệng túi<br>Màu sắc: Đen | Trắng<br>Kích cỡ: (Dài) 31 x (Rộng) 12 x (Cao) 20 cm<br>Xuất xứ: Việt Nam<br>Đang cập nhật mô tả chi tiết.'),
(6,1,'Glow','./assets/img/products/sp6.png','Túi xách',599000,'Màu sắc: Đang cập nhật<br>Kiểu dáng: Đang cập nhật<br>Chất liệu: Đang cập nhật<br>Kích thước: Đang cập nhật<br>Mô tả sản phẩm: Đang cập nhật ...'),
(7,1,'GLOW','./assets/img/products/sp7.png','Túi xách',450000,'Kiểu dáng: Hobo Bag<br>Kích thước: 19 x 24 x 7 cm<br>Kiểu khóa: Nắp gập<br>Chất liệu: Da PU trơn cao cấp<br>Kích cỡ: Trung bình<br>Xuất xứ: Việt Nam'),
(8,1,'CHARIS BAG','./assets/img/products/sp8.png','Túi xách',450000,'Kiểu dáng: Hobo Bag<br>Kích thước: 19 x 24 x 7 cm<br>Kiểu khóa: Nắp gập<br>Chất liệu: Da PU trơn cao cấp<br>Kích cỡ: Trung bình<br>Xuất xứ: Việt Nam'),
(9,1,'Onist Bag','./assets/img/products/sp9.png','Túi xách',650000,'Màu sắc: Đang cập nhật<br>Kiểu dáng: Đang cập nhật<br>Chất liệu: Đang cập nhật<br>Kích thước: Đang cập nhật<br>Mô tả sản phẩm: Đang cập nhật ...'),
(10,1,'Nina','./assets/img/products/sp10.png','Ví',149000,'Chất liệu: Da PU trơn<br>Kiểu dáng: Ví thẻ đeo cổ, có ngăn khoá kéo<br>Màu sắc: Đen | Trắng ngà | Đỏ<br>Kiểu quai đeo: Ví đeo cổ<br>Kiểu khoá: Khoá kéo<br>Kích thước: 12 x 8cm | dây đeo - 43cm<br>Xuất xứ: Việt Nam'),
(11,1,'Lia','./assets/img/products/sp11.png','Ví',149000,'Chất liệu: Da PU trơn<br>Kiểu dáng: Ví thẻ đeo cổ<br>Màu sắc: Đen | Trắng ngà | Đỏ<br>Kiểu quai đeo: Ví đeo cổ<br>Điểm đặc biệt: Có mặt trơn để ảnh<br>Kích thước: 11 x 7,5cm | dây đeo: 43,5cm<br>Xuất xứ: Việt Nam'),
(12,1,'STAND WALLET','./assets/img/products/sp12.png','Ví',199000,'Kiểu dáng: Basic, thanh lịch<br>Kích thước: 14 x 10 x 2cm<br>Kiểu khóa: Khóa kéo<br>Chất liệu: Da PU sần nhẹ, chắc chắn<br>Kích cỡ: Trung bình<br>Màu sắc: Đen | Trắng<br>Xuất xứ: Việt Nam'),
(13,1,'June','./assets/img/products/sp13.png','Ví',199000,'Màu sắc: Đang cập nhật<br>Kiểu dáng: Đang cập nhật<br>Chất liệu: Đang cập nhật<br>Kích thước: Đang cập nhật<br>Mô tả sản phẩm: Đang cập nhật ...'),
(14,1,'TONGUE WALLET','./assets/img/products/sp14.png','Ví',250000,'• Kiểu dáng: Basic, thanh lịch<br>• Kích thước: 11.6 x 9.2 x 2cm<br>• Kiểu khóa: Khóa kéo<br>• Chất liệu: Da PU sần nhẹ, chắc chắn<br>• Kích cỡ: Trung bình<br>• Màu sắc: Đen, Trắng<br>• Xuất xứ: Việt Nam'),
(16,1,'Hộp Quà Luôn Lấp Lánh Dịu Dàng - Charis Đen','./assets/img/products/sp16.png','Quà tặng',798000,'• Mô tả sản phẩm: Đang cập nhật...'),
(17,1,'Hộp Quà Luôn Lấp Lánh Tinh Tế - Scarlet Đen','./assets/img/products/sp17.png','Quà tặng',798000,'• Mô tả sản phẩm: Đang cập nhật...'),
(18,1,'Hộp Quà Luôn Lấp Lánh Rực Rỡ - Skye Vàng','./assets/img/products/sp18.png','Quà tặng',798000,'• Mô tả sản phẩm: Đang cập nhật...'),
(19,1,'Hộp Quà Luôn Lấp Lánh Rực Rỡ - Skye Đen','./assets/img/products/sp19.png','Quà tặng',798000,'• Mô tả sản phẩm: Đang cập nhật...'),
(20,1,'Heart Airpod Case','./assets/img/products/sp20.png','Phụ kiện',160000,'• Mô tả sản phẩm: Đang cập nhật...'),
(21,1,'Hina Pouch','./assets/img/products/sp21.png','Phụ kiện',85000,'• Mô tả sản phẩm: Đang cập nhật...'),
(22,1,'Ari Pouch','./assets/img/products/sp22.png','Phụ kiện',85000,'• Mô tả sản phẩm: Đang cập nhật...'),
(23,1,'Heart Mirror','./assets/img/products/sp23.png','Phụ kiện',80000,'• Kích thước: 6 x 5,8 cm<br>• Màu sắc: Đen, Nâu be<br>• Công dụng:<br>&nbsp;&nbsp;– Làm charm treo túi, móc treo chìa khoá<br>&nbsp;&nbsp;– Soi gương tiện lợi<br>• Xuất xứ: Việt Nam'),
(24,1,'Gương tròn','./assets/img/products/sp24.png','Phụ kiện',80000,'• Gương cầm tay mini của LESAC có thể sử dụng làm phụ kiện cho túi của bạn thêm phần đặc biệt.<br>• Xuất xứ: Việt Nam'),
(25,1,'Dung Dịch Vệ Sinh Túi 350ml','./assets/img/products/sp26.png','Phụ kiện',75000,'• Công dụng:<br>&nbsp;&nbsp;– Leather Cleaner có độ pH trung tính, không để lại mùi hoá học<br>&nbsp;&nbsp;– Làm sạch bụi bẩn, làm mềm và tăng độ bóng đẹp cho bề mặt da<br><br>• Cách sử dụng:<br>&nbsp;&nbsp;– Lắc đều trước khi sử dụng<br>&nbsp;&nbsp;– Xịt một lượng dung dịch vừa đủ lên bề mặt da cần vệ sinh<br>&nbsp;&nbsp;– Dùng khăn mềm lau theo hình xoáy tròn để làm sạch vết bẩn<br><br>• Xuất xứ: Việt Nam');

-- ==============================================================
-- 3. BẢNG GIỎ HÀNG (carts)
-- ==============================================================
DROP TABLE IF EXISTS carts;
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1
);

-- ==============================================================
-- 4. BẢNG ĐƠN HÀNG (orders)
-- ==============================================================
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT,
  fullname VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(255),
  total INT,
  shipping_fee INT DEFAULT 30000,
  status VARCHAR(50) DEFAULT 'pending',
  note TEXT
);

-- ==============================================================
-- 5. BẢNG CHI TIẾT ĐƠN HÀNG (order_items)
-- ==============================================================
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price INT NOT NULL
);

-- ==============================================================
-- 6. DỮ LIỆU MẪU GIỎ HÀNG + ĐƠN HÀNG
-- ==============================================================
INSERT INTO carts (account_id, product_id, quantity) VALUES (2, 1, 2), (2, 3, 1);

INSERT INTO orders (account_id, fullname, phone, address, total, shipping_fee, status, note)
VALUES (2, 'Khách hàng test', '0900000000', 'Hà Nội', 1230000, 30000, 'pending', 'Giao giờ hành chính');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 2, 610000),
(1, 3, 1, 650000);

-- ==============================================================
-- HOÀN TẤT ✅
-- ==============================================================

