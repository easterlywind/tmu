<?php
include_once("connect.php");
$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? '';
$account_id = (int)($data['account_id'] ?? 0);
$product_id = (int)($data['product_id'] ?? 0);
$quantity = (int)($data['quantity'] ?? 1);

switch ($action) {
  case 'get':
    $res = $conn->query("SELECT c.id, p.title, p.img, p.price, c.quantity
                         FROM carts c JOIN products p ON c.product_id=p.id
                         WHERE c.account_id=$account_id");
    $items = [];
    while ($r = $res->fetch_assoc()) $items[] = $r;
    echo json_encode($items);
    break;

  case 'add':
    $check = $conn->query("SELECT id FROM carts WHERE account_id=$account_id AND product_id=$product_id");
    if ($check->num_rows > 0)
      $conn->query("UPDATE carts SET quantity=quantity+$quantity WHERE account_id=$account_id AND product_id=$product_id");
    else
      $conn->query("INSERT INTO carts (account_id, product_id, quantity) VALUES ($account_id, $product_id, $quantity)");
    echo json_encode(["success" => true]);
    break;

  case 'update':
    $conn->query("UPDATE carts SET quantity=$quantity WHERE account_id=$account_id AND product_id=$product_id");
    echo json_encode(["success" => true]);
    break;

  case 'delete':
    $conn->query("DELETE FROM carts WHERE account_id=$account_id AND product_id=$product_id");
    echo json_encode(["success" => true]);
    break;

  default:
    echo json_encode(["success" => false, "message" => "Thiếu action"]);
}
?>
