-- Script para crear usuario lucho con plan full
-- Ejecutar en la base de datos

INSERT INTO users (
    username, 
    email, 
    password, 
    plan, 
    status, 
    created_at,
    updated_at
) VALUES (
    'lucho',
    'reqini@gmail.com',
    '12345678',
    'full',
    'active',
    NOW(),
    NOW()
);

-- Verificar que el usuario se creó correctamente
SELECT * FROM users WHERE username = 'lucho';
