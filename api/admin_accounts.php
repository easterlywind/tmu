<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/connect.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$action = $data['action'] ?? '';

function respond($payload, int $code = 200) {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

if (!is_array($data)) {
  respond(['success' => false, 'message' => 'Invalid request body'], 400);
}

switch ($action) {
  case 'create': {
    $fullname = trim($data['fullname'] ?? '');
    $phone    = trim($data['phone'] ?? '');
    $password = trim($data['password'] ?? '');
    $address  = trim($data['address'] ?? '');
    $email    = trim($data['email'] ?? '');
    $status   = isset($data['status']) ? (int)$data['status'] : 1;
    $userType = isset($data['userType']) ? (int)$data['userType'] : 0;

    if ($fullname === '' || $phone === '' || $password === '') {
      respond(['success' => false, 'message' => 'Thiếu họ tên, số điện thoại hoặc mật khẩu'], 400);
    }

    $check = $conn->prepare('SELECT id FROM accounts WHERE phone = ? LIMIT 1');
    $check->bind_param('s', $phone);
    $check->execute();
    $dup = $check->get_result()->fetch_assoc();
    $check->close();
    if ($dup) {
      respond(['success' => false, 'message' => 'Số điện thoại đã tồn tại'], 409);
    }

    $stmt = $conn->prepare(
      'INSERT INTO accounts (fullname, phone, password, address, email, status, userType)
       VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssssii', $fullname, $phone, $password, $address, $email, $status, $userType);
    if (!$stmt->execute()) {
      $error = $stmt->error ?: $conn->error;
      $stmt->close();
      respond(['success' => false, 'message' => 'Không thể tạo tài khoản: ' . $error], 500);
    }
    $id = $stmt->insert_id;
    $stmt->close();

    respond([
      'success' => true,
      'account' => [
        'id'       => $id,
        'fullname' => $fullname,
        'phone'    => $phone,
        'password' => $password,
        'address'  => $address,
        'email'    => $email,
        'status'   => $status,
        'userType' => $userType
      ]
    ]);
  }

  case 'update': {
    $id       = isset($data['id']) ? (int)$data['id'] : 0;
    $fullname = trim($data['fullname'] ?? '');
    $phone    = trim($data['phone'] ?? '');
    $password = trim($data['password'] ?? '');
    $address  = trim($data['address'] ?? '');
    $email    = trim($data['email'] ?? '');
    $status   = isset($data['status']) ? (int)$data['status'] : 1;
    $userType = isset($data['userType']) ? (int)$data['userType'] : 0;

    if ($id <= 0) {
      respond(['success' => false, 'message' => 'Thiếu id tài khoản'], 400);
    }
    if ($fullname === '' || $phone === '' || $password === '') {
      respond(['success' => false, 'message' => 'Họ tên, số điện thoại và mật khẩu là bắt buộc'], 400);
    }

    $stmt = $conn->prepare(
      'UPDATE accounts
         SET fullname = ?, phone = ?, password = ?, address = ?, email = ?, status = ?, userType = ?
       WHERE id = ?'
    );
    $stmt->bind_param('ssssiiii', $fullname, $phone, $password, $address, $email, $status, $userType, $id);
    if (!$stmt->execute()) {
      $error = $stmt->error ?: $conn->error;
      $stmt->close();
      respond(['success' => false, 'message' => 'Không thể cập nhật tài khoản: ' . $error], 500);
    }
    $stmt->close();

    respond(['success' => true]);
  }

  case 'set_status': {
    $id     = isset($data['id']) ? (int)$data['id'] : 0;
    $status = isset($data['status']) ? (int)$data['status'] : 0;

    if ($id <= 0) {
      respond(['success' => false, 'message' => 'Thiếu id tài khoản'], 400);
    }

    $stmt = $conn->prepare('UPDATE accounts SET status = ? WHERE id = ?');
    $stmt->bind_param('ii', $status, $id);
    if (!$stmt->execute()) {
      $error = $stmt->error ?: $conn->error;
      $stmt->close();
      respond(['success' => false, 'message' => 'Không thể thay đổi trạng thái: ' . $error], 500);
    }
    $stmt->close();

    respond(['success' => true]);
  }

  default:
    respond(['success' => false, 'message' => 'Unknown action'], 400);
}
