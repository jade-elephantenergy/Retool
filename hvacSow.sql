-- installer_equip
SELECT
  COALESCE(equipment_new.equipment_name, labor_new.name) AS item_name
FROM
  line_items_new
  JOIN systems_new ON line_items_new.system_id = systems_new.id
  LEFT JOIN equipment_new ON line_items_new.equipment_id = equipment_new.id
  LEFT JOIN labor_new ON line_items_new.labor_id = labor_new.id
WHERE
  systems_new.proposal_id = {{project.value.finalized_proposal_id}}
  AND systems_new.system_type = 'hvac'
  AND equipment_new.equipment_name IS NOT NULL
  AND equipment_new.provider <> 'elephant';

-- line_items_hp1
SELECT equipment_new.equipment_name as equipment_name,
  equipment_new.model_number as model_number,
  equipment_new.width as width,
  equipment_new.height as height,
  equipment_new.depth as depth,
  equipment_new.weight as weight,
  equipment_new.provider as provider
FROM line_items_new 
INNER JOIN equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE line_items_new.system_id = (
    SELECT id
    FROM (
        SELECT id 
        FROM systems_new 
        WHERE proposal_id = {{project.value.finalized_proposal_id}}
        AND system_type = 'hvac'
        LIMIT 1
    ) AS subquery
)
AND line_items_new.line_item_type = 'equipment'
AND equipment_new.provider = 'elephant';

-- line_items_hp2
SELECT equipment_new.equipment_name as equipment_name,
  equipment_new.model_number as model_number,
  equipment_new.width as width,
  equipment_new.height as height,
  equipment_new.depth as depth,
  equipment_new.weight as weight,
  equipment_new.provider as provider
FROM line_items_new 
INNER JOIN equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE line_items_new.system_id = (
    SELECT id
    FROM systems_new 
    WHERE proposal_id = {{project.value.finalized_proposal_id}}
    AND system_type = 'hvac'
    ORDER BY id OFFSET 1 LIMIT 1
)
AND line_items_new.line_item_type = 'equipment'
AND equipment_new.provider = 'elephant';

-- heatKitInfo
SELECT line_items_new.*, equipment_new.*
FROM line_items_new 
INNER JOIN equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE line_items_new.system_id IN (
    SELECT id
    FROM systems_new 
    WHERE proposal_id = {{project.value.finalized_proposal_id}}
    AND system_type = 'hvac'
)
AND equipment_new.equipment_type = 'Heat Kit';


-- thermostatInfo
SELECT line_items_new.*, equipment_new.*
FROM line_items_new 
INNER JOIN equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE line_items_new.system_id IN (
    SELECT id
    FROM systems_new 
    WHERE proposal_id = {{project.value.finalized_proposal_id}}
    AND system_type = 'hvac'
)
AND equipment_new.equipment_type = 'Thermostat';

-- humidInfo
SELECT line_items_new.*, equipment_new.*
FROM line_items_new 
INNER JOIN equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE line_items_new.system_id IN (
    SELECT id
    FROM systems_new 
    WHERE proposal_id = {{project.value.finalized_proposal_id}}
    AND system_type = 'hvac'
)
AND equipment_new.equipment_type = 'Humidifier';

-- permits
SELECT 
    ahri_certifications_new.*,
    houses_new.gas_utility AS "Gas_Utility_Provider",
    houses_new.electric_utility AS "Electric_Utility_Provider"
FROM 
    ahri_certifications_new
JOIN 
    systems_new ON ahri_certifications_new.id = systems_new.ahri_id
JOIN 
    houses_new ON systems_new.house_id = houses_new.id
WHERE 
    systems_new.proposal_id = {{project.value.finalized_proposal_id}}
AND systems_new.system_type = 'hvac';

-- offerInfo
SELECT 
    SUM(line_items_new.price_actual) AS price_actual,
    SUM(labor_new.labor_hours) AS labor_hours
FROM 
    line_items_new
JOIN 
    systems_new ON line_items_new.system_id = systems_new.id
JOIN
    labor_new ON line_items_new.labor_id = labor_new.id
WHERE
    systems_new.proposal_id = {{ project.value.finalized_proposal_id }}
    AND labor_new.category = 'hvac';

--write_sows
{
"project_id": {{project.value.id}},
"wall_type": {{wallType.value}},
"wifi_network": {{wifiNetwork.value}},
"wifi_password": {{wifiPassword.value}},
"hvac_overview": {{hvac_overview.value}},
"hvac_project_risks": {{hvacProjectRisks.value}},
"hvac_installers_required": {{hvacInstallersReq.value}},
"home_heating_load": {{homeHeatingLoad.value}},
"heat_pump_load_system_1": {{heatPumpLoad1.value}},
"aux_heating_system_1": {{auxHeating1.value}},
"first_stage_lockout_system_1": {{firstStageLockout1.value}},
"second_stage_lockout_system_1": {{secondStageLockout1.value}},
"condenser_placement_system_1": {{condenserPlacement1.value}},
"minisplit_install_locations_system_1": {{minisplitLoc1.value}},
"hp1_ducting": {{ducting.value}},
"hp1_thermostat": {{thermostat.value}},
"hp1_controls": {{controls.value}},
"aux_drain_pan_system_1": {{auxDrainPan1.value}},
"refrigerant_lines_system_1": {{refrigerantLines1.value}},
"condensate_pump_system_1": {{condensatePump1.value}},
"humidification_system_system_1": {{humidificationSystem1.value}},
"flues": {{flues.value}},
"gas_lines": {{gaslines.value}},
"heat_pump_load_system_2": {{heatPumpLoad2.value}},
"aux_heating_system_2": {{auxHeating2.value}},
"first_stage_lockout_system_2": {{firstStageLockout2.value}},
"second_stage_lockout_system_2": {{secondStageLockout2.value}},
"condenser_placement_system_2": {{condenserPlacement2.value}},
"air_handler_install_location_system_2": {{airHandlerLoc2.value}},
"minisplit_locations_system_2": {{minisplitLoc2.value}},
"hp2_ducting": {{ducting2.value}},
"hp2_thermostat": {{thermostat2.value}},
"hp2_controls": {{controls2.value}},
"aux_drain_pan_system_2": {{auxDrainPan2.value}},
"refrigerant_lines_system_2": {{refrigerantLinesSystem2.value}},
"condensate_pump_system_2": {{condensatePump2.value}},
"humidification_system_system_2": {{humidificationSystem2.value}},
"electrical_installer": {{electInstaller.value}},
"electrical_install_date": {{electInstallDate.value}},
"plumbing_installer": {{plumbInstaller.value}},
"plumbing_install_date": {{plumbInstallDate.value}},
"scope": {{permitTable.data['3'].system1}},
"specifications": {{installerEquipTable.data.specifications}}
}
