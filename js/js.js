//global variables
var overLayer;

// init map
var map = L.map('mapid').setView([48.019324, 11.57959], 5);

var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

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


//select a country
function onMapClick(e) {
    console.log(e);

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

map.on('click', onMapClick);


function highlightCountry(name){

    console.log(name);
    if (name) {
        $('#mapid').addClass("newMap");
    } else {
        $('#mapid').removeClass("newMap");
    }

    $.getJSON('http://localhost/GAZZETTER/php/countryBorders.geo.json', function(data){

        if(overLayer) { //deletes the previously polygon on selected country
            overLayer.remove();
        }

        overLayer = L.geoJSON(data, {
            onEachFeature: function(feature, layer) { 
                
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

    });

}