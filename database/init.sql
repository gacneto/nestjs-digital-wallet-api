-- Create Database
CREATE DATABASE IF NOT EXISTS wallet_homolog;
USE wallet_homolog;

-- Create Restricted User
CREATE USER IF NOT EXISTS 'wallet_api_homolog'@'%' IDENTIFIED BY 'api123';
GRANT SELECT, INSERT, UPDATE, DELETE ON wallet_homolog.* TO 'wallet_api_homolog'@'%';
FLUSH PRIVILEGES;

-- Create Tables

-- 1. CARTEIRA
CREATE TABLE IF NOT EXISTS CARTEIRA (
    endereco VARCHAR(255) PRIMARY KEY,
    hash_chave_privada VARCHAR(255) NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'active'
);

-- 2. MOEDA
CREATE TABLE IF NOT EXISTS MOEDA (
    codigo VARCHAR(10) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL -- 'CRYPTO' or 'FIAT'
);

-- 3. SALDO_CARTEIRA
CREATE TABLE IF NOT EXISTS SALDO_CARTEIRA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carteira_endereco VARCHAR(255) NOT NULL,
    moeda_codigo VARCHAR(10) NOT NULL,
    saldo DECIMAL(20, 8) NOT NULL DEFAULT 0,
    FOREIGN KEY (carteira_endereco) REFERENCES CARTEIRA(endereco),
    FOREIGN KEY (moeda_codigo) REFERENCES MOEDA(codigo),
    UNIQUE KEY unique_wallet_currency (carteira_endereco, moeda_codigo)
);

-- 4. DEPOSITO_SAQUE (Historico)
CREATE TABLE IF NOT EXISTS DEPOSITO_SAQUE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carteira_endereco VARCHAR(255) NOT NULL,
    moeda_codigo VARCHAR(10) NOT NULL,
    tipo VARCHAR(10) NOT NULL, -- 'DEPOSITO' or 'SAQUE'
    valor DECIMAL(20, 8) NOT NULL,
    taxa DECIMAL(20, 8) DEFAULT 0,
    data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carteira_endereco) REFERENCES CARTEIRA(endereco),
    FOREIGN KEY (moeda_codigo) REFERENCES MOEDA(codigo)
);

-- 5. CONVERSAO (Historico)
CREATE TABLE IF NOT EXISTS CONVERSAO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carteira_endereco VARCHAR(255) NOT NULL,
    moeda_origem VARCHAR(10) NOT NULL,
    moeda_destino VARCHAR(10) NOT NULL,
    valor_origem DECIMAL(20, 8) NOT NULL,
    valor_destino DECIMAL(20, 8) NOT NULL,
    taxa DECIMAL(20, 8) NOT NULL,
    data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carteira_endereco) REFERENCES CARTEIRA(endereco),
    FOREIGN KEY (moeda_origem) REFERENCES MOEDA(codigo),
    FOREIGN KEY (moeda_destino) REFERENCES MOEDA(codigo)
);

-- 6. TRANSFERENCIA (Historico)
CREATE TABLE IF NOT EXISTS TRANSFERENCIA (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carteira_origem VARCHAR(255) NOT NULL,
    carteira_destino VARCHAR(255) NOT NULL,
    moeda_codigo VARCHAR(10) NOT NULL,
    valor DECIMAL(20, 8) NOT NULL,
    taxa DECIMAL(20, 8) NOT NULL,
    data_operacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carteira_origem) REFERENCES CARTEIRA(endereco),
    FOREIGN KEY (carteira_destino) REFERENCES CARTEIRA(endereco),
    FOREIGN KEY (moeda_codigo) REFERENCES MOEDA(codigo)
);

-- Seed Data
INSERT IGNORE INTO MOEDA (codigo, nome, tipo) VALUES
('BTC', 'Bitcoin', 'CRYPTO'),
('ETH', 'Ethereum', 'CRYPTO'),
('SOL', 'Solana', 'CRYPTO'),
('USD', 'United States Dollar', 'FIAT'),
('BRL', 'Brazilian Real', 'FIAT');
