<?php
include 'utils.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$presentes = $data['presentes'];

gravarEscolhas($presentes);

echo json_encode(['message' => 'Presentes escolhidos com sucesso!']);

 