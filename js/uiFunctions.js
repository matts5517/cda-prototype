function buildBMPdropdown() {
  // create the BMP dropdown HTML
  let bmpDDHTML = `<select class="bmp-dropdown">`;
  bmpDDHTML += `<option value="" disabled selected>Select a BMP</option>`;
  $.each(bmp_lut_table, function(i, v) {
    var myJSON = JSON.stringify(v);
    bmpDDHTML += `<option data-bmp-options="${myJSON}">${v.BMP_Short}</option>`;
  });
  bmpDDHTML += `</select>`;
  return bmpDDHTML;
}
// build out the html code for the BMP dropdown initialy
const bmpDDHTML = buildBMPdropdown();

// create the BMP selection box
function createBMPSelectionBoxes(i, v) {
  let html = `<div data-field_ID="${i}" class="bmp-selection-box">`;
  html += `<div class="bmp-box-header">Field ID: ${i} - P Load: ${v.totalPhosLoad} - N Load: ${v.totalNitLoad}</div>`;
  // add in BMP Dropdown
  html += `<div class="bmp-select-wrapper">`;
  html += `${bmpDDHTML}`;
  html += `</div>`;
  html += `</div>`;
  return html;
}

// create the agricultural field selection box in the BMP selection area
function displayFieldsForBMPSelection() {
  const fieldSelectedDataObject =
    state["cda-data-object"]["fieldSelectedDataObject"];
  // show the bmp section of the app
  showBMPSelection();
  // empty the selection wrapper
  $(".bmp-selection-box-wrapper").empty();
  // loop through the selected field object and build BMP selection boxes
  $.each(fieldSelectedDataObject, function(i, v) {
    const html = createBMPSelectionBoxes(i, v);
    $(".bmp-selection-box-wrapper").append(html);
  });
}
// display fields that have been selected in the main section of the app when a user clicks on the map
function displaySelectedFields(id) {
  console.log("display", id);
  let html = `<div>Field ID: ${id}</div>`;
  $(".selected-fields-wrapper").append(html);
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
  state.fieldCropTableQuery();
});

// on go back to main settings button click
$(".go-back-to-settings").on("click", evt => {
  hideBMPSelection();
});

// on BMP select menu click/change
$(document).on("change", ".bmp-dropdown", function(evt) {
  bmpDropdownChange(evt);
});
