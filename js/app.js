import { drawGenderVisualiation } from "./gender.js";

const topicTitle = d3.select('#topic-title');

// Define SVG dimensions and margins
const svgWidth = 1000;
const svgHeight = 200;
const margin = { top: 20, right: 30, bottom: 30, left: 60 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select('#visualization').append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .attr('id', "svg")
    .attr('style', 'background-color:white;');

// Create group for the chart area
let chart = svg.append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)
                    .attr('id', 'chart');

// Add on click event listener to the gender button
d3.select("#genderButton").on("click", () => {
    topicTitle.text("Gender Wage Gap in Australia");
    chart = drawGenderVisualiation(svg, chart, width, height);
});

d3.select("#unemploymentButton").on("click", () => {console.log("Clicked")})
