d3.json("data.json").then(function(data) {
    console.log(data); // Log the data to the console

    // Set up margins and dimensions for the chart
    const margin = { top: 50, right: 100, bottom: 100, left: 200 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define the color scale for the heatmap
    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, 1]); // Normalize to 0-1 range

    // Get the unique courses
    const courses = Array.from(new Set(data.map(d => d.Course)));

    // Set the scales for the axes
    const xScale = d3.scaleBand()
        .domain(["Approved"]) // Only include "Approved"
        .range([0, width])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain(courses)
        .range([0, height])
        .padding(0.05);

    // Create axes
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Create the heatmap cells
    svg.selectAll(".cell")
        .data(data)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale("Approved"))
        .attr("y", d => yScale(d.Course))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.approved_rate))
        .on("mouseover", function(event, d) {
            // Show tooltip on hover
            const tooltip = d3.select(".tooltip");
            tooltip.style("display", "block")
                .html(`
                    <strong>Course:</strong> ${d.Course} <br>
                    <strong>Approved Rate:</strong> ${d.approved_rate}
                `)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            // Hide tooltip on mouseout
            d3.select(".tooltip").style("display", "none");
        });

    // Add a colorbar
    const colorBarHeight = 300;
    const colorBarWidth = 20;

    // Colorbar scale
    const colorBarScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, colorBarHeight]);

    // Add a group for the colorbar
    const colorBarGroup = svg.append("g")
        .attr("transform", `translate(${width + 40},${(height - colorBarHeight) / 2})`);

    // Define a more granular gradient
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "color-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    // Add multiple stops to the gradient to reflect the full color scale
    const numStops = 100; // Increase for smoother transitions
    d3.range(numStops).forEach(i => {
        gradient.append("stop")
            .attr("offset", `${(i / (numStops - 1)) * 100}%`)
            .attr("stop-color", d3.interpolateViridis(i / (numStops - 1)));
    });

    // Colorbar rectangle
    colorBarGroup.append("rect")
        .attr("width", colorBarWidth)
        .attr("height", colorBarHeight)
        .style("fill", "url(#color-gradient)");

    // Add colorbar axis
    colorBarGroup.append("g")
        .attr("transform", `translate(${colorBarWidth}, 0)`)
        .call(d3.axisRight(colorBarScale).ticks(6));
});
