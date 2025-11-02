<?php
include_once("connect.php");
$account_id = isset($_GET['account_id']) ? (int)$_GET['account_id'] : 0;

if ($account_id > 0)
  $sql = "SELECT * FROM orders WHERE account_id=$account_id ORDER BY id DESC";
else
  $sql = "SELECT * FROM orders ORDER BY id DESC"; // admin xem tất cả

$res = $conn->query($sql);
$list = [];
while ($row = $res->fetch_assoc()) $list[] = $row;

header('Content-Type: application/json');
echo json_encode($list);
?>
