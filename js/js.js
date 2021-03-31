//global variables
var overLayer;
var capitalMarker;
var countryDataRest;
var capitalTimezone;
var getTime;
var boardingList;
var select;
var weatherData = {};

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

new L.Control.Zoom({ position: 'topright' }).addTo(map);

L.control.scale({ position: 'topleft' }).addTo(map);


//setting country list for navbar and getting geojson data 

$.ajax({
    url: window.location.href + "php/getNavList.php",
    type: 'GET',
    dataType: 'json',
    
    success: function(navList){

        boardingList = navList.data;

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

        $('#countryList option[value=GB]').attr("selected","selected");
    
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
    
    
  
    $.ajax({
        url: window.location.href + "php/getCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            p_code: 1
        },

        success: function(country){

            console.log(country.data.countryName);
            
            highlightCountry(country.data.countryCode);

            //get wikidata weather
            $.ajax({
                url: window.location.href + 'php/getCountry.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    place: country.data.countryName,
                    p_code: 2
                },
                success: function(wiki) {

                    console.log(wiki);
                    $("#wikiData").text(wiki.data.geonames[0].summary);             

                },
                error: function(xhr, status, error){
                    console.log(status);
                }
            });

            //select the country in country list
            if (!select) {
                select = country.data.countryCode;
                $(`#countryList option[value=${country.data.countryCode}]`).attr("selected","selected");
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
            
            //setting the country layer
            if(overLayer) { //deletes the previously polygon on selected country
                overLayer.remove();
            }

            if (capitalMarker) {
                capitalMarker.remove();
            }

            overLayer = L.geoJSON(layerData.data).addTo(map);

            overLayer.on("click", function(layerCoords) {
                
                $.ajax({

                    url: window.location.href + 'php/getWeatherData.php',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        lat: layerCoords.latlng.lat,
                        lng: layerCoords.latlng.lng,
                        p_code: 2
                    },
                    success: function(weather) {

                        overLayer.bindPopup(`<div class=""><h6>${weather.data.name}</h6><img src="https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png" alt="Location name icon" width="40" height="40" />
                        <p>Weather: ${weather.data.weather[0].description}</p>
                        <p>Temp: ${Math.round(weather.data.main.temp)} C</p></div>`);

                    },
                    error: function(xhr, status, error){
                        
                        console.log(status);

                    }
                });

            });
        
            overLayer.bindPopup(``);
                    
        },
        error: function(xhr, status, error){

            if(overLayer) { //deletes the previously polygon on selected country
                overLayer.remove();
            }

            if (capitalMarker) {
                capitalMarker.remove();
            }

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

            // find boarding countries
            var bording = "";

            const countries = boardingList.filter(country => {

                return countryDataRest.borders.includes(country.iso_a3);
                
            });

            countries.forEach(country => {
                bording += country.name + "; ";
            });

            if (bording.length > 0) {
                $("#borders").text("Borders With: " + bording);
            } else {
                $("#borders").text("Borders With: Not boarding with any country");
            }

            // wiki link
            $("#wiki").attr("href",`https://en.wikipedia.org/wiki/${countryInfo.data.name}`);

            //getting capital information
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
    map.flyTo(capitalCoord,5);
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
  
    //get capital weather
        $.ajax({
            url: window.location.href + 'php/getWeatherData.php',
            type: 'POST',
            dataType: 'json',
            data: {
                capital: countryDataRest.capital,
                p_code: 1
            },
            success: function(weather) {

                
                $("#capIcon").attr("src", `https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png`);
                $("#weatherCapLabel").text("Capital Weather");
                $("#capName").text("Capital: " + weather.data.name);
                $("#capitalTemp").text("Temperature: " + Math.round(weather.data.main.temp) + " C");
                $("#maxCapitalTemp").text("The highest possible temperature: " + Math.round(weather.data.main.temp_max) + " C");
                $("#minCapitalTemp").text("The lowest possible temperature: " + Math.round(weather.data.main.temp_min) + " C");
                $("#capHumidity").text("Humidity: " + weather.data.main.humidity + " %");
                $("#capPressure").text("Pressure: " + weather.data.main.pressure + " hPa");
                $("#capDescription").text("Weather: " + weather.data.weather[0].description);
                $("#capWindSpeed").text("Wind Speed: " + weather.data.wind.speed + " m/s");

            },
            error: function(xhr, status, error){
                console.log(status);
            }
        });

}


//modal country data
$("#countryData").bind("show.bs.modal", async function() {  
    
    //get country data
    $('#countryTitle').text(countryDataRest.name);
    $("#flag").attr("src", countryDataRest.flag);
    $("#capital").text("Capital: " + countryDataRest.capital);
    $("#subRegion").text("Sub Region: " + countryDataRest.subregion);
    $("#population").text("Population: " + countryDataRest.population);
    $("#area").text("Area: " + countryDataRest.area + "km"); $("#area").append("<sup>2</sup>");
    $("#language").text("Language: " + countryDataRest.languages[0].name);
    $("#currency").text("Currency: " + countryDataRest.currencies[0].name + " (" + countryDataRest.currencies[0].symbol + ")");

});

//country modal button

$("#changeToWeather").on("click", function(){
    $("#countryDisplay").css("background-image", "url('./images/weatherBack.jpg')");
    $("#changeToWeather").css("background-color", "gray");
    $("#changeToCountry").css("background-color", "#4CAF50");
    $("#countryOnDisplay").addClass("d-none");
    $("#weatherOnDisplay").removeClass("d-none");
    $("#weatherOnDisplay").addClass("d-flex");
});

$("#changeToCountry").on("click", function(){
    $("#countryDisplay").css("background-image", "url('./images/countryDisplay.jpg')");
    $("#changeToCountry").css("background-color", "gray");
    $("#changeToWeather").css("background-color", "#4CAF50");
    $("#countryOnDisplay").removeClass("d-none");
    $("#weatherOnDisplay").removeClass("d-flex");
    $("#weatherOnDisplay").addClass("d-none");
});



//modal wikidata data
$("#wikidata").bind("show.bs.modal",  async function() {
    
   
 
});

//http://api.geonames.org/wikipediaSearchJSON?q=Germany&&maxRows=10&username=gravity1kk