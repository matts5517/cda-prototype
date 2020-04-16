function Test() {
  this.test = "test";
  this.render = function () {
    console.log("render", this.test);
  };
}
Test.prototype.render2 = function () {
  console.log("test prototype");
};

// loop through all selected fields and calculate nutrient load for each crop and the total for field
state.calculateNutrientLoad = function (features) {
  return new Promise(function (resolve, reject) {
    const fieldSelectedDataObject =
      state["cda-data-object"]["fieldSelectedDataObject"];
    // loop through all selected features and add a new object for each field
    $.each(features, function (i, v) {
      let fid = v.attributes.fid;
      if (!fieldSelectedDataObject.fid) {
        fieldSelectedDataObject[fid] = {};
      }
    });
    // loop through all selected features and add nutrient load to each field object
    $.each(features, function (i, v) {
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
      if (fieldSelectedDataObject[fid].cropName != cropName) {
        fieldSelectedDataObject[fid][cropName] = {};
      }
      // per crop, add in other variables to the objcte, including loads
      let cropValue = fieldSelectedDataObject[fid][cropName];
      cropValue.cropID = cropID;
      cropValue.acres = cropAcres;
      cropValue.nit_load = nitLoad;
      cropValue.phos_load = phosLoad;
    });
    // calculate total nutrient loads
    $.each(fieldSelectedDataObject, function (i, v) {
      let totalNitLoad = 0;
      let totalPhosLoad = 0;
      $.each(v, function (i, k) {
        totalNitLoad += k.nit_load;
        totalPhosLoad += k.phos_load;
      });
      v.totalNitLoad = totalNitLoad;
      v.totalPhosLoad = totalPhosLoad;
    });
    // resolve the prmoise
    resolve();
  });
};
