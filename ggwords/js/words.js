var app = {
        temp: false,
        data: [],
        padding: 25,
        rainbow: d3.scale.category20(),
        combine: false,
        prev: "single",
        state: {
            "bin.1": [],
            "bin.2": [],
            "bin.3": [],
            "bin.4": [],
            "single": []
        },
        tweets: {
            "October.2014": {},
            "November.2014": {},
            "December.2014": {},
            "January.2015": {},
            "February.2015": {},
            "March.2015": {}
        }
    };

function eventResize() {
    app.w = window.innerWidth - app.padding - 180;
    app.h = window.innerHeight - app.padding;

    d3.select("#Graph")
        .attr("width", app.w)
        .attr("height", app.h);
}

function updateGraph() {
    "use strict";
    var x = d3.scale.ordinal()
            .domain(["October.2014", "November.2014", "December.2014", "January.2015", "February.2015", "March.2015"])
            .rangePoints([app.padding * 3, app.w - app.padding]),

        y = d3.scale.linear()
            .range([app.padding, app.h - app.padding])
            .domain([0.03, 0]),

        svg = d3.select("#Graph")
            .attr("width", app.w)
            .attr("height", app.h),

        words,
        points = [],
        lines,
        value;

    if (app.prev === "single") {
        words = app.state["single"];

        app.data
            .filter(function (d) {
                return words.indexOf(d.name) > -1;
            })
            .forEach(function (d) {
                Object.keys(d).forEach(function (key) {
                    if (key !== "name" && key !== "totals") {
                        points.push({x: key, y: d[key], name: d.name});
                    }
                });
            });

        words.sort();

    } else {
        words = ["bin.1", "bin.2", "bin.3", "bin.4"];
        points = [];

        words.forEach(function (bin) {
            var dates = ["October.2014", "November.2014", "December.2014",
                        "January.2015", "February.2015", "March.2015"],
                new_ = [],

                nodes = app.data.filter(function (d) {
                        return app.state[bin].indexOf(d.name) > -1;
                    });

            dates.forEach(function (date) {
                var value = nodes.reduce(function (initial, value) {
                        return initial + value[date];
                    }, 0);

                //Average, comment out to return it to addition.
                value /= nodes.length;

                new_.push({x: date, y: value, name: bin});
            });

            points = points.concat(new_);
        });
    }

    //Align y axis.
    if (d3.select("#scale").property("value") === "Relative") {
        y.domain([d3.max(points, function (d) {return d.y; }), 0]);
    } else {
        y.domain([parseFloat(d3.select("#range").property("value")), 0]);
    }

    //Create axis.
    svg.selectAll("#xaxis").data([""]).enter()
        .append("g")
        .attr("id", "xaxis")
        .attr("class", "axis");

    svg.select("#xaxis")
        .attr("transform", "translate(0," + (app.h - app.padding) + ")")
        .call(
            d3.svg.axis()
                .scale(x)
                .orient("bottom")
        );

    svg.selectAll("#yaxis").data([""]).enter()
        .append("g")
        .attr("transform", "translate(" + (app.padding * 2)  + ", 0)")
        .attr("id", "yaxis")
        .attr("class", "axis");

    svg.select("#yaxis")
        .call(
            d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5)
                .tickFormat(function (tick) {
                    return (tick * 100).toString() + "%";
                })
        );

    function updatePopup (node) {
        var popup = d3.select("#popup");
        popup.style("display", "block");
        popup.style("left", (x(node.x) + app.padding).toString() + "px");
        popup.style("top", (y(node.y) + app.padding).toString() + "px");

        popup.select("h1").text(node.name);
        popup.select("p:nth-child(2)").text("x: " + node.x)
        popup.select("p:nth-child(3)").text("y: " + (node.y * 100).toFixed(2).toString() + "%")
    }

    function removePopup () {
        d3.select("#popup").style("display", "none");
    }

    // Points
    var circle = svg.selectAll("circle")
        .data(points);

    circle.enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 6);

    circle.exit().remove();

    circle
        .attr("fill", function (d) {return app.rainbow(words.indexOf(d.name)); })
        .attr("cx", function (d) {return x(d.x); })
        .attr("cy", function (d) {return y(d.y); })
        .on("mouseover", updatePopup)
        .on("mouseout", removePopup)
        .on("click", updateTweets);

    //Paths
    lines = words.map(function (word) {
        return points.filter(function (d) {
            return d.name === word;
        });
    });

    var linegen = d3.svg.line()
            .y(function (d) {return y(d.y); })
            .x(function (d) {return x(d.x); })
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
        .style("stroke", function (d, i) {return app.rainbow(i); });

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
        .attr("x", app.w - 50)
        .attr("fill", function (d, i) {return app.rainbow(i); })
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
        .attr("x", app.w - 60)
        .text(function (d) {return d; })
        .attr("y", function (d, i) {return i * 15 + 18; });
}

function updateTweets(node) {
    var data = app.tweets[node.x][node.name],
        tweets = d3.select("#tweets");

    if (data === undefined) {
        data = ["Sorry no tweets loaded for this word yet."];
    }

    if (app.prev === "single") {
        d3.select("#tweets").style("display", "block");
    }

    tweets.select("header h1").text(node.x + ": " + node.name);

    tweets = d3.select("#tweets")
        .selectAll("p")
        .data(data);

    tweets.enter()
        .append("p");

    tweets.exit()
        .remove();

    tweets.text(function (d) {return d; });



    app.temp = true;
}

function eventClear() {
    if (!app.temp) {
        d3.select("#tweets").style("display", "none")
    }
    app.temp = false;
}

function updateWords(words) {
    "use strict";
    var menu,
        f,
        data;

    //Sort nodes
    data = app.data.map(function (d) {return d.name; });
    if (d3.select("#order").property("value") !== "Frequency") {
        data.sort();
    }

    //Apply changes.
    menu = d3.select("#choose")
        .selectAll("option.words")
        .data(data);

    menu.enter()
        .append("option")
        .attr("class", "words");

    menu.exit()
        .remove();

    menu
        .text(function (d) {return d; })
        .property("selected", function (d) {
            return words.indexOf(d) > -1;
        });
}

function eventChange() {
    "use strict";
    //Hide ymax slider.
    if (d3.select("#scale").property("value") === "Relative") {
        d3.select("#parentRange").style("display", "none");
    } else {
        d3.select("#parentRange").style("display", "block");
    }

    //Hide bin selector.
    if (d3.select("#combine").property("checked")) {
        d3.select("#bins").style("display", "block");
    } else {
        d3.select("#bins").style("display", "none");
    }

    //Get state of visualization.
    var state;
    if (d3.select("#combine").property("checked")) {
        state = d3.select("#bins").property("value");
    } else {
        state = "single";
    }

    var words = [];
    //Update selected words.
    d3.selectAll("#choose option")
        .filter(function () {
            return this.selected;
        })
        .each(function () {
            words.push(this.text);
        });

    //Save words.
    if (app.prev === state) {
        app.state[state] = words;
    } else {
        words = app.state[state];
    }
    app.prev = state;

    //Update page.
    eventResize()
    updateWords(words);
    updateGraph();
    d3.select("#tweets").style("display", "none");
}

function eventLoad() {
    "use strict";
    eventResize()

    d3.select("#Control")
        .on("change", eventChange)
        .on("input", eventChange);

    window.onresize = eventChange;

    d3.select("body")
        .append("img")
        .attr("src", "static/ajax-loader.gif")
        .attr("class", "ajax");

    d3.select("#Graph")
        .on("click", eventClear);

    d3.csv("data/relative.csv", function (error, raw) {
    d3.csv("data/October-2014.csv", function (error1, tweets1) {
    d3.csv("data/November-2014.csv", function (error2, tweets2) {
    d3.csv("data/December-2014.csv", function (error3, tweets3) {
    d3.csv("data/January-2015.csv", function (error4, tweets4) {
    d3.csv("data/February-2015.csv", function (error5, tweets5) {
    d3.csv("data/March-2015.csv", function (error6, tweets6) {

        //Errors
        if (error || error1 || error2 || error3 || error4 || error5 || error6) {
            console.warn("There was an error.");
        }

        //Process relative
        raw.forEach(function (row) {
            Object.keys(row).forEach(function (key) {
                if (key !== "") {
                    row[key] = parseFloat(row[key], 10);
                }
            });
            row.name = row[''];
            delete row[''];
        });
        raw.sort(function (a, b) {
            return b.totals - a.totals;
        });
        app.data = raw;

        d3.select(".ajax").remove();
        eventChange();

        //Process tweets.
        var tweets = [tweets1, tweets2, tweets3, tweets4, tweets5, tweets6],
            dates= [
                "October.2014",
                "November.2014",
                "December.2014",
                "January.2015",
                "February.2015",
                "March.2015"
            ],
            i;

        tweets.forEach(function (month, i) {
            month.forEach(function (tweet) {
                if (!(app.tweets[dates[i]][tweet.keyword] instanceof Array)) {
                    app.tweets[dates[i]][tweet.keyword] = [];
                }
                app.tweets[dates[i]][tweet.keyword].push(tweet.tweet);
            });
        });
    });
    });
    });
    });
    });
    });
    });
}
