<?php
require 'db.php';

$stmt = $pdo->query("SELECT * FROM products");
$prodotti = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($prodotti);
