<?php

$executionStartTime = microtime(true) / 1000;

$str = file_get_contents('../data/mountains.json');

$decode = json_decode($str,true);

foreach ($decode["mountains"] as $value) {

    if ($value["country"] == $_REQUEST['country']) {

        $mountains[] = Array("name" => $value["name"], "metres" => $value["metres"], "lat" => $value["lat"], "lng" => $value["lon"]);
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $mountains;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>