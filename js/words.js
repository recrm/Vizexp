var RAW;

function eventMouseOver(data) {
    "use strict";
    var xpad = 20,
        ypad = 16,
        linebr = 15,
        svg = d3.select("#Graph"),
        circle = d3.select(this),
        x = parseInt(circle.attr("cx"), 10),
        y = parseInt(circle.attr("cy"), 10);

    svg.append("rect")
        .attr("x", x - 50)
        .attr("y", y - 60)
        .attr("rx", 5)
        .attr("ry", 5)
        .attr("height", 50)
        .attr("width", 125)
        .attr("id", "tooltip")
        .attr("class", "temp");

    svg.append("text")
        .attr("x", x - 65 + xpad)
        .attr("y", y - 60 + ypad)
        .attr("class", "temp")
        .text("Year: " + data.year);

    svg.append("text")
        .attr("x", x - 65 + xpad)
        .attr("y", y - 60 + ypad + linebr)
        .attr("class", "temp")
        .text("Count: " + data.count);

    svg.append("text")
        .attr("x", x - 65 + xpad)
        .attr("y", y - 60 + ypad + linebr * 2)
        .attr("class", "temp")
        .text("Total: " + data.total);
}

function updateGraph() {
    "use strict";
    var padding = 60,
        w = window.innerWidth - 200,
        h = window.innerHeight - 60,
        rainbow = d3.scale.category20(),
        words = selectMultiple("#choose"),
        S = d3.select("#smooth").property("value"),

        points = RAW.filter(function (d) {
            return words.indexOf(d.text) > -1;
        }),

        lines = words.map(function (word) {
            return RAW.filter(function (d) {
                return d.text === word;
            }).sort(function (a, b) {
                return a.year - b.year;
            });
        }),

        x = d3.scale.linear()
            .range([padding, w - padding])
            .domain([1965, 2005]),

        y = d3.scale.linear()
            .range([padding, h - padding])
            .domain([d3.max(points, function (d) {return d["X" + S]; }), 0]),

        svg = d3.select("#Graph")
            .attr("width", w)
            .attr("height", h);

    svg.selectAll("#xaxis").data([""]).enter()
        .append("g")
        .attr("id", "xaxis")
        .attr("class", "axis");

    svg.select("#xaxis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(
            d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(10)
                .tickFormat(d3.format(""))
        );

    svg.selectAll("#yaxis").data([""]).enter()
        .append("g")
        .attr("transform", "translate(" + padding + ", 0)")
        .attr("id", "yaxis")
        .attr("class", "axis");

    svg.select("#yaxis")
        .call(
            d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5)
        );

    // Points
    var circle = svg.selectAll("circle")
        .data(points);

    circle.enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 5);

    circle.exit().remove();

    circle
        .attr("fill", function (d) {return rainbow(words.indexOf(d.text)); })
        .attr("cx", function (d) {return x(d.year); })
        .attr("cy", function (d) {return y(d["X" + S]); })
        .on("mouseover", eventMouseOver)
        .on("mouseout", function () {d3.selectAll(".temp").remove(); });

    //Paths
    var linegen = d3.svg.line()
        .y(function (d) {return y(d["X" + S]); })
        .x(function (d) {return x(d.year); })
        .interpolate("linear"),

        paths = svg.selectAll("path.path")
        .data(lines);

    paths.enter()
        .insert("path", ".point")
        .attr("class", "path")
        .style("stroke-width", 1)
        .style("fill", "none");

    paths.exit().remove();
    paths
        .attr("d", function (d) {return linegen(d); })
        .style("stroke", function (d, i) {return rainbow(i); });

    //legend squares
    var legend = svg.selectAll("rect.legend")
        .data(words);

    legend.enter()
        .append("rect")
        .attr("class", "legend")
        .attr("height", 10)
        .attr("width", 10);

    legend.exit().remove();

    legend
        .attr("x", w - 50)
        .attr("fill", function (d, i) {return rainbow(i); })
        .attr("y", function (d, i) {return i * 15 + 10; });

    // legend text
    var text = svg.selectAll("text.legend")
        .data(words);

    text.enter()
        .append("text")
        .attr("class", "legend")
        .attr("text-anchor", "end")
        .attr("class", "legend");

    text.exit().remove();

    text
        .attr("x", w - 60)
        .text(function (d) {return d; })
        .attr("y", function (d, i) {return i * 15 + 18; });
}

function updateWords() {
    "use strict";
    var order = d3.select("#order").property("value"),
        mapping = RAW.map(function (d) {
            return {"text": d.text, "total": d.wordtot};
        });

    if (order === "Frequency") {
        mapping.sort(function (a, b) {return b.total - a.total; });
    } else {
        mapping.sort();
    }

    var keywords = getUnique(mapping, function (d) {return d.text; }),

        menu = d3.select("#choose").selectAll("option.words")
            .data(keywords);

    menu.enter()
        .append("option")
        .attr("class", "words");

    menu.exit().remove();
    menu.text(function (d) {return d; });
}

function eventInput() {
    "use strict";
    var value = d3.select("#smooth").property("value");
    d3.select("#showsmooth").property("value", value - 1);
}

function eventChange() {
    "use strict";
    eventInput();
    updateWords();
    updateGraph();
}

function eventLoad() {
    "use strict";
    var datapath = "data/";
    d3.select("#Control")
        .on("change", eventChange)
        .on("input", eventInput);

    window.onresize = eventChange;
    
    d3.select("body")
        .append("img")
        .attr("src", "static/ajax-loader.gif")
        .attr("class", "ajax");

    d3.csv(datapath + "words.csv", function (error, raw) {
        if (error) {
            console.warn("There was an error.");
        }
        
        raw.forEach(function (row) {
            Object.keys(row).forEach(function (key) {
                if (key !== "text") {
                    row[key] = parseFloat(row[key], 10);
                }
            });
        });
        d3.select(".ajax").remove();
        RAW = raw;
        eventChange();
    });
}
