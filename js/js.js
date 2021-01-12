$(window).on('load', function() {
    
    //get current location
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            myLatitude = position.coords.latitude;
            myLongitude = position.coords.longitude;
            console.log(myLatitude, myLongitude);
            mymap.setView([myLatitude, myLongitude], 8);
            var myLocation = L.marker([myLatitude, myLongitude]).addTo(mymap);
        });
    }

    //preloader
    if ($('#preloader').length) {
        $('#preloader').delay(100).fadeOut('slow', function () {
            $(this).remove();
        });
    } 

  });

var mymap = L.map('mapid').setView([48.019324, 11.57959], 6);

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);


function onMapClick(e) {
    //console.log(e);

$.ajax({
	url: `http://localhost/GAZZETTER/php/countryBorders2.geo.json`,
	dataType: 'json',
	success: function(countries) {

        console.log(countries);

        L.geoJSON(countries, {
            style: {
                "color": "#ff7800",
                "weight": 5,
                "opacity": 0.65
            },
            pointToLayer: function (feature, latlng) {
                console.log(latlng);
                return L.circleMarker(latlng, {
                    radius: 8,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            }
        }).bindPopup(function(layer) {
            return layer.feature.properties.name;
        }).addTo(mymap);

        //mymap.fitBounds(countries.features);
			
		},
		error: function(xhr, status, error) {
				console.log("erroe with ajax call for bordersJSON");
		}
});
} 
mymap.on('click', onMapClick);

/*mymap.on('click', function(e){
    $.ajax({ url:'http://maps.googleapis.com/maps/api/geocode/json?latlng='+e.latlng.lat+','+e.latlng.lng+'&sensor=true',
    success: function(data){
    var state = data.results[0].address_components[5].long_name;
    var country = data.results[0].address_components[6].long_name;
    var zip = data.results[0].address_components[7].long_name;
    $('.leaflet-popup-content').text(state+' '+country+' '+zip);
    console.log(data.results[0]);
    }
    });
    popup.setLatLng(e.latlng).setContent('').openOn(mymap);
    });*/