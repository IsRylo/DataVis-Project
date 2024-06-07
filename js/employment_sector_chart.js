// Specifying the data 
const employmentSectorFile = 'data/employee_sector.csv';
// Specifying the containers and HTML elements
const slider = d3.select('#year-sector-slider');
const yearValue = d3.select('#year-sector-value');
const tooltip = d3.select("#tooltip");
const sliderContainer = d3.select('.slider-sector-container');
sliderContainer.classed("hidden", true);

let legendGroup = null;

// Setting up the svg container
const width = 1000;
const height = 700;

const svgContainer = d3.select('#employment-sector-chart-container')
                            .attr("width", width)
                            .attr("height", height);

// Setting up the padding
const padding = {
    top: 20,
    left: 20,
    right: 20,
    bottom: 20
};

const legendWidth = 200;
// Setting up the svg dimensions
const svgWidth = width - padding.left - padding.right - legendWidth;
const svgHeight = height - padding.top - padding.bottom;

let svg = null;

// Setting up the color
const colorScale = d3.scaleOrdinal()
colorScale.range(d3.schemeCategory10);

// Helper function to take in the 'CodeA-CodB' and return the alphabets in between
function expandSectorCode(code) {
    code = code.trimStart().trimEnd();
    const sectors = [];
    const ranges = code.split('-');
    
    if (ranges.length === 1) {
        return [];
    }
    
    const startChar = ranges[0].charCodeAt(0);
    const endChar = ranges[1].charCodeAt(0);
    
    for (let i = startChar; i <= endChar; i++) {
        sectors.push(String.fromCharCode(i));
    }
    
    return sectors;
}

// Helper function to prune redudant string id
function removeStringIDs(tree) {
    if (!tree || typeof tree !== 'object') {
        return; // Exit if the node is null or not an object
    }

    // Check if the node has children
    if (Array.isArray(tree.children)) {
        // Filter out string IDs from children array
        tree.children = tree.children.filter(child => typeof child !== 'string');

        // Recursively remove string IDs from children nodes
        tree.children.forEach(child => removeStringIDs(child));
    }
}

// Function to create a hierarchical structure
function createHierarchy(data, location, year) {
    let root = { name: "root", children: [] };

    // Process and group data by sector code and location
    data.forEach(d => {
        if (d.LOCATION === location && parseFloat(d.TIME) === year) {
            const sectors = expandSectorCode(d.SECTOR_CODE);
            // Push the sectors and the data into the root
            root.children.push({
                name: d.SECTOR_TITLE.trimEnd(),
                value: d.VALUE,
                id: d.SECTOR_CODE.trimStart().trimEnd(),
                children: sectors,
            });
        }
    });

    // Constructing the tree
    let nodes = root.children;
    // Sort nodes based on the number of children in ascending order
    nodes.sort((a, b) => {
        return a.children.length - b.children.length;
    });

    for (let i = 0; i < nodes.length - 1; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[i].children < 1) {
                continue;
            }
            // Get the array of children 
            const childArr = nodes[i].children;
            // Check if the next array contains the same children as the previous array
            // Find the index where arrB starts in arrA
            let index = nodes[j].children.findIndex((d, index) => {
                // console.log(childArr.every((value, iterator) => value === nodes[j].children[index + iterator]));
                // console.log(index);
                return childArr.every((value, iterator) => value === nodes[j].children[index + iterator]);
            });

            if (index !== -1) {
                // console.log("Params: " + i + " " + j + " index " + index +  "  " + " Replacing " + nodes[j].children[index] + " with " + nodes[i].id);
                nodes[j].children.splice(index, childArr.length, nodes[i].id);

            }
        }
    }

    // console.log(nodes);
    let result = null;

    // Build tree structure
    nodes.forEach(item => {
        const parent = item;
        item.children.forEach(childId => {
            const child = nodes.find((d) => d.id == childId);
            // console.log(child);
            if (child) {
                parent.children.push(child);
            }
        });
    });

    // Find and return the root node
    Object.values(nodes).forEach(node => {
        if (!Object.values(nodes).some(n => n.children.includes(node))) {
            result = node;
        }
    });

    removeStringIDs(result);
    return result;
}


export function employment_sector_chart(countryCode, year) {
    // Select the SVG element
    // Selecting the svg
    svgContainer.selectAll("*").remove();

    svg = svgContainer.append('svg')
        .attr('width', svgWidth)
        .attr('height', svgHeight);

    // Get the data
    d3.csv(employmentSectorFile).then((employmentSectorData) => {
        const hierarchyData = createHierarchy(employmentSectorData, countryCode, year);
        if (hierarchyData) {
            sliderContainer.classed("hidden", false);
            draw(hierarchyData);
            // Update map based on slider value
            slider.on('input', function() {
                console.log("Sector Slider Triggered");
                const selectedYear = +this.value;
                yearValue.text(selectedYear);
                const newHierarchy = createHierarchy(employmentSectorData, countryCode, selectedYear);

                update(newHierarchy);
            });
        } else {
            svg.append("text")
                .attr("class", "no-data-message")
                .attr("x", width / 2)
                .attr("y", height / 2)
                .attr("text-anchor", "middle")
                .attr("font-size", "24px")
                .attr("fill", "white")
                .text("No employment data found :'C");
            return;
        }
    });
}

// Initial draw function with animations
function draw(data) {
    // Create the initial structure
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Calculate total value for percentage calculation
    const totalValue = root.value;
  
    const treemapLayout = d3.treemap()
      .size([width, height])
      .padding(1);
  
    treemapLayout(root);
  
    // Update the color scale domain with initial data names
    colorScale.domain(root.leaves().map(d => d.data.name));
  
    // Create legend data based on the initial color scale
    const legendData = root.leaves().map(d => ({
      name: d.data.name,
      color: colorScale(d.data.name)
    }));

    // Calculate dimensions and spacing for legend items
    const legendHeight = legendData.length * 20; // Assuming each item has 20px height
    const legendX = svgWidth - legendWidth + 10;
    const legendY = 5;
  
    // Add legend group
    const legendSVG = svgContainer.append('svg')
                    .attr("width", legendWidth)
                    .attr("height", svgHeight);
    legendGroup = legendSVG.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(10, 0)`);
    
    // Add colored rectangles to legend
    legendGroup.selectAll(".legend-item")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d.color);
  
    // Add labels to legend items
    legendGroup.selectAll(".legend-item")
      .append("text")
      .attr("x", 20)
      .attr("y", 9) // Center vertically within the rectangle
      .text(d => d.name)
      .style("font-size", "12px")
      .style("fill", "white");
  
    // Initial draw with transitions
    const treemapRects = svg.selectAll(".node")
      .data(root.leaves())
      .enter().append("rect")
      .attr("class", "node")
      .attr("x", d => (d.x0 + d.x1) / 2) // Start at center
      .attr("y", d => (d.y0 + d.y1) / 2) // Start at center
      .attr("width", 0) // Start with width 0
      .attr("height", 0) // Start with height 0
      .attr("fill", d => colorScale(d.data.name))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .transition()
      .duration(1000) // Transition duration in milliseconds
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("opacity", 1); // Transition to full opacity
  
    // Add values inside polygons with transitions
    svg.selectAll(".value")
      .data(root.leaves())
      .enter().append("text")
      .attr("class", "value")
      .attr("text-anchor", "middle")
      .attr("x", d => (d.x0 + d.x1) / 2)
      .attr("y", d => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("opacity", 0) 
      .text(d => `${((d.value / totalValue) * 100).toFixed(2)}%`)
      .transition()
      .duration(1000) // Transition duration in milliseconds
      .attr("opacity", 1); // Transition to full opacity
  }
  
function update(data) {
    // Create the hierarchical structure
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);
  
    const treemapLayout = d3.treemap()
      .size([width, height])
      .padding(1);
  
    treemapLayout(root);
  
    // Calculate total value for percentage calculation
    const totalValue = root.value;
  
    // Update the color scale domain with new data names
    colorScale.domain(root.leaves().map(d => d.data.name));
  
    // Create legend data based on the new color scale
    const legendData = root.leaves().map(d => ({
      name: d.data.name,
      color: colorScale(d.data.name)
    }));
  
    // Update legend items with transitions
    const legendItems = legendGroup.selectAll(".legend-item")
      .data(legendData, d => d.name);
  
    // Exit old legend items
    legendItems.exit().remove();
  
    // Enter new legend items
    const newLegendItems = legendItems.enter().append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);
  
    newLegendItems.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => d.color);
  
    newLegendItems.append("text")
      .attr("x", 20)
      .attr("y", 9) // Center vertically within the rectangle
      .text(d => d.name)
      .style("font-size", "12px")
      .style("fill", "white");
  
    // Merge and update legend items with transitions
    legendItems.merge(newLegendItems)
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);
  
    legendItems.select("rect")
      .transition()
      .duration(500)
      .attr("fill", d => d.color);
  
    legendItems.select("text")
      .transition()
      .duration(500)
      .text(d => d.name);
  
    // Update treemap data with transitions
    const treemapRects = svg.selectAll(".node")
      .data(root.leaves(), d => d.data.name);
  
    // Exit old rectangles
    treemapRects.exit()
      .transition()
      .duration(1000)
      .attr("width", 0)
      .attr("height", 0)
      .remove();
  
    // Enter new rectangles
    const newTreemapRects = treemapRects.enter().append("rect")
      .attr("class", "node")
      .attr("x", d => (d.x0 + d.x1) / 2) // Start at center
      .attr("y", d => (d.y0 + d.y1) / 2) // Start at center
      .attr("width", 0) // Start with width 0
      .attr("height", 0) // Start with height 0
      .attr("fill", d => colorScale(d.data.name))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  
    // Merge and update rectangles with transitions
    treemapRects.merge(newTreemapRects)
      .transition()
      .duration(1000)
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("opacity", 1);
  
    // Update values inside polygons with transitions
    const treemapValues = svg.selectAll(".value")
      .data(root.leaves(), d => d.data.name);
  
    // Exit old values
    treemapValues.exit()
      .transition()
      .duration(1000)
      .attr("opacity", 0)
      .remove();
  
    // Enter new values
    const newTreemapValues = treemapValues.enter().append("text")
      .attr("class", "value")
      .attr("text-anchor", "middle")
      .attr("x", d => (d.x0 + d.x1) / 2)
      .attr("y", d => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("opacity", 0) // Start with zero opacity for smooth transition
      .text(d => `${((d.value / totalValue) * 100).toFixed(2)}%`);
  
    // Merge and update values with transitions
    treemapValues.merge(newTreemapValues)
      .transition()
      .duration(1000)
      .attr("x", d => (d.x0 + d.x1) / 2)
      .attr("y", d => (d.y0 + d.y1) / 2)
      .attr("opacity", 1) // Transition to full opacity
      .text(d => `${((d.value / totalValue) * 100).toFixed(2)}%`);
  }  

// Function to handle mouseover event
function handleMouseOver(event, d) {
    // Add tooltip or other interactivity here
    tooltip.classed("hidden", false)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px")
            .html(`<strong>${d.data.name}</strong><br>People Employed: ${d.data.value * 1000}`);
}
  
  // Function to handle mouseout event
function handleMouseOut(d) {
    // Remove tooltip or reset interactivity here
    tooltip.classed("hidden", true);
}