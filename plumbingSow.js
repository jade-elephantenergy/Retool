// permitsTableFormat
var permitsData = permits.data.hspf;
console.log('Permits Data:', permitsData);

var hddMaxValue = hdd_new.data.hdd_max;
console.log('HDD Max Value:', hddMaxValue);

var newElectricServiceValue = sows.data.new_electric_service;
console.log('New Electric Service Value:', newElectricServiceValue);

var tableData = [];

tableData.push({
    "Property": "hspf",
    "system1": permitsData[0] ? permitsData[0] : null,
    "system2": permitsData[1] ? permitsData[1] : null,
});

tableData.push({
    "Property": "BTU",
    "system1": hddMaxValue ? hddMaxValue : null,
    "system2": hddMaxValue ? hddMaxValue : null
});

tableData.push({
    "Property": "New Electric Service",
    "system1": newElectricServiceValue,
    "system2": newElectricServiceValue
});

console.log('Table Data:', tableData);

// Set the table data
return tableData;


//installerEquipTableChanges
let changes = Object.entries(installerEquipTable.changesetObject);
let data = { ...installerEquipDisplayedData.data };
changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Check if the row index exists in the data
  if (data[rowIndex]) {
    // Merge the change data with the corresponding entry in data
    data[rowIndex] = { ...data[rowIndex], ...changeData };
  } else {
    console.error(`Row index "${rowIndex}" does not exist in the data.`);
  }
});

return data;


//systemReqs
let data = {
 "Special Handling Requirements": specialHandlingReqs.value ? specialHandlingReqs.value : "N/A",
  "Ducting":ducting.value ? ducting.value : "N/A",
  "Flues": flues.value ? flues.value : "N/A",
  "Vacuum Relief Valve": vacuumReliefValve.value ? vacuumReliefValve.value : "N/A",
  "Pressure Regulator": pressureRegulator.value ? pressureRegulator.value : "N/A",
  "Hot Wire Pipe Insulation": hotWirePipeInstall.value ? hotWirePipeInstall.value : "N/A",
  "Main Water Line Valve Location": mainWaterLineValveLoc.value ? mainWaterLineValveLoc.value : "N/A",
  "Removal/Disposal of Old Equipment": removeOldEquip.value ? removeOldEquip.value : "N/A"
}
return data;


//systemReqsFormatted
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
let data = systemReqs.data;

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


//newElectricalService
let data = {
  "Electrical Company": electCompany.value ? electCompany.value : "N/A",
  "License Number": licenseNum.value ? licenseNum.value : "N/A",
  "Size (in amps)": electSize.value ? electSize.value : "N/A"
}
return data;

//newElectricalServiceFormatted
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
      <th>New Electrical Service</th>
      <th> </th>
    </tr>
`;

// Data object containing the provided properties
let data = newElectricalService.data;

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


//reduceImage
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
//replace dataUrl with photo upload component
let dataUrl = 'data:'+aerialHomeUpload3.files[0].type+';base64,'+aerialHomeUpload3.value[0].base64Data;
let imageType = aerialHomeUpload3.files[0].type
let resolution = 500
let quality = 1


let ds = downscaleImage(
        dataUrl,  
        imageType,  // e.g. 'image/jpeg'
        resolution,  // max width/height in pixels
        quality   // e.g. 0.9 = 90% quality
    )

return ds
