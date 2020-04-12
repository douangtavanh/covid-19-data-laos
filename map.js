//Map for Vientiane Capital
$(document).ready(function () {
    //Set variable map directory
    let mapVTEPath = ("map/Vientiane-Capital.json");
    let infectedDataPath = ("map/Vientiane-Capital.csv");
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

//Map for Lao PDR
let drawLaosMap = (presentTotal, presentMale, presentFemale) => {
    //Set variable map directory
    let mapDraw = ("map/LAO_ADM1.json");
    let mapTestData = ("map/laoPDR.csv");

    //Set to select SVG DOM
    let svg = d3.select("#drawMapLao");
    let colorMap = d3.map();
    let maleMap = d3.map();
    let femaleMap = d3.map();

    //Set variable to import data
    let promise = [
        d3.json(mapDraw),
        d3.csv(mapTestData),
        d3.csv(mapTestData, d => +d[presentTotal]),
    ];

    Promise.all(promise).then(createMapLaoPDR);

    function createMapLaoPDR(value) {
        let laoPDR = value[0];
        let valueLaoPDR = value[1];
        let rawDataValue = value[2];

        //Set new Variable to import raw data to desire dataset
        valueLaoPDR.map(d => colorMap.set(d["feature_id"], d[presentTotal]));
        valueLaoPDR.map(d => maleMap.set(d["feature_id"], d[presentMale]));
        valueLaoPDR.map(d => femaleMap.set(d["feature_id"], d[presentFemale]));

        //Set Scale color to be filled in each province based on number of cases
        let color = d3.scaleLinear()
            .domain([0, d3.max(rawDataValue)])
            .range(["#ddd", "red"]);

        //Import Map Topojson type as Geojson structure
        let myMap = topojson.feature(laoPDR, laoPDR["objects"]["LAO_ADM1"]); //Use TopoJSON script to read the topojson format

        // Set projection map type
        //Because our imported is match d3.geoMaercator() map drawing type (for additional map drawing type please look
        //the D3JS API Page
        let projection = d3.geoMercator()
            .fitSize([790, 790], myMap); //Auto fit SVG refer to svg set at HTML

        //Set tooltips on mouseover event
        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        //Draw a graph use "g" because draw multiple path in one time
        svg.append("g")
            .selectAll("path")
            .data(myMap.features)
            .enter().append("path")
            .attr("d", d3.geoPath().projection(projection))
            .attr("fill", d => color(+(d["properties"][presentTotal] = colorMap.get(+d["properties"]["feature_id"]))))
            .on("mouseover", d => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                if (+(d["properties"][presentTotal]) === 0) { //IF NO DATA on that province the color of number case change to gray
                    tooltip.html(
                        "<h6>" + `${d["properties"]["Name"]}` + "</h6>" +
                        "<br>" +
                        "<section style='display: inline-flex; align-items: baseline;'>" +
                        "<h5 style='color: #ddd; font-weight: bolder; margin-right: 1rem;'>" + `${+(d["properties"][presentTotal])}` + "</h5>" +
                        "<p> ຄົນ </p>" +
                        "</section>" +
                        "<br>" +
                        "<section style='display: inline-flex; align-items: baseline;'>" +
                        "<h6 style='color: royalblue; font-weight: bolder; margin-right: 1rem;'>" + "<i class=\"fas fa-male\"></i> : " + `${+(d["properties"][presentMale] = maleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                        "<h6 style='color: hotpink; font-weight: bolder;'>" + "<i class=\"fas fa-female\"></i> : " + `${+(d["properties"][presentFemale] = femaleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                        "</section>"
                    )
                    .style("left", (d3.event.pageX + 30) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
                } else {
                    tooltip.html(
                        "<h6>" + `${d["properties"]["Name"]}` + "</h6>" +
                        "<br>" +
                        "<section style='display: inline-flex; align-items: baseline;'>" +
                        "<h5 style='color: orangered; font-weight: bolder; margin-right: 1rem;'>" + `${+(d["properties"][presentTotal])}` + "</h5>" +
                        "<p> ຄົນ </p>" +
                        "</section>" +
                        "<br>" +
                        "<section style='display: inline-flex; align-items: baseline;'>" +
                        "<h6 style='color: royalblue; font-weight: bolder; margin-right: 1rem;'>" + "<i class=\"fas fa-male\"></i> : " + `${+(d["properties"][presentMale] = maleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                        "<h6 style='color: hotpink; font-weight: bolder;'>" + "<i class=\"fas fa-female\"></i> : " + `${+(d["properties"][presentFemale] = femaleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                        "</section>"
                    )
                    .style("left", (d3.event.pageX + 30) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
                }
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        // //Draw a line border for each province
        svg.append("path")
            .datum(topojson.mesh(laoPDR, laoPDR["objects"]["LAO_ADM1"]))
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-linejoin", "round")
            .attr("d", d3.geoPath().projection(projection));

        //Draw Value on Map
        svg.selectAll(".subunit-label")
            .data(myMap.features)
            .enter().append("text")
            .attr("class", "subunit-label")
            .attr("transform", function (d) {
                return "translate(" + d3.geoPath().projection(projection).centroid(d) + ")";
            })
            .attr("dy", "0")
            .attr("font-size", "1rem")
            .attr("text-anchor", "middle")
            .text(d => d["properties"][presentTotal]);

        //Below can put comment block out if you want to add legend (its script link to d3-legend.js file)
        //Add Legend
        // svg.append("g")
        //     .attr("transform", "translate(100,650)")
        //     .append(() => legend({
        //         color: d3.scaleThreshold(["<2.5", "2.5", "10", "20", ">=30"],
        //             ["#0091ea", "#00c853", "#ffd600", "#ff6d00", "#d50000"]),
        //         title: "WHO Classification, 2017 (%)",
        //         width: 190
        //     }));
    }
}
document.addEventListener("DOMContentLoaded", function () {
    //drawLaosMap(name of total infected cases row,  name of male infected row, name of female infected row)
    drawLaosMap("20200412", "m20200412", "f20200412");
});