// set the dimensions and margins of the graph
var margin = { top: 20, right: 200, bottom: 70, left: 70 },
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("/Data/Data_for_Dashboard.csv").then(function (data) {

    /*********************
     * X AXIS
    *********************/
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

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
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

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
            .html("The country is: " + d.Country +
                "<br>Urban %: " + d['Urban population (percent)'] +
                "<br>Urban % growth is: " + d['Urban population (percent growth rate per annum)'])
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
    }

    var mousemove = function (d) {
        tooltip
            .html("The country is: " + d.Country +
                "<br>Urban %: " + d['Urban population (percent)'] +
                "<br>Urban % growth is: " + d['Urban population (percent growth rate per annum)'])
            .style("top", d3.select(this).attr("cy") + "px")
            .style("left", d3.select(this).attr("cx") + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function (d) {
        tooltip
            .transition()
            .duration(1000)
            .style("opacity", 0)
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
        .attr("cx", width + 10)
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

    /*********************
     * ANNOTATIONS
    *********************/

    const annotations = [
        {
            note: {
                label: "Steady percentage of population in Urban areas",
                title: "Europe "
            },
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 80,         // circle radius
                radiusPadding: 20,   // white space around circle befor connector
            },
            color: ["red"],
            x: width * 0.6,
            y: height * 0.85,
            dy: 30,
            dx: 150
        }
    ]

    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(annotations)
    svg.append("g")
        .call(makeAnnotations)

    /*********************
     * SCATTER PLOT DATA 
    *********************/
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")

        .filter(function (d) { return d['Year'] == "2005" })

        .attr("cx", function (d) { return x(d['Urban population (percent)']); })
        .attr("cy", function (d) { return y(d['Urban population (percent growth rate per annum)']); })
        .attr("r", function (d) { return (x(d['Population (million)']) / 250 + 3); })

        .style("fill", "none")
        .style("stroke-width", 2)    // set the stroke width
        .style("stroke", function (d) { return color(d['Region']) })
        .on("mouseover", mouseover)
})