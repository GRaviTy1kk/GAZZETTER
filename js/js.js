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
            //console.log(myLatitude, myLongitude);
            myLatitude = position.coords.latitude;
            myLongitude = position.coords.longitude;
            map.setView([myLatitude, myLongitude], 5);
            var myLocation = L.marker([myLatitude, myLongitude]).addTo(map);
            
            
            console.log(mapObj);
            onMapClick(mapObj, position);
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
function onMapClick(e, position) {
    console.log(e.latlng);
    if (position) {
        e.latlng.lat=position.coords.latitude;
        e.latlng.lng=position.coords.longitude;
        return true;
    }
    $.ajax({
        url: "http://localhost/GAZZETTER/php/getCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        },
        success: function(country){
            //console.log(country);

            highlightCountry(country.data.countryCode);

        },
        error: function(xhr, status, error){
            console.log(status);
        }
    });
}

map.on('click', onMapClick);


function highlightCountry(name){

    $.getJSON('http://localhost/GAZZETTER/php/countryBorders.geo.json', function(data){

        if(overLayer) { //deletes the previously polygon on selected country
            overLayer.remove();
        }

        overLayer = L.geoJSON(data, {
            onEachFeature: function(feature, layer) { 
                
            },
            filter: function (feature) {
                console.log(feature);
                if (feature.properties.iso_a2 === name) {
                    //map.fitBounds(this.getBounds());
                    return true;
                }
            },
            style: null
        }).bindPopup(function(layer) {
            return layer.feature.properties.name;
        }).addTo(map);

    });

}