// Specifying the data 
const geoDataFile = 'data/countries_geolocation.json';
const unemploymentDataFile = 'data/unemployment.csv';
// Specifying the containers and HTML elements
const mapContainer = d3.select('#map-container');
const slider = d3.select('#year-slider');

// Setting up the svg container
const width = 1000;
const height = 500;

// Setting up the padding
const padding = {
    top: 50,
    left: 50,
    right: 50,
    bottom: 50
};

// Setting up the svg dimensions
const svgWidth = width - padding.left - padding.right;
const svgHeight = height - padding.top - padding.bottom;

// Function to draw the line graph for a selected country
export function drawLineGraph(country, gdpData) {
    // Creating the svg
    const lineContainre = d3.select("#unemployment-chart-container")
        .attr("width", width)
        .attr("height", height);
        lineContainre.selectAll("*").remove();

    d3.csv(unemploymentDataFile).then((unemploymentData) => {
        // Filter data for the selected country
        const countryGDPData = gdpData.filter(d => d.COU === country);
        const countryUnemploymentData = unemploymentData.filter(d => d.COU === country);

        // Selecting the svg
        const lineSVG = d3.select('#unemployment-chart-container').append('svg')
                .attr('width', svgWidth)
                .attr('height', svgHeight);
        // Create scales
        const xScale = d3.scaleLinear()
            .domain([2010, 2022])
            .range([0, svgWidth - padding.left - padding.right]);

        console.log(xScale.domain());

        const yScaleGDP = d3.scaleLinear()
            .domain([0, d3.max(countryGDPData, d => d.GDP)])
            .range([svgHeight - padding.top - padding.bottom, 0]);
        
        console.log(countryGDPData);
        console.log(yScaleGDP.domain());

        const yScaleUnemployment = d3.scaleLinear()
            .domain([0, d3.max(countryUnemploymentData, d => +d.Unemployment_Percent)])
            .range([svgHeight - padding.top - padding.bottom, 0]);

        // Create line generators
        const lineGDP = d3.line()
            .x(d => xScale(+d.YEA))
            .y(d => {
                console.log(d);
                console.log(yScaleGDP(+d.GDP));
                return yScaleGDP(+d.GDP);
            });

        const lineUnemployment = d3.line()
            .x(d => xScale(+d.YEA))
            .y(d => {
                console.log(d);
                console.log(yScaleUnemployment(+d.Unemployment_Percent));
                return yScaleUnemployment(+d.Unemployment_Percent);
            });

        // Append axes
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
        const yAxisGDP = d3.axisLeft(yScaleGDP);
        const yAxisUnemployment = d3.axisRight(yScaleUnemployment);

        lineSVG.append("g")
            .attr("transform", `translate(${padding.left},${svgHeight - padding.bottom})`)
            .call(xAxis);

        lineSVG.append("g")
            .attr("transform", `translate(${padding.left},${padding.top})`)
            .call(yAxisGDP);

        lineSVG.append("g")
            .attr("transform", `translate(${svgWidth - padding.right},${padding.top})`)
            .call(yAxisUnemployment);

        // Append lines
        lineSVG.append("path")
            .datum(countryGDPData)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("d", lineGDP)
            .attr("transform", `translate(${padding.left},${padding.top})`);

        lineSVG.append("path")
            .datum(countryUnemploymentData)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", lineUnemployment)
            .attr("transform", `translate(${padding.left},${padding.top})`);

    });
}