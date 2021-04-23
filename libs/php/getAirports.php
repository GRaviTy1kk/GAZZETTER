<?php

$executionStartTime = microtime(true) / 1000;

$str = file_get_contents('../data/airports.json');

$decode = json_decode($str,true);

foreach ($decode['airports'] as $value) {

    if ($value['city'] == 'Null') {

        $value['city'] = "City Not Found";
    }

    if ($value["country"] == $_REQUEST['country']) {
        $airports[] = Array("name" => $value["name"], "country" => $value["country"],
        "city" => $value["city"], "lat" => $value["lat"], "lng" => $value["lng"]);
    }

}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $airports;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>