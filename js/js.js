//global variables 
var overLayer;
var layerData;
var countrySelAtr;
var capitalMarker;
var countryDataRest;
var weatherData;
var coordinates;

// init map
var map = L.map('mapid', {
    zoomControl: false
});

var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    noWrap: true,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

//setting country list for navbar and getting geojson data 
$.getJSON('http://localhost/GAZZETTER/php/countryBorders.geo.json', function(data){
    layerData = data;
    
    //creating navbar
    data.features.forEach(x => {
        if (x.properties.iso_a2 == -99) {
          return;
        }
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
    navigator.geolocation.getCurrentPosition(function(position){

        if (position.coords) {
            
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
        } else {
            map.setView([51.505, -0.09], 5);
        }
    });  
    
    map.setView([51.505, -0.09], 5);
    

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

    coordinates = [e.latlng.lat, e.latlng.lng];

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
        },
        error: function(xhr, status, error){
            console.log("you clicked on a waterface");
        }
    });
}


function highlightCountry(code){
    //setting the country layer
    if(overLayer) { //deletes the previously polygon on selected country
        overLayer.remove();
    }

    overLayer = L.geoJSON(layerData, {
        onEachFeature: function(feature, layer) { 
            
        },
        filter: function (feature) {
            
            if (feature.properties.iso_a2 === code) {          
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
            country_code: code
        },

        success: function (countryInfo) {

            console.log(countryInfo.data);

            countryDataRest = countryInfo.data;

            $("#wiki").attr("href",`https://en.wikipedia.org/wiki/${countryInfo.data.name}`);

            $.ajax({
                url: 'http://localhost/GAZZETTER/php/getCapitalInfo.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    capital: countryInfo.data.capital
                },

                success: function(capitalInfo) {
                    
                    if (capitalInfo.data.results[0].components.city) {
                        capitals(capitalInfo.data.results[0]);
                    } else {
                        capitals(capitalInfo.data.results[1]);
                    }
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

    console.log(capitalInfo);

    if (capitalMarker) {
        capitalMarker.remove();
    }

    var cCor = capitalInfo.geometry;
    capitalCoord = [cCor.lat, cCor.lng];
    map.setView(capitalCoord, 5);
    capitalMarker = new L.marker(capitalCoord).addTo(map);
    capitalMarker.bindPopup(`<b>${capitalInfo.components.city}</b>`).openPopup(); 
}

//modal country data
$("#countryData").bind("show.bs.modal", async function() {

    $('#countryTitle').text(countryDataRest.name);

    $("#flag").attr("src", countryDataRest.flag);
    $("#capital").text("Capital: " + countryDataRest.capital);
    $("#subRegion").text("Sub Region: " + countryDataRest.subregion);
    $("#population").text("Population: " + countryDataRest.population);
    $("#area").text("Area: " + countryDataRest.area + "km"); $("#area").append("<sup>2</sup>");
    $("#language").text("Language: " + countryDataRest.languages[0].name);
    $("#currency").text("Currency: " + countryDataRest.currencies[0].name + " (" + countryDataRest.currencies[0].symbol + ")");

    // find boarding countries
    var bording = "";

    const countries = layerData.features.filter(country => {

        return countryDataRest.borders.includes(country.properties.iso_a3);
        
    });

    countries.forEach(country => {
        bording += country.properties.name + "; ";
    });

    if (bording.length > 0) {
        $("#borders").text("Borders With: " + bording);
    } else {
        $("#borders").text("Borders With: Not boarding with any country");
    }

});


//modal waether data
$("#waether").bind("show.bs.modal", function() {

   $.ajax({
    url: 'http://localhost/GAZZETTER/php/getWeatherData.php',
    type: 'POST',
    dataType: 'json',
    data: {
        capital: countryDataRest.capital,
        p_code: 1
    },
    success: function(weather) {

        console.log(weather);
        //$("#capitalWeather").text("Weather: " + weather);

    },
    error: function(xhr, status, error){
        console.log(status);
    }
   });

   $.ajax({
    url: 'http://localhost/GAZZETTER/php/getWeatherData.php',
    type: 'POST',
    dataType: 'json',
    data: {
        lat: coordinates[0],
        lng: coordinates[1],
        p_code: 2
    },
    success: function(weather) {

        console.log(weather);
        //$("#onClickWeather").text("Weather: " + weather);

    },
    error: function(xhr, status, error){
        console.log(status);
    }
   });

});

