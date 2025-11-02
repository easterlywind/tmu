<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/connect.php';  // chỉ include 1 lần

// Helper: lấy tham số từ POST -> GET -> JSON body
function get_param($key) {
  // Ưu tiên POST
  if (isset($_POST[$key])) return trim($_POST[$key]);
  // Sau đó GET
  if (isset($_GET[$key])) return trim($_GET[$key]);
  // Cuối cùng JSON
  $raw = file_get_contents('php://input');
  if ($raw) {
    $json = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && isset($json[$key])) {
      return trim($json[$key]);
    }
  }
  return '';
}

$phone    = get_param('phone');
$password = get_param('password');

if ($phone === '' || $password === '') {
  echo json_encode(['ok' => false, 'msg' => 'Missing phone or password']);
  exit;
}

// Chuẩn bị statement an toàn
$stmt = $conn->prepare("SELECT id, fullname, phone, password, address, email, status, userType
                        FROM accounts WHERE phone = ? LIMIT 1");
$stmt->bind_param('s', $phone);
$stmt->execute();
$res = $stmt->get_result();

if ($row = $res->fetch_assoc()) {
  // Ở SQL mẫu của bạn đang lưu mật khẩu plain text
  if ($password === $row['password']) {
    // Không trả mật khẩu về client
    unset($row['password']);
    echo json_encode(['ok' => true, 'user' => $row]);
  } else {
    echo json_encode(['ok' => false, 'msg' => 'Wrong password']);
  }
} else {
  echo json_encode(['ok' => false, 'msg' => 'Account not found']);
}
