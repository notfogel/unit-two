//this map method creates the map, center and zoom set the coordinates for the center and zoom level 
var map = L.map('map', {
    center: [39.75,-105],
    zoom: 3.5
});
//this tileLayer method creates the basemap from the link to a demo OSM. copied shamelessly from quickstartTutorial.js 
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
//this method comes from geoJSON, not Leaflet, and creates a feature with the attributes designed below
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
//same deal, this comes from geoJSON, not Leaflet itself, hence the plain-ish text (as compared to like, L.whatever)
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];
//once again, a geoJSON method, not a Leaflet one. hence the way it's incorporated below (i.e.: L.geoJSON)
var myStyle = {
    "color": "red",
    "weight": 5,
    "opacity": 1
};
//geoJSON built in method. boy does this JSON guy know a whole lot of stuff
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//function attaching popup functionality to a geoJSON feature before the geoJSON layer is formally called through L.geoJSON (below_)
function onEachFeature(feature,layer){
    if (feature.properties && feature.properties.popupContent){
        layer.bindPopup(feature.properties.popupContent);
    }
}
//now this sure is a robust geoJSON, with all kinds of attributes (which may come into play later)
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];
//this geoJSON appendage assigns style to the state polygon depending on the value of its feature:party (i.e. dem/gop)
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map); //append that jawn to tha map!!!!
//this line calls the feature from before and runs the popup assignment function on it before adding it to the map layer
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);
//here we're creating a feature with the style attributes of the markeroptions var, hence our orange ball which exists at the same spot as coors field
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
//adds the lines from above with myStyle as specified above to the map layer
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map); 