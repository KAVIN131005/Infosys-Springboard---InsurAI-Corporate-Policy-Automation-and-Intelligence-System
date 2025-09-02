-- Insert default roles only if they don't exist
INSERT INTO role (name) 
SELECT 'USER' 
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'USER');

INSERT INTO role (name) 
SELECT 'BROKER' 
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'BROKER');

INSERT INTO role (name) 
SELECT 'ADMIN' 
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'ADMIN');
