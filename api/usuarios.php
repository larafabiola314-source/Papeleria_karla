<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $json = file_get_contents("php://input");
    $datos = json_decode($json);

    if ($datos) {
        $nombre = mysqli_real_escape_string($conexion, $datos->nombre);
        $ap = mysqli_real_escape_string($conexion, $datos->ap);
        $am = mysqli_real_escape_string($conexion, $datos->am);
        $username = mysqli_real_escape_string($conexion, $datos->username);
        $password = mysqli_real_escape_string($conexion, $datos->password);
        $fecha = date('Y-m-d H:i:s');

        //validar el nombre de usuario para que no haya repetidos
        $check = mysqli_query($conexion, "SELECT Id_Usuario FROM usuario WHERE Username = '$username'");
        if (mysqli_num_rows($check) > 0) {
            echo json_encode(["status" => "error", "message" => "El nombre de usuario '$username' ya está en uso."]);
            exit();
        }

        //insertar usaurio
        $consulta = "INSERT INTO usuario (Nombre, AP, AM, Username, Contrasenia, Created_at) 
                     VALUES ('$nombre', '$ap', '$am', '$username', '$password', '$fecha')";
        
        if (mysqli_query($conexion, $consulta)) {
            echo json_encode(["status" => "success", "message" => "Usuario guardado"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conexion)]);
        }
    }
} elseif ($metodo === 'GET') {
    $consulta = "SELECT * FROM usuario ORDER BY Id_Usuario ASC";
    $resultado = mysqli_query($conexion, $consulta);
    $usuarios = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $fila['Id_Usuario'] = (int)$fila['Id_Usuario'];
        $usuarios[] = $fila;
    }
    
    echo json_encode($usuarios);
}

 elseif ($metodo === 'PUT') {
    //actualizar usuario
    $json = file_get_contents("php://input");
    $datos = json_decode($json);

    if ($datos) {
        $nombre = mysqli_real_escape_string($conexion, $datos->nombre);
        $ap = mysqli_real_escape_string($conexion, $datos->ap);
        $am = mysqli_real_escape_string($conexion, $datos->am);
        $username = mysqli_real_escape_string($conexion, $datos->username);
        $password = mysqli_real_escape_string($conexion, $datos->password);

        //validar el nombre de usuario
        $check = mysqli_query($conexion, "SELECT Id_Usuario FROM usuario WHERE Username = '$username' AND Id_Usuario != $id");
        if (mysqli_num_rows($check) > 0) {
            echo json_encode(["status" => "error", "message" => "El nombre de usuario '$username' ya está en uso."]);
            exit();
        }

        //si se escribe en contraseña se actualiza, sino se deja igual
        if (!empty($password)) {
            $consulta = "UPDATE usuario SET Nombre='$nombre', AP='$ap', AM='$am', Username='$username', Contrasenia='$password' WHERE Id_Usuario=$id";
        } else {
            $consulta = "UPDATE usuario SET Nombre='$nombre', AP='$ap', AM='$am', Username='$username' WHERE Id_Usuario=$id";
        }

        if (mysqli_query($conexion, $consulta)) {
            echo json_encode(["status" => "success", "message" => "Usuario actualizado"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conexion)]);
        }
    }
} elseif ($metodo === 'DELETE') {
    //eliminar usuario
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($id > 0) {
        $consulta = "DELETE FROM usuario WHERE Id_Usuario = $id";
        if (mysqli_query($conexion, $consulta)) {
            echo json_encode(["status" => "success", "message" => "Usuario eliminado"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conexion)]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ID no válido"]);
    }
}

?>