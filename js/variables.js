dataObj = {
  url:
    "https://cumulus.tnc.org/arcgis/rest/services/nascience/CDA_feature_service_prototype/MapServer",
  field_crop_join_url:
    "https://cumulus.tnc.org/arcgis/rest/services/nascience/CDA_feature_service_prototype/MapServer/4",
  visibleLayers: [5],
  appAreaVisible: "main",
  "cda-data-object": {
    "area-selected-counter": 0,
    "area-selected": "",
    "area-option": true,
    "local-option": "",
    "local-option-selections": [],
    "resource-option": true,
    "resource-option-selections": [],
    "huc-option": "",
    "huc-option-selections": [],
    "catchment-option": "",
    "catchment-option-selections": [],
    "edge-field-option": "",
    "stream-option": "",
    "nitrogen-option": true,
    "phosphorus-option": false,
    "sediment-option": false,
    sed_method: "",
    "baseline-option": true,
    "alternate-option": "",
    fieldSelectedDataObject: {}
  }
};


// create the BMP dropdown HTML
let bmpDDHTML = `<select class="bmp-dropdown">`;
bmpDDHTML += `<option value="" disabled selected>Select a BMP</option>`;
$.each(bmp_lut_table, function (i,v) {
  var myJSON = JSON.stringify(v);
  bmpDDHTML += `<option data-bmp-options="${myJSON}">${v.BMP_Short}</option>`;
});
bmpDDHTML += `</select>`;
t