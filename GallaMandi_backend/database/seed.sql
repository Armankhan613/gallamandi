-- GallaMandi demo seed data
-- NOTE: The uploaded project contains image files but not the original MySQL rows.
-- The prices/descriptions below are DEMO values. Replace them if you recover the old data.
-- Safe to run repeatedly: rows are identified by image_url.

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Wheat',
       'Fresh wheat sourced from farmers and suitable for everyday household use.',
       45.00, 'Grains', 100, '/product_images/wheat.jpg',
       '{"crop_type":"wheat","origin":"Madhya Pradesh","quality_grade":"A"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/wheat.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Rice',
       'Quality rice for everyday cooking.',
       60.00, 'Grains', 100, '/product_images/rice.jpg',
       '{"crop_type":"rice","grain_type":"long grain","origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/rice.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Masoor Dal',
       'Fresh red lentils with a clean, earthy taste.',
       95.00, 'Pulses', 100, '/product_images/masoor.jpg',
       '{"pulse":"masoor","protein_rich":true,"origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/masoor.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Black Masoor',
       'Nutritious black masoor lentils.',
       110.00, 'Pulses', 80, '/product_images/blackMasoor.jpg',
       '{"pulse":"black masoor","protein_rich":true,"origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/blackMasoor.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Chickpeas',
       'Clean, wholesome chickpeas for curries, salads and snacks.',
       90.00, 'Pulses', 100, '/product_images/chickpea.jpg',
       '{"pulse":"chickpea","protein_rich":true,"origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/chickpea.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Soybean',
       'Quality soybeans suitable for household and food processing use.',
       70.00, 'Oilseeds', 100, '/product_images/soyabean.jpg',
       '{"crop_type":"soybean","oilseed":true,"origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/soyabean.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Potatoes',
       'Fresh potatoes suitable for everyday cooking.',
       35.00, 'Vegetables', 150, '/product_images/potatoes.jpg',
       '{"crop_type":"potato","grade":"A","origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/potatoes.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Onions',
       'Fresh farm onions with good shelf life.',
       40.00, 'Vegetables', 150, '/product_images/onions.jpg',
       '{"crop_type":"onion","grade":"A","origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/onions.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Green Beans',
       'Fresh green beans suitable for home cooking.',
       55.00, 'Vegetables', 100, '/product_images/beans.jpg',
       '{"crop_type":"beans","fresh":true,"origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/beans.jpg');

INSERT INTO products (name, description, price, category, stock, image_url, attributes)
SELECT 'Coriander',
       'Fresh coriander with vibrant aroma and flavour.',
       30.00, 'Herbs', 100, '/product_images/coriander.jpg',
       '{"crop_type":"coriander","fresh":true,"origin":"India"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM products WHERE image_url = '/product_images/coriander.jpg');
