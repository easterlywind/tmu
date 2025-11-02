<?php
include_once("connect.php");
$data = json_decode(file_get_contents("php://input"), true);

$fullname = $data['fullname'] ?? '';
$phone = $data['phone'] ?? '';
$password = $data['password'] ?? '';
$address = $data['address'] ?? '';
$email = $data['email'] ?? '';

$sql = "INSERT INTO accounts (fullname, phone, password, address, email, status, userType)
        VALUES ('$fullname', '$phone', '$password', '$address', '$email', 1, 0)";

if ($conn->query($sql)) {
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => "Số điện thoại đã tồn tại hoặc lỗi khi tạo tài khoản"]);
}
?>
