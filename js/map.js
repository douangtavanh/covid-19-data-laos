//Mapbox Script
let mapbox = (presentTotal, presentMale, presentFemale) => {
    //Mapbox API token goes here
    mapboxgl.accessToken = 'pk.eyJ1IjoiZG91YW5ndGF2YW5oIiwiYSI6ImNrOTAzamVwZDAwa2QzZ3BndHRwZGdldmIifQ.NHFYqE0p1crfa5LSI4wLWw';

    //Set up Mapbox style and call Mapbox API
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/douangtavanh/ck95bbxqn0g4z1io7mkdmojgb',
        center: [102.2902265, 18.1195961],
        zoom: 6,
        maxZoom: 15,
        minZoom: 6
    });

    //Add Mapbox control: zoom in, zoom out
    map.addControl(new mapboxgl.NavigationControl());


    // Set map file path for d3js drawing on mapbox
    let laoMapPath = ("map/LAO_ADM1.geojson");
    let laoMapDataPath = ("https://raw.githubusercontent.com/douangtavanh/covid19-data-viz-Lao/master/data/laoPDR.csv"); //Default use to update data directly by owner GitHub
    //let laoMapDataPath = ("data/laoPDR.csv"); //In case develop in local
    let laoMapCaseDataPath = ("https://raw.githubusercontent.com/douangtavanh/covid19-data-viz-Lao/master/data/case.json"); //Default use to update data directly by owner GitHub
    //let laoMapCaseDataPath = ("data/case.json"); //In case develop in local

    //Import data
    let promise = [
        d3.json(laoMapPath),
        d3.csv(laoMapDataPath),
        d3.csv(laoMapDataPath, d => +d[presentTotal]),
        d3.json(laoMapCaseDataPath)

    ];
    Promise.all(promise).then(createMapBoxLaos);

    //Set tooltips on mouseover event (Province)
    let tooltipMapbox = d3.select("body").append("div")
        .attr("class", "tooltipMapbox")
        .style("opacity", 0);

    //Set tooltips on mouseover event (case circle)
    let tooltipLaosMapOnMapbox = d3.select("body").append("div")
        .attr("class", "tooltipLaosMapOnMapbox")
        .style("opacity", 0);

    //Set variable for create new array while drawing
    let colorMap = d3.map();
    let maleMap = d3.map();
    let femaleMap = d3.map();

    //Function of read data run here
    function createMapBoxLaos(value) {
        let laoMap = value[0];
        let laoMapData = value[1];
        let rawDataValue = value[2]
        let caseData = value[3];
        let link = value[3].map(d => d["link"]); //Use for drawing link case line path

        //Set new Variable to import raw data to desire dataset
        laoMapData.map(d => colorMap.set(d["feature_id"], d[presentTotal]));
        laoMapData.map(d => maleMap.set(d["feature_id"], d[presentMale]));
        laoMapData.map(d => femaleMap.set(d["feature_id"], d[presentFemale]));

        //Set Scale color to be filled in each province based on number of cases
        let color = d3.scaleLinear()
            .domain([0, d3.max(rawDataValue)])
            .range(["#ddd", "#ea5770"]);


        //Import Map as GeoJSON structure
        let container = map.getCanvasContainer();
        let svg = d3.select(container).append("svg");
        let transform = d3.geoTransform({point: projectPoint}); //This to convert geoJSON point to mapbox point
        let path = d3.geoPath().projection(transform); //projection point on map

        //Drew Map line province path
        let featureElement = svg.append("g")
            .attr("class", "laosMap")
            .selectAll("path")
            .data(laoMap.features)
            .enter().append("path")
            .attr("class", d => d["properties"]["Name"])
            .attr("stroke", "white")
            .attr("stroke-width", 0.5)
            .attr("fill", d => color(+(d["properties"][presentTotal] = colorMap.get(+d["properties"]["feature_id"]))))
            .attr("fill-opacity", 0.6)
            .on("mouseover", d => {
                tooltipLaosMapOnMapbox.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltipLaosMapOnMapbox.html(
                    textToShowOnMapProvince(d)
                )
                    .style("left", (d3.event.pageX + 30) + "px")
                    .style("top", (d3.event.pageY - 50) + "px");
            })
            .on("mouseout", d => {
                tooltipLaosMapOnMapbox.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        //Create function to show map while mouseover event on province path
        function textToShowOnMapProvince(d) {
            if (+(d["properties"][presentTotal]) === 0) { //IF NO DATA on that province the color of number case change to gray
                return (
                    "<h6>" + `${d["properties"]["Name"]}` + "</h6>" +
                    "<hr>" +
                    "<div style='display: inline-flex; align-items: baseline;'>" +
                    "<h5 style='color: #ddd; font-weight: bold; margin-right: 1rem;'>" + `${+(d["properties"][presentTotal])}` + "</h5>" + "<p> ຄົນ </p>" +
                    "</div>" +
                    "<hr>" +
                    "<div style='display: inline-flex; align-items: baseline;'>" +
                    "<h6 style='color: royalblue; font-weight: bold; margin-right: 1rem;'>" + "<i class=\"fas fa-male\"></i> : " + `${+(d["properties"][presentMale] = maleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                    "<h6 style='color: hotpink; font-weight: bold;'>" + "<i class=\"fas fa-female\"></i> : " + `${+(d["properties"][presentFemale] = femaleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                    "</div>"
                )
            } else {
                return (
                    "<h6>" + `${d["properties"]["Name"]}` + "</h6>" +
                    "<hr>" +
                    "<div style='display: inline-flex; align-items: baseline;'>" +
                    "<h5 style='color: #ea5770; font-weight: bold; margin-right: 1rem;'>" + `${+(d["properties"][presentTotal])}` + "</h5>" + "<p> ຄົນ </p>" +
                    "</div>" +
                    "<hr>" +
                    "<div style='display: inline-flex; align-items: baseline;'>" +
                    "<h6 style='color: royalblue; font-weight: bold; margin-right: 1rem;'>" + "<i class=\"fas fa-male\"></i> : " + `${+(d["properties"][presentMale] = maleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                    "<h6 style='color: hotpink; font-weight: bold;'>" + "<i class=\"fas fa-female\"></i> : " + `${+(d["properties"][presentFemale] = femaleMap.get(d["properties"]["feature_id"]))}` + "</h6>" +
                    "</div>"
                )
            }
        }

        //Draw number on Map province path
        let numberOnLaosMap = d3.select(".laosMap")
            .selectAll(".province-number-label")
            .data(laoMap.features)
            .enter().append("text")
            .attr("class", d => "province-number-label-" + d["properties"]["Name"])
            .attr("dy", "15")
            .attr("font-size", "1.5rem")
            .attr("fill", "white")
            .attr("text-anchor", "middle")
            .text(d => d["properties"][presentTotal]);


        //Draw Link line
        let caseLink = svg.append("g")
            .attr("class", "linkElement");

        let linkPath = d3.select(".linkElement")
            .selectAll("path")
            .data(link)
            .enter().append("path")
            .attr("class", (d, i) => {
                return "link-circle-" + (i + 1)
            })
            .attr("fill", "none")
            .attr("stroke", "#ddd")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .style("opacity", 0.4);
        //.attr("marker-end", "url(#arrow)");

        //Append the arrow path to draw with line link path
        // let defs = svg.append("defs");
        // let maker = defs.append("marker")
        //     .attr("id", "arrow")
        //     .attr("viewBox", "0 -5 20 20")
        //     .attr("refX", 5)
        //     .attr("refY", 0)
        //     .attr("markerWidth", 4)
        //     .attr("markerHeight", 4)
        //     .attr("orient", "auto");
        // maker.append("path")
        //     .attr("d", "M0,-5L10,0L0,5")
        //     .attr("class", "arrowHead")
        //     .style("fill", "blue")
        //     .style("opacity", 0.7);

        //Draw Circle Case
        let caseElement = svg.append("g")
            .attr("class", "circleElement");

        let circleElement = caseElement.selectAll("g")
            .data(caseData)
            .enter().append("g")
            .attr("class", d => "circle-" + d["case"]);

        circleElement.each(function (d) {
            d3.select(this).selectAll("circle")
                .data([d])
                .enter().append("circle")
                .attr("class", d => "circleCase-" + d["case"])
                .attr("r", 15)
                .attr("stroke", "#383838")
                .attr("stroke-width", .5)
                .style("fill", d => circleFillChange(d))
                .attr("opacity", 1)
                .on("mouseover", function () {
                    d3.select(this).style("fill", "#fff")
                        .style("cursor", "pointer");
                    tooltipMapbox.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltipMapbox.html(
                        testText(d)
                    ).style("left", (d3.event.pageX + 30) + "px")
                        .style("top", (d3.event.pageY - 50) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this).style("fill", d => circleFillChange(d))
                        .style("cursor", "default");
                    tooltipMapbox.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });

        //Condition set to each circle
        function circleFillChange(d) {
            if (d["status"] === "ກໍາລັງປິ່ນປົວ") {
                return "#ffa600"
            } else if (d["status"] === "ປິ່ນປົວຫາຍດີ") {
                return "#039245"
            } else {
                return "#ddd"
            }
        }

        //Condition set for Text to show on each case circle
        function testText(d) {
            if (d["status"] === "ປິ່ນປົວຫາຍດີ") {
                return (
                    "<table class='table table-borderless'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<th scope='col'>" + "ກໍລະນີ: " + `${d["case"]}` + "</th>" +
                    "<th scope='col'>" + "ພົບວັນທີ: " + `${d["caseFoundDate"]}` + "</th>" +
                    "<th scope='col' style='color: #039245'>" + "ສະຖານະ: " + `${d["status"]}` + "</th>" +
                    "<th scope='col' style='color: #039245'>" + "ອອກໂຮງໝໍວັນທີ: " + `${d["caseResolvedDate"]}` + "</th>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" + "ຊື່: " + `${d["name"]}` + "</td>" +
                    "<td>" + "ເພດ: " + `${d["sex"]}` + "</td>" +
                    "<td>" + "ອາຍຸ: " + `${d["age"]}` + "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" + "ບ້ານ: " + `${d["village"]}` + "</td>" +
                    "<td>" + "ເມືອງ: " + `${d["district"]}` + "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td colspan='3'>" + "ຂໍ້ມູນ: " + `${d["infectedSource"]}` + "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>"
                )
            } else if (d["status"] === "ກໍາລັງປິ່ນປົວ") {
                return (
                    "<table class='table table-borderless'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<th scope='col'>" + "ກໍລະນີ: " + `${d["case"]}` + "</th>" +
                    "<th scope='col'>" + "ພົບວັນທີ: " + `${d["caseFoundDate"]}` + "</th>" +
                    "<th scope='col' style='color: #ffa600'>" + "ສະຖານະ: " + `${d["status"]}` + "</th>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" + "ເພດ: " + `${d["sex"]}` + "</td>" +
                    "<td>" + "ອາຍຸ: " + `${d["age"]}` + "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" + "ບ້ານ: " + `${d["village"]}` + "</td>" +
                    "<td>" + "ເມືອງ: " + `${d["district"]}` + "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td colspan='3'>" + "ຂໍ້ມູນ: " + `${d["infectedSource"]}` + "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>"
                )
            } else if (d["status"] === "ເສຍຊີວິດ") {
                return (
                    "<table class='table table-borderless'>" +
                    "<tbody>" +
                    "<tr>" +
                    "<th scope='col'>" + "ກໍລະນີ: " + `${d["case"]}` + "</th>" +
                    "<th scope='col'>" + "ພົບວັນທີ: " + `${d["caseFoundDate"]}` + "</th>" +
                    "<th scope='col' style='color: #ddd'>" + "ສະຖານະ: " + `${d["status"]}` + "</th>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" + "ເພດ: " + `${d["sex"]}` + "</td>" +
                    "<td>" + "ອາຍຸ: " + `${d["age"]}` + "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td>" + "ບ້ານ: " + `${d["village"]}` + "</td>" +
                    "<td>" + "ເມືອງ: " + `${d["district"]}` + "</td>" +
                    "</tr>" +
                    "<tr>" +
                    "<td colspan='3'>" + "ຂໍ້ມູນ: " + `${d["infectedSource"]}` + "</td>" +
                    "</tr>" +
                    "</tbody>" +
                    "</table>"
                )
            } else {
                return "<p>" + "ERROR READING DATA" + "</p>"
            }
        }

        circleElement.each(function (d) {
            d3.select(this).selectAll("text")
                .data([d])
                .enter().append("text")
                .attr("class", d => "circle-text-" + d["case"])
                .text((d) => {
                    return d["case"]
                })
                .style('text-anchor', 'middle')
                .style('font-size', '.7rem')
                .style('fill', 'black')
        });


        //The function to update our drawing in every time use change the view point
        function update() {
            //Check to show the content base on zoom level
            //If the zoom level more than 10 the province Path will be hidden and show the case content
            if ((map.getZoom()) < 10) {
                d3.select(".laosMap").style("visibility", "visible");
                d3.select(".circleElement").style("visibility", "hidden");
                d3.select(".linkElement").style("visibility", "hidden");
            } else {
                d3.select(".laosMap").style("visibility", "hidden");
                d3.select(".circleElement").style("visibility", "visible");
                d3.select(".linkElement").style("visibility", "visible");
            }


            //Draw Map Position
            featureElement.attr("d", path);

            //Draw Number on Province Path
            numberOnLaosMap.attr("transform", d => "translate(" + path.centroid(d) + ")");

            //Draw Circle Case Position
            circleElement.each(function (d) {
                d3.select(this).selectAll("circle")
                    .data([d])
                    .attr("cx", d => {
                        return project(d["location"]).x;
                    })
                    .attr("cy", d => {
                        return project(d["location"]).y;
                    });
            });
            circleElement.each(function (d) {
                d3.select(this).selectAll("text")
                    .data([d])
                    .attr("x", d => {
                        return project(d["location"]).x
                    })
                    .attr("y", d => {
                        return project(d["location"]).y
                    });
            });

            //Draw Link Case
            linkPath.attr("d", path);
        }

        //Below the point will be updated based on following event listener
        map.on("viewreset", update)
        map.on("movestart", function () {
            svg.classed("hidden", true);
        });
        map.on("rotate", function () {
            svg.classed("hidden", true);
        });
        map.on("moveend", function () {
            update()
            svg.classed("hidden", false);
        })

        //Finally activate update() function
        update();
    }

    //Function for applying the map point from Mapbox long, lat to d3JS projection
    //This function for drawing to the path or polygon type
    function projectPoint(lon, lat) {
        let point = map.project(new mapboxgl.LngLat(lon, lat));
        //stream.point is the d3.geo api
        this.stream.point(point.x, point.y);
    }

    //This function for drawing the point geo location type
    function project(d) {
        return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
    }
}

document.addEventListener("DOMContentLoaded", function () {
    //drawLaosMap(name of total infected cases row,  name of male infected row, name of female infected row)
    mapbox("presentDate", "mPresentDate", "fPresentDate");
});