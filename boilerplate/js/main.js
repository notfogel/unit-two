//global var alert!!!!! weewoooo
var map;
var minValue = 1 //I experiemented w/ commenting this out and it doesn't seem to need to exist but...leaving it for safekeeping
var dataStats = {};
console.log("you're doing great! almost done!");

function createMap(){
    //the creation of map
    map = L.map('map', {
        center: [40,-98.5],
        zoom: 3.4
    });
    //adding OSM tilelayerrrrr
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Forward/Reverse buttons by Saepul Nahwan, used under CC'}).addTo(map);
    
    //call the uh, getData fxn
    getData(map);
};
//creating a minValue fxn for proportional scaling 
//commenting this fxn out for now til I can get this loop to function bc 0-values are messing it up rn
//ok so I'm diving back into this old friend(enemy) and it hasn't broken the map yet bc there's no uncommented reference to it :)
function calcStats(data){
    //creation of empty array for to store all data valuez
    var allValues = [];
    //a loop, which loops thru each uh oh I hope this loop specific to my data I wrote 2 week ago that never got tested actually works
    for(var state of data.features){
        //loop thru each year hooo boy let's get it
        for(var year = 2022; year >= 2016; year-=1){
            //get num_bills for current year
            var value = state.properties["bills_"+ String(year)];
            //since i'm missing data for 2017 i had to write a brief conditional so the loop keeps moving
            if(year === 2017) { continue; }
            //add value to array
            allValues.push(value);
        }
    }
    console.log(dataStats);
    //min,max,mean stats for our array
    //dataStats.min = Math.min(...allValues); //discarding the real min (at least for now) bc it's equal to 0
    dataStats.min = 1 
    //although I guess the dataStats var isn't being used anywhere yet
    dataStats.max = Math.max(...allValues);
    //calculate meanValue
    var sum = allValues.reduce(function(a, b){return a+b;});
    dataStats.mean = sum/ allValues.length;
    
}

//now it's time to calculate the radius of each and every proportional symbol
function calcPropRadius(attValue){
    //constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    //Flannery formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    return radius;
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
    var year = attribute.split("_")[1];
    //build popup content strng
    var popupContent = new PopupContent(feature.properties, attribute);

    //bind the popup to the birble marker
    layer.bindPopup(popupContent.formatted);

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
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("bills") > -1){
            attributes.push(attribute);
        };
    };
    return attributes;
};
//I just want a title!!!!
function createTitle(){
    L.Control.textbox = L.Control.extend({
		onAdd: function(map) {
			
		var title = L.DomUtil.create('div');
		title.id = "my_title";
		title.innerHTML = "<strong>Pieces of Anti-Trans Legislation Proposed by U.S. State, 2016-2022 <br> by Sammy Fogel</strong>"
        
		return title;
		},
        
		onRemove: function(map) {
			// Nothing to do here
		}
	});
	L.control.textbox = function(opts) { return new L.Control.textbox(opts);}
	L.control.textbox({ position: 'bottomleft' }).addTo(map);
}

//sequence ctrls baby!!!
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft',
            content: "Toggle between years using the slider bar or the buttons"
        },
        onAdd: function() {            
            //create the control container div with a particular class namw
            var container = L.DomUtil.create('div', 'sequence-control-container');
            //create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
            //add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse (by Saepul Nahwan under CC) "><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward (by Saepul Nahwan under CC) "><img src="img/forward.png"></button>');
            container.insertAdjacentHTML('afterbegin','<text id="affordance">Slide or Click Me to Toggle Years</text>');
            //disable any mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);
            //initialize other DOM elements
            return container;
        }
    });
    map.addControl(new SequenceControl());  
    //listenerz
    document.querySelector('.range-slider').max = 5;
    document.querySelector('.range-slider').min = 0;
    document.querySelector('.range-slider').value = 0;
    document.querySelector('.range-slider').step = 1;

    var steps = document.querySelectorAll('.step');
    //this loop powers the slider and the buttons
    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            //increment! or decrement! just no excrement!
            if (step.id == 'forward'){
                index++;
                //make this sequence wrap arround to 1st attribute
                index = index > 5 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //wrap to last attruibute again
                index = index < 0 ? 5 : index;
            };
            //upd8 slider
            document.querySelector('.range-slider').value = index; //so this line seems to be making the slider move w/ the buttonz. but won't let update by using slider
            //pass new att to update symbolz
            updatePropSymbols(attributes[index]);
        });
    });
    document.querySelector('.range-slider').addEventListener('input', function(){            
        var index = this.value;
        
        updatePropSymbols(attributes[index]);
    });

};

//update the symbols as the index changes with the slideyguy
function updatePropSymbols(attribute){
    var year = attribute.split("_")[1];
    //update temporal legend
    document.querySelector("span.year").innerHTML = year;
    
    map.eachLayer(function(layer){
        if (layer.feature){
            //access feature properties
            var props = layer.feature.properties;
            //console.log(props)
            //update each feature's radius based on new attValues
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            var year = attribute.split("_")[1];
            //add state to popup content string
            var popupContent = new PopupContent(props, attribute);
            
            //update popup content            
            popup = layer.getPopup();            
            popup.setContent(popupContent.formatted).update();            
            
        };
    }); 

};
//creating a legend!
function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        onAdd: function(){
            //cre8 control container w/ a particular clasz name
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            container.innerHTML = '<p class="temporal-legend">Number of Anti-Trans Bills in  <span class="year">2022</span></p>';
          
            //svg time baby!!!
            var svg = '<svg id="attribute-legend" width="130px" height="130px">';
            
            //circle array time whewwwwww
            var circles = ["max", "mean", "min"];
            //presenting...a loop! a loop which, if successful, will add each circle and text to our svg string!!! mwahahahaha you're too late Batman!!!!
            for (var i=0; i<circles.length; i++){
                //heeeere weeee goooo (about to grant form to these birbles..dynamically!)
                var radius = calcPropRadius(dataStats[circles[i]]);
                var textContent = dataStats[circles[i]];
                var cy = 85 - radius
                if(i === 2) { continue; }                
                //birble string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + 
                '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="45"/>';                          
            
                //evenly space out labels
                var textY = i * 65 + 20; //lol before even executing this I'm already suspicious of it
                //text string
                svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + "&emsp;" + "&emsp;" + textContent + '</text>';
                
            }; //close the loop 
            //now let's close that string!!!!
            svg += "</svg>";
            //and let's now lob all this attribute legend svg business into the container
            container.insertAdjacentHTML('beforeend',svg);

            //this line below actually CREATES the darn thing (in theory) 
            return container; 
        }
    });
    map.addControl(new LegendControl());
};
function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.billz = this.properties[attribute];
    this.formatted = "<p><b>State:</b> " + this.properties.State + "</p><p><b>Anti-Trans Bills Proposed in " + this.year + ": </b> " + this.billz + " </p>";
    
    
    
    /*
    //add state to popup content string
    var popupContent = "<p><b>State </b>" + properties.State + "</p>";
    //add formatted attribute to panel content string
    var year = attribute.split("_")[1];
    popupContent += "<p><b>Anti-Trans Bills Proposed in " + year + ": </b>" + properties[attribute];

    return popupContent; */
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
            calcStats(json)
            //minValue = 1; //commenting this out for now bc what if I need it later??? I probably won't but,,,hoarder instinct, sorry 
        //call that fxn and create those proportional symbolz!
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
            createTitle();
        
    });  
};
//the line below this one activates all the stuff above this line once the DOM hath loaded
document.addEventListener('DOMContentLoaded',createMap)

