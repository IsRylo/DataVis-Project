// Specifying the data 
const worldMapData = 'data/countries_geolocation.json';
const gdpData = 'data/GDP.json';
// Specifying the containers and HTML elements
const mapContainer = d3.select('#map-container');
const slider = d3.select('#year-slider');

// Setting up the svg
const width = 1000;
const height = 500;

const padding = {
    top: 5,
    left: 5,
    right: 5,
    bottom: 5
};

// Selecting the svg
const mapSVG = d3.select('#map-container').append('svg')
                    .attr('width', width)
                    .attr('height', height)
                    .attr("fill", "lightblue");

// Country Codes
const g7Countries = ['USA', 'CAN', 'FRA', 'ITA', 'JPN', 'DEU', 'GBR']; 
// Colour Schema 
const colorSchema = d3.scaleQuantize()
                        .range(['#f2f0f7','#cbc9e2','#9e9ac8','#756bb1','#54278f']);

const minValue = 40000;
const maxValue = 76291;

// Load GeoJSON data and create map
d3.json(worldMapData).then(function(mapData) {
    // Create a projection (e.g., Mercator projection)
    const projection = d3.geoMercator()
        .fitSize([width, height], mapData)
        .translate([width / 2, height / 1.5]) // Adjust the translation to center and move the map up
        .scale([width / (2 * Math.PI)]);

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Plot world map
    mapSVG.selectAll('path')
        .data(mapData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', function(d) {
            const country = d.id;
            if (g7Countries.includes(country)) {
                return '#f00';
            }
            return '#ccc'; 
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5);

    // Update map based on slider value
    slider.on('input', function() {
        const selectedYear = this.value;
        updateMap(selectedYear);
    });

    function updateMap(year) {
        d3.json(gdpData).then(function(gdpData) {
            const countriesData = gdpData[year];
            // Set the color domain
            colorSchema.domain([
                minValue,
                maxValue
            ]);
    
            mapSVG.selectAll('path')
                .data(mapData.features)
                .join('path')
                .attr('d', path)
                .attr('fill', function(d) {
                    const country = d.id; // Country code from GeoJSON
                    if (g7Countries.includes(country)) {
                        const value = countriesData[country]; // Get the value for the country and year
                        return colorSchema(value);
                    } else {
                        return colorSchema(countriesData['WORLD']);
                    }
                })
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5);
        });
    }

    // Add legend
    const legend = mapSVG.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + (width - 100) + ',' + (height - 100) + ')');

    legend.selectAll('rect')
    .data(colorScale.range())
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 20)
    .attr('width', 20)
    .attr('height', 10)
    .attr('fill', d => d);

    legend.selectAll('text')
    .data(['Low', 'Medium', 'High']) // Update with appropriate legend labels
    .enter()
    .append('text')
    .attr('x', (d, i) => i * 60)
    .attr('y', 25)
    .text(d => d);

});
