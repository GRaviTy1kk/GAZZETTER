var style2 = {
	color: 'green'
};

var highlight = {
	color: 'red'
};

$(window).on('load', function() {
    
    //get current location
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            myLatitude = position.coords.latitude;
            myLongitude = position.coords.longitude;
            console.log(myLatitude, myLongitude);
            map.setView([myLatitude, myLongitude], 8);
            var myLocation = L.marker([myLatitude, myLongitude]).addTo(map);
        });
    }

    //preloader
    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
            $(this).remove();
        });
    } 

  });

// init map
var map = L.map('mapid').setView([48.019324, 11.57959], 6);

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//select a country
function onMapClick(e) {
    console.log(e.latlng);
    $.ajax({
        url: "http://localhost/GAZZETTER/php/getCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        },
        success: function(country){
            console.log(country);
            highlightCountry(country.data.countryCode);

        },
        error: function(xhr, status, error){
            console.log(status);
        }
    });
}

map.on('click', onMapClick);




function highlightCountry(name){

var assembly = L.geoJSON(null, {
    onEachFeature: forEachFeature2,
    style: style2
  }).addTo(map);
  
$.getJSON('http://localhost/GAZZETTER/js/countryBorders.geo.json', function(data){
    assembly.addData(data);
});


	
function forEachFeature2(e) {
    var group = e.target,
    layer = e.layer;
    
    group.setStyle(style2);
    layer.setStyle(highlight);
}
			
 
assembly.on("click", onFeatureGroupClick);

function onFeatureGroupClick(e) {
	var group = e.target,
  		layer = e.layer;
  
    group.setStyle(style2);
    layer.setStyle(highlight);
    
}

function forEachFeature2(feature, layer) {
    layer.on("click", function(e) {
      assembly.setStyle(style2); //<<< layername is assembly
      layer.setStyle(highlight);
    });
}

}