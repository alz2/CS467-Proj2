var currentYear = 2000;
var currentOption = "suicides/100k pop";
var minColor = "#EFEFFF";
var maxColor = "#02386F";
var leftMin = 0,
    leftMax = 0,
    rightMin = 0,
    rightMax = 0;

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
            .range([minColor,maxColor]); // blue color

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


    function htmlToElement(html) {
        var template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }

    // make slider
    var sliderContainer = document.createElement("slidecontainer");
    var slider = htmlToElement('<div style="text-align:center;"><input type="range" min="2000" max="2015" value="50" class="slider" id="myRange" style="text-align:center"></div>');
    sliderContainer.appendChild(slider);
    document.body.appendChild(sliderContainer);
    var years = htmlToElement('<p style="text-align:center">Year: <span id="demo"></span></p>');
    document.body.appendChild(years);

    var years = document.getElementById("demo");
    years.innerHTML = currentYear;

    var years2 = document.getElementById("demo1");
    years2.innerHTML = currentYear;

    function updateMaps() {
        leftData = filterData("suicides/100k pop", currentYear);
        rightData = filterData(currentOption, currentYear);
        augmentColors(leftData);
        augmentColors(rightData);
        // update minmax vals
        let leftValues = Object.keys(leftData).map((country, i) => {return leftData[country].number});
        let rightValues = Object.keys(rightData).map((country, i) => {return rightData[country].number});
        leftMin = Math.min.apply(null, leftValues);
        leftMax = Math.max.apply(null, leftValues);
        rightMin = Math.min.apply(null, rightValues);
        rightMax = Math.max.apply(null, rightValues);
        updateLegend(leftMin, leftMax);



        leftMap.updateChoropleth(leftData);
        rightMap.updateChoropleth(rightData);
        years.innerHTML = slider.value;
        years2.innerHTML = slider.value;
    }

    var slider = document.getElementById("myRange");
    slider.oninput = function() {
        currentYear = +this.value;
        updateMaps();
    }

    function onClickFn(v) {
        console.log(this.value);
        currentOption = this.value;
        updateMaps();
    }

    // var button1 = htmlToElement('<button class="btn gdp" id="b1">GDP</button>');
    var button1 = document.getElementById("b1");
    button1.onclick = onClickFn;

    // var button3 = htmlToElement('<button class="btn population" id="b3">Population</button>');
    var button3 = document.getElementById("b3");
    button3.onclick = onClickFn;

    d3.select(".lmap").attr("align","center");

    function updateLegend(minVal, maxVal) {
        // Color legend.
        var svg = d3.select("svg");
        var linear = d3.scale.pow()
            .domain([minVal, maxVal])
            .range([minColor, maxColor]);

        var svg = d3.select("svg");

        if (svg[0][0].childElementCount) { // remove previous graphic if avail
            while (svg[0][0].firstChild) {
                svg[0][0].removeChild(svg[0][0].firstChild);
            }
        }

        svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(20,20)");

        var legendLinear = d3.legend.color()
            .shapeWidth(50)
            .cells(10)
            .orient('horizontal')
            .scale(linear);

        svg.select(".legendLinear")
            .call(legendLinear);
    }
    updateLegend(0, 10);
});
