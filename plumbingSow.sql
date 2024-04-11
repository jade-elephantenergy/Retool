-- installer_equip
SELECT 
    COALESCE(equipment_new.equipment_name, labor_new.name) AS item_name
FROM 
    line_items_new
JOIN 
    systems_new ON line_items_new.system_id = systems_new.id
LEFT JOIN 
    equipment_new ON line_items_new.equipment_id = equipment_new.id
LEFT JOIN 
    labor_new ON line_items_new.labor_id = labor_new.id
WHERE 
    systems_new.proposal_id = {{project.value.finalized_proposal_id}}
AND equipment_new.provider = 'plumbing';


-- waterHeater
SELECT equipment_new.equipment_name AS equipment_name,
       equipment_new.model_number AS model_number,
       equipment_new.width AS width,
       equipment_new.height AS height,
       equipment_new.depth AS depth,
       equipment_new.weight AS weight,
       equipment_new.provider AS provider
FROM line_items_new 
INNER JOIN equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE line_items_new.system_id IN (
    SELECT id 
    FROM systems_new 
    WHERE proposal_id = {{ project.value.finalized_proposal_id }}
    AND system_type = 'water heater'
)
AND line_items_new.line_item_type = 'equipment';


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
AND systems_new.system_type = 'water heater';


--offerInfo
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
    AND labor_new.category = 'plumbing';
