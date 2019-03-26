async function loadCsvData() {
    let csvResp = await fetch('suicide_data.csv');
    let csvText = await csvResp.text();
    let csvData = d3.csv.parse(csvText);
    return csvData;
}

loadCsvData().then((d)=>{
    console.log(d);
    createMap = function(targetDiv, mapId, geoData) {
        var map = targetDiv;
        map.id = mapId
        map.style.position = "relative"
        map.style.width = "500px"
        map.style.height = "300px"


        var basic_choropleth = new Datamap({
            element: targetDiv,
            projection: 'mercator',
            fills: {
                defaultFill: "#eaefeb",
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

    //var testData = {
    //    USA: 100,
    //    JPN: 75,
    //    ITA: 50,
    //    KOR: 120,
    //    RUS: 10
    //}

    filterData = function(key, year) {
        let filteredYears = d.filter((el) => {
            return el.year == year;
        });

        let filteredValues = filteredYears.map((el) => {
            return {
                [el.Country_key.substring(1)]: +el[key]
            };
        });

        let res = {}
        filteredValues.forEach(el => {
            let country = Object.keys(el)[0]
            if (!(country in res)) {
                res[country] = 0;
            }
            res[country] += el[country];
        });
        return res;
    }

    let t = filterData("suicides/100k pop", 2005);
    let tr = filterData("suicides/100k pop", 2000);
    augmentColors(t);
    augmentColors(tr);

    var leftMap = document.createElement("div");
    leftMap.id = "leftMap";

    var rightMap = document.createElement("div");
    rightMap.id = "rightMap";

    document.getElementById("lmap").appendChild(leftMap);
    document.getElementById("rmap").appendChild(rightMap);
    createMap(leftMap, "suicides/100k pop", t);
    createMap(rightMap, "suicides/100k pop", tr);
});

