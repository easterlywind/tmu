<?php
include_once(__DIR__ . "/connect.php");

$sql = "SELECT 
          id, status, title, img, category, price, `description` AS `desc`
        FROM products
        ORDER BY id ASC";

$res = $conn->query($sql);

$products = [];
while ($row = $res->fetch_assoc()) {
  $products[] = [
    "id"       => (int)$row["id"],
    "status"   => (int)$row["status"],
    "title"    => $row["title"],
    "img"      => $row["img"],
    "category" => $row["category"],
    "price"    => (int)$row["price"],
    "desc"     => $row["desc"]
  ];
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($products, JSON_UNESCAPED_UNICODE);
