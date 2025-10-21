-- Admin kullanıcısının şifresini güncelle
-- Yeni hash: admin123 şifresi için doğru bcrypt hash

UPDATE users 
SET password = '$2a$12$lxYx8x8euCZYcTggjvAKU.LrXJvj07ogtv3QQ1VUls5drLJuaz8VW',
    updated_at = NOW()
WHERE email = 'admin@tesvik360.com';

-- Test kullanıcısının şifresini de güncelle
UPDATE users 
SET password = '$2a$12$lxYx8x8euCZYcTggjvAKU.LrXJvj07ogtv3QQ1VUls5drLJuaz8VW',
    updated_at = NOW()
WHERE email = 'test@example.com';