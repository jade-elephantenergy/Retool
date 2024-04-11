// installerEquipTableChanges
let changes = Object.entries(installerEquipTable.changesetObject);
let data = installerEquipTable.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//hp1SystemReqs
let data = {
  "Home Heating Load": homeHeatingLoad.value ? homeHeatingLoad.value : "N/A",
  "Heat Pump Load": heatPumpLoad1.value ? heatPumpLoad1.value : "N/A",
  "Aux Heating": auxHeating1.value ? auxHeating1.value : "N/A",
  "First Stage Lockout": firstStageLockout1.value ? firstStageLockout1.value : "N/A",
  "Second Stage Lockout": secondStageLockout1.value ? secondStageLockout1.value : "N/A",
  "Condenser Placement": condenserPlacement1.value ? condenserPlacement1.value : "N/A",
  "Air Handler Location": airHandlerLoc1.value ? airHandlerLoc1.value : "N/A",
  "Minisplit Location(s)": minisplitLoc1.value ? minisplitLoc1.value : "N/A",
  "Ducting": ducting.value ? ducting.value : "N/A",
  "Thermostat": thermostat.value ? thermostat.value : "N/A",
  "Controls": controls.value ? controls.value : "N/A",
  "Aux Drain Pan": auxDrainPan1.value ? auxDrainPan1.value : "N/A",
  "Refrigerant Lines": refrigerantLines1.value ? refrigerantLines1.value : "N/A",
  "Condensate Pump": condensatePump1.value ? condensatePump1.value : "N/A",
  "Humidification System": humidificationSystem1.value ? humidificationSystem1.value : "N/A",
  "Flues": flues.value ? flues.value : "N/A",
  "Gas Lines": gaslines.value ? gaslines.value : "N/A"
}
return data;


//hp1Formatted
// Initialize the HTML string for the table
let tableHTML = `
<div>
  <style>
    .custom-table {
      border-collapse: collapse;
      width: 100%;
    }
    .custom-table th, .custom-table td {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }
    .custom-table th {
      background-color: #f2f2f2;
    }
  </style>
  <table class="custom-table">
    <tr>
      <th>System Requirements</th>
      <th> </th>
    </tr>
`;

// Data object containing the provided properties
let data = hp1SystemReqs.data;

// Loop through each property in the data object and generate table rows
Object.entries(data).forEach(([property, value]) => {
  tableHTML += `
    <tr>
      <td>${property}</td>
      <td>${value}</td>
    </tr>
  `;
});

// Close the table HTML
tableHTML += `</table></div>`;

// Return the formatted HTML table
return tableHTML;


//hp2SystemReqs
let data = {
  "Home Heating Load": homeHeatingLoad2.value ? homeHeatingLoad2.value : "N/A",
  "Heat Pump Load": heatPumpLoad2.value ? heatPumpLoad2.value : "N/A",
  "Aux Heating": auxHeating2.value ? auxHeating2.value : "N/A",
  "First Stage Lockout": firstStageLockout2.value ? firstStageLockout2.value : "N/A",
  "Second Stage Lockout": secondStageLockout2.value ? secondStageLockout2.value : "N/A",
  "Condenser Placement": condenserPlacement2.value ? condenserPlacement2.value : "N/A",
  "Air Handler Location": airHandlerLoc2.value ? airHandlerLoc2.value : "N/A",
  "Minisplit Location(s)": minisplitLoc2.value ? minisplitLoc2.value : "N/A",
  "Ducting": ducting2.value ? ducting2.value : "N/A",
  "Thermostat": thermostat2.value ? thermostat2.value : "N/A",
  "Controls": controls2.value ? controls2.value : "N/A",
  "Aux Drain Pan": auxDrainPan2.value ? auxDrainPan2.value : "N/A",
  "Refrigerant Lines": refrigerantLinesSystem2.value ? refrigerantLinesSystem2.value : "N/A",
  "Condensate Pump": condensatePump2.value ? condensatePump2.value : "N/A",
  "Humidification System": humidificationSystem2.value ? humidificationSystem2.value : "N/A",
  "Flues": flues2.value ? flues2.value : "N/A",
  "Gas Lines": gaslines2.value ? gaslines2.value : "N/A"
}
return data;


//hp2Formatted
// Initialize the HTML string for the table
let tableHTML = `
<div>
  <style>
    .custom-table {
      border-collapse: collapse;
      width: 100%;
    }
    .custom-table th, .custom-table td {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }
    .custom-table th {
      background-color: #f2f2f2;
    }
  </style>
  <table class="custom-table">
    <tr>
      <th>System Requirements</th>
      <th> </th>
    </tr>
`;

// Data object containing the provided properties
let data = hp2SystemReqs.data;

// Loop through each property in the data object and generate table rows
Object.entries(data).forEach(([property, value]) => {
  tableHTML += `
    <tr>
      <td>${property}</td>
      <td>${value}</td>
    </tr>
  `;
});

// Close the table HTML
tableHTML += `</table></div>`;

// Return the formatted HTML table
return tableHTML;


//permitTableChanges
let changes = Object.entries(permitTable.changesetObject);
let data = permitTable.data;

changes.forEach(change => {
  let property = change[0];
  let changeData = change[1];

  // Find the row index corresponding to the property
  let rowIndex = data.findIndex(row => row.Property === property);
  if (rowIndex !== -1) {
    // Update the values for the system that has changed
    if ('system1' in changeData) {
      data[rowIndex].system1 = changeData.system1;
    }
    if ('system2' in changeData) {
      data[rowIndex].system2 = changeData.system2;
    }
  } else {
    // Row not found, create a new row with the changeset data
    data.push({ Property: property, ...changeData });
  }
});

return data;


//reduceImages
function getImage(dataUrl)
{
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = dataUrl;
        image.onload = () => {
            resolve(image);
        };
        image.onerror = (el, err) => {
            reject(err.error);
        };
    });
}

async function downscaleImage(
        dataUrl,  
        imageType,  // e.g. 'image/jpeg'
        resolution,  // max width/height in pixels
        quality   // e.g. 0.9 = 90% quality
    ) {

    // Create a temporary image so that we can compute the height of the image.
    const image = await getImage(dataUrl);
    const oldWidth = image.naturalWidth;
    const oldHeight = image.naturalHeight;
    console.log('dims', oldWidth, oldHeight);

    const longestDimension = oldWidth > oldHeight ? 'width' : 'height';
    const currentRes = longestDimension == 'width' ? oldWidth : oldHeight;
    console.log('longest dim', longestDimension, currentRes);

    if (currentRes > resolution) {
        console.log('need to resize...');

        // Calculate new dimensions
        const newSize = longestDimension == 'width' ? Math.floor(oldHeight / oldWidth * resolution) : Math.floor(oldWidth / oldHeight * resolution);
        const newWidth = longestDimension == 'width' ? resolution : newSize;
        const newHeight = longestDimension == 'height' ? resolution : newSize;
        console.log('new width / height', newWidth, newHeight);

        // Create a temporary canvas to draw the downscaled image on.
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw the downscaled image on the canvas and return the new data URL.
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        const newDataUrl = canvas.toDataURL(imageType, quality);
        return newDataUrl;
    }
    else {
        return dataUrl;
    }

}
// select dataUrl for photo upload component
let dataUrl = 'data:'+aerialHomeUpload.files[0].type+';base64,'+aerialHomeUpload.value[0].base64Data;
let imageType = aerialHomeUpload.files[0].type
let resolution = 500
let quality = 1


let ds = downscaleImage(
        dataUrl,  
        imageType,  // e.g. 'image/jpeg'
        resolution,  // max width/height in pixels
        quality   // e.g. 0.9 = 90% quality
    )

return ds


//permitsTableFormat
var permitsData = permits.data;
var scopeValue = sows && sows.data ? sows.data.scope : null; 
var condenserLocation1 = condenserPlacement1.value;
var condenserLocation2 = condenserPlacement2.value;
var hddMaxValue = hdd_new && hdd_new.data ? hdd_new.data.hdd_max : null; // Add check here
var tableData = [];

var firstPermit = permitsData[0];
var secondPermit = permitsData[1];

// Function to find condenser name from line items data
function findCondenserName(lineItemsData) {
    if (!lineItemsData || lineItemsData.length === 0) return null;
    for (var i = 0; i < lineItemsData.length; i++) {
        if (lineItemsData[i].equipment_type === "Condenser") {
            return lineItemsData[i].equipment_name;
        }
    }
    return null; // Return null if condenser not found
}

// Find condenser name from line_items_hp1 and line_items_hp2
var condenserName1 = findCondenserName(line_items_hp1.data);
var condenserName2 = findCondenserName(line_items_hp2.data);

tableData.push({
    "Property": "Building Heat Type",
    "system1": "Gas",
    "system2": "Gas"
});

tableData.push({
    "Property": "Heat Pump",
    "system1": condenserName1,
    "system2": condenserName2
});

tableData.push({
    "Property": "Condenser Location",
    "system1": condenserLocation1,
    "system2": condenserLocation2
});

tableData.push({
    "Property": "seer",
    "system1": firstPermit ? firstPermit.seer : null,
    "system2": secondPermit ? secondPermit.seer : null
});

tableData.push({
    "Property": "cop_5",
    "system1": firstPermit ? firstPermit.cop_5 : null,
    "system2": secondPermit ? secondPermit.cop_5 : null
});

tableData.push({
    "Property": "hspf",
    "system1": firstPermit ? firstPermit.hspf : null,
    "system2": secondPermit ? secondPermit.hspf : null
});

tableData.push({
    "Property": "BTU",
    "system1": hddMaxValue ? hddMaxValue : null,
    "system2": hddMaxValue ? hddMaxValue : null
});

tableData.push({
    "Property": "Scope",
    "system1": scopeValue ? scopeValue : null,
    "system2": scopeValue ? scopeValue : null
});

tableData.push({
    "Property": "New Electric Service",
    "system1": sows && sows.data && sows.data.electrical_company ? sows.data.electrical_company : "N/A",
    "system2": sows && sows.data && sows.data.electrical_company ? sows.data.electrical_company : "N/A"
});

tableData.push({
    "Property": "Gas Utility Provider",
    "system1": firstPermit ? firstPermit.Gas_Utility_Provider : null,
    "system2": secondPermit ? secondPermit.Gas_Utility_Provider : null
});

tableData.push({
    "Property": "Electric Utility Provider",
    "system1": firstPermit ? firstPermit.Electric_Utility_Provider : null,
    "system2": secondPermit ? secondPermit.Electric_Utility_Provider : null
});

console.log('Table Data:', tableData);

// Set the table data
return tableData;
