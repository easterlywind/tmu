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

switch ($action) {
  case 'add': {
    $title    = trim($data['title'] ?? '');
    $img      = trim($data['img'] ?? '');
    $category = trim($data['category'] ?? '');
    $price    = (int)($data['price'] ?? 0);
    $desc     = trim($data['desc'] ?? '');

    if ($title === '' || $img === '' || $category === '' || $price <= 0 || $desc === '') {
      respond(['success' => false, 'message' => 'Missing product information'], 400);
    }

$nextIdRes = $conn->query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM products');
if (!$nextIdRes) {
  respond(['success' => false, 'message' => 'Failed to fetch next product id: ' . $conn->error], 500);
}
$nextIdRow = $nextIdRes->fetch_assoc();
$nextIdRes->free();
$nextId    = (int)($nextIdRow['next_id'] ?? 1);

    $stmt = $conn->prepare(
      'INSERT INTO products (id, status, title, img, category, price, description)
       VALUES (?, 1, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('isssis', $nextId, $title, $img, $category, $price, $desc);

if (!$stmt->execute()) {
  $error = $stmt->error ?: $conn->error;
  $stmt->close();
  respond(['success' => false, 'message' => 'Failed to add product: ' . $error], 500);
}

    $stmt->close();

    respond([
      'success' => true,
      'product' => [
        'id'       => $nextId,
        'status'   => 1,
        'title'    => $title,
        'img'      => $img,
        'category' => $category,
        'price'    => $price,
        'desc'     => $desc
      ]
    ]);
  }

  case 'update': {
    $id       = (int)($data['id'] ?? 0);
    $title    = trim($data['title'] ?? '');
    $img      = trim($data['img'] ?? '');
    $category = trim($data['category'] ?? '');
    $price    = (int)($data['price'] ?? 0);
    $desc     = trim($data['desc'] ?? '');

    if ($id <= 0 || $title === '' || $img === '' || $category === '' || $price <= 0 || $desc === '') {
      respond(['success' => false, 'message' => 'Missing product information'], 400);
    }

    $stmt = $conn->prepare(
      'UPDATE products SET title = ?, img = ?, category = ?, price = ?, description = ? WHERE id = ?'
    );
    $stmt->bind_param('sssisi', $title, $img, $category, $price, $desc, $id);

if (!$stmt->execute()) {
  $error = $stmt->error ?: $conn->error;
  $stmt->close();
  respond(['success' => false, 'message' => 'Failed to update product: ' . $error], 500);
}

    $stmt->close();

    respond(['success' => true]);
  }

  case 'delete': {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
      respond(['success' => false, 'message' => 'Invalid product id'], 400);
    }

    $stmt = $conn->prepare('UPDATE products SET status = 0 WHERE id = ?');
    $stmt->bind_param('i', $id);
if (!$stmt->execute()) {
  $error = $stmt->error ?: $conn->error;
  $stmt->close();
  respond(['success' => false, 'message' => 'Failed to update product status: ' . $error], 500);
}

    $stmt->close();

    respond(['success' => true]);
  }

  case 'restore': {
    $id = (int)($data['id'] ?? 0);
    if ($id <= 0) {
      respond(['success' => false, 'message' => 'Invalid product id'], 400);
    }

    $stmt = $conn->prepare('UPDATE products SET status = 1 WHERE id = ?');
    $stmt->bind_param('i', $id);
if (!$stmt->execute()) {
  $error = $stmt->error ?: $conn->error;
  $stmt->close();
  respond(['success' => false, 'message' => 'Failed to restore product: ' . $error], 500);
}

    $stmt->close();

    respond(['success' => true]);
  }

  default:
    respond(['success' => false, 'message' => 'Unknown action'], 400);
}
