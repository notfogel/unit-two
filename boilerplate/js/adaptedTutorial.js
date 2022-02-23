//I'm letting examples tell me what to do :(,,,uhhh I mean, creates an empty var called map to be filled below with mappy goodness
var map;
//aforementioned function by which I am a bit horrified
function createMap(){
   map = L.map('map', {
        center: [20,0],
        zoom: 2
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    //call the uh, getData fxn
    getData();
};
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};
function getData(){
    fetch("data/MegaCities.geojson")
        .then(function(response){
            return response.json();
    })
    .then(function(json){
        L.geoJSON(json, {
            onEachFeature: onEachFeature
            
        }).addTo(map);
    });     
};
//the line below this one activates all the stuff above this line once the DOM hath loaded
document.addEventListener('DOMContentLoaded',createMap)

//at the moment I am at an absolute loss for how to make the feature points into dots. I might just ignore it in favor of the (probably more important) leaflet data points portion lol
