// generateInflowCustomer
var customer = crypto.randomUUID();
var address = crypto.randomUUID();

var data = {
    customerID: customer,
    addressID: address,
};


return data;


// inflowJSON
var customer = inflow_get_customer.data[0].customerId;
var poNumber = project.data.id;
var salesOrderId = crypto.randomUUID();
var source = "Retool";

var equipmentLineItems = finalized_line_items.value.filter(function(lineItem) {
    return lineItem.line_item_type === 'equipment' && lineItem.inflow_id !== 'NEEDS_INPUT';
});

var lines = [];

equipmentLineItems.forEach(function(lineItem) {
    var line = {
        description: lineItem.name,
        productId: lineItem.inflow_id,
        salesOrderLineId: crypto.randomUUID()
    };

    lines.push(line);
});

var data = {
    customerId: customer,
    poNumber: poNumber,
    salesOrderId: salesOrderId,
    source: source,
    lines: lines
};

// Convert the object to a JSON string
var jsonString = JSON.stringify(data);

// Return the JSON string
return jsonString;


//inflowMatchSerialNumbers
// Filter line items by type
const filteredLineItems = finalized_line_items.value.filter(item => item.line_item_type === "equipment");

// Initialize an array to store the mappings
const productIdToLineItemIdAndSerialNumberMap = [];

// Iterate over each item in filteredLineItems and populate the map
filteredLineItems.forEach(item => {
    const { id: lineItemId, inflow_id: inflowId } = item;
    const matchedProduct = inflow_get_order.data.lines.find(product => product.productId === inflowId);
    if (matchedProduct && matchedProduct.quantity.serialNumbers.length > 0) {
        // Push the mapping to the array with the first serial number
        productIdToLineItemIdAndSerialNumberMap.push({
            lineItemId,
            serialNumber: matchedProduct.quantity.serialNumbers[0] // Use only the first serial number
        });
    }
});

// Sort the array by lineItemId
productIdToLineItemIdAndSerialNumberMap.sort((a, b) => a.lineItemId - b.lineItemId);

// Return the formatted data
return productIdToLineItemIdAndSerialNumberMap;

