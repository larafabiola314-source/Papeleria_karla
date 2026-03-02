<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$datos = json_decode(file_get_contents("php://input"));

if ($datos) {
    //evitar las inyecciones sql
    $usuario = mysqli_real_escape_string($conexion, $datos->username);
    $password = mysqli_real_escape_string($conexion, $datos->password);

    $consulta = "SELECT * FROM usuario WHERE Username = '$usuario' AND Contrasenia = '$password'";
    $resultado = mysqli_query($conexion, $consulta);

    if (mysqli_num_rows($resultado) > 0) {
        $fila = mysqli_fetch_assoc($resultado);
        echo json_encode(["status" => "success", "usuario" => $fila]);
    } else {
        echo json_encode(["status" => "error", "message" => "Credenciales incorrectas"]);
    }
}
?>