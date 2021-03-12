<?php

$executionStartTime = microtime(true) / 1000;

$str = file_get_contents('countryBorders.geo.json');

$decode = json_decode($str,true);

$decode["features"][0]["geometry"];

foreach ($decode["features"] as $value) {
    if ($value["properties"]["iso_a2"] == $_REQUEST["code"]) {
        $countryBorder = $value;
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $countryBorder;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>