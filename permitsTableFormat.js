// hvacSOW
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
