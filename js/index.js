// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("/Data/Data_for_Dashboard.csv", function (data) {

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([-2, 20])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

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
        tooltip
            .style("opacity", 1)
    }

    var mousemove = function (d) {
        tooltip
            .html("The country is: " + d.Country +
                "<br>Urban %: " + d['Urban population (percent)'] +
                "<br>Urban % growth is: " + d['Urban population (percent growth rate per annum)'])
            .style("left", (d3.mouse(this)[0] + 90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    var mouseleave = function (d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d['Urban population (percent)']); })
        .attr("cy", function (d) { return y(d['Urban population (percent growth rate per annum)']); })
        .attr("r", function (d) { return (x(d['Population (million)']) / 500 + 5); })
        .style("fill", function (d) {

            var returnColor;

            if (d['Region'] === "East Asia & Pacific") {
                returnColor = "green";
            } else if (d['Region'] === "Europe & Central Asia") {
                returnColor = "purple";
            } else if (d['Region'] === "Latin America & Caribbean") {
                returnColor = "red";
            } else if (d['Region'] === "Middle East & North Africa") {
                returnColor = "orange";
            } else if (d['Region'] === "North America") {
                returnColor = "blue";
            } else if (d['Region'] === "South Asia") {
                returnColor = "pink";
            } else if (d['Region'] === "Sub-Saharan Africa") {
                returnColor = "black";
            }

            return returnColor;
        })
        .style("opacity", 0.3)
        .style("stroke", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
})