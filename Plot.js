colorPallate = ({
    'Base': 'black',
    'Limit BMI to 18.5 to 25': 'blue',
    'Sleep for 7 to 9 hours per day': 'green',
    'Quit smoking': 'red'
});

buildColorPicker = function(data) {
    return Object.keys(data).reduce((o, k, i) => {
        o[k] = colorPallate[k]; return o;
    }, {});
};

getX = function(data) {
    const data_all = [].concat.apply([], Object.values(data));
    return d3.scaleLinear()
        .domain([d3.min(data_all, d => d.AGE) - 2.5, d3.max(data_all, d => d.AGE) + 2.5])
        .range([margin.left, width - margin.right])
};

getY = function(data, yVar) {
    const data_all = [].concat.apply([], Object.values(data));
    return d3.scaleLinear()
        .domain([d3.min(data_all, d => d[yVar]) * 0.9, d3.max(data_all, d => d[yVar]) * 1.1]).nice()
        .range([height - margin.bottom, margin.top])
};

createLegend = function(selector, data) {
    // Convert color picker to colors with list of {Topic, Color} objects
    const colorPicker = buildColorPicker(data);
    const colors = Object.keys(colorPicker).reduce((o, k, i) => {
        o.push({'Topic': k, 'Color': colorPicker[k]});
        return o;
    }, []);

    // Legend width and height
    const legendWidth = 200;
    const legendHeight = 20 * colors.length;

    const svg = d3.select(selector).append("svg").attr("viewBox", [0, 0, legendWidth, legendHeight]);
    const g = svg.append("g")
        .attr("transform", `translate(5,10)`)
        .attr("text-anchor", "end")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(colors)
        .join("g")

    g.append("rect")
        .attr("x", legendWidth - 20)
        .attr("y", (d, i) => i * 15)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => d.Color);

    g.append("text")
        .attr("width", 120)
        .attr("x", legendWidth - 30)
        .attr("y", (d, i) => i * 15 + 8)
        .text(d => d.Topic);

    return svg.node();
};

drawLine = function(data, svg, yVar, color, x, y) {
    const line = d3.line()
        .x(d => x(d.AGE))
        .y(d => y(d[yVar]));

    // Details
    const detail_width = 450;
    const detail = svg.append('g')
        .attr('class', 'detail')
        .attr("transform", `translate(${width - margin.right - detail_width}, ${height - margin.bottom - 30})`)
        .style("visibility", "hidden");

    const detail_box = detail.append('rect')
        .attr('width', detail_width)
        .attr('height', 60)
        .attr('fill', 'white')
        .style('opacity', 0);

    const detail_text = detail.append('text')
        .attr('x', detail_width - 60)
        .attr('dy', '1.2em')
        .attr('width', detail_width)
        .attr('height', 30)
        .style('text-anchor', 'end')
        .style('white-space', 'pre-wrap')
        .attr("font-family", "sans-serif")
        .attr('font-size', '15px')
        .attr('font-weight', 'bold');

    // Line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    svg.append("g")
        .attr("fill", color)
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .selectAll("g")
        .data(data)
        .join("circle")
        .attr("transform", d => `translate(${x(d.AGE)},${y(d[yVar])})`)
        .attr("r", 3)
        .on('mouseover', function(d) {
            d3.select(this)
                .transition()
                .attr('stroke', 'black');
            svg.select('.detail')
                .style('visibility', "visible")
                .select('text')
                .text(
                    "[" + d.TOPIC + "]" +
                    "\xa0\xa0Age: " + d.AGE +
                    "\xa0\xa0Risk: " + d[yVar].toFixed(2) + "x"
                )
                .raise();
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .attr('stroke', color);
            svg.select('.detail').style('visibility', "hidden");
            svg.select('.transcript').style('visibility', "hidden");
        });
};

createBoard = function(selector, data, yVar) {
    let svg = d3.select(selector).append("svg").attr("viewBox", [0, 0, width, height]);
    const data_base = data['Base'];
    const x = getX(data);
    const y = getY(data, yVar);
    const colorPicker = buildColorPicker(data);
    //
    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(d3.map(data_base, d => d.AGE).keys()))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("y", -12)
            .attr("x", 20)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("AGE")
        );

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 5)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(yVar)
        );


    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    for (let [topic, data_topic] of Object.entries(data)) {
        drawLine(data_topic, svg, yVar, colorPicker[topic], x, y);
    }
};
height = 500;
width = 900;
margin = ({top: 20, right: 30, bottom: 30, left: 40});
