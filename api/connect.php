<?php
$servername = "localhost";
$username = "root";      // mặc định XAMPP
$password = "";          // mặc định rỗng
$dbname = "hello";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");
?>
