<?php
$servername = "localhost";  // hoặc 127.0.0.1
$username = "root";         // tài khoản MySQL của bạn
$password = "";             // mật khẩu (thường để trống trong XAMPP)
$dbname = "hello";          // tên database bạn đang dùng

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("❌ Kết nối thất bại: " . $conn->connect_error);
} else {
    echo "✅ Kết nối thành công tới CSDL!";
}

$conn->close();
?>
