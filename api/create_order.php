<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/connect.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Invalid JSON payload'], JSON_UNESCAPED_UNICODE);
  exit;
}

$accountPhone   = trim($data['account_phone'] ?? '');
$receiverName   = trim($data['receiver_name'] ?? '');
$receiverPhone  = trim($data['receiver_phone'] ?? '');
$address        = trim($data['address'] ?? '');
$shippingMethod = trim($data['shipping_method'] ?? '');
$deliveryDate   = trim($data['delivery_date'] ?? '');
$deliveryTime   = trim($data['delivery_time'] ?? '');
$userNote       = trim($data['note'] ?? '');
$total          = (int)($data['total'] ?? 0);
$items          = $data['items'] ?? [];
$requiresAddress = stripos($shippingMethod, 'giao') !== false;

if (
  $accountPhone === '' ||
  $receiverName === '' ||
  $receiverPhone === '' ||
  $total <= 0 ||
  !is_array($items) ||
  count($items) === 0 ||
  ($requiresAddress && $address === '')
) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Missing or invalid order information'], JSON_UNESCAPED_UNICODE);
  exit;
}

$accountStmt = $conn->prepare('SELECT id FROM accounts WHERE phone = ? LIMIT 1');
$accountStmt->bind_param('s', $accountPhone);
$accountStmt->execute();
$accountRes = $accountStmt->get_result();
$accountRow = $accountRes->fetch_assoc();
$accountId  = $accountRow ? (int)$accountRow['id'] : 0;
$accountStmt->close();

if ($accountId === 0) {
  http_response_code(404);
  echo json_encode(['success' => false, 'message' => 'Account not found'], JSON_UNESCAPED_UNICODE);
  exit;
}

$shippingFee = $requiresAddress ? 30000 : 0;

$noteParts = [];
if ($shippingMethod !== '') $noteParts[] = "Shipping: {$shippingMethod}";
if ($deliveryDate !== '')   $noteParts[] = "Delivery date: {$deliveryDate}";
if ($deliveryTime !== '')   $noteParts[] = "Delivery time: {$deliveryTime}";
if ($userNote !== '')       $noteParts[] = "Note: {$userNote}";
$fullNote = implode(' | ', $noteParts);

try {
  $conn->begin_transaction();

  $orderStmt = $conn->prepare(
    'INSERT INTO orders (account_id, fullname, phone, address, total, shipping_fee, status, note)
     VALUES (?, ?, ?, ?, ?, ?, \'pending\', ?)'
  );
  $orderStmt->bind_param(
    'isssiis',
    $accountId,
    $receiverName,
    $receiverPhone,
    $address,
    $total,
    $shippingFee,
    $fullNote
  );

  if (!$orderStmt->execute()) {
    throw new RuntimeException('Failed to create order');
  }

  $orderId = $orderStmt->insert_id;
  $orderStmt->close();

  $itemStmt = $conn->prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
  );

  foreach ($items as $item) {
    $productId = (int)($item['product_id'] ?? 0);
    $quantity  = (int)($item['quantity'] ?? 0);
    $price     = (int)($item['price'] ?? 0);

    if ($productId <= 0 || $quantity <= 0 || $price < 0) {
      throw new RuntimeException('Invalid order item payload');
    }

    $itemStmt->bind_param('iiii', $orderId, $productId, $quantity, $price);
    if (!$itemStmt->execute()) {
      throw new RuntimeException('Failed to create order item');
    }
  }

  $itemStmt->close();

  $clearStmt = $conn->prepare('DELETE FROM carts WHERE account_id = ?');
  $clearStmt->bind_param('i', $accountId);
  $clearStmt->execute();
  $clearStmt->close();

  $conn->commit();

  echo json_encode([
    'success'   => true,
    'order_id'  => $orderId,
    'order'     => [
      'account_id'     => $accountId,
      'receiver_name'  => $receiverName,
      'receiver_phone' => $receiverPhone,
      'address'        => $address,
      'total'          => $total,
      'shipping_fee'   => $shippingFee,
      'note'           => $fullNote
    ]
  ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  $conn->rollback();
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
