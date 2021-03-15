<?php

$executionStartTime = microtime(true) / 1000;

$str = file_get_contents('countryBorders.geo.json');

$decode = json_decode($str,true);

foreach ($decode["features"] as $value) {
    $navList[] = Array("iso_a2" => $value["properties"]["iso_a2"], "name" => $value["properties"]["name"],
     "iso_a3" => $value["properties"]["iso_a3"]); 
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $navList;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>