/*********
 * Setup *
 * *******/

// Check for project
let projectId;
if(!project.data)
	throw Error('A project must be selected in order to generate invoices');
else
	projectId = project.data.id;
// Check for proposal id
const proposalId = project.data.finalized_proposal_id;
if(!proposalId)
	throw Error('A proposal must be finalized in order to generate invoices');

// Set up pretty invoice names for labor items, keyed by system_type
const laborNames = {
	'hvac': 'Electric Heat Pump Installation',
	'water heater': 'Heat Pump Water Heater Installation',
	'ev': 'Electric Vehicle',
	'ev charging': 'Electric Vehicle Charger Installation',
	'solar': 'Solar Panel Installation',
	'panel': 'Electrical Upgrades',
	'cooktop': 'Induction Cooktop Wiring',
	'energy efficiency': 'Energy Efficiency Measures',
	'maintenance': 'Maintenance Plan',
	'other': 'Other'
};

//equipment types to give their own invoice lines to
const enumeratedEquipmentTypes = ['Condenser',
								'AHU',
								'Dual-Fuel Coil',
								'Horizontal-Ducted Head',
								'Wall Head',
								'Floor Head',
								'Ceiling Cassette',
								'Thermostat',
								'ERV',
								'EV Charger',
								'HPWH'];
const sortOrder = ['labor'].concat(enumeratedEquipmentTypes).concat(['parts','permit','discount','change order','incentive']);

// Place to store invoice lines before being inserted
let invoiceLines = [];

// Place to store margin line items to deal with later in application flow
let marginLineItems = [];

// Incentives payable to customer directly go in the footer
let footerLines = [];

// Total cost of project before incentives
let amountBeforeIncentives;

// Other global vars for info
let lineItems; // Array
let systems; // keyed by id
let equipmentData; // Get equipment data keyed by id
let ahriData; // get AHRI data keyed by id
let incentivesData; // get incentives data keyed by id
let permitsData; // get permits data keyed by id




/*************
 * Functions *
 *************/
function getSystem(item){
	let system = systems.find(system => item.system_id === system.id);
	if(system)
		return system;
	else
		throw Error('Line item must be attributed to a system: '+JSON.stringify(item));
}

function processLabor(item){
	let system = getSystem(item);
	if(system.invoiceItems && system.invoiceItems.labor){
		system.invoiceItems.labor.amount = system.invoiceItems.labor.amount ? system.invoiceItems.labor.amount + item.price_actual : item.price_actual;
	}
	else {
		let name = laborNames[system.system_type];
		if(system.system_type === 'hvac')
			name += ' \nAHRI Number: '+(ahriData[system.ahri_id]?.ahri_number ? ahriData[system.ahri_id]?.ahri_number : '');

		system.invoiceItems.labor = {
			sort_type: 'labor',
			line_item_type: 'labor',
			system_id: system.id,
			name: name,
			amount: item.price_actual
		}
	}
}

function processEquipment(item){
	let system = getSystem(item);
	let equipment = equipmentData[item.equipment_id];
	if(!equipment)
		throw Error('Equipment not found for line item '+item);

	if(enumeratedEquipmentTypes.includes(equipment.equipment_type)){
		system.invoiceItems['equipment_'+item.id] = {
			sort_type: equipment.equipment_type,
			line_item_type: 'equipment',
			system_id: system.id,
			name: equipment.equipment_name+'  \nModel Number: '+equipment.model_number+'    Serial Number: '+(item.serial_number ? item.serial_number : ''),
			amount: item.price_actual
		}
	}
	else if(system.invoiceItems && system.invoiceItems.parts){
		system.invoiceItems.parts.amount = system.invoiceItems.parts.amount ? system.invoiceItems.parts.amount + item.price_actual : item.price_actual;
	}
	else {
		system.invoiceItems.parts = {
			sort_type: 'parts',
			line_item_type: 'equipment',
			system_id: system.id,
			name: 'Parts & Accessories',
			amount: item.price_actual
		}
	}
}

function processMargin(margin){
	// Spread margin across labor, equipment, and parts proportionally
	let system = getSystem(margin);
	console.log(system);
	let applicableLines = Object.keys(system.invoiceItems).reduce((acc,key) =>{
		if(key === 'labor' || key.includes('equipment') || key === 'parts')
			acc.push(system.invoiceItems[key]);
		return acc;
	},[]);
	let cost = applicableLines.reduce((acc, line) => acc + line.amount,0);
	if(!cost || cost === 0)
		throw Error('Could not determine system cost for '+system);

	applicableLines.forEach(line => line.amount += margin.price_actual * (line.amount / cost));
}

function processIncentive(item){
	let system = getSystem(item);
	let incentive = incentivesData[item.incentive_id]
	if(!incentive)
		throw Error('Could not find incentive for item '+JSON.stringify(item));
	let incentiveLine = {
		sort_type: 'incentive',
		line_item_type: 'incentive',
		system_id: system.id,
		name: incentive.name,
		amount: item.price_actual
	}
	if(incentive.recipient === 'elephant')
		system.invoiceItems['incentive_'+item.id] = incentiveLine;
	else if(incentive.recipient === 'customer' || incentive.recipient === 'homeowner')
		footerLines.push(incentiveLine);
	else
		throw Error(`Invalid incentive recipient ${incentive.recipient} for incentive: ${incentive.name}`);
}

function processDiscount(item){
	let system = getSystem(item);
	system.invoiceItems['discount_'+item.id] = {
		sort_type: 'discount',
		line_item_type: 'discount',
		system_id: system.id,
		name: item.description,
		amount: item.price_actual
	}
}

function processChangeOrder(item){
	let system = getSystem(item);
	system.invoiceItems['changeOrder_'+item.id] = {
		sort_type: 'change order',
		line_item_type: 'change order',
		system_id: system.id,
		name: item.description, 
		amount: item.price_actual
	}
}

function processPermit(item){
	// Match permits to first instance of the right type of system, & add to labor cost

	// Object to match permit_type to system_type
	let typeMatcher = {
		'hvac': ['hvac'],
		'plumbing': ['water heater'],
		'electrical': ['panel', 'hvac', 'water heater', 'ev charging', 'solar', 'cooktop']
	}

	let permit = permitsData[item.permit_id];
	let systemTypes = systems.map(sys => sys.system_type);
	let matchedType = typeMatcher[permit?.permit_type]?.find(type => systemTypes.includes(type));
	let system = systems.find(system => system.system_type === matchedType);
	if(!system)
		system = systems.find(system => system.id === item.system_id);

	// If no system type match found, add as a separate line
	if(!matchedType || matchedType === 'other'){
		if(system.invoiceItems.permits){
			system.invoiceItems.permits.amount = system.invoiceItems.permits.amount ? system.invoiceItems.permits.amount + item.price_actual : item.price_actual;
		} else {
			system.invoiceItems.permits = {
				sort_type: 'permit',
				line_item_type: 'permit',
				system_id: system.id,
				name: 'Permits',
				amount: item.price_actual
			}
		}
	} else {
		// If system type match is found, swap out the system and process it as labor
		let newItem = item;
		newItem.system_id = system.id;
		processLabor(newItem);
	}

}

function processMaintenancePlan(item){
	let system = getSystem(item);
	if(system.invoiceItems && system.invoiceItems.maintenance){
		system.invoiceItems.maintenance.amount = system.invoiceItems.maintenance.amount ? system.invoiceItems.maintenance.amount + item.price_actual : item.price_actual;
	}
	else {
		system.invoiceItems.maintenance = {
			sort_type: 'maintenance',
			line_item_type: 'maintenance',
			system_id: system.id,
			name: 'Maintenance Plan',
			amount: item.price_actual
		}
	}
}



/*********************
 * Application Logic *
 *********************/

// Get the right systems and line items
let lineItemsPromise = new Promise((resolve,reject) => {
	line_items_finalized.trigger({
		onSuccess: resolve,
		onFailure: reject,
		additionalScope: {
			finalizedProposalId: proposalId
		}
	});	
});
let systemsPromise = new Promise((resolve,reject) => {
	systems_finalized.trigger({
		onSuccess: resolve,
		onFailure: reject,
		additionalScope: {
			finalizedProposalId: proposalId
		}
	});
});
let equipmentPromise = new Promise((resolve,reject) => {
	equipment_by_id.trigger({
		onSuccess: resolve,
		onFailure: reject
	});
});
let ahriPromise = new Promise((resolve,reject) => {
	ahri_by_id.trigger({
		onSuccess: resolve,
		onFailure: reject
	});
});
let incentivesPromise = new Promise((resolve,reject) => {
	incentives_by_id.trigger({
		onSuccess: resolve,
		onFailure: reject
	});
});

// Get information on what invoices we're creating
let firstDepositPct = firstDepositAmount.value;
let secondDepositPct = secondDepositAmount.value;
let firstCardFees = firstDepositCcFee.value;
let secondCardFees = secondDepositCcFee.value;
let financingPct = financingAmount.value;
let finalCardFees = finalInvoiceCcfee.value;
console.log(`Card fees: ${firstCardFees} ${secondCardFees} ${finalCardFees}`)

let firstDepositInvoice;
if(firstDepositPct > 0){
	firstDepositInvoice = {
		project_id: projectId,
		invoice_type: 'First Deposit',
		invoice_status: 'not sent',
		invoice_amount: 0
	}
}
let secondDepositInvoice;
if(secondDepositPct > 0){
	secondDepositInvoice = {
		project_id: projectId,
		invoice_type: 'Second Deposit',
		invoice_status: 'not sent',
		invoice_amount: 0
	}
}
let finalInvoice = {
	project_id: projectId,
	invoice_type: 'Final Invoice',
	invoice_status: 'not sent',
	invoice_amount: 0
}
let financingInvoice = {
  project_id: projectId,
  invoice_type: 'Financing Invoice',
  invoice_status: 'not sent',
  invoice_amount: 0
}


Promise.all([lineItemsPromise,systemsPromise,equipmentPromise,ahriPromise,incentivesPromise])
.then(async ([gotlineItems,gotSystems,gotEquipmentData,gotAhriData,gotIncentivesData]) => {
	console.log('let\'s goooooo');
	// set global-scope vars
	lineItems = gotlineItems;
	systems = gotSystems;
	equipmentData = gotEquipmentData;
	ahriData = gotAhriData;
	incentivesData = gotIncentivesData;

	// get permits
	let permitIds = lineItems.filter(item => item.line_item_type === 'permit' && item.permit_id).map(item => item.permit_id);
	permitsData = await new Promise((resolve,reject) => {
		permits_by_id.trigger({
			additionalScope: {
				permitIds: permitIds
			},
			onSuccess: resolve,
			onFailure: reject
		});
	});

	// set up invoiceItems property on all systems
	systems.forEach(system => system.invoiceItems = {});

	// Process line items. Invoice lines will be stored in the system object.
	console.log('processing '+lineItems.length+' line items');
	lineItems.forEach(item => {
		if(item.line_item_type === 'labor')
			processLabor(item);
		else if(item.line_item_type === 'equipment')
			processEquipment(item);
		else if(item.line_item_type === 'margin')
			marginLineItems.push(item); // process margin later after all equipment and labor line items are dealt with
		else if(item.line_item_type === 'discount')
			processDiscount(item);
		else if(item.line_item_type === 'incentive')
			processIncentive(item);
		else if(item.line_item_type === 'change order')
			processChangeOrder(item);
		else if(item.line_item_type === 'permit')
			processPermit(item);
		else if(item.line_item_type === 'maintenance plan')
			processMaintenancePlan(item);
		else
			throw Error('Invalid line item type: '+item.line_item_type+'. Item in question: '+JSON.stringify(item));
	});

	// process margin afterward
	console.log('processing margin');
	marginLineItems.forEach(item => processMargin(item));

	/// Process invoice line items in systems
	let incentiveLines = [];
	let discountLines = [];
	let changeOrderLines = [];

	systems.forEach(system => {
		let newLines = [];
		if(!system.invoiceItems || Object.keys(system.invoiceItems).length === 0)
			return;
		Object.values(system.invoiceItems).forEach(line => {
			// put incentives, discounts, and change orders into separate arrays to be added at the end
			if(line.sort_type === 'incentive')
				incentiveLines.push(line);
			else if(line.sort_type === 'discount')
				discountLines.push(line);
			else if(line.sort_type === 'change order')
				changeOrderLines.push(line);
			else
				newLines.push(line);
		});

		// sort newLines in the right order
		newLines.sort((a, b) => {
			const indexA = sortOrder.indexOf(a.sort_type);
			const indexB = sortOrder.indexOf(b.sort_type);

			if(indexA < indexB)
				return -1;
			if(indexA > indexB)
				return 1;
			return 0;
		});

		// add to invoiceLines
		invoiceLines = invoiceLines.concat(newLines);
	});
	// add incentives, discounts, and change orders
	invoiceLines = invoiceLines.concat(discountLines);
	invoiceLines = invoiceLines.concat(changeOrderLines);
	invoiceLines = invoiceLines.concat(incentiveLines);

	// add credit card fee for final invoice
	if(finalCardFees){
		invoiceLines.push({
			line_item_type: 'credit card fee',
			name: '3% Credit Card Fee',
			amount: 0.03 * invoiceLines.reduce((acc,line) => acc + line.amount,0)
		})
	}

	// get amount before incentives and use that to set up deposit amounts
	amountBeforeIncentives = invoiceLines.reduce((acc,line) => {
		if(line.sort_type === 'incentive')
			return acc;
		else
			return acc + line.amount;
	},0);
	let netCost = Math.round((invoiceLines.reduce((acc,line) => acc + line.amount,0) + footerLines.reduce((acc,line) => acc + line.amount,0))*100)/100;
	
	// Set up credits for deplosit invoices
	if(firstDepositInvoice){
		firstDepositInvoice.invoice_amount = Math.round(firstDepositPct * amountBeforeIncentives);
		invoiceLines.push({
			line_item_type: 'deposit',
			name: 'Credit for First Deposit',
			amount: -1 * firstDepositInvoice.invoice_amount
		});
	}
	if(secondDepositInvoice){
		secondDepositInvoice.invoice_amount = Math.round(secondDepositPct * amountBeforeIncentives);
		invoiceLines.push({
			line_item_type: 'deposit',
			name: 'Credit for Second Deposit',
			amount: -1 * secondDepositInvoice.invoice_amount
		});
	}
  if(financingInvoice){
    financingInvoice.invoice_amount = Math.round(financingPct);
      invoiceLines.push({
        line_item_type: 'financing',
        name: 'Credit for Financing Loan',
        amount: -1 * financingInvoice.invoice_amount
      });
  }

	// fill invoice_amount field
	finalInvoice.invoice_amount = Math.round(invoiceLines.reduce((acc,line) => acc + line.amount,0)*100)/100;

	// remove sort_type field b/c it is not stored in db
	invoiceLines.forEach(line => delete line.sort_type);

	// set up final invoice footer
	if(footerLines.length > 0){
		finalInvoice.footer = 'Incentives payable directly to customer: ';
		footerLines.forEach(line => {
			finalInvoice.footer += `\n $${-line.amount} - ${line.name}`;
		});
		finalInvoice.footer += '\n\n Net Project Cost: $'+netCost;
	}

	// insert final invoice
	finalInvoicePromise = new Promise((resolve,reject) => {
		insert_invoice.trigger({
			onSuccess: resolve,
			onFailure: reject,
			additionalScope: {
				invoiceData: finalInvoice
			}
		});
	}).then((gotFinalInvoice) => {
		console.log('inserted final invoice');
		// Get inserted invoice data w/id
		finalInvoice = gotFinalInvoice.result[0];
		
		// add invoice id to line items
		invoiceLines.forEach(item => {
			item.invoice_id = finalInvoice.id;
		});

		// insert line items
		invoiceLinesPromise = new Promise((resolve,reject) => {
			insert_invoice_lines.trigger({
				onSuccess: resolve,
				onFailure: reject,
				additionalScope: {
					invoiceLines: invoiceLines 
				}
			});
		}).then(invoiceLines => {
			console.log(invoiceLines.result[0].rowCount+' lines created for final invoice');
		}).catch(error => {
			console.log('Error in processing line items for final invoice: '+error.message);
			throw error;
		});

		// add invoice id to other deposits
		if(firstDepositInvoice)
			firstDepositInvoice.invoice_id = finalInvoice.id;
		if(secondDepositInvoice)
			secondDepositInvoice.invoice_id = finalInvoice.id;
    if(financingInvoice) 
      financingInvoice.invoice_id = financingInvoice.id;

		// Insert deposit invoices
		let firstDepositInvoicePromise;
		if(firstDepositInvoice){
			firstDepositInvoicePromise = new Promise((resolve,reject) => {
				insert_invoice.trigger({
					onSuccess: resolve,
					onFailure: reject,
					additionalScope: {
						invoiceData: firstDepositInvoice
					}
				});
			});
		}
		let secondDepositInvoicePromise;
		if(secondDepositInvoice){
			secondDepositInvoicePromise = new Promise((resolve,reject) => {
				insert_invoice.trigger({
					onSuccess: resolve,
					onFailure: reject,
					additionalScope: {
						invoiceData: secondDepositInvoice
					}
				});
			});
		}
    let financingInvoicePromise;
    if(financingInvoice){
      financingInvoicePromise = new Promise((resolve,reject) => {
        insert_invoice.trigger({
          onSuccess: resolve,
          onFailure: reject,
          additionalScope: {
            invoiceData: financingInvoice
          }
        });
      });
    }

		// Insert invoice lines for each deposit invoice
		Promise.all([firstDepositInvoicePromise,secondDepositInvoicePromise, financingInvoicePromise]).then(([gotFirstDepositInvoice,gotSecondDepositInvoice, gotFinancingInvoice]) => {
			let newLines = [];
			let firstDepositInvoice = gotFirstDepositInvoice.result[0];
			let secondDepositInvoice = gotSecondDepositInvoice.result[0];
      let financingInvoice = gotFinancingInvoice.result[0];

			if(firstDepositInvoice){
				console.log('first deposit invoice created: '+JSON.stringify(firstDepositInvoice));
				newLines.push({
					invoice_id: firstDepositInvoice.id,
					line_item_type: 'deposit',
					name: 'First Deposit: '+firstDepositPct*100+'% of total before incentives',
					amount: firstDepositInvoice.invoice_amount
				});
				// add cc fees
				if(firstCardFees){
					newLines.push({
						invoice_id: firstDepositInvoice.id,
						line_item_type: 'credit card fee',
						name: '3% Credit Card Fee',
						amount: Math.round(0.03 * firstDepositInvoice.invoice_amount)
					});
				}
			}
			if(secondDepositInvoice){
				console.log('second deposit invoice created: '+JSON.stringify(secondDepositInvoice));
				newLines.push({
					invoice_id: secondDepositInvoice.id,
					line_item_type: 'deposit',
					name: 'Second Deposit: '+secondDepositPct*100+'% of total before incentives',
					amount: secondDepositInvoice.invoice_amount
				});
				// add cc fees
				if(secondCardFees){
					newLines.push({
						invoice_id: secondDepositInvoice.id,
						line_item_type: 'credit card fee',
						name: '3% Credit Card Fee',
						amount: Math.round(0.03 * secondDepositInvoice.invoice_amount)
					});
				}
			}
      if(financingInvoice){
				console.log('financing invoice created: '+JSON.stringify(financingInvoice));
				newLines.push({
					invoice_id: financingInvoice.id,
					line_item_type: 'financing',
					name: 'Financing: '+financingPct,
					amount: financingInvoice.invoice_amount
				});
			if(newLines.length > 0){
				let depositLinesPromise = new Promise((resolve,reject) => {
					insert_invoice_lines.trigger({
						onSuccess: resolve,
						onFailure: reject,
						additionalScope: {
							invoiceLines: newLines
						}
					});
				}).then(invoiceLines => {
					console.log(invoiceLines.result[0].rowCount+' lines created for deposit invoices');
				}).catch(error => {
					console.log('Error in processing line items for deposit invoices: '+error.stack);
					throw error;
				});;
			}
		}).catch(error => {
			console.log('Error in processing deposit invoices: '+error.stack);
			throw error;
		});
	});

	//TODO workflow to add credit line item to final invoice when deposit invoice is paid
}).catch(error => {
	console.log('Error encountered in processing: '+error.stack);
	throw error;
});	

if(newLines.length > 0){
				let financingLinesPromise = new Promise((resolve,reject) => {
					insert_invoice_lines.trigger({
						onSuccess: resolve,
						onFailure: reject,
						additionalScope: {
							invoiceLines: newLines
						}
					});
				}).then(invoiceLines => {
					console.log(invoiceLines.result[0].rowCount+' lines created for financing invoice');
				}).catch(error => {
					console.log('Error in processing line items for financing invoice: '+error.stack);
					throw error;
				});;
			}
		}).catch(error => {
			console.log('Error in processing financing invoice: '+error.stack);
			throw error;
		});
	});

	//TODO workflow to add credit line item to final invoice when deposit invoice is paid
}).catch(error => {
	console.log('Error encountered in processing: '+error.stack);
	throw error;
});	
