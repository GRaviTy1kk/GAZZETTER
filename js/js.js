//global variables
var overLayer;
var capitalMarker;
var countryDataRest;
var capitalTimezone;
var getTime;
var boardingList;
var weatherData = {local: {}, cap: {}};

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
            lng: e.latlng.lng
        },

        success: function(country){
            
            highlightCountry(country.data.countryCode);
            
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

                        overLayer.bindPopup(`<div><h5>${weather.data.name}</h5><p>${Math.round(weather.data.main.temp)}</p>
                        <img src="https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@2x.png" alt="Location name icon" width="40" height="40" />
                        <p>${weather.data.weather[0].description}</p></div>`);

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

                $("#onClickWeather").text("");
                $("#locName").text("");

                weatherData.cap.name = weather.data.name;
                weatherData.cap.temp = Math.round(weather.data.main.temp);
                weatherData.cap.tempMax = Math.round(weather.data.main.temp_max);
                weatherData.cap.tempMin = Math.round(weather.data.main.temp_min);
                weatherData.cap.humidity = weather.data.main.humidity;
                weatherData.cap.pressure = weather.data.main.pressure;
                weatherData.cap.icon = weather.data.weather[0].icon;
                weatherData.cap.description = weather.data.weather[0].description;
                weatherData.cap.windSpeed = weather.data.wind.speed;

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


    //get capital weather
    if (weatherData.cap.name) {

        if (weatherData.cap.icon) {
            $("#capIcon").attr("src", `https://openweathermap.org/img/wn/${weatherData.cap.icon}@2x.png`);
            $("#localIcon").attr("class", "d-inline");
        } else {
            $("#capIcon").attr("src", window.location.href + 'images/weatherIcons/windSpeed.png');
        }

        $("#weatherCapLabel").text("Capital Weather");
        $("#capName").text("Capital: " + weatherData.cap.name);
        $("#capitalTemp").text("Temperature: " + weatherData.cap.temp + " C");
        $("#maxCapitalTemp").text("The highest possible temperature: " + weatherData.cap.tempMax + " C");
        $("#minCapitalTemp").text("The lowest possible temperature: " + weatherData.cap.tempMin + " C");
        $("#capHumidity").text("Humidity: " + weatherData.cap.humidity + " %");
        $("#capPressure").text("Pressure: " + weatherData.cap.pressure + " hPa");
        $("#capDescription").text("Weather: " + weatherData.cap.description);
        $("#capWindSpeed").text("Wind Speed: " + weatherData.cap.windSpeed + " m/s");

    } else {
        $("#weatherCapLabel").text("Select any country to get its capital weather");
    }

});

//country modal button

$("#changeToWeather").on("click", function(){
    $("#countryDisplay").css("background-image", "url('./images/weatherBack.jpg')");
    $("#countryOnDisplay").addClass("d-none");
    $("#weatherOnDisplay").removeClass("d-none");
    $("#weatherOnDisplay").addClass("d-flex");
});

$("#changeToCountry").on("click", function(){
    $("#countryDisplay").css("background-image", "url('./images/countryDisplay.jpg')");
    $("#countryOnDisplay").removeClass("d-none");
    $("#weatherOnDisplay").removeClass("d-flex");
    $("#weatherOnDisplay").addClass("d-none");
});



//modal wikidata data
$("#wikidata").bind("show.bs.modal",  async function() {
    
   
 
});
