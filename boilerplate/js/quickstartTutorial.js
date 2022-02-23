//creates the map and sets the center and zoom
var map = L.map('map').setView([51.505, -0.09], 13);
//this tileLayer method creates the basemap from the link to a demo OSM.
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
//creates a marker object  at the specified coordinates and adds it to the map layer right away
var marker = L.marker([51.5, -0.09]).addTo(map);
//creates a circle object at the specified coordinates and specifies this circle's style attributes 
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 550
}).addTo(map);
//creates a three-sided polygon object (you may know the name for this type of polygon) at the specified coordinates
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);
//these three lines below call the above variables, turn them into popup objects, and adds respective messages to said popups
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a birble."); //because circles are boring. birbles, though??? :D
polygon.bindPopup("I am a polygon. If you're wondering what sort of polygon, I'm DEFINITELY NOT a triangle. So stop asking.");
//this is an empty popup var to be used in the function below
var popup = L.popup();
//this function makes it so that whenever the map is clicked, a popup spitting out the coordinates on which you just clicked appears
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You blicked the map at " + e.latlng.toString())
        .openOn(map);
}
//creates a click event which triggers the above function
map.on('click', onMapClick);