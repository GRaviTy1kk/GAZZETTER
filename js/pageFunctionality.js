//country modal button

$("#changeToWeather").on("click", function(){
    $("#countryDisplay").css("background-image", "url('./images/weatherOnBack.jpg')");
    $("#countryOnDisplay").addClass("d-none");
    $("#weatherOnDisplay").removeClass("d-none");
    $("#weatherOnDisplay").addClass("d-flex");
    $("#changeToCountry").removeClass("d-none");
    $("#changeToWeather").addClass("d-none");
});

$("#changeToCountry").on("click", function(){
    $("#countryDisplay").css("background-image", "url('./images/countryOnDisplay.jpg')");
    $("#countryOnDisplay").removeClass("d-none");
    $("#weatherOnDisplay").removeClass("d-flex");
    $("#weatherOnDisplay").addClass("d-none");
    $("#changeToWeather").removeClass("d-none");
    $("#changeToCountry").addClass("d-none");
});

