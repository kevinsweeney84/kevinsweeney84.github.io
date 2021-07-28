var year = "2005"
var firstRun = true;

// set the dimensions and margins of the graph
var margin = { top: 10, right: 200, bottom: 70, left: 70 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1050 800")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

/*********************
* X AXIS
*********************/
var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);
var xaxis = d3.axisBottom(x)
svg.append("g")
    .attr("class", "axis")
    .attr("class", "Xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);

// text label for the x axis
svg.append("text")
    .attr("class", "axisText")
    .attr("transform",
        "translate(" + (width / 2) + " ," +
        (height + margin.top + 30) + ")")
    .style("text-anchor", "middle")
    .text("Urban Population (percent)");

/*********************
 * Y AXIS
*********************/
var y = d3.scaleLinear()
    .domain([-2, 9])
    .range([height, 0]);
var yaxis = d3.axisLeft(y)
svg.append("g")
    .attr("class", "axis")
    .attr("class", "Yaxis")
    .call(yaxis);

// text label for the y axis
svg.append("text")
    .attr("class", "axisText")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Urban Population (percent growth rate per annum)");

/*********************
 * GRIDLINES
*********************/
// gridlines in x axis function
function make_x_gridlines() {
    return d3.axisBottom(x)
        .ticks(10)
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(y)
        .ticks(10)
}

// add the X gridlines
svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    )

// add the Y gridlines
svg.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    )

/*********************
 * TOOLTIP
*********************/

// Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
// Its opacity is set to 0: we don't see it by default.
var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

// A function that change this tooltip when the user hover a point.
// Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
var mouseover = function (d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", 1)
    tooltip
        .html("<b>" + d.Country.toUpperCase() + "</b>" +
            "<br>----------" + 
            "<br><b>Urban %: </b>" + d['Urban population (percent)'] +
            "<br><b>Urban % growth: </b>" + d['Urban population (percent growth rate per annum)'] +
            "<br><b>Population: </b>" + String(Number(d["Population (million)"]).toFixed(2)) + " million")
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 50) + "px");
}

/*********************
 * LEGEND
*********************/

// create a list of keys
var keys = ["East Asia & Pacific", "Europe & Central Asia", "Latin America & Caribbean",
    "Middle East & North Africa", "North America", "South Asia", "Sub-Saharan Africa"]

// Usually you have a color scale in your chart already
var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet2);

// Add one dot in the legend for each name.
svg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", width + 20)
    .attr("cy", function (d, i) { return margin.top + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) { return color(d) })

// Add one dot in the legend for each name.
svg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", width + 30)
    .attr("y", function (d, i) { return margin.top + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) { return color(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

/***************** */
function setupSVG() {

    document.getElementById("my_dataviz").setAttribute("current-year", year);




    async function loadAllData() {
        data = await d3.csv("/Data/Data_for_Dashboard.csv");

        data = sortData(data);

        loadPageData();
    }

    function sortData(data) {

        // Sort based on the 2005 urban % values
        let data2005 = data.filter(function (d) {
            return d.Year == "2005";
        });

        // sort the data going from least densily populated urban center to most (2005)
        data2005 = data2005.sort(function mysortfunction(a, b) {
            var x = a['Urban population (percent)'];
            var y = b['Urban population (percent)'];

            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        })

        // Extract just the Country info from the object
        var data2005sorted = data2005.map(function (value, index) { return value['Country']; });

        // Function sorts an object based on a given order
        function mapOrder(array, order, key) {

            array.sort(function (a, b) {
                var A = a[key], B = b[key];

                if (order.indexOf(A) > order.indexOf(B)) {
                    return 1;
                } else {
                    return -1;
                }

            });

            return array;
        };

        data = mapOrder(data, data2005sorted, 'Country');

        return data
    }

    function loadPageData() {

        let yearData = data.filter(function (d) {
            return d.Year == document.getElementById("my_dataviz").getAttribute("current-year");
        });

        if (firstRun) {
            plotInitData(yearData)

            firstRun = false
        } else {
            plotDataWithTransitions(yearData)
        }
    }

    function plotInitData(yearData) {

        addAnnotations();

        svg
            .selectAll("dataCircles")
            .data(yearData)
            .enter()
            .append("circle")
            .attr("class", "dataCircles")

            .attr("cx", function (d) { return x(parseFloat(d['Urban population (percent)'])); })
            .attr("cy", function (d) { return y(parseFloat(d['Urban population (percent growth rate per annum)'])); })
            .attr("r", function (d) { return (x(parseFloat(d['Population (million)'])) / 250 + 3); })

            .style("fill", "none")
            .style("stroke-width", 2)    // set the stroke width
            .style("stroke", function (d) { return color(d['Region']) })
            .on("mouseover", mouseover)
    }

    // Create a function that takes a dataset as input and update the plot:
    function plotDataWithTransitions(yearData) {


        // Update circles
        svg.selectAll(".dataCircles")
            .data(yearData)  // Update with new data
            .transition()  // Transition from old to new
            .duration(1000)  // Length of animation
            .on("start", function () { })

            .delay(function (d, i) { return i / yearData.length * 3000; })

            .attr("cx", function (d) { return x(parseFloat(d['Urban population (percent)'])); })
            .attr("cy", function (d) { return y(parseFloat(d['Urban population (percent growth rate per annum)'])); })
            .attr("r", function (d) { return (x(parseFloat(d['Population (million)'])) / 250 + 3); })

            .on("end", function () { });

        addAnnotations();

    }

    function addAnnotations() {

        svg.selectAll(".annotation-group").remove()
        /*********************
         * ANNOTATIONS
        *********************/

        if (document.getElementById("my_dataviz").getAttribute("current-year") == "2005") {
            annotations = [
                {
                    note: {
                        label: "Still very Rural. Significant shift to urban areas",
                        title: "Sub-Saharan Africa"
                    },
                    type: d3.annotationCalloutCircle,
                    subject: {
                        radius: 80,         // circle radius
                        radiusPadding: 20,   // white space around circle befor connector
                    },
                    color: ["red"],
                    x: width * 0.2,
                    y: height * 0.4,
                    dy: -100,
                    dx: 150
                }
            ]
        } else if (document.getElementById("my_dataviz").getAttribute("current-year") == "2010") {
            annotations = [
                {
                    note: {
                        label: "Many highly Urbanised societies",
                        title: "Middle East & North Africa"
                    },
                    type: d3.annotationCalloutRect,
                    subject: {
                        width: width * 0.2,
                        height: height * 0.5,
                    },
                    color: ["red"],
                    x: width * 0.81,
                    y: height * 0.1,
                    dy: 200,
                    dx: 250
                }
            ]
        } else {
            annotations = [
                {
                    note: {
                        label: "Stable percentage of population in Urban areas",
                        title: "Europe & Central Asia"
                    },
                    type: d3.annotationCalloutCircle,
                    subject: {
                        radius: 80,         // circle radius
                        radiusPadding: 20,   // white space around circle befor connector
                    },
                    color: ["red"],
                    x: width * 0.62,
                    y: height * 0.85,
                    dy: 0,
                    dx: -150
                }
            ]
        }

        // Add annotation to the chart
        const makeAnnotations = d3.annotation()
            .annotations(annotations)

        svg.append('g')
            .attr('class', 'annotation-group')
            .call(makeAnnotations)
    }

    loadAllData();
}

function updateSVG(choosenYear) {
    year = choosenYear

    setupSVG();
}

function nextYear() {

    if (year == "2005") {
        choosenYear = "2010";
    } else if (year == "2010") {
        choosenYear = "2015";
    } else {
        return
    }

    updateSVG(choosenYear)
}

function prevYear() {

    if (year == "2010") {
        choosenYear = "2005";
    } else if (year == "2015") {
        choosenYear = "2010";
    } else {
        return
    }

    updateSVG(choosenYear)
}

/*********************
 * PAGINATION
*********************/

var pageItem = $(".pagination li").not(".prev,.next");
var prev = $(".pagination li.prev");
var next = $(".pagination li.next");

pageItem.click(function () {
    pageItem.removeClass("active");
    $(this).not(".prev,.next").addClass("active");
});

next.click(function () {

    if ($('li.active').next().not(".next").length == 1) {
        $('li.active').removeClass('active').next().addClass('active');
    }
});

prev.click(function () {

    if ($('li.active').prev().not(".prev").length == 1) {
        $('li.active').removeClass('active').prev().addClass('active');
    }
});




