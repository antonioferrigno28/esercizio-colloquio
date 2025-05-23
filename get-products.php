<?php
// Connessione al database tramite il file db.php
require 'db.php';

// Eseguiamo una query per ottenere tutti i prodotti
$query = "SELECT * FROM products";
$result = $conn->query($query);

// Recuperiamo i risultati
$prodotti = $result->fetchAll(PDO::FETCH_ASSOC);

// Impostiamo l'header per il contenuto JSON
header('Content-Type: application/json');

// Restituiamo i risultati in formato JSON
echo json_encode($prodotti);
