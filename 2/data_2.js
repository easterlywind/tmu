function deleteDb(){
    if(localStorage.getItem('products')!=null){
        localStorage.removeItem('products')
        console.log("ok")
    }
}
deleteDb()
//Khoi tao danh sach san pham
function createProduct() {
    if (localStorage.getItem('products') == null) {
        let products = [
            {
                id: 1,
                status: 1,
                title: 'Jojo',
                img: './assets/img/products/sp1.png',
                category: 'Túi xách',
                price: 610000,
                desc: `Kiểu dáng: Phom gối nắp sập<br>
Kiểu quai: Đeo vai và đeo chéo <br>
Kiểu khoá: Khoá kéo miệng túi kim loại<br>
Chất liệu: Da PU bóng vân nhăn mờ<br>
Màu sắc: Đen | Trắng<br>
Kích cỡ: (Dài) 26 - (Rộng) 8 - (Cao) 13,5cm<br>
Xuất xứ: Việt Nam`
            },
            {
                id: 2,
                status: 1,
                title: 'XINH',
                img: './assets/img/products/sp2.png',
                category: 'Túi xách',
                price: 650000,
                desc: `Kiểu dáng: Dáng hobo, miệng võng<br>
Chất liệu: Da PU bóng vân nhăn mờ<br>
Kiểu khoá: Khoá kéo miệng túi<br>
Màu sắc: Đen | Trắng<br>
Kích cỡ: (Dài) 31 x (Rộng) 12 x (Cao) 21cm<br>
Xuất xứ: Việt Nam`
            },
            {
                id: 3,
                status: 1,
                title: 'LUNA BAG',
                img: './assets/img/products/sp3.png',
                category: 'Túi xách',
                price: 650000,
                desc: 'Đang Cập Nhật....'
            },
            {
                id: 4,
                status: 1,
                title: 'Crystal Bag',
                img: './assets/img/products/sp4.png',
                category: 'Túi xách',
                price: 932000,
                desc: 'Đang cập nhật ...'
            },
            {
                id: 5,
                status: 1,
                title: 'Bloom Bag',
                img: './assets/img/products/sp5.png',
                category: 'Túi xách',
                price: 650000,
                desc: 'Kiểu dáng: Dáng hobo, miệng võng<br>Chất liệu: Da PU bóng vân nhăn mờ<br>Kiểu khóa: Khóa kéo miệng túi<br>Màu sắc: Đen | Trắng<br>Kích cỡ: (Dài) 31 x (Rộng) 12 x (Cao) 20 cm<br>Xuất xứ: Việt Nam<br>Đang cập nhật mô tả chi tiết.'
            },
            {
                id: 6,
                status: 1,
                title: 'Glow',
                img: './assets/img/products/sp6.png',
                category: 'Túi xách',
                price: 599000,
                desc: 'Màu sắc: Đang cập nhật<br>Kiểu dáng: Đang cập nhật<br>Chất liệu: Đang cập nhật<br>Kích thước: Đang cập nhật<br>Mô tả sản phẩm: Đang cập nhật ...'
            },
            {
                id: 7,
                status: 1,
                title: 'GLOW',
                img: './assets/img/products/sp7.png',
                category: 'Túi xách',
                price: 450000,
                desc: 'Kiểu dáng: Hobo Bag<br>Kích thước: 19 x 24 x 7 cm<br>Kiểu khóa: Nắp gập<br>Chất liệu: Da PU trơn cao cấp<br>Kích cỡ: Trung bình<br>Xuất xứ: Việt Nam'
            },
            {
                id: 8,
                status: 1,
                title: 'CHARIS BAG',
                img: './assets/img/products/sp8.png',
                category: 'Túi xách',
                price: 450000,
                desc: 'Kiểu dáng: Hobo Bag<br>Kích thước: 19 x 24 x 7 cm<br>Kiểu khóa: Nắp gập<br>Chất liệu: Da PU trơn cao cấp<br>Kích cỡ: Trung bình<br>Xuất xứ: Việt Nam'
            },
            {
                id: 9,
                status: 1,
                title: 'Onist Bag',
                img: './assets/img/products/sp9.png',
                category: 'Túi xách',
                price: 650000,
                desc: 'Màu sắc: Đang cập nhật<br>Kiểu dáng: Đang cập nhật<br>Chất liệu: Đang cập nhật<br>Kích thước: Đang cập nhật<br>Mô tả sản phẩm: Đang cập nhật ...'
            },
            {
    id: 10,
    status: 1,
    title: 'Nina',
    img: './assets/img/products/sp10.png', // đổi lại đúng file ảnh nếu khác
    category: 'Ví',
    price: 149000,
    desc: `Chất liệu: Da PU trơn<br>
Kiểu dáng: Ví thẻ đeo cổ, có ngăn khoá kéo<br>
Màu sắc: Đen | Trắng ngà | Đỏ<br>
Kiểu quai đeo: Ví đeo cổ<br>
Kiểu khoá: Khoá kéo<br>
Kích thước: 12 x 8cm | dây đeo - 43cm<br>
Xuất xứ: Việt Nam`
},
{
    id: 11,
    status: 1,
    title: 'Lia',
    img: './assets/img/products/sp11.png', // đổi đúng tên file ảnh nếu khác
    category: 'Ví',
    price: 149000,
    desc: `Chất liệu: Da PU trơn<br>
Kiểu dáng: Ví thẻ đeo cổ<br>
Màu sắc: Đen | Trắng ngà | Đỏ<br>
Kiểu quai đeo: Ví đeo cổ<br>
Điểm đặc biệt: Có mặt trơn để ảnh<br>
Kích thước: 11 x 7,5cm | dây đeo: 43,5cm<br>
Xuất xứ: Việt Nam`
},
{
    id: 12,
    status: 1,
    title: 'STAND WALLET',
    img: './assets/img/products/sp12.png', // đổi đúng tên file ảnh nếu khác
    category: 'Ví',
    price: 199000,
    desc: `Kiểu dáng: Basic, thanh lịch<br>
Kích thước: 14 x 10 x 2cm<br>
Kiểu khóa: Khóa kéo<br>
Chất liệu: Da PU sần nhẹ, chắc chắn<br>
Kích cỡ: Trung bình<br>
Màu sắc: Đen | Trắng<br>
Xuất xứ: Việt Nam`
},
{
    id: 13,
    status: 1,
    title: 'June',
    img: './assets/img/products/sp13.png', // đổi đúng tên file ảnh nếu khác
    category: 'Ví',
    price: 199000,
    desc: 'Màu sắc: Đang cập nhật<br>Kiểu dáng: Đang cập nhật<br>Chất liệu: Đang cập nhật<br>Kích thước: Đang cập nhật<br>Mô tả sản phẩm: Đang cập nhật ...'
},
{
    id: 14,
    status: 1,
    title: 'TONGUE WALLET',
    img: './assets/img/products/sp14.png', // đổi đúng tên file ảnh nếu khác
    category: 'Ví',
    price: 250000,
    desc: `• Kiểu dáng: Basic, thanh lịch<br>
• Kích thước: 11.6 x 9.2 x 2cm<br>
• Kiểu khóa: Khóa kéo<br>
• Chất liệu: Da PU sần nhẹ, chắc chắn<br>
• Kích cỡ: Trung bình<br>
• Màu sắc: Đen, Trắng<br>
• Xuất xứ: Việt Nam`
},
{
    id: 16,
    status: 1,
    title: 'Hộp Quà Luôn Lấp Lánh Dịu Dàng - Charis Đen',
    img: './assets/img/products/sp16.png',
    category: 'Quà tặng',
    price: 798000,
    desc: `• Mô tả sản phẩm: Đang cập nhật...`
},
{
    id: 17,
    status: 1,
    title: 'Hộp Quà Luôn Lấp Lánh Tinh Tế - Scarlet Đen',
    img: './assets/img/products/sp17.png',
    category: 'Quà tặng',
    price: 798000,
    desc: `• Mô tả sản phẩm: Đang cập nhật...`
},
{
    id: 18,
    status: 1,
    title: 'Hộp Quà Luôn Lấp Lánh Rực Rỡ - Skye Vàng',
    img: './assets/img/products/sp18.png',
    category: 'Quà tặng',
    price: 798000,
    desc: `• Mô tả sản phẩm: Đang cập nhật...`
},
{
    id: 19,
    status: 1,
    title: 'Hộp Quà Luôn Lấp Lánh Rực Rỡ - Skye Đen',
    img: './assets/img/products/sp19.png',
    category: 'Quà tặng',
    price: 798000,
    desc: `• Mô tả sản phẩm: Đang cập nhật...`
},
{
    id: 20,
    status: 1, 
    title: 'Heart Airpod Case',
    img: './assets/img/products/sp20.png',
    category: 'Phụ kiện',
    price: 160000,
    desc: `• Mô tả sản phẩm: Đang cập nhật...`
},
{
    id: 21,
    status: 1, 
    title: 'Hina Pouch',
    img: './assets/img/products/sp21.png',
    category: 'Phụ kiện',
    price: 85000,
    desc: `• Mô tả sản phẩm: Đang cập nhật...`
},
{
    id: 22,
    status: 1, // Còn hàng
    title: 'Ari Pouch',
    img: './assets/img/products/sp22.png',
    category: 'Phụ kiện',
    price: 85000,
    desc: `• Mô tả sản phẩm: Đang cập nhật...`
},
{
    id: 23,
    status: 1, 
    title: 'Heart Mirror',
    img: './assets/img/products/sp23.png',
    category: 'Phụ kiện',
    price: 80000,
    desc: `• Kích thước: 6 x 5,8 cm<br>
• Màu sắc: Đen, Nâu be<br>
• Công dụng:<br>
&nbsp;&nbsp;– Làm charm treo túi, móc treo chìa khoá<br>
&nbsp;&nbsp;– Soi gương tiện lợi<br>
• Xuất xứ: Việt Nam`
},
{
    id: 24,
    status: 1, // Còn hàng
    title: 'Gương tròn',
    img: './assets/img/products/sp24.png',
    category: 'Phụ kiện',
    price: 80000,
    desc: `• Gương cầm tay mini của LESAC có thể sử dụng làm phụ kiện cho túi của bạn thêm phần đặc biệt.<br>
• Xuất xứ: Việt Nam`
},
{
    id: 25,
    status: 1, // Còn hàng
    title: 'Dung Dịch Vệ Sinh Túi 350ml',
    img: './assets/img/products/sp26.png',
    category: 'Phụ kiện',
    price: 75000,
    desc: `• Công dụng:<br>
&nbsp;&nbsp;– Leather Cleaner có độ pH trung tính, không để lại mùi hoá học<br>
&nbsp;&nbsp;– Làm sạch bụi bẩn, làm mềm và tăng độ bóng đẹp cho bề mặt da<br><br>
• Cách sử dụng:<br>
&nbsp;&nbsp;– Lắc đều trước khi sử dụng<br>
&nbsp;&nbsp;– Xịt một lượng dung dịch vừa đủ lên bề mặt da cần vệ sinh<br>
&nbsp;&nbsp;– Dùng khăn mềm lau theo hình xoáy tròn để làm sạch vết bẩn<br><br>
• Xuất xứ: Việt Nam`
}




        ]
        localStorage.setItem('products', JSON.stringify(products));
    }
}

// Create admin account 
function createAdminAccount() {
    let accounts = localStorage.getItem("accounts");
    if (!accounts) {
        accounts = [];
        
        accounts.push({
            fullname: "Lesac admin",
            phone: "0123456789",
            password: "123456",
            address: '',
            email: '',
            status: 1,
            join: new Date(),
            cart: [],
            userType: 1
        })
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
}

window.onload = createProduct();
window.onload = createAdminAccount();