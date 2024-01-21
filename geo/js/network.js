var FOLDER = "data/",
    width = 960,
    height = 500;
    
function updateGraph() {
    var projection = d3.geo.orthographic()
        .scale(height/2)
        .clipAngle(90);

    var force = d3.layout.force()
        .linkDistance(function(d) {return 1/d.weight * 125;})
        .size([180, 360]);

    var svg = d3.select("#graph")
        .attr("width", width)
        .attr("height", height)
        .call(d3.behavior.drag()
            .origin(function() { 
                var r = projection.rotate(); 
                return {x: 3 * r[0], y: -3 * r[1]}; 
            })
            .on("drag", function() { 
                force.start(); 
                var r = [d3.event.x / 3, -d3.event.y / 3, projection.rotate()[2]]; 
                projection.rotate(r); 
            })
        );

    d3.json(FOLDER + "links.json", function(error, links) {
      d3.json(FOLDER + "nodes.json", function(error, nodes) {
        var link = svg.selectAll("line.link")
            .data(links)
            .enter()
                .append("line")
                .attr("class", "link")
                .style("stroke-width", function(d) {return d.weight;});

        var node = svg.selectAll("g.node")
            .data(nodes)
            .enter()
                .append("g");
                
        var circle = node.append("circle")
            .attr("r", 5)
            .attr("class", "node");
                
        var text = node.append("text")
            .attr("class", "text")
            .text(function(d) {return d.name;});   

        force
            .nodes(nodes)
            .links(links)
            .on("tick", function() {
                circle
                    .each(function(d) {d.temp = projection([d.x, d.y])})
                    .attr("cx", function(d) {return d.temp[0]})
                    .attr("cy", function(d) {return d.temp[1]});
                link
                    .attr("x1", function(d) {return d.source.temp[0];})
                    .attr("y1", function(d) {return d.source.temp[1];})
                    .attr("x2", function(d) {return d.target.temp[0];})
                    .attr("y2", function(d) {return d.target.temp[1];});
                text
                    .attr("x", function(d) {return d.temp[0];})
                    .attr("y", function(d) {return d.temp[1];});
            })
            .start();
      });
    });
}

//function distance(one, two) {
//    var a = [one[0] * 2*Math.PI/360, one[1] * 2*Math.PI/360],
//        b = [two[0] * 2*Math.PI/360, two[1] * 2*Math.PI/360],
//        d = Math.acos(Math.sin(a[0]) * Math.sin(b[0]) + Math.cos(a[0]) * Math.cos(b[0]) * Math.cos(a[1] - b[1]]));
//  
////    var a = [Math.sin(radone[0]) * Math.cos(radone[1]),
////             Math.sin(radone[0]) * Math.sin(radone[1]),
////             Math.cos(radone[0])];
////    
////    var b = [Math.sin(radtwo[0]) * Math.cos(radtwo[1]),
////             Math.sin(radtwo[0]) * Math.sin(radtwo[1]),
////             Math.cos(radtwo[0])];

////    d = Math.sqrt(Math.pow(a[0]-b[0], 2)+Math.pow(a[1]-b[1], 2)+Math.pow(a[2]-b[2], 2));
//    return d;

//}


