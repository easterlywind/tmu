<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/connect.php';

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload) || empty($payload['action'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Invalid request'], JSON_UNESCAPED_UNICODE);
  return;
}

$action = $payload['action'];

switch ($action) {
  case 'set_status':
    $orderId = (int)($payload['id'] ?? 0);
    $statusInput = strtolower(trim((string)($payload['status'] ?? '')));

    $statusMap = [
      'pending'   => 'pending',
      'completed' => 'completed',
      'done'      => 'completed',
      'processing'=> 'processing',
      'cancelled' => 'cancelled',
      'canceled'  => 'cancelled'
    ];

    if ($orderId <= 0 || $statusInput === '' || !isset($statusMap[$statusInput])) {
      http_response_code(400);
      echo json_encode(['success' => false, 'message' => 'Invalid order id or status'], JSON_UNESCAPED_UNICODE);
      return;
    }

    $normalizedStatus = $statusMap[$statusInput];

    $stmt = $conn->prepare('UPDATE orders SET status = ? WHERE id = ?');
    if (!$stmt) {
      http_response_code(500);
      echo json_encode(['success' => false, 'message' => 'Failed to prepare statement'], JSON_UNESCAPED_UNICODE);
      return;
    }

    $stmt->bind_param('si', $normalizedStatus, $orderId);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
      $check = $conn->prepare('SELECT status FROM orders WHERE id = ? LIMIT 1');
      if ($check) {
        $check->bind_param('i', $orderId);
        $check->execute();
        $result = $check->get_result();
        $row = $result->fetch_assoc();
        $check->close();

        if ($row) {
          echo json_encode([
            'success' => true,
            'id'      => $orderId,
            'status'  => $row['status']
          ], JSON_UNESCAPED_UNICODE);
          $stmt->close();
          return;
        }
      }

      $stmt->close();
      http_response_code(404);
      echo json_encode(['success' => false, 'message' => 'Order not found'], JSON_UNESCAPED_UNICODE);
      return;
    }

    $stmt->close();

    echo json_encode([
      'success' => true,
      'id'      => $orderId,
      'status'  => $normalizedStatus
    ], JSON_UNESCAPED_UNICODE);
    return;

  default:
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Unsupported action'], JSON_UNESCAPED_UNICODE);
    return;
}
?>
