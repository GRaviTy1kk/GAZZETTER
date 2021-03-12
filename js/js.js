//global variables 
var overLayer;
var countrySelAtr;
var capitalMarker;
var countryDataRest;
var weatherData;
var coordinates;
var capitalTimezone;
var getTime;

// init map
var map = L.map('mapid', {
    zoomControl: false,
    minZoom: 2
});

var openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    noWrap: true,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);


//setting country list for navbar and getting geojson data 

$.ajax({
    url: window.location.href + "php/getNavList.php",
    type: 'GET',
    dataType: 'json',
    
    success: function(navList){
        
        console.log(navList);

        navList.data.forEach(x => {
            if (x.iso_a2 == -99) {
              return;
            }
            $("#countryList").append(`<option value=${x.iso_a2}>${x.name}</option>`);
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
        

    },
    error: function(xhr, status, error){
        console.log("you clicked on a waterface");
    }
});


//onload operations
$(window).on('load', function() {
    
    //get current location    
    navigator.geolocation.getCurrentPosition(function(position){

        if (position.coords) {
            
            myLatitude = position.coords.latitude;
            myLongitude = position.coords.longitude;
            map.setView([myLatitude, myLongitude], 5);
            var myLocation = L.marker([myLatitude, myLongitude]).bindPopup("My Location").addTo(map);

            //onload choose country
            var cordinata = {latlng: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            }};
            onMapClick(cordinata);
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
        url: window.location.href + "php/getCountry.php",
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


    $.ajax({
        url: window.location.href + "php/getBordersCoords.php",
        type: 'POST',
        dataType: 'json',
        data: {
            code: code
        },

        success: function(layerData){
            
            console.log(layerData);
            //setting the country layer
            if(overLayer) { //deletes the previously polygon on selected country
                overLayer.remove();
            }

            overLayer = L.geoJSON(layerData.data
            ).bindPopup(function(layer) {
                return layer.feature.properties.name;
            }).addTo(map);
                    
        },
        error: function(xhr, status, error){
            console.log("you clicked on a waterface");
        }
    });


    //working with country data
    $.ajax({
        url: window.location.href + 'php/countryInfo.php',
        type: "POST",
        dataType: "json",
        data: {
            country_code: code
        },

        success: function (countryInfo) {

            countryDataRest = countryInfo.data;

            $("#wiki").attr("href",`https://en.wikipedia.org/wiki/${countryInfo.data.name}`);

            $.ajax({
                url: window.location.href + 'php/getCapitalInfo.php',
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

async function capitals(capitalInfo) {

    if (capitalMarker) {
        capitalMarker.remove();
    }

    var cCor = capitalInfo.geometry;
    capitalCoord = [cCor.lat, cCor.lng];
    map.setView(capitalCoord, 5);
    capitalMarker = new L.marker(capitalCoord).addTo(map);
    capitalMarker.bindPopup(`<b>${capitalInfo.components.city}</b>`).openPopup();

    if (!capitalTimezone || capitalTimezone !== capitalInfo.annotations.timezone.name ) {

        capitalTimezone = capitalInfo.annotations.timezone.name;

        clearInterval(getTime);

        $("#time").empty();

        var d1 = new Date();

        var d2 = new Date( d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds() );

        var utc = Math.floor(d2.getTime()/ 1000);

        var date  = new Date((utc + capitalInfo.annotations.timezone.offset_sec)*1000);

        getTime =  setInterval(function(){

            date.setSeconds( date.getSeconds() + 1 );
            $("#time").text(countryDataRest.capital + " date and time: " + date.toLocaleDateString("en-US") + " " + date.toLocaleTimeString("en-US"));

        }, 1000);
        
    }
}


//modal country data
$("#countryData").on("show.bs.modal", async function() {  

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
$("#waether").bind("show.bs.modal",  async function() {

    if (countryDataRest.capital) {
        $.ajax({
            url: window.location.href + 'php/getWeatherData.php',
            type: 'POST',
            dataType: 'json',
            data: {
                capital: countryDataRest.capital,
                p_code: 1
            },
            success: function(weather) {

                console.log(weather);
                $("#capitalWeather").text(countryDataRest.capital + " Weather: " + weather.data.main.temp);
                $("#capName").text(countryDataRest.capital + " Weather: " + weather.data.name);

            },
            error: function(xhr, status, error){
                console.log(status);
            }
        });
    }

    if (coordinates) {

        $.ajax({
            url: window.location.href + 'php/getWeatherData.php',
            type: 'POST',
            dataType: 'json',
            data: {
                lat: coordinates[0],
                lng: coordinates[1],
                p_code: 2
            },
            success: function(weather) {

                console.log(weather);
                $("#onClickWeather").text("Local weather: " + weather.data.main.temp);
                $("#locName").text("Local weather: " + weather.data.name);
            },
            error: function(xhr, status, error){
                console.log(status);
            }
        });
    }

});

