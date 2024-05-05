// import { drawGenderVisualiation } from "./gender.js";

// const topicTitle = d3.select('#topic-title');

// // Define SVG dimensions and margins
// const svgWidth = 1000;
// const svgHeight = 200;
// const margin = { top: 20, right: 30, bottom: 30, left: 60 };
// const width = svgWidth - margin.left - margin.right;
// const height = svgHeight - margin.top - margin.bottom;

// // Create SVG element
// const svg = d3.select('#app').append('svg')
//     .attr('width', svgWidth)
//     .attr('height', svgHeight)
//     .attr('id', "svg")
//     .attr('style', 'background-color:white;');

// // Create group for the chart area
// let chart = svg.append('g')
//                     .attr('transform', `translate(${margin.left}, ${margin.top})`)
//                     .attr('id', 'chart');

// // Add on click event listener to the gender button
// d3.select("#genderButton").on("click", () => {
//     topicTitle.text("Gender Wage Gap in Australia");
//     chart = drawGenderVisualiation(svg, chart, width, height);
// });

// d3.select("#unemploymentButton").on("click", () => {console.log("Clicked")})

// Sample GeoJSON data for illustration (replace with actual data)
const worldMapData = 'js/countries_geolocation.json';
const g7Countries = ['USA', 'CAN', 'FRA', 'DEU', 'ITA', 'JPN', 'GBR']; // Country codes

// Sample GDP data (replace with actual data)
const gdpData = {
    'USA': 21427, // Example GDP value for USA
    'CAN': 17378,
    'FRA': 2826,
    'DEU': 4143,
    'ITA': 2037,
    'JPN': 5170,
    'GBR': 2827
};


// Load GeoJSON data and create map
d3.json(worldMapData).then(function(data) {
    // Create SVG element
    const svg = d3.select('#map-container').append('svg')
        .attr('width', 800)
        .attr('height', 500);

    // Create a projection (e.g., Mercator projection)
    const projection = d3.geoMercator()
        .fitSize([800, 500], data);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Plot world map
    svg.selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', function(d) {
            const country = d.properties.ISO_A3; // Country code from GeoJSON
            if (g7Countries.includes(country)) {
                return '#f00'; // Red color for G7 countries
            }
            return '#ccc'; // Default color for non-G7 countries
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5);

    // Add tooltips for GDP (not implemented in this example)
});