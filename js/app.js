// import { unemployment_chart } from "./unemployment_chart";
import { employment_sector_chart } from "./employment_sector_chart.js";
// import { gdp_chart } from "./gdp_chart";
import { drawLineGraph } from "./unemployment_GDP_lineChart.js";


// Set initial container size
// const containerWidth = document.getElementById("container").clientWidth;
// const containerHeight = document.getElementById("container").clientHeight;
// const initialWidth = containerWidth;
// const initialHeight = containerHeight;

// Specifying the data 
const geoDataFile = 'data/countries_geolocation.json';
const gdpDataFile = 'data/GDP.csv';
// Specifying the containers and HTML elements
const mapContainer = d3.select('#map-container');
const slider = d3.select('#year-slider');
const yearValue = d3.select('#year-value');
// Setting up the tooltip
const tooltip = d3.select("#tooltip");


// Setting up the svg container
const width = 1000;
const height = 700;

// Setting up the padding
const padding = {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10
};

// Setting up the svg dimensions
const svgWidth = width - padding.left - padding.right;
const svgHeight = height - padding.top - padding.bottom;

// Setting up color ranges
const colorSchema = d3.scaleQuantize().range(d3.schemeBlues[9]);

// Dynamically set the wdith of the container
d3.select('#map-container')
    .attr("width", width)
    .attr("height", height);

// Selecting the svg
const mapSVG = d3.select('#map-container').append('svg')
                    .attr('width', svgWidth)
                    .attr('height', svgHeight);


// Load GeoJSON data and create map
d3.json(geoDataFile).then(function(geoData) {

    d3.csv(gdpDataFile).then((gdpData) => {
        // Set the color domain
        colorSchema.domain([
            1000,
            60000,  
        ]);
        drawWorldMap(geoData, gdpData, 2010);
        // Update map based on slider value
        slider.on('input', function() {
            const selectedYear = +this.value;
            yearValue.text(selectedYear);
            updateWorldMap(geoData, gdpData, selectedYear);
        });
    });  
});


// Function to draw the worldmap based on year
function drawWorldMap(geoData, gdpData, year) {
    // Create a projection (e.g., Mercator projection)
    const projection = d3.geoMercator()
        //.fitSize([svgWidth, svgHeight], geoData);
        .translate([svgWidth/2, svgHeight/1.5]) // Adjust the translation to center and move the map up
        .scale([svgWidth / (2 * Math.PI)]);    

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    mapSVG.selectAll('path')
            .data(geoData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('stroke', 'black')
            .attr('stroke-width', 0.5)
            .style('fill', 'black');

    updateWorldMap(geoData, gdpData, year);

         // Add legend
    const legendWidth = 200;
    const legendHeight = 20;

    const legend = mapSVG.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (svgWidth - legendWidth - padding.right) + ',' + (svgHeight - legendHeight - 50) + ')');

    const legendScale = d3.scaleLinear()
        .domain(colorSchema.domain())
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(legendHeight)
        .ticks(5);

    legend.selectAll('rect')
        .data(colorSchema.range().map(d => colorSchema.invertExtent(d)))
        .enter().append('rect')
        .attr('x', d => legendScale(d[0]))
        .attr('y', 0)
        .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
        .attr('height', legendHeight)
        .style('fill', d => colorSchema(d[0]));

    legend.append('g')
        .attr('transform', 'translate(0,' + legendHeight + ')')
        .call(legendAxis)
        .select(".domain").remove();
}


// Function to color and update the worldmap based on year
function updateWorldMap(geoData, gdpData, year) {
    // Get the GDP data based on the year
    const filteredGdpData = gdpData.filter(d => +d.YEA === year);

    // Merge the GDP and GeoJSON dataset
    geoData.features.forEach(feature => {
        const country = feature.id;
        const countryData = filteredGdpData.find(d => d.COU === country);
        feature.properties.GDP = countryData ? +countryData.GDP : null;
    });

    // Update path colors with transition
    mapSVG.selectAll('path')
        .data(geoData.features)
        .on("mouseover", function(event, d) {
            if (d.id == "BMU")
                return;

            let GDP = d.properties.GDP;
            if (GDP != null) {
                GDP = "$" + GDP.toFixed(2) + "/capita (US exchange rate)";
            } else {
                GDP = "Data not available.";
            }

            tooltip.classed("hidden", false)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px")
                .html(`<strong>${d.properties.name}</strong><br>GDP: ${GDP}`);
        })
        .on("mouseout", function() {
            tooltip.classed("hidden", true);
        })
        .on("click", function(event, d) {
            const country = d.id; // Assuming d.id represents the country code
            // const countryData = gdpData.find(d => d.COU === country); // Assuming COU is the country code in GDP data
    
            // Update container sizes on click
            // const mapWidth = width * 0.5; // Map takes 50% of the container
            // const mapHeight = height; // Map height remains the same
            // const chartWidth = width * 0.25; // Each chart takes 25% of the container
    
            // updateContainerSizes(mapWidth, mapHeight, chartWidth);
            // employment_sector_chart();

            drawLineGraph(country, gdpData);
    
            // // Create the charts
            // // createUnemploymentChart(countryData);
            // // createEmploymentSectorChart(countryData);
        })
        .transition()
        .duration(1000)
        .style('fill', d => {
            const gdp = d.properties.GDP;
            return gdp === null ? 'grey' : colorSchema(gdp);
        });
}


// Function to update container sizes
function updateContainerSizes(mapWidth, mapHeight, chartWidth) {
    d3.select("#map-container")
        .transition()
        .duration(500)
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    d3.select("#unemployment-chart-container")
        .transition()
        .duration(500)
        .style("width", chartWidth + "%");

    d3.select("#employment-sector-chart-container")
        .transition()
        .duration(500)
        .style("width", chartWidth + "%");
}