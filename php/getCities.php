<?php

$executionStartTime = microtime(true) / 1000;

$str = file_get_contents('cities.json');

$decode = json_decode($str,true);

foreach ($decode as $value) {

    if ($value["country"] == $_REQUEST['code']) {
        $cities[] = Array("city" => $value["name"], "country" => $value["country"],
        "lat" => $value["lat"], "lng" => $value["lng"]);
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $cities;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>