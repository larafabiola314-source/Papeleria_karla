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

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $json = file_get_contents("php://input");
    $datos = json_decode($json);
    
    if ($datos) {
        //actualizar producto
        if (isset($datos->id_producto)) {
            $id = (int)$datos->id_producto;

            if (isset($datos->accion) && $datos->accion === 'editar_completo') {
                $nom = mysqli_real_escape_string($conexion, $datos->nombre);
                $des = mysqli_real_escape_string($conexion, $datos->descripcion);
                
                $pre = (float)$datos->precio;
                $stk = (int)$datos->stock;
        
                $consulta = "UPDATE producto SET Nombre='$nom', Descripcion='$des', Precio=$pre, Stock=$stk 
                             WHERE Id_Producto = $id";
            } else {
                $activo = $datos->activo ? 1 : 0;
                
                $consulta = "UPDATE producto SET Is_Active = $activo WHERE Id_Producto = $id";
            }
            
            if (mysqli_query($conexion, $consulta)) {
                echo json_encode(["status" => "success", "message" => "Estado/Producto actualizado"]);
            } else {
                echo json_encode(["status" => "error", "message" => mysqli_error($conexion)]);
            }
        } 
        //registrar producto
        else {
            $nombre = mysqli_real_escape_string($conexion, $datos->nombre);
            $desc = mysqli_real_escape_string($conexion, $datos->descripcion);
            
            $precio = (float)$datos->precio;
            $stock = (int)$datos->stock;
            $fecha = date('Y-m-d H:i:s');

            $consulta = "INSERT INTO producto (Nombre, Descripcion, Precio, Stock, Created_at, Is_Active) 
                         VALUES ('$nombre', '$desc', $precio, $stock, '$fecha', 1)";
            
            if (mysqli_query($conexion, $consulta)) {
                echo json_encode(["status" => "success", "message" => "Producto guardado"]);
            } else {
                echo json_encode(["status" => "error", "message" => mysqli_error($conexion)]);
            }
        }
    }
} 
//obtener productos
elseif ($metodo === 'GET') {
    $consulta = "SELECT * FROM producto WHERE Is_active = 1 ORDER BY Nombre ASC";
    $resultado = mysqli_query($conexion, $consulta);
    $productos = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $fila['Precio'] = (float)$fila['Precio'];
        $fila['Stock'] = (int)$fila['Stock'];
        $fila['Is_Active'] = (bool)$fila['Is_Active'];
        $productos[] = $fila;
    }
    echo json_encode($productos);
}
?>