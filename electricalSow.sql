-- installer_equip
SELECT 
    COALESCE(equipment_new.equipment_name, labor_new.name) AS item_name,
  labor_new.category AS labor_category,  
  labor_new.subcategory AS labor_subcategory, equipment_new.provider AS equipment_provider,
  line_items_new.id AS id
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
AND labor_new.category != 'hvac'
AND labor_new.subcategory != 'adder'
AND (equipment_new.provider <> 'elephant' OR equipment_new.provider IS NULL);

-- dedicatedCircuits
SELECT 
    line_items_new.id AS line_item_id,
    line_items_new.additional_data AS additional_data,
    coalesce(equipment_new.equipment_name, labor_new.name) AS name,
    equipment_new.model_number AS model_number,
    equipment_new.provider as equipment_provider,
    labor_new.category AS labor_category,
    labor_new.subcategory AS labor_subcategory,
    labor_new.circuit_amps AS circuit_amps,
    labor_new.circuit_voltage AS circuit_voltage,
    line_items_new.additional_data->'electrical_requirements'->>'over_50' AS reqlength,
    CASE 
      WHEN labor_new.circuit_amps <= 15 THEN '14'
      WHEN labor_new.circuit_amps <= 20 THEN '12'
      WHEN labor_new.circuit_amps <= 30 THEN '10'
      WHEN labor_new.circuit_amps <= 40 THEN '8'
      WHEN labor_new.circuit_amps <= 55 THEN '6'
      WHEN labor_new.circuit_amps <= 100 THEN '3'
      WHEN labor_new.circuit_amps <= 150 THEN '1/0'
      WHEN labor_new.circuit_amps <= 200 THEN '3/0'
    END AS wire_gauge
      
FROM 
    line_items_new
INNER JOIN 
    labor_new ON line_items_new.labor_id = labor_new.id
  AND labor_new.category = 'electrical'
INNER JOIN
    systems_new ON line_items_new.system_id = systems_new.id
LEFT JOIN 
    equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE 
    systems_new.proposal_id = {{project.value.finalized_proposal_id}}


-- nondedicatedCircuits
SELECT 
    line_items_new.id AS line_item_id,
    line_items_new.additional_data AS additional_data,
    coalesce(equipment_new.equipment_name, labor_new.name) AS name,
    equipment_new.model_number AS model_number,
    equipment_new.provider as equipment_provider,
    labor_new.category AS labor_category,
    labor_new.subcategory AS labor_subcategory,
    labor_new.circuit_amps AS circuit_amps,
    labor_new.circuit_voltage AS circuit_voltage,
    line_items_new.additional_data->'electrical_requirements'->>'over_50' AS reqlength,
    CASE 
      WHEN labor_new.circuit_amps <= 15 THEN '14'
      WHEN labor_new.circuit_amps <= 20 THEN '12'
      WHEN labor_new.circuit_amps <= 30 THEN '10'
      WHEN labor_new.circuit_amps <= 40 THEN '8'
      WHEN labor_new.circuit_amps <= 55 THEN '6'
      WHEN labor_new.circuit_amps <= 100 THEN '3'
      WHEN labor_new.circuit_amps <= 150 THEN '1/0'
      WHEN labor_new.circuit_amps <= 200 THEN '3/0'
    END AS wire_gauge
      
FROM 
    line_items_new
INNER JOIN 
    labor_new ON line_items_new.labor_id = labor_new.id
  AND labor_new.category != 'electrical'
INNER JOIN
    systems_new ON line_items_new.system_id = systems_new.id
LEFT JOIN 
    equipment_new ON line_items_new.equipment_id = equipment_new.id
WHERE 
    systems_new.proposal_id = {{project.value.finalized_proposal_id}}


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
AND equipment_new.provider != 'hvac';


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
AND line_items_new.line_item_type = 'equipment';


-- waterHeater
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
        AND system_type = 'water heater'
    ) AS subquery
)
AND line_items_new.line_item_type = 'equipment';


-- evCharging
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
        AND system_type = 'ev'
    ) AS subquery
)
AND line_items_new.line_item_type = 'equipment';


-- inductionWiring
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
        AND system_type = 'cooktop'
    ) AS subquery
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
AND systems_new.system_type = 'hvac';


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
    AND labor_new.category = 'electrical';
