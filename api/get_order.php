<?php
include_once(__DIR__ . "/connect.php");

$account_id = isset($_GET['account_id']) ? (int)$_GET['account_id'] : 0;

$baseSql = "
  SELECT
    o.id,
    o.account_id,
    o.fullname,
    o.phone,
    o.address,
    o.total,
    o.shipping_fee,
    o.status,
    o.note,
    oi.id         AS item_id,
    oi.product_id AS item_product_id,
    oi.quantity   AS item_quantity,
    oi.price      AS item_price,
    p.title       AS item_product_title,
    p.img         AS item_product_img
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
";

if ($account_id > 0) {
  $sql = $baseSql . " WHERE o.account_id = ? ORDER BY o.id DESC, oi.id ASC";
  $stmt = $conn->prepare($sql);
  $stmt->bind_param('i', $account_id);
} else {
  $sql = $baseSql . " ORDER BY o.id DESC, oi.id ASC";
  $stmt = $conn->prepare($sql);
}

$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
  $orderId = (int)$row['id'];
  if (!isset($orders[$orderId])) {
    $orders[$orderId] = [
      'id'           => $orderId,
      'account_id'   => (int)$row['account_id'],
      'fullname'     => $row['fullname'],
      'phone'        => $row['phone'],
      'address'      => $row['address'],
      'total'        => (int)$row['total'],
      'shipping_fee' => (int)$row['shipping_fee'],
      'status'       => $row['status'],
      'note'         => $row['note'],
      'items'        => []
    ];
  }

  if (!empty($row['item_id'])) {
    $orders[$orderId]['items'][] = [
      'id'            => (int)$row['item_id'],
      'order_id'      => $orderId,
      'product_id'    => (int)$row['item_product_id'],
      'quantity'      => (int)$row['item_quantity'],
      'price'         => (int)$row['item_price'],
      'product_title' => $row['item_product_title'],
      'product_img'   => $row['item_product_img']
    ];
  }
}
$stmt->close();

header('Content-Type: application/json; charset=utf-8');
echo json_encode(array_values($orders), JSON_UNESCAPED_UNICODE);
?>
