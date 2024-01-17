-- DROP TABLE IF EXISTS soc_code_associations;
-- DROP TABLE IF EXISTS lines;
-- DROP TABLE IF EXISTS orders;
-- DROP TABLE IF EXISTS credit_cards;
-- DROP TABLE IF EXISTS statuses;
-- DROP TABLE IF EXISTS drivers_licenses;
-- DROP TABLE IF EXISTS addresses;

CREATE TABLE addresses (
    address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    province_or_territory VARCHAR(20) NOT NULL,
    postal_code VARCHAR(6) CHECK (postal_code ~ '^[A-Z]\d[A-Z]\d[A-Z]\d$')
);

SELECT * FROM addresses;

CREATE TABLE drivers_licenses (
    dl_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dl_number VARCHAR(15) NOT NULL ,
    dl_address_id UUID NOT NULL,
    dl_expiry DATE NOT NULL,
    dl_dob DATE NOT NULL,
    FOREIGN KEY (dl_address_id) REFERENCES addresses(address_id)
);

SELECT * FROM drivers_licenses;

CREATE TABLE statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(30),
    status_description VARCHAR(255)
);

SELECT * FROM statuses;

CREATE TABLE credit_cards (
    credit_card_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_card_number VARCHAR(16) CHECK (credit_card_number ~ '^[0-9]{16}$'),
    credit_card_expiry DATE,
    credit_card_name VARCHAR(255)
);

SELECT * FROM credit_cards;

CREATE TABLE orders (
    order_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    order_number_report VARCHAR(10),
    activation_date DATE,
    tracking_number VARCHAR(12),
    status_code INTEGER REFERENCES statuses(status_id),
    status_date DATE,
    internal_notes TEXT,
    rd_notes TEXT,
    notes_for_dealer TEXT,
    notes_from_dealer TEXT,
    dealer_code VARCHAR(10),
    g_order_number VARCHAR(7),
    account_number VARCHAR(9),
    msd_code VARCHAR(255),
    customer_full_legal_name VARCHAR(255),
    customer_date_of_birth DATE,
    hst_number VARCHAR(15),
    contact_phone_number VARCHAR(10),
    customer_email VARCHAR(255) CHECK (customer_email ~ '^[^@]+@[^@]+\.[^@]+$'),
    internet_account_number VARCHAR(20),
    internet_service_address_id UUID REFERENCES addresses(address_id),
    shipping_address_id UUID REFERENCES addresses(address_id),
    drivers_license_id UUID REFERENCES drivers_licenses(dl_id),
    customer_sin_number VARCHAR(9),
    customer_bank_inst_no VARCHAR(3),
    customer_bank_transit_no VARCHAR(5),
    customer_bank_account_no VARCHAR(12),
    sim_number VARCHAR(24),
    name_of_sim_card_holder VARCHAR(255),
    credit_card_id UUID REFERENCES credit_cards(credit_card_id),
    passport_number VARCHAR(20),
    study_permit_number VARCHAR(15),
    permanent_resident_card VARCHAR(255),
    carrier_id INTEGER REFERENCES carriers(carrier_id),
    CONSTRAINT orders_pkey PRIMARY KEY (order_id),
    CONSTRAINT orders_check CHECK (
        (customer_sin_number ~ '9%' AND credit_card_id IS NOT NULL) OR
        (customer_sin_number !~ '9%' AND credit_card_id IS NULL)
    )
);

CREATE TABLE lines (
    line_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(order_id),
    user_name VARCHAR(255) NOT NULL CHECK (user_name ~ '^[A-Za-z0-9 ]+$'),
    line_phone_number VARCHAR(10),
    is_new_line BOOLEAN NOT NULL,
    current_provider_name VARCHAR(20),
    current_provider_account_number VARCHAR(14),
    is_byod BOOLEAN,
    hardware VARCHAR(255),
    upfront_edge_discount BOOLEAN,
    plan_code VARCHAR(12) NOT NULL,
    CHECK (
        (is_new_line AND current_provider_name IS NULL AND current_provider_account_number IS NULL) OR
        (NOT is_new_line AND current_provider_name IS NOT NULL AND current_provider_account_number IS NOT NULL)
    ),
    CHECK (
        (is_byod AND hardware IS NULL) OR (NOT is_byod AND hardware IS NOT NULL)
    )
);


CREATE TABLE soc_code_associations ( -- This table consists of the extra soc codes that get tagged onto the line info
    association_id SERIAL PRIMARY KEY,
    line_id UUID,  -- Assuming line_id is a UUID in the 'lines' table
    soc_code_value VARCHAR(12),
    FOREIGN KEY (line_id) REFERENCES lines(line_id)
);

INSERT INTO statuses (status_id, status_name, status_description) VALUES
(1, 'NEW_ORDER', 'New order'),
(2, 'IN_SUBMISSION', 'Order is being processed'),
(3, 'SUBMITTED', 'Order entered in Rogers Direct'),
(4, 'PENDING', 'Order pending in Rogers Direct'),
(5, 'OTHER_PENDING', 'Order pending for information from dealer'),
(6, 'VALIDATION_REQUIRED', 'Customer needs to call rogers and validate themselves before order can move any further'),
(7, 'PENDING_CREDIT_APPROVAL', 'Pending on rogers credit approval'),
(8, 'COMPLETE', 'Order completed'),
(9, 'SHIPPED', 'Order shipped'),
(10, 'DELIVERED', 'Shipment delivered'),
(11, 'RETURN_TO_SENDER', 'Order could not be delivered and was not picked up, and hence returned to sender'),
(12, 'RETURN_PROCESSED', 'Rogers has processed the return (cancelled the line and credited the account)'),
(13, 'SIM_SWAPPED', 'SIM swapped on request of customer');

CREATE TABLE carriers (
    carrier_id SERIAL PRIMARY KEY,
    carrier_name VARCHAR(20)
);

INSERT INTO carriers (carrier_id, carrier_name) VALUES
(1,'Rogers'),
(2,'Bell'),
(3,'Telus'),
(4,'Ring Central'),
(5,'Zayo'),
(6,'Dialpad'),
(7,'Comcast'),
(8,'Starlink'),
(9,'Terago');

SELECT * FROM carriers;

CREATE TABLE products (
    product_id UUID PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
    product_category VARCHAR(30),
    product_name VARCHAR(30)
);

INSERT INTO products (product_category, product_name) VALUES
('Wireline', 'Cable internet'),
('Wireline', 'DSL / Bell Fibe'),
('Wireline', 'Business Fiber'),
('Wireline', 'Dedicated Fiber'),
('Wireline', 'RES'),
('Wireline', 'Wireless Internet'),
('Wireless', 'Mobility'),
('Wireless', 'Watch'),
('Wireless', 'Tablets'),
('Wireless', 'Rocket Hubs'),
('Wireless', 'MiFi device'),
('Data Centre', 'Colocation'),
('Data Centre', 'Cloud'),
('IoT', 'GPS solution'),
('UCaaS / CCaaS', 'Unison'),
('UCaaS / CCaaS', 'Business Phone'),
('UCaaS / CCaaS', 'MVP'),
('UCaaS / CCaaS', 'Call Centre'),
('UCaaS / CCaaS', 'Microsoft');

SELECT * from products;





SELECT * from statuses;

SELECT * FROM lines l
LEFT JOIN orders o on o.order_id = l.order_id
LEFT JOIN statuses s on o.status_code = s.status_id
LEFT JOIN drivers_licenses dls on o.drivers_license_id = dls.dl_id
LEFT JOIN addresses shipping_addrs ON o.shipping_address_id = shipping_addrs.address_id
LEFT JOIN addresses dl_addrs ON o.drivers_license_id = dl_addrs.address_id;