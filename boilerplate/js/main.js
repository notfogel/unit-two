var map;
var minValue = 1

function createMap(){
    //the creation of map
    map = L.map('map', {
        center: [40,-98.5],
        zoom: 4
    });
    //adding OSM tilelayerrrrr
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    
    //call the uh, getData fxn
    getData(map);
};
//creating a minValue fxn for proportional scaling 
/* commenting this fxn out for now til I can get this loop to function bc 0-values are messing it up rn
function calculateMinValue(data){
    //creation of empty array for to store all data valuez
    var allValues = [];
    //a loop, which loops thru each uh oh I don't have any cities in here let's hope my state_unit is equivalent
    for(var state of data.features){
        //loop thru each year hooo boy let's get it
        for(var year = 2016; year <= 2022; year+=1){
            //get num_bills for current year
            var value = state.properties["num_bills_"+ String(year)];
            //since i'm missing data for 2017 i had to write a brief conditional so the loop keeps moving
            if(year === 2017) { continue; }
            //add value to array
            allValues.push(value);
        }
    }
    console.log(allValues);
    //get min value of our array
    var minValue = Math.min(...allValues)
    console.log(minValue)
    return minValue;
} */
//now it's time to calculate the radius of each and every proportional symbol
function calcPropRadius(attValue){
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    return radius;
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
//now it's time to make some symbolz
function createPropSymbols(data){
    
    var attribute = "num_bills_2022";

    
    //let's cre8 some marker optionz
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //cre8 leaflet geojson layerrr & add it 2 tha map
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng){
            //for each feature, determine its value 4 tha selected attribute
            var attValue = Number(feature.properties[attribute]);

            //give each feature's birble marker a radius based on its attValue
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            
            //create birbleMarkerz
            return L.circleMarker(latlng,geojsonMarkerOptions);
        }
    }).addTo(map);
};


function getData(){
    fetch("data/antitranslaws_15gap_17gap.geojson")
        .then(function(response){
            return response.json();
    })
    .then(function(json){
        //calculate minimum data value (not yet tho since loop still bunk)
        //minValue = calculateMinValue(json);
        //call that fxn and create those proportional symbolz!
        createPropSymbols(json);
    })        
};
//the line below this one activates all the stuff above this line once the DOM hath loaded
document.addEventListener('DOMContentLoaded',createMap)

