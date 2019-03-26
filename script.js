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
        return basic_choropleth;
    }

    augmentColors = function(geoData) {
        var values = Object.keys(geoData).map((country, i) => {return geoData[country]});
        var minValue = Math.min.apply(null, values),
            maxValue = Math.max.apply(null, values);

        var paletteScale = d3.scale.pow()
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

    let leftData = filterData("suicides/100k pop", 2005);
    let rightData = filterData("suicides/100k pop", 2000);
    augmentColors(leftData);
    augmentColors(rightData);

    var leftMapDiv = document.createElement("div");
    leftMapDiv.id = "leftMap";

    var rightMapDiv = document.createElement("div");
    rightMapDiv.id = "rightMap";

    document.getElementById("lmap").appendChild(leftMapDiv);
    document.getElementById("rmap").appendChild(rightMapDiv);
    var leftMap = createMap(leftMapDiv, "suicides/100k pop", leftData);
    var rightMap = createMap(rightMapDiv, "suicides/100k pop", rightData);

    var currentOption = "suicides/100k pop";

    function htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    // make slider
    var sliderContainer = document.createElement("slidecontainer");
    var slider = htmlToElement('<input type="range" min="1985" max="2015" value="50" class="slider" id="myRange">&nbsp;<p>Year: <span id="cyear"></span></p>');
    sliderContainer.appendChild(slider);
    document.body.appendChild(sliderContainer);

    //<div class="slidecontainer">
    //    <input type="range" min="2000" max="2015" value="50" class="slider" id="myRange">
    //    &nbsp;<p>Year: <span id="cyear"></span></p>
    //</div>
    
    var slider = document.getElementById("myRange");
    slider.oninput = function() {
        console.log("update");
        let newYear = +this.value;
        leftData = filterData(currentOption, newYear);
        rightData = filterData(currentOption, newYear);
        augmentColors(leftData);
        augmentColors(rightData);
        leftMap.updateChoropleth(leftData);
        rightMap.updateChoropleth(rightData);
    }
});

