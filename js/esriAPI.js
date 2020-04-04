require([
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "dojo/_base/Color",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/graphic"
], function(
  Map,
  ArcGISDynamicMapServiceLayer,
  SimpleLineSymbol,
  SimpleFillSymbol,
  Color,
  Query,
  QueryTask,
  Graphic
) {
  // init map ******************************************************************************************
  const map = new Map("map", {
    center: [-93.5, 30.16],
    zoom: 16
    // basemap: "topo"
  });
  // Add dynamic map service ******************************
  let dynamicLayer = new ArcGISDynamicMapServiceLayer(state.url, {
    opacity: 0.7
  });

  let selectionSymbol = new SimpleFillSymbol(
    SimpleFillSymbol.STYLE_SOLID,
    new SimpleLineSymbol(
      SimpleLineSymbol.STYLE_SOLID,
      new Color([0, 255, 255]),
      2
    ),
    new Color([0, 255, 255, 0.1])
  );
  // add dynamic layer to map and set visible layers ************************************************************************
  map.addLayer(dynamicLayer);
  dynamicLayer.setVisibleLayers([0]);
  // wait until layer is loaded fully before allowing map interaction ************************
  dynamicLayer.on("load", function() {
    layersArray = dynamicLayer.layerInfos;
    console.log(map);
    map.on("click", point => {
      state.mapClick(point);
    });
  });
  // build where clause and query
  state.fieldCropTableQuery = function() {
    // loop through all the field ID's and build where clause
    // we will use the where clause to query the Field_Crop_LUT Table
    let where = "";
    $.each(state["cda-data-object"]["local-option-selections"], (i, v) => {
      where += `fid = ${v}`;
      if (state["cda-data-object"]["local-option-selections"].length != i + 1) {
        where += ` OR `;
      }
    });
    let q = new Query();
    let qt = new QueryTask(state.field_crop_join_url);
    //  q.outFields = ["Crop_LUT.CropName", "Crop_LUT.Nitr_EMC", "FINAL_Field_Crop_LUT.fid"];
    q.outFields = ["*"];
    q.returnGeometry = false;
    q.where = where;
    qt.execute(q, function(e) {
      if (e.features.length > 0) {
        calculateNutrientLoad(e.features);
      } else {
        // there were no fields selected
      }
    });
  };
  // when a user clicks on the map to select
  state.mapClick = function(point) {
    console.log(map);
    // build out map click query
    const q = new Query();
    const qt = new QueryTask(state.url + "/0");
    q.geometry = point.mapPoint;
    q.outFields = ["*"];
    q.returnGeometry = true;
    // execute map query
    qt.execute(q, function(e) {
      // check to see if you clicked on a feature
      if (e.features.length > 0) {
        // add a selected graphic to the selected polygon
        map.graphics.add(
          new Graphic(e.features[0].geometry, selectionSymbol, {
            id: e.features[0].attributes.fid_1
          })
        );
        // if click on polygon, push polygon ID to main object
        state["cda-data-object"]["local-option-selections"].push(
          e.features[0].attributes.fid_1
        );
        displaySelectedFields(e.features[0].attributes.fid_1);
      }
    });
  };
});
