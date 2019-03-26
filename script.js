createMap = function(targetDiv, mapId, geoData) {
    var map = targetDiv;
    map.id = mapId
    //style="position: relative; width: 500px; height: 300px;"
    map.style.position = "relative"
    map.style.width = "500px"
    map.style.height = "300px"


    var basic_choropleth = new Datamap({
        element: document.getElementById(mapId),
        projection: 'mercator',
        fills: {
            defaultFill: "#ABDDA4",
        },
        data: geoData,
        geographyConfig: {
            popupTemplate: (geography, data) => { //return a string
                let n = data == null ? 0 : data.number;
                return '<div class="hoverinfo">'
                    +'<strong>' + geography.properties.name + '</strong>'
                    + '<p>' + mapId + ': ' + n + '</p>' +
                '</div>';
            }
        }
    });
}

augmentColors = function(geoData) {
    var values = Object.keys(geoData).map((country, i) => {return geoData[country]});
    var minValue = Math.min.apply(null, values),
        maxValue = Math.max.apply(null, values);

    var paletteScale = d3.scale.linear()
            .domain([minValue,maxValue])
            .range(["#EFEFFF","#02386F"]); // blue color

    Object.keys(geoData).map((country, i) => {
        geoData[country] = {
            fillColor: paletteScale(geoData[country]),
            number: geoData[country] }
    });
}

var target = document.createElement("div");
var testData = {
    USA: 100,
    JPN: 75,
    ITA: 50,
    KOR: 120,
    RUS: 10
}
//var testData = {
//    USA: { fillKey: "authorHasTraveledTo" },
//    JPN: { fillKey: "authorHasTraveledTo" },
//    ITA: { fillKey: "authorHasTraveledTo" },
//    CRI: { fillKey: "authorHasTraveledTo" },
//    KOR: { fillKey: "authorHasTraveledTo" },
//    DEU: { fillKey: "authorHasTraveledTo" },
//}
augmentColors(testData);
document.body.appendChild(target);
createMap(target, "test", testData);
