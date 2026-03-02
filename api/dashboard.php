<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $datos = [];
    
    $ahora = date('Y-m-d H:i:s');

    //ganancias y Ventas de hoy
    $qHoy = "SELECT COALESCE(SUM(Total), 0) as ganancias, COUNT(*) as ventas FROM ventas WHERE DATE(Fecha) = CURDATE()";
    $resHoy = mysqli_fetch_assoc(mysqli_query($conexion, $qHoy));
    
    $datos['ganancias_hoy'] = (float)$resHoy['ganancias'];
    $datos['ventas_hoy'] = (int)$resHoy['ventas'];
    $datos['ventas_dia'] = (int)$resHoy['ventas'];

    //comparacion de ayer
    $qAyer = "SELECT COALESCE(SUM(Total), 0) as ganancias FROM ventas WHERE DATE(Fecha) = CURDATE() - INTERVAL 1 DAY";
    $resAyer = mysqli_fetch_assoc(mysqli_query($conexion, $qAyer));
    $gananciasAyer = (float)$resAyer['ganancias'];

    if ($gananciasAyer > 0) {
        $porcentaje = (($datos['ganancias_hoy'] - $gananciasAyer) / $gananciasAyer) * 100;
    } else {
        $porcentaje = $datos['ganancias_hoy'] > 0 ? 100 : 0;
    }
    $datos['tendencia_porcentaje'] = round($porcentaje, 1);

    $qUltima = "SELECT MAX(Fecha) as ultima_fecha FROM ventas WHERE DATE(Fecha) = CURDATE()";
    $resUltima = mysqli_fetch_assoc(mysqli_query($conexion, $qUltima));

    if (!empty($resUltima['ultima_fecha'])) {
        $tiempo_venta = strtotime($resUltima['ultima_fecha']);
        $tiempo_actual = time(); 
        $minutos = floor(($tiempo_actual - $tiempo_venta) / 60);
        $datos['minutos_ultima_venta'] = $minutos >= 0 ? $minutos : 0;
    } else {
        $datos['minutos_ultima_venta'] = '-';
    }

    //stock
    $qStock = "SELECT COUNT(*) as alertas FROM producto WHERE Stock <= 5 AND Is_Active = 1";
    $resStock = mysqli_fetch_assoc(mysqli_query($conexion, $qStock));
    $datos['alertas_stock'] = (int)$resStock['alertas'];

    //Ventas por semana
    $qSemana = "SELECT COUNT(*) as ventas FROM ventas WHERE YEARWEEK(Fecha, 1) = YEARWEEK(CURDATE(), 1)";
    $resSemana = mysqli_fetch_assoc(mysqli_query($conexion, $qSemana));
    $datos['ventas_semana'] = (int)$resSemana['ventas'];

    //Ventas por mes
    $qMes = "SELECT COUNT(*) as ventas FROM ventas WHERE MONTH(Fecha) = MONTH(CURDATE()) AND YEAR(Fecha) = YEAR(CURDATE())";
    $resMes = mysqli_fetch_assoc(mysqli_query($conexion, $qMes));
    $datos['ventas_mes'] = (int)$resMes['ventas'];

    //tabla
    $qTabla = "SELECT v.Total, v.Fecha, u.Nombre AS Empleado 
               FROM ventas v 
               JOIN usuario u ON v.Id_Usuario = u.Id_Usuario 
               ORDER BY v.Id_Venta DESC LIMIT 10";
    $resTabla = mysqli_query($conexion, $qTabla);
    $ultimasVentas = [];
    while ($fila = mysqli_fetch_assoc($resTabla)) {
        $fila['Total'] = (float)$fila['Total'];
        $ultimasVentas[] = $fila;
    }
    $datos['ultimas_ventas'] = $ultimasVentas;

    echo json_encode($datos);
}
?>