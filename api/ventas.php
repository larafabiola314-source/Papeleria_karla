<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'conexion.php';

date_default_timezone_set('America/Mexico_City');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents("php://input");
    $datos = json_decode($json);

    if ($datos && isset($datos->productos) && count($datos->productos) > 0) {
        // Obtenemos los datos de la venta
        $id_usuario = $datos->id_usuario;
        $total = $datos->total;
        $fecha = date('Y-m-d H:i:s');

        mysqli_begin_transaction($conexion);

        try {
            //Guardar en la tabla ventas
            $queryVenta = "INSERT INTO ventas (Id_Usuario, Total, Fecha) VALUES ($id_usuario, $total, '$fecha')";
            if (!mysqli_query($conexion, $queryVenta)) {
                throw new Exception("Error al registrar la venta general: " . mysqli_error($conexion));
            }
            $id_venta = mysqli_insert_id($conexion);

            //descontar stock
            foreach ($datos->productos as $prod) {
                $id_prod = $prod->id_producto;
                $cant = $prod->cantidad;
                $precio = $prod->precio;
                $subtotal = $prod->subtotal;

                // Insertar en la tabla ventas_productos
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