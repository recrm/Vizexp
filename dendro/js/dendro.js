var d3,
    Dendro,
    console,
    DENDRO,
    HIST,
    METADATA,
    CLICK = false,
    HIGH = [],
    YFORMAT = [
        {
            "id": "6",
            "short": "sixty",
            "label": "1960s",
            "meta": "years"
        },
        {
            "id": "7",
            "short": "seventy",
            "label": "1970s"
        },
        {
            "id": "8",
            "short": "eighty",
            "label": "1980s"
        },
        {
            "id": "9",
            "short": "ninty",
            "label": "1990s"
        },
        {
            "id": "0",
            "short": "millenium",
            "label": "2000s"
        }
    ],
    PFORMAT = [
        {
            "id": "Describe computer-assisted research",
            "short": "desc",
            "label": "Describe",
            "meta": "types"
        },
        {
            "id": "Review",
            "short": "review",
            "label": "Review"
        },
        {
            "id": "Present tool and development",
            "short": "presen",
            "label": "Present"
        },
        {
            "id": "Other",
            "short": "other",
            "label": "Other"
        }
    ];

function updateDendro() {
    "use strict";
    var h = 408,
        padding = 25,
        lines_padding = 6,
        lines_height = 50,
        row_padding = 1,
        levels = [30, 25, 20, 15, 10, 5, 0],
        y = lines_padding,
        type = (d3.select("#check").property("checked") ? YFORMAT : PFORMAT),
        value = type[0].meta,
        svg = d3.select("#Dendro")
            .attr("width", 500 + row_padding * 500 + (2 * padding))
            .attr("height", h);

    levels.forEach(function (level) {
        var data_cut = Dendro.cut(level - 5, level, DENDRO);

        type.forEach(function (type) {

            var rect = svg.selectAll(".level" + level + "." + type.short)
                .data(data_cut, function (d) {return d.id; });

            rect.enter()
                .append("rect")
                .on("click", eventClick)
                .attr("y", y)
                .attr("height", lines_height + 0.5)
                .attr("x", function (d) {
                    return padding + d.loc + d.temp;
                })
                .attr("width", function (d) {
                    return d[value][type.id] + 0.5;
                })
                .each(function (d) {
                    d.temp += d[value][type.id];
                });

            rect
                .attr("class", function (d) {
                    if (HIGH.length > 0) {
                        if (Set.equal(HIGH, d.children)) {
                            return "click";
                        }
                        if (Set.intersect(HIGH, d.children).length > 0) {
                            return "high";
                        }
                        return "low";
                    }
                })
                .classed("old", function (d) {return d.old; })
                .classed(type.short, true)
                .classed("level" + level, true)
                .classed("data", true);
        });
        y += (lines_height + lines_padding);
    });

    // legend squares
    var legend = svg.selectAll("g.legend")
        .data(type);

    var g = legend.enter()
        .append("g")
        .attr("class", "legend");

    legend.exit().remove();

    g.append("rect")
        .attr("height", 10)
        .attr("width", 10)
        .attr("x", 1010)
        .attr("class", "legend");

    g.append("text")
        .attr("x", 990)
        .attr("text-anchor", "end")
        .attr("class", "legend");

    svg.selectAll("rect.legend")
        .data(type)
        .attr("y", function (d) {return type.indexOf(d) * 25 + 18; })
        .attr("class", function (d) {return "legend " + d.short; });

    svg.selectAll("text.legend")
        .data(type)
        .text(function (d) {return d.label; })
            .attr("y", function (d) {return type.indexOf(d) * 25 + 26; });
}

function updateHist() {
    "use strict";
    var h = 200,
        w = 550,
        width = 10,
        padding = 30,
        type = (d3.select("#check").property("checked") ? YFORMAT : PFORMAT),
        value = type[0].meta,
        svg = d3.select("#Hist")
            .attr("width", w)
            .attr("height", h),

    //axies
        yscale = d3.scale.linear()
            .range([h, padding])
            .domain([0, d3.max(HIST, function (d) {
                return d.children.length;
            }) + 5]),

        xscale = d3.scale.linear()
            .range([padding * 1.3, w - padding])
            .domain([d3.min(HIST, function (d) {
                return parseInt(d.id, 10);
            }), d3.max(HIST, function (d) {
                return parseInt(d.id, 10);
            })]);

    svg.selectAll("#xaxis").data([""]).enter()
        .append("g")
        .attr("id", "xaxis")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",-" + padding + ")")
        .call(d3.svg.axis()
            .scale(yscale)
            .orient("left")
            .ticks(5)
        );

    svg.selectAll("#yaxis").data([""]).enter()
        .append("g")
        .attr("id", "yaxis")
        .attr("class", "axis")
        .attr("transform", "translate(" + (width / 2) + "," + (h - padding) + ")")
        .call(d3.svg.axis()
            .scale(xscale)
            .orient("bottom")
            .tickFormat(d3.format(""))
        );

    type.forEach(function (type) {

        var rect = svg.selectAll("." + type.short)
            .data(HIST, function (d) {return d.id; });

        rect.enter()
            .append("rect")
            .attr("width", width)
            .on("click", eventClick)
            .attr("height", function (d) {
                return h - yscale(d[value][type.id]) + 0.5;
            })
            .attr("y", function (d) {
                return yscale(d.children.length - parseInt(d.temp, 10)) - padding - 1;
            })
            .attr("x", function (d) {
                return xscale(d.id);
            })
            .each(function (d) {
                d.temp = parseInt(d[value][type.id], 10) + parseInt(d.temp, 10);
            });

        rect
            .attr("class", function (d) {
                if (HIGH.length > 0) {
                    if (Set.equal(HIGH, d.children)) {
                        return "click";
                    }
                    if (Set.intersect(HIGH, d.children).length > 0) {
                        return "high";
                    }
                    return "low";
                }
            })
            .classed(type.short, true);
    });
    HIST.forEach(function (row) {
        row.temp = 0;
    });
}

function updatePapers() {
    "use strict";
    var data = METADATA.filter(function (row) {
            return HIGH.indexOf(row.Index) > -1;
        }),
        type = (d3.select("#check").property("checked") ? YFORMAT : PFORMAT),
        rows = d3.select("#papers").selectAll("p")
            .data(data);

    rows.enter().append("p");
    rows.exit().remove();

    rows
        .html(function (d) {
            return d.Author + ". <cite>" + d.Title  + "</cite>, " + d.Year;
        })
        .attr("class", function (d) {
            var found;
            if (type[0].meta === "types") {
                found = type.filter(function (e) {return d.Article_Purpose === e.id; });
                if (found.length !== 0) {
                    return found[0].short;
                }
                return "other";
            }
            found = type.filter(function (e) {return d.Year[2] === e.id; });
            return found[0].short;
        });
}

function updateInfo(data) {
    "use strict";
    var div = d3.select("#info"),
        type = (d3.select("#check").property("checked") ? YFORMAT : PFORMAT),
        value = type[0].meta,
        ptype;

    if (!data) {
        return false;
    }

    div.selectAll("p.head").data([""]).enter()
        .append("p")
        .attr("class", "head");

    div.selectAll("p.head")
        .text(function () {
            return "Total: " + data.children.length;
        });

    ptype = div.selectAll("p.type")
        .data(type);

    ptype.enter()
        .append("p")
        .attr("class", "type");

    ptype.exit().remove();

    ptype.text(function (d) {
        return d.label + ": " + data[value][d.id];
    });
}

function eventLoad() {
    "use strict";
    var folder = "data/";

    d3.select("#check").on("change", eventCheck);
    d3.select("#reset").on("click", eventClear);

    d3.select("body")
        .append("img")
        .attr("src", "static/ajax-loader.gif")
        .attr("class", "ajax");

    d3.json(folder + "dendro.json", function (error1, dendro) {
        d3.json(folder + "hist.json", function (error2, hist) {
            d3.csv(folder + "500_metadata.csv", function (error3, meta) {
                if (error1 || error2 || error3) {
                    console.warn("There was an error.");
                }
                d3.select(".ajax").remove();
                METADATA = meta.map(function (row) {
                    row.Index = parseInt(row.Index, 10);
                    return row;
                });
                DENDRO = dendro;
                HIST = hist;
                updatePage(false);
            });
        });
    });
}

function updatePage(node) {
    "use strict";
    updateHist();
    updateDendro();
    updatePapers();
    updateInfo(node);
}

function eventClick(node) {
    "use strict";
    CLICK = node;
    HIGH = node.children;
    updatePage(CLICK);
}

function eventCheck() {
    "use strict";
    d3.select("#Hist").selectAll("rect").remove();
    d3.select("#Dendro").selectAll("rect.data").remove();
    updatePage(CLICK);
}

function eventClear() {
    "use strict";
    HIGH = [];
    CLICK = false;
    updatePage(false);
}

