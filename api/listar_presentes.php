<?php
include 'utils.php';

$presentes = listarPresentes();

echo json_encode($presentes);

