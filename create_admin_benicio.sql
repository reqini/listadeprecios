-- Usuario Admin Benicio con plan full
INSERT INTO users (username, email, password, plan, status, created_at)
VALUES ('benicio', 'benicio@admin.com', 'admin123', 'full', 'active', NOW());
