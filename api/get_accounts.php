<?php
include_once(__DIR__ . "/connect.php");

$sql = "SELECT 
          id,
          fullname,
          phone,
          password,
          COALESCE(address, '') AS address,
          COALESCE(email, '')   AS email,
          status,
          userType
        FROM accounts
        ORDER BY id ASC";

$res = $conn->query($sql);

$now = date('Y-m-d H:i:s'); // phát sinh tạm 'join' cho FE
$accounts = [];

while ($row = $res->fetch_assoc()) {
  $accounts[] = [
    "id"       => (int)$row["id"],
    "fullname" => $row["fullname"],
    "phone"    => $row["phone"],
    "password" => $row["password"],   
    "address"  => $row["address"],
    "email"    => $row["email"],
    "status"   => (int)$row["status"],   // FE so sánh 0/1
    "join"     => $now,                  // để admin.js không lỗi khi formatDate()
    "cart"     => [],                    // FE kỳ vọng có mảng cart
    "userType" => (int)$row["userType"]  // 1 = admin, 0 = user
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($accounts, JSON_UNESCAPED_UNICODE);
