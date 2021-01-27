//global variables 
var overLayer;
var layerData;
// init map
var map = L.map('mapid').setView([48.019324, 11.57959], 5);

var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


//setting country list for navbar and getting geojson data 
$.getJSON('http://localhost/GAZZETTER/php/countryBorders.geo.json', function(data){
    layerData = data;

    data.features.forEach(x => {
        $("#countryList").append(`<option value=${x.properties.iso_a2}>${x.properties.name}</option>`);
    });

    
    var options = $("#countryList option");       
    options.detach().sort(function(a,b) {
        var at = $(a).text();
        var bt = $(b).text();
        return (at > bt)?1:((at < bt)?-1:0);
    });
    options.appendTo("#countryList");

    $('#countryList').change(function(){ 
            var countrySelected = $(this).val();
            highlightCountry(countrySelected);
    });
});

//onload operations
$(window).on('load', function() {
    
    //get current location
    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(function(position){
            myLatitude = position.coords.latitude;
            myLongitude = position.coords.longitude;
            map.setView([myLatitude, myLongitude], 5);
            var myLocation = L.marker([myLatitude, myLongitude]).addTo(map);

            //onload choose country
            var cordinata = {latlng: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }};
            onMapClick(cordinata);  
        });  
    }

    //preloader
    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
            $(this).remove();
        });
    }

  });

map.on('click', onMapClick);

//select a country
function onMapClick(e) {

    $.ajax({
        url: "http://localhost/GAZZETTER/php/getCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        },
        success: function(country){

            highlightCountry(country.data.countryCode);

        },
        error: function(xhr, status, error){
            console.log(status);
        }
    });
}


function highlightCountry(name){

    if(overLayer) { //deletes the previously polygon on selected country
        overLayer.remove();
    }

    overLayer = L.geoJSON(layerData, {
        onEachFeature: function(feature, layer) { 
            //console.log(feature);
            //console.log(layer);
        },
        filter: function (feature) {
                
            if (feature.properties.iso_a2 === name) {          
                return true;
            }
        },
        style: null
    }).bindPopup(function(layer) {
        return layer.feature.properties.name;
    }).addTo(map);
    //map.setView();
}