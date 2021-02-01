<?php

$executionStartTime = microtime(true) / 1000;

$_REQUEST['capital'] = str_replace ( ' ', '%20', $_REQUEST['capital']);

$url= 'https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['capital'] .'&key=652c6ea5f8aa42ebbe4d3ebd48eed5fd&language=en&pretty=1&no_annotations=1&limit=2';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL,$url);

$result=curl_exec($ch);

curl_close($ch);

$decode = json_decode($result,true);	

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "mission saved";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>