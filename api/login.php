<?php
include_once("connect.php");
$data = json_decode(file_get_contents("php://input"), true);

$phone = $data['phone'] ?? '';
$password = $data['password'] ?? '';

$sql = "SELECT * FROM accounts WHERE phone='$phone' AND password='$password' AND status=1";
$res = $conn->query($sql);

if ($res && $res->num_rows > 0) {
  $user = $res->fetch_assoc();
  echo json_encode(["success" => true, "user" => $user]);
} else {
  echo json_encode(["success" => false, "message" => "Sai tài khoản hoặc mật khẩu"]);
}
?>
