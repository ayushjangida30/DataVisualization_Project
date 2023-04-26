const topo_url = "https://gist.githubusercontent.com/Ayushjangida/c42b366cb33ed967f91f77efb5324bac/raw/8511944973445eb533c99c8e57aa99447d12fd59/student_district.json";
const student_url = "https://gist.githubusercontent.com/Ayushjangida/4f33a07e10bd6432dfd9bfa479467ce7/raw/2802462a0c054212c7dd985a566b12faf3222955/students.csv";

// other resources used:
// https://mapshaper.org/ - for simplyfying geojson file

const MARGIN = {
    TOP : 30,
    BOTTOM : 30,
    LEFT : 50,
    RIGHT : 20,
};

const GRAPH_WIDTH = 8000 - MARGIN.LEFT - MARGIN.RIGHT;
const GRAPH_HEIGHT = 8000 - MARGIN.TOP - MARGIN.BOTTOM;

var fakeData = [1, 2, 5, 3];
var finalMap;
var globalStudentCount = 0;

var selectedLanguage = "Punjabi";
var yearVal = "1991/1992";

// Map SVG
var mapDiv = d3.select("#mainmap")
                .append("div")
                .attr("width", GRAPH_WIDTH)
                .attr("height", GRAPH_HEIGHT);

// Map
var svg = mapDiv.append("svg")
    .attr("width", GRAPH_WIDTH)
    .attr("height", GRAPH_HEIGHT)
    .attr("id", "map");

// Line Graph
var linegraphsvg = d3.select("#linegraph")
    .attr("width", 500)
    .attr("height", 500)
    .append("g")
    .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")");

// Tooltip
var tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip")
    .attr("style", "position: absolute; opacity: 0");

// function handleMouseOver(position) {
//     let pos = d3.mouse(this);
//     console.log(pos);
//     d3.select(this)
//         .style("fill", "black");
//     d3.select("div")
//         .transition().duration(500)
//         .style("opacity", 0) // needs to be 0.7
//         .style("top", d3.event.pageY + 10)
//         .style("left", d3.event.pageX + 10);
//     div.html(this.getAttribute("district"));
//     //console.log(this.getAttribute("district"));
//     //console.log(d3.event.pageX, d3.event.pageY);
// }
// function handleMouseOut() {
//     d3.select(this).style("fill", "purple");
//     d3.select("div")
//         .transition().duration(500)
//         .style("opacity", 0);
// }

function selectLanguage()    {
    var select = document.getElementById("languages");
    var value = select.options[select.selectedIndex].value;
    console.log(value);
}

// var languages = [
//     "Punjabi",
//     "Chinese",
//     "Spanish",
//     "Japanese",
//     "French",
//     "English"
// ];

var dates = [
    1991,
    1992,
    1993,
    1994,
    1995,
    1996,
    1997,
    1998,
    1999,
    2000,
    2001,
    2002,
    2003,
    2004,
    2005,
    2006,
    2007,
    2008,
    2009,
    2010,
    2011,
    2012,
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019,
    2020
];

var dataTime = d3.range(0,30).map(function(d)   {
    return new Date(1991 + d, 10, 3);
});

// Slider for selecting year
// https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
var sliderTimer = d3.sliderBottom()
    .min(d3.min(dates))
    .max(d3.max(dates))
    .step(1)
    .width(700)
    .tickFormat(d3.format('1'))
    .ticks(10)
    .step(1)
    .default(d3.min(dates))
    .on('onchange', val => {
        let num1 = val.toString();
        let num2 = (val + 1).toString();
        d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        yearVal = num1 + "/" + num2;
        console.log(yearVal);
        finalMap.transition()
            .attr("fill-opacity", 0);
        drawMap();
    });


var gTime = d3.select('div#timeSlider')
    .append('svg')
    .attr('width', 4000)
    .attr('height', 200)
    .append('g')
    .attr('transform', 'translate(30,30) scale(3)');


gTime.call(sliderTimer);

d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTimer.value()));

var dropdownButton = d3.select("#languageDropdown")
    .append('select')
    .style("width", "300px")
    .style("height", "75px");


dropdownButton.selectAll('myOptions')
    .data(languages)
    .enter()
    .append('option')
    .text(function(d) {return d; })
    .style("width", "300px")
    .style("height", "55px")
    .style("font-size", "20px")
    .attr("value", function(d) {return d});

dropdownButton.on("change", function(d) {
    selectedLanguage = d3.select(this).property("value");
    finalMap.transition()
        .attr("fill-opacity", 0);
    drawMap();
    console.log(selectedLanguage);
})

function newLanguage(newlanguage) {
    selectedLanguage = newlanguage;
    finalMap.transition()
         .attr("fill-opacity", 0);
    drawMap();
    console.log(selectedLanguage);
}

// Legend scale: https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient/
//Append a defs (for definition) element to your SVG
var defs = svg.append("defs");

//Append a linearGradient element to the defs and give it a unique id
var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

//Set the color for the start (0%)
linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "white"); //light blue

//Set the color for the end (100%)
linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#053464"); //dark blue

var gradientTitle = svg.append("text")
    .attr("y", 1400)
    .attr("x", 350)
    .attr("font-size", "40px")
    .attr("font-color", "black")
    //.style("text-anchor", "left")
    .text("Student Population");

var gradient = svg.append("rect")
    .attr("width", 300)
    .attr("height", 20)
    .style("fill", "url(#linear-gradient)")
    .style("transform", "scale(5)")
    .attr("y", 290)
    .attr("x", 70);

// var formatAxis = d3.format(".1");
// var axis = d3.axisBottom()
//     .tickFormat(formatAxis)
//     .ticks(10)
//     .tickValues([100, 200, 300, 400, 500, 600, 700, 800, 900]); //specify an array here for values
//     //.orient("bottom");

var gradient0 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 350)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("0");

var gradient100 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 500)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("100");

var gradient200 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 650)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("200");

var gradient300 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 800)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("300");

var gradient400 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 950)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("400");

var gradient500 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 1100)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("500");

var gradient600 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 1250)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("600");

var gradient700 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 1400)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("700");

var gradient800 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 1550)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("800");

var gradient900 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 1700)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("900");

var gradient1000 = svg.append("text")
    .attr("y", 1580)
    .attr("x", 1850)
    .attr("font-size", "20px")
    .attr("font-color", "black")
    //.style("text-anchor", "end")
    .text("1000");

//
// gradient.append("text")
//     .attr("x", 60)
//     .attr("y", 280)
//     .attr("font-size", "40px")
//     //.style("text-anchor", "left")
//     .text("Student Population");

drawMap();

function drawMap() {

d3.csv(student_url).then(studentData => {
    //console.log(studentData);

    var select = [];
    var selectLangTotalCount = 0;

    //Get selected year from dropdown
    var year = document.getElementById("year");
    //var yearVal = year.options[year.selectedIndex].value;
    //console.log(yearVal);

    //Get selected language from dropdown
    var language= document.getElementById("languages");
    var languageVal = language.options[language.selectedIndex].value;
    console.log(languageVal);
    selectedLanguage = languageVal;

    var count = 0;
    selectLangTotalCount = studentData.map(function(studentData)    {
        if(studentData.HOME_LANGUAGE === selectedLanguage
            && studentData.DATA_LEVEL === "PROVINCE LEVEL"
            && studentData.SCHOOL_YEAR === yearVal
            && studentData.PUBLIC_OR_INDEPENDENT === "PROVINCE - Total")  {
                count = studentData.NUMBER_OF_STUDENTS;
            }
            return count;
    })
    //console.log(count);
    
    var selectRows = [];

    select = studentData.map(function(studentData)   {
        if(studentData.HOME_LANGUAGE === selectedLanguage
            && studentData.DATA_LEVEL === "DISTRICT LEVEL"
            && studentData.SCHOOL_YEAR === yearVal)  {
                selectRows.push(studentData);
            }
                return studentData;
    })
    //console.log(selectRows);

    var total = 0;
    for(i = 0; i < selectRows.length; i++)  {
        if(selectRows[i].NUMBER_OF_STUDENTS !== "Msk")   total += parseInt(selectRows[i].NUMBER_OF_STUDENTS);
    }

    //console.log(total)

    d3.json(topo_url).then(data => {
        //console.log(data);

        const collect = topojson.feature(data, data.objects.collection);

        // Map Projection
        const {height, width} = document.getElementById("map").getBoundingClientRect();
        const projection = d3.geoMercator()
            .center([15.454071, 4.279229])//13.439235,48.830666])//53.7267, 127.6476])
            .scale(3000)
            .translate([GRAPH_WIDTH / 2, GRAPH_HEIGHT / 2]);


        projection.fitExtent(
            [
                [0, 0],
                [width, height],
            ],
            collect
        )

        var path = d3.geoPath().projection(projection);

        // Source used to understand code for reversing polygons to draw reverse of polygons: https://stackoverflow.com/questions/54947126/geojson-map-with-d3-only-rendering-a-single-path-in-a-feature-collection
        // This was necessary to have districts drawn where they are independent pieces of the overall map
        collect.features.forEach(function(feature) {
            if(feature.geometry.type === "MultiPolygon") {
                feature.geometry.coordinates.forEach(function(polygon) {

                    polygon.forEach(function(ring) {
                        ring.reverse();
                    })
                })
            }
            else if (feature.geometry.type === "Polygon") {
                feature.geometry.coordinates.forEach(function(ring) {
                    ring.reverse();
                })
            }
        })

        // Color scaling function for the opacity of the districts based on their language population
        const colorScale = d3.scaleLinear()
            .domain([0, 300])
            .range([0, 1])

            // Drawing the districts
        finalMap = svg.append("g")
                .selectAll("path")
                .data(collect.features)
                .enter()
                .append("path")
                .attr("class", (collect) => collect.properties.SCHOOL_DISTRICT_NAME)
                .attr("d", path)
                .attr("transform", "translate(-2100, -6400) scale(2.8)")
                //.attr("transform", "translate(30, 100)")
                //.attr("scale", "150")
                .attr("fill", "#053464")
                // Changing the fill opacity for each district based on the student population for the chosen language
                .attr("fill-opacity", function (collect) {
                    let studentCount = 0;
                    for (let i = 0; i < selectRows.length; i++) {
                        //console.log(data.properties.SCHOOL_DISTRICT_NAME + " : " + selectRows[i].DISTRICT_NAME);
                        if (collect.properties.SCHOOL_DISTRICT_NAME === selectRows[i].DISTRICT_NAME) {
                            //console.log(selectRows[i].DISTRICT_NAME);
                            studentCount = studentCount + parseInt(selectRows[i].NUMBER_OF_STUDENTS);
                            //console.log("students: " + selectRows[i].NUMBER_OF_STUDENTS);
                        }
                    }
                    // console.log(data.properties.SCHOOL_DISTRICT_NAME + ": " + studentCount);
                    return colorScale(studentCount);
                })
                .attr("stroke", "black")
                // Hover on and off functions for extra details
                .on("mouseover", function(d) {
                    d3.select(this)
                        .style("fill", "black");
                    d3.select("#tooltip")
                        .transition()
                        .duration(50)
                        .style("background", "#e4b54c")
                        .style("font-size", "40px")
                        .style('opacity', 1)
                        .text(d.properties.SCHOOL_DISTRICT_NAME);

        })
                .on("mousemove", function(d) {
                    d3.select("#tooltip")
                        .style('left', (d3.event.pageX+10) + 'px')
                        .style('top', (d3.event.pageY+10) + 'px');
                })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .style("fill", "#053464");
                    d3.select("#tooltip")
                        .transition()
                        .duration(50)
                        .style('opacity', 0);
                })
                .on("click", function(d) {
                    let languageTrend = [];
                    let year = "1991/1992";
                    let count = 0;
                    //console.log(studentData);
                    for(let i = 0 ; i < studentData.length; i++) {
                        if (year !== studentData[i].SCHOOL_YEAR) {
                            year = studentData[i].SCHOOL_YEAR;
                            //console.log(studentData[i].SCHOOL_YEAR);
                            //languageTrend.push(count);
                            //count = 0;
                        }
                        //console.log(studentData[i].DATA_LEVEL);

                        if(year === studentData[i].SCHOOL_YEAR) {
                            console.log("year match")
                            if (studentData[i].DATA_LEVEL === "DISTRICT LEVEL") {
                                console.log("district")
                                if (studentData[i].SCHOOL_DISTRICT_NAME === d.properties.SCHOOL_DISTRICT_NAME) {
                                    console.log("name")
                                    if (selectedLanguage === studentData[i].HOME_LANGUAGE) {
                                        console.log("language")
                                        //count = count + studentData[i].NUMBER_OF_STUDENTS;
                                        languageTrend.push(studentData[i].NUMBER_OF_STUDENTS);
                                        console.log(studentData[i].NUMBER_OF_STUDENTS);
                                    }
                                }
                            }
                        }
                    }
                    console.log(languageTrend);

                    var titleDiv = d3.select("body").append("div").attr("id", "line_graph_title");
                    titleDiv.append("p")
                            .text("District: Sea of Sky")
                            .attr("font-size", "24px");
                            
                    var div = d3.select("body").append("div").attr("id", "line_graph");
                    div.append("img")
                        .attr("src", "sea_of_sky.png")
                        .attr("alt", "line graph")
                        .attr("width", 1000)
                        .attr("height", 800)
                        .attr("transform", "tranlate(1000,0)");

                });
        })

    });


}

/*
 const graticule = d3.geoGraticule();
const proj = svg.append("projPath")
    .attr("width", "100%");
const g = svg.append("g")
    .attr("width", "100%");
//const pathG = g.append("pathG");
d3.json("districts1.json").then(data => {
    console.log(data);
    console.log(data.features);
    //var bounds = path.bounds(data);
    //_data = data;
    proj.select()
        .enter()
        .append("proj")
        .merge(bc_projection);
    g.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        //.attr("class", data)
        //.merge(bc_path)
        .attr("id", (d) => d.properties.SCHOOL_DISTRICT_NAME)
        .attr("d", bc_path)
        .attr("fill", "none")
        //.attr("opacity", 0.1)
        .attr("stroke", "black");
})
        //.attr("stroke-width", "0.5");
        //.attr("fake", d => console.log(data.features.map((f) => f.properties.SCHOOL_DISTRICT_NAME)));
    /*
    var labels = g.selectAll(".label").data(data.features);
    labels.enter()
        .append("text")
        .attr("class", "label")
            .merge(labels)
            .text((d) => d.properties.SCHOOL_DISTRICT_NAME);
*/
    //.attr("stroke-width", 1.5);

/*
        g.selectAll("path").data(data.features)
            .enter()
            .append("path")
            .attr("class", data)
            .attr("d", bc_path)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("fake", d=> console.log(data.features.map((f) => f.properties.SCHOOL_DISTRICT_NAME)));
        //console.log(data.features.map((f) => f.properties.name))
        for(let i = 0; i < data.features.length; i++) {
            console.log(data.features.map((f) => f.properties.SCHOOL_DISTRICT_NAME));
        }
        const collect = topojson.feature(data, data.objects.collection);
//        console.log(collect);
//        const locate = collect.features;
        
//        console.log(data.features);
//        console.log(locate);
        console.log(collect.features)
        g.selectAll("path").data(collect.features)
                            .enter()
                            .append("path")
                            .attr('transform', `translate(${TRANSLATE_LEFT}, ${TRANSLATE_BOTTOM})`)
                            .attr("class", "collection")
                            .attr("d", bc_path)
                            .attr("fill", "white")
                            .attr("stroke", "black"); */


// function drawMap(err, bc)    {
//     if(err) throw err

//     console.log(bc)

//     svg.append("path")
//         .datum(graticule)
//         .attr("class", "graticule")
//         .attr("d", bc_path);

//     svg.append("path")
//         .datum(graticule.outline)
//         .attr("class", "foregorund")
//         .attr("d", bc_path);

//     svg.append("g")
//         .selectAll("path")
//         .data(topojson.feature(bc, bc.objects.collection).features)
//         .enter().append("path")
//         .attr("d", bc_path);
// }

// d3.json(topo_url, drawMap);