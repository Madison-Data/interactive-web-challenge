function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// -----------------------------------------

// DEMOGRAPHIC INFO BOX
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // FILTER FUNCTION
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // SELECT META DATA
    var PANEL = d3.select("#sample-metadata");

    // CLEAR PREVIOUS META DATA
    PANEL.html("");

    // KEY VALUE PAIRS
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  });
}

// ---------------------------------------------

// BUILDCHARTS
function buildCharts(sample) {
  d3.json("samples.json").then((data) => {
    // VARIABLE FOR SAMPLES 
    var samples = data.samples;
    // FILTERED SAMPLE
    var resultArray = samples.filter(sampleObj => sampleObj.id == sample); 
    // FILTER SAMPLE RESULT
    var Result = resultArray[0];
    // VARS FOR OTU_ID, OTU_LABELS, SAMPLE_VALUES
    var otuID = Result.otu_ids;
    var otuLabel = Result.otu_labels;
    console.log(otuLabel);
    var sampleValue = Result.sample_values.map((value) => parseInt(value));

    // YTICKS FOR BAR CHART - SORTED DESCENDING TO SHOW MOST COMMON BACTERIA FIRST
    var yticks = otuID.slice(0,10).map((id) => "OTU " + id).reverse();
   
    // BAR CHART TRACE
    var barData = {
      x: sampleValue.slice(0,10).reverse(),
      y: yticks,
      hoverinfo: otuLabel,
      type: "bar",
      orientation: "h",
      backgroundColor: "rgb(15 , 71, 6)",
      marker: {color: "rgb(15 , 71, 6)" }
    };
    // BAR CHART LAYOUT
    var barLayout = {
      title: {
        text: "<b>Top 10 Bacteria Cultures Found</b>",
        
        y: 0.90
      },
      margin: {
        l: 100,
        r: 35,
        b: 50,
        t: 75,
        pad: 4
      },
    };
    // PLOT BAR CHART
    Plotly.newPlot("bar", [barData], barLayout);

// ---------------------------------------------------------------------------------------

    // BUBBLE CHART TRACE
    var bubbleData = {
      x: otuID,
      y: sampleValue,
      type: "bubble",
      text: otuLabel,
      hoverinfo: "x+y+text",
      mode: "markers",
      marker: {size: sampleValue, color: otuID, colorscale: "Greens"}
    };

    // BUBBLE CHART LAYOUT
    var bubbleLayout = {
      title: {
        text: "<b>Bacteria Cultures Per Sample</b>",
        y:0.95,
      },
      xaxis: {title: "OTU ID"},
      margin: {
        l: 75,
        r: 50,
        b: 60,
        t: 60,
        pad: 10
      },
      hovermode: "closest"
    };

    // PLOT BUBBLE CHART
    Plotly.newPlot("bubble", [bubbleData], bubbleLayout);

    //-----------------------------------------------------------------------------------
    
    // GUAGE CHART VALUES
    // ACCESS METADATA
    var metadata = data.metadata;
    // FILTER METADATA TO SAMPLE NUMBER
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    // RESULT 
    var Result = resultArray[0];
    // TIMES WASHED
    var wFreq = parseFloat(Result.wfreq);

    // ------------------------------------------------
    // GAUGE CHART
    var gaugeData = {
      type: "indicator",
      value: wFreq,
      mode: "gauge+number",
      gauge: {
        axis: {range: [0,10], dtick: 2},
        bar: {color: "black"},
        steps: [
          {range: [0,2], color: "#32FF10"},
          {range: [2,4], color: "#1FC412"},
          {range: [4,6], color: "#199B0B"},
          {range: [6,8], color: "#187008"},
          {range: [8,10], color: "#0F4706"}
        ],
      }
    };   

    // GAUGE CHART LAYOUT.
    var gaugeLayout = { 
      title: {
        text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week", 
        y: 0.75,
      },
      margin: {
        l: 50,
        r: 50,
        b: 0,
        t: 50,
        pad: 50
      },
    };

    // PLOT GAUGE CHART
    Plotly.newPlot("gauge", [gaugeData], gaugeLayout);
  });
}