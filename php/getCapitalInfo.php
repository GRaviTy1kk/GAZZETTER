<?php

$executionStartTime = microtime(true) / 1000;

if ($_REQUEST['capital'] === "Dili") {
    $_REQUEST['capital'] .= ", East-Timor";
} elseif ($_REQUEST['capital'] === "Saint-Denis") {
    $_REQUEST['capital'] .= ", Réunion";
}

$_REQUEST['capital'] = str_replace ( ' ', '%20', $_REQUEST['capital']);

$url= 'https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['capital'] .'&key=652c6ea5f8aa42ebbe4d3ebd48eed5fd&language=en&pretty=1&no_annotations=1&limit=2';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);

if ($_REQUEST['capital'] === "Tokyo") {
    $decode['results'][0]['components']['city'] = "Tokyo";
} elseif ($_REQUEST['capital'] === "Stanley") {
    $decode['results'][0]['components']['city'] = "Stanley";
} elseif ($_REQUEST['capital'] === "Banjul") {
    $decode['results'][0]['components']['city'] = "Banjul";
} elseif ($_REQUEST['capital'] === "Honiara") {
    $decode['results'][0]['components']['city'] = "Honiara";
} elseif ($_REQUEST['capital'] === "Lobamba") {
    $decode['results'][0]['components']['city'] = "Lobamba";
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>