-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  profile_picture_url VARCHAR(500),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Payment Methods Table
CREATE TABLE payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  method_name ENUM('Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet') NOT NULL,
  card_last_four VARCHAR(4),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(7),
  type ENUM('Income', 'Expense', 'Investment') NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category (user_id, name, type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subcategories Table
CREATE TABLE subcategories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_subcategory (category_id, name),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Budgets Table
CREATE TABLE budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  monthly_salary DECIMAL(12, 2),
  monthly_budget DECIMAL(12, 2) NOT NULL,
  savings_target DECIMAL(12, 2),
  month INT,
  year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_budget (user_id, month, year)
);

-- Income Table
CREATE TABLE income (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  income_date DATE NOT NULL,
  source VARCHAR(100),
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency ENUM('Weekly', 'Monthly', 'Quarterly', 'Yearly'),
  recurrence_end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_user_date (user_id, income_date)
);

-- Expenses Table
CREATE TABLE expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  subcategory_id INT,
  payment_method_id INT,
  event_id INT,
  amount DECIMAL(12, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description VARCHAR(255),
  tags JSON,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency ENUM('Weekly', 'Monthly', 'Quarterly', 'Yearly'),
  recurrence_end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, expense_date),
  INDEX idx_category (category_id)
);

-- Events/Trips Table
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  type ENUM('Trip', 'Event', 'Project', 'Wedding', 'Vacation', 'Renovation', 'Education', 'Other') NOT NULL,
  description TEXT,
  budget DECIMAL(12, 2),
  start_date DATE NOT NULL,
  end_date DATE,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, start_date)
);

-- Investments Table
CREATE TABLE investments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  investment_type ENUM('FD', 'RD', 'Mutual Funds', 'SIP', 'Stocks', 'PPF', 'NPS') NOT NULL,
  invested_amount DECIMAL(12, 2) NOT NULL,
  investment_date DATE NOT NULL,
  maturity_date DATE,
  current_value DECIMAL(12, 2),
  interest_rate DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, investment_date)
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  subscription_name VARCHAR(100) NOT NULL,
  category_id INT,
  amount DECIMAL(12, 2) NOT NULL,
  renewal_date DATE NOT NULL,
  frequency ENUM('Weekly', 'Monthly', 'Yearly') NOT NULL DEFAULT 'Monthly',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user_renewal (user_id, renewal_date)
);

-- Lent Money Table
CREATE TABLE lent_money (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  person_name VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  lent_date DATE NOT NULL,
  due_date DATE,
  status ENUM('Pending', 'Partially Paid', 'Completed') DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status)
);

-- Borrowed Money Table
CREATE TABLE borrowed_money (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  person_name VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  borrowed_date DATE NOT NULL,
  due_date DATE,
  status ENUM('Pending', 'Partially Paid', 'Completed') DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status)
);

-- Tags Table
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tag (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recurring Expenses Table
CREATE TABLE recurring_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  original_expense_id INT NOT NULL,
  frequency ENUM('Weekly', 'Monthly', 'Quarterly', 'Yearly') NOT NULL,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (original_expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_lent_money_user_id ON lent_money(user_id);
CREATE INDEX idx_borrowed_money_user_id ON borrowed_money(user_id);