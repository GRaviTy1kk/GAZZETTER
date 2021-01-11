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

var mymap = L.map('mapid');

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);


function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}
    
mymap.on('click', onMapClick);