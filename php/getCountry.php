<?php

$executionStartTime = microtime(true) / 1000;

if($_REQUEST['p_code'] == 1) {
    $url='http://api.geonames.org/countryCodeJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=gravity1kk';
} elseif ($_REQUEST['p_code'] == 2) {
    $_REQUEST['place'] = str_replace ( ' ', '%20', $_REQUEST['place']);
    $url= 'http://api.geonames.org/wikipediaSearchJSON?title=' . $_REQUEST['place'] . '&maxRows=1&username=gravity1kk';
}

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