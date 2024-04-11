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


//dedicatedCircuitsTableChanges
let changes = Object.entries(dedicatedCircuitsTable.changesetObject);
let data = dedicatedCircuitsTable.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//otherEquipTableChanges
let changes = Object.entries(nondedicatedCircuitsTable.changesetObject);
let data = nondedicatedCircuitsTable.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//hp1TableChanges
let changes = Object.entries(heatPump1.changesetObject);
let data = heatPump1.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//hp2TableChanges
let changes = Object.entries(heatPump2.changesetObject);
let data = heatPump2.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//hpwhTableChanges
let changes = Object.entries(waterHeaterTable.changesetObject);
let data = waterHeaterTable.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//evTableChanges
let changes = Object.entries(evTable.changesetObject);
let data = evTable.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//inductionTableChanges
let changes = Object.entries(inductionTable.changesetObject);
let data = inductionTable.data;

changes.forEach(change => {
  let rowIndex = change[0];
  let changeData = change[1];

  // Merge the change data with the corresponding entry in data
  data[rowIndex] = _.merge(data[rowIndex], changeData);
});

return data;


//permitTableChanges
let changes = Object.entries(permitTable2.changesetObject);
let data = permitTable2.data;

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
// replace dataUrl with photo upload component
let dataUrl = 'data:'+aerialHomeUpload2.files[0].type+';base64,'+aerialHomeUpload2.value[0].base64Data;
let imageType = aerialHomeUpload2.files[0].type
let resolution = 500
let quality = 1


let ds = downscaleImage(
        dataUrl,  
        imageType,  // e.g. 'image/jpeg'
        resolution,  // max width/height in pixels
        quality   // e.g. 0.9 = 90% quality
    )

return ds

// permitsTableFormat
var permitsData = permits.data;
var scopeValue = sows && sows.data ? sows.data.scope : null; 
var condenserLocation1 = sows && sows.data && sows.data.condenser_placement_system1 ? sows.data.condenser_placement_system1 : null;
var condenserLocation2 = sows && sows.data && sows.data.condenser_placement_system2 ? sows.data.condenser_placement_system2 : null;

var hddMaxValue = hdd_new && hdd_new.data ? hdd_new.data.hdd_max : null;
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
    "system1": condenserLocation1 ? condenserLocation1 : null,
    "system2": condenserLocation2 ? condenserLocation2 : null
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

