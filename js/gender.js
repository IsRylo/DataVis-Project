// Add some data
const data = [
  { year: 2013, privateMales: 1510.00, publicMales: 1646.90, privateFemales: 1205.20, publicFemales: 1432.30 },
  { year: 2014, privateMales: 1570.20, publicMales: 1674.90, privateFemales: 1223.30, publicFemales: 1469.00 },
  { year: 2015, privateMales: 1579.40, publicMales: 1725.40, privateFemales: 1249.50, publicFemales: 1518.30 },
  { year: 2016, privateMales: 1602.10, publicMales: 1783.80, privateFemales: 1288.30, publicFemales: 1571.10 },
  { year: 2017, privateMales: 1634.30, publicMales: 1826.90, privateFemales: 1322.50, publicFemales: 1625.50 },
  { year: 2018, privateMales: 1663.80, publicMales: 1869.60, privateFemales: 1370.00, publicFemales: 1672.30 },
  { year: 2019, privateMales: 1718.20, publicMales: 1921.00, privateFemales: 1423.00, publicFemales: 1715.00 },
  { year: 2020, privateMales: 1770.30, publicMales: 1975.40, privateFemales: 1476.20, publicFemales: 1763.70 },
  { year: 2021, privateMales: 1812.30, publicMales: 2030.20, privateFemales: 1504.50, publicFemales: 1801.80 },
  { year: 2022, privateMales: 1874.40, publicMales: 2090.40, privateFemales: 1574.10, publicFemales: 1859.20 },
  { year: 2023, privateMales: 1946.90, publicMales: 2184.60, privateFemales: 1660.70, publicFemales: 1959.60 }
];

export function drawGenderVisualiation(svg, chart, width, height) {   
  // Create the scales
  const xScale = d3.scaleLinear().domain([2013, 2023]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 2000]).range([height, 0]);

  // Create x-axis
  chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d')));

  // Create y-axis
  chart.append('g')
        .call(d3.axisLeft(yScale));

  // Define line functions
  const lineMale = d3.line()
                      .x(d => xScale(d.year))
                      .y(d => yScale(d.privateMales));

  const lineFemale = d3.line()
                        .x(d => xScale(d.year))
                        .y(d => yScale(d.privateFemales));

  // Add lines to the chart
  chart.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', lineMale);

  chart.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'salmon')
        .attr('stroke-width', 2)
        .attr('d', lineFemale);

  // Add data points with tooltips
  const circles = chart.selectAll('circle')
                        .data(data)
                        .enter()
                        .append('circle')
                        .attr('cx', d => xScale(d.year))
                        .attr('cy', d => yScale(d.privateMales))
                        .attr('r', 5)
                        .attr('fill', 'steelblue')
                        .attr('class', 'data-point')
                        .on('mouseover', handleMouseOver)
                        .on('mouseout', handleMouseOut);


  // Tooltip handling functions
  function handleMouseOver(event, d) {
    const tooltip = chart.append('g')
      .attr('class', 'tooltip')
      .style('display', 'none');

    tooltip.append('rect')
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('width', 120)
      .attr('height', 50)
      .attr('x', xScale(d.year) - 60)
      .attr('y', yScale(d.privateMales) - 70)
      .attr('rx', 5)
      .attr('ry', 5);

    tooltip.append('text')
      .attr('fill', '#fff')
      .attr('x', xScale(d.year))
      .attr('y', yScale(d.privateMales) - 45)
      .attr('text-anchor', 'middle')
      .text(`Year: ${d.year}`);

    tooltip.append('text')
      .attr('fill', '#fff')
      .attr('x', xScale(d.year))
      .attr('y', yScale(d.privateMales) - 25)
      .attr('text-anchor', 'middle')
      .text(`Male Rate: ${d.privateMales}%`);

    tooltip.style('display', 'block');
  }

  function handleMouseOut() {
    d3.selectAll('.tooltip').remove();
  }

  return chart;
}

