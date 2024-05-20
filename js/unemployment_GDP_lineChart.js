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
    top: 60,
    left: 60,
    right: 60,
    bottom: 60
};

// Setting up the svg dimensions
const svgWidth = width - padding.left - padding.right;
const svgHeight = height - padding.top - padding.bottom;

// Function to draw the line graph for a selected country
export function drawLineGraph(country, gdpData) {
    // Creating the svg
    const lineContainer = d3.select("#unemployment-chart-container")
    .attr("width", width)
    .attr("height", height);
    lineContainer.selectAll("*").remove();
    
    // Get the data
    d3.csv(unemploymentDataFile).then((unemploymentData) => {
        // Filter data for the selected country
        const countryGDPData = gdpData.filter(d => d.COU === country && d.YEA >= 2010 && d.YEA <= 2022);
        const countryUnemploymentData = unemploymentData.filter(d => d.COU === country &&  d.YEA >= 2010 && d.YEA <= 2022);
        
        // Selecting the svg
        const lineSVG = d3.select('#unemployment-chart-container').append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);
        
        // Create scales
        const xScale = d3.scaleLinear()
        .domain(
            [2010,
            d3.max(countryGDPData, d => d.YEA)]
        )
        .range([0, svgWidth - padding.left - padding.right]);
        console.log(xScale.domain());
        
        const yScaleGDP = d3.scaleLinear()
        .domain([0, d3.max(countryGDPData, d => +d.GDP)])
        .range([svgHeight - padding.top - padding.bottom, 0]);
        
        const yScaleUnemployment = d3.scaleLinear()
            .domain([0, d3.max(countryUnemploymentData, d => +d.Unemployment_Percent)])
            .range([svgHeight - padding.top - padding.bottom, 0]);

        // Create line generators
        const lineGDP = d3.line()
            .x(d => xScale(+d.YEA))
            .y(d => yScaleGDP(+d.GDP));

        const lineUnemployment = d3.line()
            .x(d => xScale(+d.YEA))
            .y(d => yScaleUnemployment(+d.Unemployment_Percent));

                // Append title
                lineSVG.append("text")
                .attr("x", (svgWidth / 2))             
                .attr("y", padding.top / 2)
                .attr("text-anchor", "middle")  
                .style("font-size", "16px") 
                .style("font-weight", "bold")
                .style("fill", "#fff") 
                .text(`GDP and Unemployment Rate for ${countryGDPData[0]['Country']}`);
    
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
    
            // Append grid lines
            lineSVG.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(${padding.left},${svgHeight - padding.bottom})`)
                .call(d3.axisBottom(xScale).tickSize(-svgHeight + padding.top + padding.bottom).tickFormat(""))
                .selectAll("line")
                .attr("stroke", "lightgrey")
                .attr("stroke-opacity", 0.5);
    
            lineSVG.append("g")
                .attr("class", "grid")
                .attr("transform", `translate(${padding.left},${padding.top})`)
                .call(d3.axisLeft(yScaleGDP).tickSize(-svgWidth + padding.left + padding.right).tickFormat(""))
                .selectAll("line")
                .attr("stroke", "lightgrey")
                .attr("stroke-opacity", 0.5);
    
            // Append lines with transitions
            const pathGDP = lineSVG.append("path")
                .datum(countryGDPData)
                .attr("fill", "none")
                .attr("stroke", "yellow")
                .attr("stroke-width", 3)
                .attr("d", lineGDP)
                .attr("transform", `translate(${padding.left},${padding.top})`);
    
            const pathUnemployment = lineSVG.append("path")
                .datum(countryUnemploymentData)
                .attr("fill", "none")
                .attr("stroke", "lightgreen")
                .attr("stroke-width", 3)
                .attr("d", lineUnemployment)
                .attr("transform", `translate(${padding.left},${padding.top})`);
    
            const totalLengthGDP = pathGDP.node().getTotalLength();
            const totalLengthUnemployment = pathUnemployment.node().getTotalLength();
    
            pathGDP
                .attr("stroke-dasharray", totalLengthGDP + " " + totalLengthGDP)
                .attr("stroke-dashoffset", totalLengthGDP)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
    
            pathUnemployment
                .attr("stroke-dasharray", totalLengthUnemployment + " " + totalLengthUnemployment)
                .attr("stroke-dashoffset", totalLengthUnemployment)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);
    
            // Append axis labels
            lineSVG.append("text")
                .attr("transform", `translate(${(svgWidth / 2)}, ${svgHeight - (padding.bottom / 2)})`)
                .style("text-anchor", "middle")
                .style("fill", "white")
                .text("Year");
    
            lineSVG.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - padding.left)
                .attr("x", 0 - (svgHeight / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("GDP");
    
            lineSVG.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", svgWidth - padding.right + 20)
                .attr("x", 0 - (svgHeight / 2))
                .attr("dy", "1em")
                .style("fill", "white")
                .style("text-anchor", "middle")
                .text("Unemployment Rate (%)");
    
            // Add legend
            const legend = lineSVG.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${svgWidth - padding.right - 150}, ${svgHeight - padding.bottom - 50})`);
    
            legend.append("rect")
                .attr("width", 150)
                .attr("height", 50)
                .attr("fill", "transparent")
                .attr("stroke", "transparent")
                .attr("stroke-width", 1);
    
            legend.append("line")
                .attr("x1", 10)
                .attr("y1", 15)
                .attr("x2", 30)
                .attr("y2", 15)
                .attr("stroke", "lightgreen")
                .attr("stroke-width", 1.5);
    
            legend.append("text")
                .attr("x", 40)
                .attr("y", 20)
                .style("text-anchor", "start")
                .style("fill", "white")
                .text("GDP");
    
            legend.append("line")
                .attr("x1", 10)
                .attr("y1", 35)
                .attr("x2", 30)
                .attr("y2", 35)
                .attr("stroke", "yellow")
                .attr("stroke-width", 1.5);
    
            legend.append("text")
                .attr("x", 40)
                .attr("y", 40)
                .style("text-anchor", "start")
                .style("fill", "white")
                .text("Unemployment");
    });
}
