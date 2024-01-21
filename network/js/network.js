var PADDING = 25,
    SELECT = [],
    ARTICLES,
    LINKS,
    NODES,
    FORCE;

function findTool(num) {
    "use strict";
    var small = NODES.filter(function (node) {
        return node.id === num;
    });
    return small[0];
}

function filterData() {
    "use strict";
    var weight = d3.select("#controlWeight").property("value"),
        hide = d3.select("#checkEmpty").property("checked"),
        nodes_found = [],
        links_sub,
        nodes_sub;

    links_sub = LINKS.filter(function (d) {
        return d.weight > parseInt(weight, 10);
    });

    if (!hide) {
        links_sub.forEach(function (d) {
            nodes_found.push(d.source, d.target);
        });

        nodes_sub = NODES.filter(function (node) {
            return nodes_found.indexOf(node) > -1;
        });
    } else {
        nodes_sub = NODES;
    }

    return {"nodes": nodes_sub, "links": links_sub};
}

function updatePapers() {
    "use strict";
    var title,
        papers = d3.select("#papers"),
        tool = findTool(SELECT[0]),
        data = ARTICLES.filter(function (article) {
            return article["X" + SELECT[0]];
        }),
        para = papers.selectAll("p")
            .data(data);

    para.enter().append("p");
    para.exit().remove();
    para.html(function (d) {
        return "<i>"+d.anames+"</i>. CHum " + d.volume +"."+d.issue+" ("+d.year+")";
    });

    if (typeof tool === "undefined") {
        title = "";
    } else {
        title = tool.name;
    }
    d3.select("#papershead").text(title);
}

function updateForce(data) {
    "use strict";
    var control = parseInt(d3.select("#control").style("width"), 10),
        distance = d3.select("#controlDistance").property("value"),
        charge = d3.select("#controlCharge").property("value"),
        invertDist = d3.select("#checkDistance").property("checked"),
        linkDistance;

    if (invertDist) {
        linkDistance = function (d) {return distance * 300 / d.weight; }
    } else {
        linkDistance = function (d) {return distance * d.weight; }
    }

    FORCE
        .size([window.innerWidth - PADDING - control, window.innerHeight - PADDING - 50])
        .nodes(data.nodes)
        .links(data.links)
        .linkDistance(linkDistance)
        .charge(function (d) {return -d.weight * charge - 10; })
        .start();
}

function updateGraph() {
    "use strict";
    var controlW = parseInt(d3.select("#control").style("width"), 10),
        controlH = parseInt(d3.select("#control").style("height"), 10),
        w = window.innerWidth - 50 - controlW,
        h = window.innerHeight - PADDING - 90,
        data = filterData(),
        svg = d3.select("#graph"),
        links = svg.selectAll("line.link")
            .data(data.links, function (d) {return d.id; }),
        nodes = svg.selectAll("g.node")
            .data(data.nodes, function (d) {return d.id; }),
        other = [],
        temp;

    //Resize page
    d3.select("#svgcontainer")
        .style("width", w + "px");

    d3.select("#papers")
        .style("height", (window.innerHeight - PADDING - controlH - 38).toString() + "px");

    svg.attr("height", h)

    //Links
    links.enter()
        .insert("line", ".node")
        .attr("class", "link")
        .style("stroke-width", function (d) {return Math.pow(d.weight, 1/3); });

    links.exit().remove();
    links
        .classed("high", function (d) {
            var value = (d.source.id === SELECT[0] || d.target.id === SELECT[0]);
            if (value) {
                other.push(d.target.id, d.source.id);
            }
            return value;
        });

    //Nodes
    temp = nodes.enter()
        .append("g")
        .attr("class", "node");

    temp.append("circle")
        .attr("class", "point")
        .attr("r", 6)
        .on("click", eventClick)
        .call(FORCE.drag);

    temp.append("text")
        .attr("class", "text")
        .text(function (d) {return d.name; });

    nodes.exit().remove();
    nodes.selectAll(".point")
        .classed("high", function (d) {
            return d.id === SELECT[0];
        })
        .classed("other", function (d) {
            return d.id !== SELECT[0] && other.indexOf(d.id) > -1;
        });

    updateForce(data);
}

function updateHist() {
    "use strict";
    //Tick marks
    var dates = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
        controlW = parseInt(d3.select("#control").style("width"), 10),
        w = window.innerWidth - 50 - controlW,

        years = d3.time.scale()
            .domain([new Date("1964"), new Date("2006")])
            .range([25, w-25]),
        tickdata = ARTICLES.filter(function (article) {
                return article["X" + SELECT[0]];
            }),

        svg = d3.select("#hist")
            .attr("width", "100%")
            .attr("height", 50),

        ticks = svg.selectAll(".timetick")
            .data(tickdata);

    ticks.enter()
        .append("path")
        .attr("class", "timetick");

    ticks.exit().remove();

    ticks
        .attr('d', function (d) {
            var x = years(new Date(d.year, dates.indexOf(d.month)));
            return 'M ' + x + ' 25 l -3 -10 l 6 0 Z';
        });

    //Date axis
    var axies = svg.selectAll("#xaxis")
        .data(SELECT);

    axies.enter()
        .append("g")
        .attr("id", "xaxis")
        .attr("class", "axis");

    axies.exit().remove();

    axies.call(d3.svg.axis()
            .scale(years)
            .orient("bottom")
        )
        .attr("transform", "translate(0," + 25 + ")");
}


function eventInput() {
    "use strict";
    var ranges = ["Weight", "Charge", "Distance"];

    ranges.forEach(function (type) {
        var input = d3.select("#control" + type),
            output = d3.select("#display" + type);
        output.text(input.property("value"));
    });
    updateGraph();
}

function eventChange() {
    "use strict";
    updateGraph();
}

function eventClick(node) {
    "use strict";
    SELECT = [node.id];
    updateGraph();
    updateHist();
    updatePapers();
}

function eventClear() {
    "use strict";
    SELECT = [];
    updateGraph();
    updateHist();
    updatePapers();
}

function eventLoad() {
    "use strict";
    var folder = "data/";

    window.onresize = eventChange;
    d3.select("#topcontrol")
        .on("input", eventInput)
        .on("change", eventChange);

    d3.select("#reset")
        .on("click", eventClear);

    FORCE = d3.layout.force()
        .linkDistance(function (d) {return d.weight; })
        .on("tick", function () {
            d3.selectAll(".link")
                .attr("x1", function (d) {return d.source.x; })
                .attr("y1", function (d) {return d.source.y; })
                .attr("x2", function (d) {return d.target.x; })
                .attr("y2", function (d) {return d.target.y; });

            d3.selectAll(".point")
                .attr("cx", function (d) {return d.x; })
                .attr("cy", function (d) {return d.y; });

            d3.selectAll(".text")
                .attr("x", function (d) {return d.x - 10; })
                .attr("y", function (d) {return d.y - 10; });

        })
        .start();

    d3.select("body")
        .append("img")
        .attr("src", "static/ajax-loader.gif")
        .attr("class", "ajax");

    d3.csv(folder + "all_metadata.csv", function (error1, meta) {
        d3.json(folder + "links.json", function (error2, links) {
            d3.json(folder + "nodes.json", function (error3, nodes) {
                if (error1 || error2 || error3) {
                    console.warn("There was an error.");
                }
                ARTICLES = meta.map(function (col) {

                    var found = {};
                    d3.keys(col).forEach(function (key) {
                        if (key.indexOf("X") > -1) {
                            found[key] = (col[key] === "t");
                        } else if (key === "month" || key === "anames") {
                            found[key] = col[key];
                        } else {
                            found[key] = parseInt(col[key], 10);
                        }
                    });


                    return found;
                });
                d3.select(".ajax").remove();
                FORCE
                    .links(links)
                    .nodes(nodes)
                    .start();
                LINKS = links;
                NODES = nodes;
                eventInput();
                updateHist();
            });
        });
    });
}
