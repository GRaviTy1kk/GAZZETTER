//global variables 
var overLayer;
var layerData;
var countrySelAtr;
var capitalMarker;
// init map
var map = L.map('mapid');

var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


//setting country list for navbar and getting geojson data 
$.getJSON('http://localhost/GAZZETTER/php/countryBorders.geo.json', function(data){
    layerData = data;

    //creating navbar
    data.features.forEach(x => {
        $("#countryList").append(`<option value=${x.properties.iso_a2}>${x.properties.name}</option>`);
    });

    //sorting navbar
    var options = $("#countryList option");       
    options.detach().sort( (a,b) => {
        var at = $(a).text();
        var bt = $(b).text();
        return (at > bt)?1:((at < bt)?-1:0);
    });
    options.appendTo("#countryList");

    
    //selecting a country
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
    } else {
        map.setView([51.505, -0.09], 5);
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
            
            //selecting a country in navbar
            if (!countrySelAtr) {
                countrySelAtr = country.data.countryCode;
                $(`#countryList option[value=${countrySelAtr}]`).attr("selected","selected");
            } 

            //map.setView([e.latlng.lat, e.latlng.lng], 5);
        
        },
        error: function(xhr, status, error){
            console.log(status);
        }
    });
}


function highlightCountry(name){
    //setting the country layer
    if(overLayer) { //deletes the previously polygon on selected country
        overLayer.remove();
    }

    overLayer = L.geoJSON(layerData, {
        onEachFeature: function(feature, layer) { 
            
        },
        filter: function (feature) {
            
            if (feature.properties.iso_a2 === name) {          
                return true;
            }
        }
    }).bindPopup(function(layer) {
        return layer.feature.properties.name;
    }).addTo(map);

    //working with country data
    $.ajax({
        url: 'http://localhost/GAZZETTER/php/countryInfo.php',
        type: "POST",
        dataType: "json",
        data: {
            country_code: name
        },
        success: function (countryInfo) {
            console.log(countryInfo);

            $.ajax({
                url: 'http://localhost/GAZZETTER/php/getCapitalInfo.php',
                type: 'Post',
                dataType: 'json',
                data: {
                    capital: countryInfo.data.capital
                },
                success: function(capitalInfo) {
                    capitals(capitalInfo);
                },
                error: function(xhr, status, error){
                    console.log(status);
                }
            });
        },

        error: function(xhr, status, error){
            console.log(status);
        }
    });

}

function capitals(capitalInfo) {
    if (capitalMarker) {
        capitalMarker.remove();
    }
    var cCor = capitalInfo.data.results[0].geometry;
    capitalCoord = [cCor.lat, cCor.lng];
    map.setView(capitalCoord, 5);
    capitalMarker = new L.marker(capitalCoord).addTo(map);
    capitalMarker.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();
}
