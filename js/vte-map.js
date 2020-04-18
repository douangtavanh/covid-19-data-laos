//Map for Vientiane Capital
$(document).ready(function () {
    //Set variable map directory
    let mapVTEPath = ("map/Vientiane-Capital.json");
    let infectedDataPath = ("data/Vientiane-Capital.csv");
    //Set to select SVG DOM
    let svg = d3.select("#drawMapVTE");
    let mapTestSort1 = d3.map();

    //Set variable to import data
    let promise = [
        d3.json(mapVTEPath),
        d3.csv(infectedDataPath, d => mapTestSort1.set(d.feature_id, d.value)),
        d3.csv(infectedDataPath, d => +d.value),
    ];

    Promise.all(promise).then(creatMap);

    function creatMap(value) {
        let vte = value[0];
        let valueVTE = value[1];
        let rawDataValue = value[2];
        console.log(valueVTE);
        console.log(vte);
        console.log(rawDataValue);
        //Set Scale
        let color = d3.scaleLinear()
            .domain([0, d3.max(rawDataValue)])
            .range(["#dddddd", "red"]);
        //Import Map Topojson type as Geojson structure
        let vteMap = topojson.feature(vte, vte["objects"]["Vientiane-Capital"]);
        console.log(vteMap.features);
        // Set projection map type
        let projection = d3.geoMercator()
            .fitSize([790, 790], vteMap); //Auto fit SVG refer to svg set at HTML

        //Set tooltips
        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        //Draw a graph use "g" because draw multiple path in one time
        svg.append("g")
            .selectAll("path")
            .data(vteMap.features)
            .enter().append("path")
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", d => color(d["properties"]["feature_id"] = mapTestSort1.get(+d["properties"]["feature_id"])))
            .on("mouseover", function update(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(
                    "<h6>" + `${d["properties"]["Name"]}` + "</h6>" +
                    "<br>" +
                    "<h5 style='color: red; font-weight: bolder;'>" + `${+d["properties"]["feature_id"]}` + "</h5>" +
                    "<br>" +
                    "<p> Cases </p>"
                )
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 100) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        // //Draw a line border for each province
        svg.append("path")
            .datum(topojson.mesh(vte, vte["objects"]["Vientiane-Capital"], (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", d3.geoPath().projection(projection));

        //Draw Value on Map
        svg.selectAll(".subunit-label")
            .data(vteMap.features)
            .enter().append("text")
            .attr("class", "subunit-label")
            .attr("transform", function (d) {
                return "translate(" + d3.geoPath().projection(projection).centroid(d) + ")";
            })
            .attr("dy", "0")
            .attr("font-size", ".8rem")
            .attr("text-anchor", "middle")
            .text(d => d["properties"]["feature_id"]);
    }
});