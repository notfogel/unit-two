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
//hoo boy here weeee goooo (it's Air Jordan on my flip flops, and...)
function pointToLayer(feature, latlng, attributes){
    //determine hwhitch attribute to visual-eyes w/ proportional symbolz
    var attribute = attributes[0];
    //cre8 marker optionz
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //forEachFeature, determine its value for teh selected_attribUte
    var attValue = Number(feature.properties[attribute]);

    //give each feature's birble marker a radius based on its attValue
    options.radius = calcPropRadius(attValue);

    //cre8 birble marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content strng
    var popupContent = "<p><b>States:</b> " + feature.properties.State + "</p><p><b>" + "Anti-Trans Bills Proposed" + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the birble marker
    layer.bindPopup(popupContent);

    //returm birble marker to the L.geoJSON pointToLayer option
    return layer;
};
//now it's time to make some symbolz
function createPropSymbols(data, attributes){
    //cre8 a leaflet geojson layer & add it 2 tha mapppp
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
    
};
//this here fxn will create an array of the sequential attributez to keep track of their order
//may have to reverse the order this fxn assigns later on, or maybe my map will just count years backwards idk both seem ok to me
//or or or! I can just go directly into the csv and reverse the order! that seems way way easier than writing a reverse-loop. this is mostly just a note for future Sammy.
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("num") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};


//sequence ctls baby!!!
function createSequenceControls(attributes){
    //let's spawn a range input element (aka slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    //I only have 6 timestaps for now so max set to 5 instead of 6 as in example
    document.querySelector('.range-slider').max = 5;
    document.querySelector('.range-slider').min = 0;
    document.querySelector('.range-slider').value = 0;
    document.querySelector('.range-slider').step = 1;
    //let's add some buttons!!!!!
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse">Reverse</button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward">Forward</button>');
    //these simply must be fixed they are massive, also I'll have to do the CC attribution
    document.querySelector('#reverse').insertAdjacentHTML('beforeend','<img src="img/reverse.png">'); 
    document.querySelector('#forward').insertAdjacentHTML('beforeend','<img src="img/forward.png">');

    //Step 5: click listener for buttons (my buttons still suck as of rn lol)
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            
            //increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                //Step 7: if past the last attribute, wrap around to first attribute
                index = index > 5 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //Step 7: if past the first attribute, wrap around to last attribute
                index = index < 0 ? 5 : index;
            };

            //update slider
            document.querySelector('.range-slider').value = index; 

            updatePropSymbols(attributes[index]);
        })
    })
    
    //Step 5: input listener for slider (we love the slider tho!!!!)
    document.querySelector('.range-slider').addEventListener('input', function(){            
        var index = this.value;
        
        updatePropSymbols(attributes[index]);
    });


};
//update the symbols as the index changes with the slideyguy
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            //update each feature's radius based on new attValues
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            //add state to popup content string
            var popupContent = "<p><b>State:</b> " + props.State + "</p>";
            //this stuff below here needs to be tweaked
            //add formatted attribute to panel content string
            //problems: for some reason once I added this section (186-197) most of the points stopped moving with the index
            //in fact, it seems like only AL is updating? which means something with a loop somewhere must be broken?
            //problems: the popups do not update when I scroll between (i wonder if these 2 things are related (probably))
            popupContent += "<p><b>Anti-Trans Bills Proposed " + feature.properties.State + ":</b> " + props[attribute] + "</p>";

            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent).update();            
            
        };
    });
};

function getData(){
    fetch("data/antitranslaws_15gap_17gap.geojson")
        .then(function(response){
            return response.json();
    })
    .then(function(json){
        //doin some attribute stuff with arrays or something
        var attributes = processData(json);
        
        //calculate minimum data value (not yet tho since loop still bunk)
        //minValue = calculateMinValue(json);
        minValue = 1;
        //call that fxn and create those proportional symbolz!
        createPropSymbols(json, attributes);
        createSequenceControls(attributes);
    })        
};
//the line below this one activates all the stuff above this line once the DOM hath loaded
document.addEventListener('DOMContentLoaded',createMap)

