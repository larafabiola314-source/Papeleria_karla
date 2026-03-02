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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents("php://input");
    $datos = json_decode($json);

    if ($datos && isset($datos->productos) && count($datos->productos) > 0) {
        $id_usuario = (int)$datos->id_usuario;
        $total = (float)$datos->total;
        $fecha = date('Y-m-d H:i:s');

        mysqli_begin_transaction($conexion);

        try {
            //guardar en la tabla
            $queryVenta = "INSERT INTO ventas (Id_Usuario, Total, Fecha) VALUES ($id_usuario, $total, '$fecha')";
            if (!mysqli_query($conexion, $queryVenta)) {
                throw new Exception("Error al registrar la venta general: " . mysqli_error($conexion));
            }
            $id_venta = mysqli_insert_id($conexion);

            //descontar stock
            foreach ($datos->productos as $prod) {
                $id_prod = (int)$prod->id_producto;
                $cant = (int)$prod->cantidad;
                $precio = (float)$prod->precio;
                $subtotal = (float)$prod->subtotal;

                $queryDetalle = "INSERT INTO ventas_productos (Id_Venta, Id_Producto, Cantidad, Precio_Unidad, Subtotal) 
                                 VALUES ($id_venta, $id_prod, $cant, $precio, $subtotal)";
                
                if (!mysqli_query($conexion, $queryDetalle)) {
                    throw new Exception("Error en el detalle del producto: " . mysqli_error($conexion));
                }

                // Descontar stock de la tabla producto
                $queryStock = "UPDATE producto SET Stock = Stock - $cant WHERE Id_Producto = $id_prod";
                
                if (!mysqli_query($conexion, $queryStock)) {
                    throw new Exception("Error al actualizar el stock: " . mysqli_error($conexion));
                }
            }

            mysqli_commit($conexion);
            echo json_encode(["status" => "success", "message" => "Venta registrada"]);

        } catch (Exception $e) {
            mysqli_rollback($conexion);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No hay productos en el carrito"]);
    }
}
?>