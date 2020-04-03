$(document).ready(function() {
  // bring in esri api libs
  require([
    "esri/map",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "dojo/_base/Color",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/graphic"
  ], function(Map, ArcGISDynamicMapServiceLayer, SimpleLineSymbol, SimpleFillSymbol, Color, Query, QueryTask, Graphic) {
    //****************************************************************************************************
    // esri api code goes here
    // init map ******************************************************************************************
    var map = new Map("map", {
      center: [-93.5, 30.16],
      zoom: 16
      // basemap: "topo"
    });
    // Add dynamic map service ******************************
    let dynamicLayer = new ArcGISDynamicMapServiceLayer(dataObj.url, {
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
      map.on("click", point => {
        mapClick(point);
      });
    });
    // when a user clicks on the map to select
    function mapClick(point) {
      // build out map click query
      let q = new Query();
      let qt = new QueryTask(dataObj.url + "/0");
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
          dataObj["cda-data-object"]["local-option-selections"].push(
            e.features[0].attributes.fid_1
          );

          displaySelectedFields(e.features[0].attributes.fid_1);
        }
      });
    }
    // ****************************************************************************************************
    // bpmLogic functions *************************************************************
    // build where clause and query
    function fieldCropTableQuery() {
      // loop through all the field ID's and build where clause
      // we will use the where clause to query the Field_Crop_LUT Table
      let where = "";
      $.each(dataObj["cda-data-object"]["local-option-selections"], (i, v) => {
        where += `fid = ${v}`;
        if (
          dataObj["cda-data-object"]["local-option-selections"].length !=
          i + 1
        ) {
          where += ` OR `;
        }
      });
      let q = new Query();
      let qt = new QueryTask(dataObj.field_crop_join_url);
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
    }
    // loop through all selected fields and calculate nutrient load for each crop and the total for field
    function calculateNutrientLoad(features) {
      // loop through all selected features and add a new object for each field
      $.each(features, function(i, v) {
        let fid = v.attributes.fid;
        if (!dataObj["cda-data-object"]["fieldSelectedDataObject"].fid) {
          dataObj["cda-data-object"]["fieldSelectedDataObject"][fid] = {};
        }
      });
      // loop through all selected features and add nutrient load to each field object
      $.each(features, function(i, v) {
        let fid = v.attributes.fid;
        let cropName = v.attributes.CropName;
        let cropID = v.attributes.crop_id;
        let cropAcres = v.attributes.CropArea_acres;
        let annualPrecip = v.attributes.AnnPrecip_in;
        let phosEMC = v.attributes.Phos_EMC;
        let nitEMC = v.attributes.Nitr_EMC;
        let convFactor = 0.000113;
        // calculate load values
        let phosLoad = phosEMC * annualPrecip * cropAcres * convFactor;
        let nitLoad = nitEMC * annualPrecip * cropAcres * convFactor;
        // if crop name is not already in the data object, add cropname =  new {}
        if (
          dataObj["cda-data-object"]["fieldSelectedDataObject"][fid].cropName !=
          cropName
        ) {
          dataObj["cda-data-object"]["fieldSelectedDataObject"][fid][
            cropName
          ] = {};
        }
        // per crop, add in other variables to the objcte, including loads
        dataObj["cda-data-object"]["fieldSelectedDataObject"][fid][
          cropName
        ].cropID = cropID;
        dataObj["cda-data-object"]["fieldSelectedDataObject"][fid][
          cropName
        ].acres = cropAcres;
        dataObj["cda-data-object"]["fieldSelectedDataObject"][fid][
          cropName
        ].nit_load = nitLoad;
        dataObj["cda-data-object"]["fieldSelectedDataObject"][fid][
          cropName
        ].phos_load = phosLoad;
      });
      // calculate total nutrient loads
      $.each(dataObj["cda-data-object"]["fieldSelectedDataObject"], function(
        i,
        v
      ) {
        let totalNitLoad = 0;
        let totalPhosLoad = 0;
        $.each(v, function(i, k) {
          totalNitLoad += k.nit_load;
          totalPhosLoad += k.phos_load;
        });
        v.totalNitLoad = totalNitLoad;
        v.totalPhosLoad = totalPhosLoad;
      });
      // once everything has been calulated, start building BMP GUI
      displayFieldsForBMPSelection();
    }
    // *********************************************************************************
    // UI functions ******************************************************************
    // display fields that have been selected in the main section of the app when a user clicks on the map
    function displaySelectedFields(id) {
      console.log("display", id);
      let html = `<div>Field ID: ${id}</div>`;
      $(".selected-fields-wrapper").append(html);
    }
    // create the agricultural field selection box in the BMP selection area
    function displayFieldsForBMPSelection() {
      // show the bmp section of the app
      showBMPSelection();
      // empty the selection wrapper
      $(".bmp-selection-box-wrapper").empty();
      // loop through the selected field object and build BMP selection boxes
      $.each(dataObj["cda-data-object"]["fieldSelectedDataObject"], function(
        i,
        v
      ) {
        let html = `<div data-field_ID="${i}" class="bmp-selection-box">`;
        html += `<div class="bmp-box-header">Field ID: ${i} - P Load: ${v.totalPhosLoad} - N Load: ${v.totalNitLoad}</div>`;
        // add in BMP Dropdown
        html += `<div class="bmp-select-wrapper">`;
        html += `${bmpDDHTML}`;
        html += `</div>`;
        html += `</div>`;
        $(".bmp-selection-box-wrapper").append(html);
      });
    }
    // when a user selects a BMP from the dropdown menu
    function bmpDropdownChange(evt) {
      // add a select menu attribute marked as yes
      $($(evt.currentTarget).parent()[0]).data("selected", "yes");
      let parentBox = $(evt.currentTarget)
        .parent()
        .parent();
      // remove all bmp boxes that are not marked as selected
      $.each($(parentBox).find(".bmp-select-wrapper"), function(i, v) {
        if ($(v).data()["selected"] != "yes") {
          $(v).remove();
        }
      });
      // append a non selected bmp box
      let html = `<div class="bmp-select-wrapper">${bmpDDHTML}</div>`;
      $(evt.currentTarget)
        .parent()
        .parent()
        .append(html);
    }

    // show hide BMP selection wrapper
    function showBMPSelection() {
      $(".main-settings-wrapper").hide();
      $(".bmp-selection-wrapper").show();
    }
    function hideBMPSelection() {
      $(".bmp-selection-wrapper").hide();
      $(".main-settings-wrapper").show();
    }

    //***********************************************************************************************
    // on clicks ***********************************************************************
    // on BMP select button click
    $(".select-bmp-button").on("click", evt => {
      fieldCropTableQuery();
    });

    // on go back to main settings button click
    $(".go-back-to-settings").on("click", evt => {
      hideBMPSelection();
    });

    // on BMP select menu click/change
    $(document).on("change", ".bmp-dropdown", function(evt) {
      bmpDropdownChange(evt);
    });
  });
});
