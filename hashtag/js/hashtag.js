var d3,
    window,
    console,
    asGet,
    getUnique,
    isAlone,
    
    //Data loaded.
    LOAD = [],

    //Loaded tweet data.
    SELECT = false, //Currently selected node.
    NODE = false, //data from last query.
    
    //Interactive Highlight data
    HIGH = [],   //Dates that are highlighted.
    WORDS = [];  //Drawn hashtag Lines.

//********************************
//             Graph
//********************************

function updateGraph(trans) {
    "use strict";
    var offset = 0.25,
        w = window.innerWidth - 400,
        h = window.innerHeight - 60,
        top_bar_space = 40,
        padding = {top: 10, bottom: 40, left: 80, right: 80},
        rainbow = d3.scale.category20(),
        absolute = d3.select("#ViewType").property("value"),
        uniqueDays = getUnique(LOAD, function (d) {return d.day; }).sort(function (a, b) {return a - b; }),
        alone = isAlone(LOAD, function (t) {return t.id; }),
        selection,

        //create scale   
        svg = d3.select("#Graph")
            .attr("width", w)
            .attr("height", h),

        yvalue = (function () {
            if (absolute === "Sorted") {
                return [-1, 10];
            } else if (absolute === "Relative") {
                return [d3.max(LOAD, function(d){return d.count / d.total; }), 0];
            }
            return [d3.max(LOAD, function(d) {return d.count; }), 0];
        }()),

        checkabsolute = function (d) {
            if (absolute === "Sorted") {
                return y(d.index + (offset * (uniqueDays.indexOf(d.day) % 2)));
            } else if (absolute === "Relative") {
                return y(d.count / d.total);
            }
            return y(d.count);
        },

        y = d3.scale.linear()
            .domain(yvalue)
            .clamp(true)
            .range([padding.top + top_bar_space, h - padding.bottom]),

        x = d3.scale.linear()
            .domain(d3.extent(LOAD, function (d) {return d.day; }))
            .range([padding.left, w - padding.right]),

        line = d3.svg.line()
            .y(checkabsolute)
            .x(function (d) {return x(d.day); })
            .tension(0.1)
            .defined(function (d) {return !(d === undefined); })
            .interpolate("linear");
    
    d3.select("#Tweets").style("height", h + 'px');
    d3.select("#content").style("height", (function () {
        var top = parseInt(d3.select("#buttons").style("height"), 10),
            bottom = parseInt(d3.select("#tweetpanel").style("height"), 10);
        return (h - top - bottom) + "px";
    }()));

    uniqueDays.sort();

    //top bar
    svg.selectAll("#topbar")
        .data([""])
        .enter()
            .append("line")
            .attr("id", "topbar")
            .attr("x1", 0)
            .attr("x2", w)
            .attr("y1", top_bar_space)
            .attr("y2", top_bar_space);

    //topdata
    selection = svg.selectAll(".texttop")
        .data(
            uniqueDays.map(function (day) {
                var value = LOAD.reduce(function (prev, cur) {
                    if (prev === 0 && cur.day === day) {
                        return cur.total;
                    }
                    return prev;
                }, 0);
                return {"day": day, "value": value};
            })
        );

    selection.enter()
        .append("text")
        .attr("class", "texttop")
        .style("text-anchor", "middle")
        .attr("y", top_bar_space * (4/6));

    selection.exit().remove();

    selection
        .text(function (d) {return d.value; })
        .attr("x", function (d) {return x(d.day); });

    //greybar
    selection = svg.selectAll(".greybar")
        .data(uniqueDays);

    selection.enter()
        .append("line")
        .attr("class", "greybar")
        .attr("y1", 55);

    selection.exit().remove();

    selection
        .attr("x1", function (d) {return x(d); })
        .attr("x2", function () {return d3.select(this).attr("x1"); })
        .attr("y2", h - 45)
        .classed("high", function (d) {
            return d === HIGH[0];
        })
        .classed("barselect", function (d) {
            if (SELECT) {
                return SELECT.day === d;
            }
            return false;
        })
        .classed("weekend", function (d) {
            var date = new Date(d),
                week = date.getDay();
            return (week === 5 || week === 6);
        });

    //Paths
    selection = svg.selectAll("path.path")
        .data(
            WORDS.map(function (word) {
                var sub = LOAD.filter(function (d) {return d.id === word; });
                return uniqueDays.map(function (d) {
                    return sub.filter(function (e) {return e.day === d; })[0];
                });
            })
        );

    selection.enter()
        .append("path")
        .attr("class", "path")
        .style("fill", "none");

    selection.exit().remove();
    selection
        .interrupt()
        .style("stroke", function (d, i) {return rainbow(i); });

    if (trans) {
        selection = selection.transition()
            .duration(1000)
    }
    selection
        .attr("d", function (d) {return line(d); });

    // Points
    selection = svg.selectAll("text.points")
        .data(LOAD);

    selection.enter()
        .append("text")
        .attr("class", "points")
        .attr("text-anchor", "middle");

    selection.exit().remove();

    selection
        .interrupt()
        .classed("tweetselect", function (d) {
            if (SELECT) {
                return SELECT.id === d.id;
            }
            return false;
        })
        .classed("alone", function (d) {
            return alone(d);
        })
        .classed("high", function (d) {
            return WORDS.indexOf(d.id) > -1;
        })
        .on("click", eventClick)
        .on("mouseover", eventHooverGraph)
        .on("mouseout", eventClearGraph)
        .text(function (d) {return d.id; });

    if (trans) {
        selection = selection.transition()
            .duration(1000)
    }
    selection
        .attr("x", function (d) {return x(d.day); })
        .attr("y", checkabsolute);

    //yaxis
    selection = svg.selectAll("#yaxis")
        .data(
            (function () {
                if (absolute === "Sorted") {
                    return [];
                }
                return [""];
            }())
        );

    selection.enter()
        .append("g")
        .attr("id", "yaxis")
        .attr("class", "axis")
        .attr("transform", "translate(" + 45 + ", 0)");

    selection.exit().remove();

    selection
        .call(d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(6)
        );

    //x Axies
    selection = svg.selectAll("#xaxis")
        .data([""]);

    selection.enter()
        .append("g")
        .attr("id", "xaxis")
        .attr("class", "axis");

    selection
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickValues(uniqueDays)
            .tickFormat(function (tick) {
                var date = new Date(tick),
                    year = (date.getFullYear() + 1).toString().substr(2, 2),
                    month = date.getMonth() + 1,
                    day = date.getDate();
                return (day + "." + month + "." + year);
            })
        )
        .attr("transform", "translate(0," + (h - padding.bottom) + ")");
}

function eventClearGraph() {
    "use strict";
    HIGH = [];
    WORDS = [];
    if (SELECT) {
        HIGH.push(SELECT.day);
        WORDS.push(SELECT.id);
    }
    d3.selectAll("#Datahash option").property("selected", false);
    updateGraph();
}

function eventControlPhp() {
    "use strict";
    var datemin = d3.select("#DateMin").property("value"),
        datemax = d3.select("#DateMax").property("value"),
        maxelements = 100000,
        mysqlsearch = d3.select("#Mysqlsearch").property("value"),
        data = {
            "type": "main",
            "last": datemax,
            "first": datemin,
            "limit": maxelements,
            "search": mysqlsearch
        };
    queryDatabase(data, generateGraph);
}

function eventControlZoom() {
    "use strict";
    updateGraph(true);
}


function eventControlHigh() {
    "use strict";
//    var Rangevalue = d3.select("#Range").property("value"),
    var found = getUnique(LOAD, function (d) {return d.id; }),
        options;

    found.sort();

    options = d3.select("#Datahash").selectAll("option")
        .data(found);

    options.enter().append("option");
    options.exit().remove();
    options.text(function (d) {return d; });

//    d3.select("#Displayrange").property("value", Rangevalue);

    //Find highlighted words.
    found = SELECT ? [SELECT.id] : [];
    d3.select("#Datahash").selectAll("option")
        .each(function () {
            if (this.selected) {
                found.push(this.text);
            }
        });

    WORDS = found;
    updateGraph();
}

function generateGraph(data) {
    "use strict";
    eventClearGraph();
    data.data.forEach(function (d) {
        var day = d.day.split("-");
        d.day = (new Date(day[0] - 1, day[1] - 1, day[2])).getTime();
    });
    LOAD = data.data;
    d3.select("#Inload").property("value", data.metadata.rows);
    updateGraph();
    eventControlHigh();
}

function eventHooverGraph(node) {
    "use strict";
    HIGH.push(node.day);
    WORDS.push(node.id);
    updateGraph();
}

//********************************
//             Tweet
//********************************
function eventClick(node) {
    "use strict";
    var date = new Date(node.day),
        data = {
            "first": (date.getFullYear() + 1) + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
            "last": (date.getFullYear() + 1) + "-" + (date.getMonth() + 1) + "-" + (date.getDate() + 1),
            'search': d3.select("#Mysqlsearch").property("value"),
            'hashtag': node.id,
            'limit': 50,
            'offset': 0
        };

    SELECT = node;
    eventClearGraph()

    data.type = "count";
    queryDatabase(data, function (data) {
        var value = data.data[0].count;
        d3.selectAll("#Indata").property("value", value);
    });

    data.type = "user";
    queryDatabase(data, function (data) {
        data.data.unshift({'name': "", "count": 0});
        
        var options = d3.select("#Tweetusers").selectAll("option")
            .data(data.data);

        options.enter().append("option");
        options.exit().remove();
        options.text(function (d) {return d.username; });
    });

    data.type = "hashtag";
    queryDatabase(data, function (data) {
        data.data.unshift({'name': "", "count": 0});
        
        var options = d3.select("#Tweethash").selectAll("option")
            .data(data.data);

        print(data.data[0])

        options.enter().append("option");
        options.exit().remove();
        options.text(function (d) {return d.name; });
    });

    data.type = "secondary";
    NODE = data;
    queryDatabase(data, updateTweets);

}

function updateTweets(data) {
    "use strict";
    if (data.data.length === 0) {
        data.data.push({
            "username": "NA",
            "time": "NA",
            "text": "Sorry no tweets were found."
        });
    }

    var tweets = d3.select("#content").selectAll(".tweet")
            .data(data.data),

        lists = tweets.enter()
            .append("ul")
            .attr("class", "tweet");

    lists.append("li").attr("class", "date");
    lists.append("li").attr("class", "username");
    lists.append("li").attr("class", "text");
    
    tweets.exit().remove();

    tweets.select(".username")
        .text(function (d) {
            return d.username;
        });

    tweets.select(".date")
        .text(function (d) {
            return d.time.substring(0, 10);
        });

    tweets.select(".text")
        .text(function (d) {
            return d.text;
        });
}

function updateControlTweets() {
    "use strict";
    var new_node = {"offset": 0, "type": "secondary"},
        main_search = d3.select("#Mysqlsearch").property("value"),
        hashtag = d3.select("#Tweethash").property("value"),
        user = d3.select("#Tweetusers").property("value");
//        second_search = d3.select('#Tweetsearch').property("value");

    ["first", "last", "limit"].forEach(function (d) {
        new_node[d] = NODE[d];
    });

    //search
    new_node.search = main_search;
//    new_node.search2 = second_search;

    //hashtags
    new_node.hashtag = [NODE.hashtag.split(",")[0]];
    if (hashtag) {
        new_node.hashtag.push(hashtag);
    }
    new_node.hashtag = new_node.hashtag.toString();

    //users
    new_node.user = [user];
    
    NODE = new_node;
    d3.select("#top").property("value", NODE.offset);
    queryDatabase(NODE, updateTweets);
}

function eventNextTweets() {
    "use strict";
    NODE.offset += NODE.limit;
    d3.select("#top").property("value", NODE.offset);
    queryDatabase(NODE, updateTweets);
}

function eventPrevTweets() {
    "use strict";
    NODE.offset -= NODE.limit;
    if (NODE.offset < 0) {
        NODE.offset = 0;
    }
    d3.select("#top").property("value", NODE.offset);
    queryDatabase(NODE, updateTweets);
}

function eventTweetClear() {
    NODE = false;
    SELECT = false;
    WORDS = [];
    HIGH = [];
    d3.select("#Indata").property("value", 0);
    d3.selectAll("#Tweetusers").selectAll("option").remove();
    d3.selectAll("#Tweethash").selectAll("option").remove();
    d3.selectAll(".tweet").remove();
    d3.select("#top").property("value", 0);
    updateGraph();
}


//********************************
//             Other
//********************************


function queryDatabase(info, callback) {
    "use strict";
    var path = "data/tweets.php",
        vars = asGet(info);

    d3.select("body")
        .append("img")
        .attr("src", "static/ajax-loader.gif")
        .attr("class", "ajax");

    d3.select("#phpsubmit").property("value", "Loading...");

    d3.json(path + vars)
        .get(function (error, data) {
            d3.select("#phpsubmit").property("value", "Submit");
            if (error) {
                d3.select("#phpsubmit").property("value", "There was an error.");
                console.warn("There was an error.");
                console.warn(asGet(info));
            }
//            print(data.metadata.query);
            d3.select(".ajax").remove();
            callback(data);
        });
}

function eventLoad() {
    "use strict";
    //Assign events.
    d3.select("#Tweetnext")
        .on("click", eventNextTweets);

    d3.select('#Tweetprev')
        .on("click", eventPrevTweets);
        
    d3.select('#Tweetclear')
        .on("click", eventTweetClear);

    d3.select("#Tweetcontrol")
        .on("submit", updateControlTweets)
        .on("change", updateControlTweets);

    d3.select("#Phpcontrol")
        .on("submit", eventControlPhp);

    d3.select("#Highcontrol")
        .on("submit", function () {return true; })
        .on("input", eventControlZoom)
        .on("change", eventControlZoom);

    d3.select("#Datahash")
        .on("change", eventControlHigh);

    d3.selectAll("form")
        .on("keypress", function () {return false; });

    window.onresize = updateGraph;
    eventControlPhp();
}
