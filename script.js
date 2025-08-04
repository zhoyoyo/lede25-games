const calculateBtn = d3.select("#calculate");
const graphContainer1 = d3.select('.graph1');
const graphContainer2 = d3.select('.graph2');

calculateBtn.on('click', function(){

    const age = d3.select("#age").node().value;
    const gender = d3.select('input[name="gender"]:checked').node().value;

    // validate the input
    if (isNaN(age) || age < 1 || age > 119) {

        fillResultText('<span class="warning">Please enter a valid age between 1 and 119.</span>')

        graphContainer1.style('display','none');
        // graphContainer2.style('display','none');

        return;
    } else {
        // If the input is valid... 
        getLifeExpectancy(age, gender)
    }

})


function fillResultText(text) {
    d3.select('#result-container p').html(text);
}

function getLifeExpectancy(age, gender, year = 2022) {
    const indexF = (year - 1900)*2, indexM = indexF + 1;
    const index = gender == 'female' ? indexF : indexM;

    d3.json("life.json") 
    .then(data => {
        // fill text
        let lifeExpectancy = data[age][index];
        fillResultText("An average American like you can expect to live another <span>" + Math.round(lifeExpectancy) + ' years</span> according to estimates from 2022.')
        
        // drawGraph1
        drawGraph1(age, lifeExpectancy)

        // drawGraph2
        drawGraph2(gender, age, data[age])

        // bind resize event
        window.addEventListener('resize', ()=>{
            drawGraph2(gender, age, data[age])
        });

    })

}

function drawGraph1(age, lifeExpectancy) {
    const usedPct = 100 - Math.round(lifeExpectancy / (+age + lifeExpectancy) * 100);

    // show graph
    graphContainer1.style('display','block')
    // fill text
    graphContainer1.select('.hint span').html(usedPct);
    // fill graph
    graphContainer1.select('div.inner')
    .transition().duration(500)
    .style('width', (usedPct) + '%')
}

function drawGraph2(gender, age, dataByAge) {

    const data = dataByAge.filter((d,i) => gender == 'f' ? (i % 2 == 0 ? true : false) : (i % 2 == 0 ? false : true));
    const genderWord = gender == 'female' ? 'women' : 'men';

    graphContainer2.html(""); // Clear previous chart
    graphContainer2.append('p')
    .html('The remaining years to live for ' + age + '-year-old ' + genderWord + ' in the U.S.')

    const width = (graphContainer2.node().getBoundingClientRect()).width;
    const height = width *0.6;
    const margin = {top: 10, right: 20, bottom: 30, left: 30};

    const svg = graphContainer2
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom);

    const xScale = d3.scaleLinear()
        .domain([1900, 2022])
        .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([height - margin.bottom, margin.top])

    const line = d3.line()
        .x((d,i)=> xScale(1900 + i))
        .y((d,i)=> yScale(d));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickFormat(d=> d)
            .tickValues([1910,1930,1950,1970,1990,2010,2022])
        );

    svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(
            d3.axisLeft(yScale)
            .tickValues([0,10,20,30,40,50,60,70,80,90,100])
    );

    svg.append("path")
    .attr('d', line(data))

    svg.append('text')
    .attr('class','label')
    .attr('transform',`translate(${margin.left},${margin.top})`)
    .attr('dy',10)
    .text('Age')

}

