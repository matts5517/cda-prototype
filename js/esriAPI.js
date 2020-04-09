require([
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "dojo/_base/Color",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/graphic",
], function (
  Map,
  ArcGISDynamicMapServiceLayer,
  SimpleLineSymbol,
  SimpleFillSymbol,
  Color,
  Query,
  QueryTask,
  Graphic
) {
  state.initMap = function () {
    // init map ******************************************************************************************
    state.map = new Map("map", {
      center: [-93.5, 30.16],
      zoom: 16,
      // basemap: "topo"
    });
    // Add dynamic map service ******************************
    state.dynamicLayer = new ArcGISDynamicMapServiceLayer(state.url, {
      opacity: 0.7,
    });

    state.selectionSymbol = new SimpleFillSymbol(
      SimpleFillSymbol.STYLE_SOLID,
      new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID,
        new Color([0, 255, 255]),
        2
      ),
      new Color([0, 255, 255, 0.1])
    );
    // add dynamic layer to map and set visible layers ************************************************************************
    state.map.addLayer(state.dynamicLayer);
    state.dynamicLayer.setVisibleLayers([0]);
    // wait until layer is loaded fully before allowing map interaction ************************
    state.dynamicLayer.on("load", function () {
      const layersArray = state.dynamicLayer.layerInfos;
      state.map.on("click", (point) => {
        state.mapClick(point);
      });
    });
  };

  // build where clause and query
  state.fieldCropTableQuery = function () {
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
    q.outFields = ["*"];
    q.returnGeometry = false;
    q.where = where;
    qt.execute(q, function (e) {
      if (e.features.length > 0) {
        state.calculateNutrientLoad(e.features).then(function () {
          // once everything has been calulated, start building BMP GUI
          console.log(state["cda-data-object"]["fieldSelectedDataObject"]);
          state.displayFieldsForBMPSelection();
        });
      } else {
        // there were no fields selected
      }
    });
  };
  // when a user clicks on the map to select
  state.mapClick = function (point) {
    // wait for the prmoise to resolve then continue
    state.fieldMapClickQuery(point).then(function (features) {
      if (features.length > 0) {
        // add selection graphic to map
        state.addGraphicsToMap(
          features[0].geometry,
          features[0].attributes.fid_1
        );
        // if click on polygon, push polygon ID to main object
        state["cda-data-object"]["local-option-selections"].push(
          features[0].attributes.fid_1
        );
        // update the UI to display selecetd fields for BMP selection
        state.displaySelectedFields(features[0].attributes.fid_1);
      }
    });
  };

  // add graphics to web map
  state.addGraphicsToMap = function (featureGeom, id) {
    // add a selected graphic to the selected polygon
    state.map.graphics.add(
      new Graphic(featureGeom, state.selectionSymbol, {
        id: id,
      })
    );
  };

  state.fieldMapClickQuery = function (point) {
    return new Promise(function (resolve, reject) {
      const q = new Query();
      const qt = new QueryTask(state.url + "/0");
      q.geometry = point.mapPoint;
      q.outFields = ["*"];
      q.returnGeometry = true;
      // execute map query
      qt.execute(q, function (e) {
        // check to see if you clicked on a feature
        if (e.features.length > 0) {
          const features = e.features;
          return resolve(features);
        } else {
          const features = "";
          return resolve(features);
        }
      });
    });
  };
});
