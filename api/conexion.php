<?php

date_default_timezone_set('America/Mexico_City');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$servidor = "localhost";
$usuario = "root";
$password = "";
$bd = "papeleria-karla";

$conexion = mysqli_connect($servidor, $usuario, $password, $bd);

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

mysqli_query($conexion, "SET time_zone = '-06:00'");


mysqli_set_charset($conexion, "utf8mb4");

?>