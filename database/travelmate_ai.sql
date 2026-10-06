-- ============================================================
-- TravelMate AI - Complete Database Schema
-- Database: travelmate_ai
-- ============================================================

CREATE DATABASE IF NOT EXISTS travelmate_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travelmate_ai;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  profile_image VARCHAR(500),
  favorite_style VARCHAR(50),
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: destinations
-- ============================================================
CREATE TABLE IF NOT EXISTS destinations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  city VARCHAR(100),
  description TEXT,
  long_description TEXT,
  category VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 4.00,
  average_budget DECIMAL(10,2),
  best_time VARCHAR(200),
  climate VARCHAR(100),
  language VARCHAR(100),
  currency VARCHAR(50),
  timezone VARCHAR(50),
  image VARCHAR(500),
  gallery TEXT,
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  is_featured BOOLEAN DEFAULT FALSE,
  visit_count INT DEFAULT 0,
  travel_tips TEXT,
  local_food TEXT,
  emergency_numbers TEXT,
  safety_tips TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_country (country),
  INDEX idx_category (category),
  INDEX idx_rating (rating),
  INDEX idx_featured (is_featured)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: attractions
-- ============================================================
CREATE TABLE IF NOT EXISTS attractions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  destination_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 4.00,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  opening_hours VARCHAR(200),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  INDEX idx_destination (destination_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: trips
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  destination_id INT,
  trip_name VARCHAR(200) NOT NULL,
  destination_name VARCHAR(150),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  travelers INT DEFAULT 1,
  budget DECIMAL(10,2),
  travel_style ENUM('budget', 'standard', 'luxury') DEFAULT 'standard',
  travel_pace ENUM('relaxed', 'balanced', 'packed') DEFAULT 'balanced',
  interests TEXT,
  starting_location VARCHAR(200),
  status ENUM('planning', 'upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'planning',
  cover_image VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: itinerary
-- ============================================================
CREATE TABLE IF NOT EXISTS itinerary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  day_number INT NOT NULL,
  activity_name VARCHAR(200) NOT NULL,
  description TEXT,
  activity_type VARCHAR(50),
  activity_date DATE,
  start_time TIME,
  end_time TIME,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  location_name VARCHAR(200),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  sort_order INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX idx_trip (trip_id),
  INDEX idx_day (trip_id, day_number)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: favorites
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  destination_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: expenses
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  category ENUM('transportation', 'hotels', 'food', 'activities', 'shopping', 'miscellaneous') NOT NULL,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip (trip_id),
  INDEX idx_category (category)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: packing_items
-- ============================================================
CREATE TABLE IF NOT EXISTS packing_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  item VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  is_completed BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX idx_trip (trip_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE: budget_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS budget_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trip_id INT NOT NULL,
  transportation DECIMAL(10,2) DEFAULT 0,
  hotels DECIMAL(10,2) DEFAULT 0,
  food DECIMAL(10,2) DEFAULT 0,
  activities DECIMAL(10,2) DEFAULT 0,
  shopping DECIMAL(10,2) DEFAULT 0,
  miscellaneous DECIMAL(10,2) DEFAULT 0,
  total_budget DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  UNIQUE KEY unique_trip_budget (trip_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED: Categories
-- ============================================================
INSERT INTO categories (name, description, icon, color) VALUES
('Adventure', 'Thrilling outdoor activities and extreme sports', 'mountain', '#FF6B35'),
('Beach', 'Beautiful coastlines and sandy shores', 'waves', '#0099CC'),
('Mountains', 'Scenic highlands and mountain retreats', 'mountain-snow', '#6B8F71'),
('Nature', 'Forests, wildlife and natural landscapes', 'trees', '#52B788'),
('Historical', 'Ancient monuments and cultural heritage', 'landmark', '#B5838D'),
('Romantic', 'Perfect destinations for couples', 'heart', '#E07A5F'),
('Family', 'Fun and safe destinations for families', 'users', '#F2CC8F'),
('Wildlife', 'Safari and wildlife watching experiences', 'paw-print', '#81B29A'),
('City', 'Urban exploration and modern experiences', 'building', '#3D405B'),
('Luxury', 'Premium and exclusive travel experiences', 'star', '#FFD700');

-- ============================================================
-- SEED: Destinations (India)
-- ============================================================
INSERT INTO destinations (name, country, state, description, long_description, category, rating, average_budget, best_time, climate, language, currency, image, latitude, longitude, is_featured, travel_tips, local_food, emergency_numbers, safety_tips) VALUES
('Ooty', 'India', 'Tamil Nadu', 'The Queen of Hill Stations nestled in the Nilgiri Mountains, offering stunning tea gardens, colonial architecture, and cool mountain air.', 'Ooty, officially known as Udhagamandalam, is a picturesque hill station in the Nilgiri district of Tamil Nadu. Surrounded by rolling hills, aromatic tea plantations, eucalyptus forests, and misty valleys, Ooty has long been celebrated as the Queen of Hill Stations. The town was developed by the British during the colonial era and retains much of its old-world charm. The Nilgiri Mountain Railway, a UNESCO World Heritage Site, offers a breathtaking toy train ride through the scenic landscapes.', 'Mountains', 4.5, 15000, 'October to June (best March-June)', 'Cool and pleasant, 10°C - 25°C', 'Tamil, English', 'INR', 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800', 11.4102, 76.6950, TRUE, 'Carry warm clothes even in summer. Book Nilgiri Mountain Railway tickets in advance. Best visited weekdays to avoid weekend crowds.', 'Varkey, Ooty Chocolate, Homemade Jam, Eucalyptus oil products, Fresh vegetables', 'Police: 100, Ambulance: 108, Fire: 101', 'Keep valuables secure in crowded markets. Use authorized taxis. Avoid trekking alone in forests.'),

('Kodaikanal', 'India', 'Tamil Nadu', 'The Princess of Hill Stations with its star-shaped lake, sprawling valleys, and waterfalls set amidst shola forests and grasslands.', 'Kodaikanal, known as "The Princess of Hill Stations," is a charming hill resort in the Dindigul district of Tamil Nadu. Perched at an altitude of 2,133 meters on the Palani Hills, Kodaikanal is famous for its star-shaped manmade lake, breathtaking Pillar Rocks, Silver Cascade Falls, and the lush Pine Forest. The town offers a unique blend of natural beauty and adventure activities.', 'Mountains', 4.4, 12000, 'October to June', 'Cool and misty, 8°C - 20°C', 'Tamil, English', 'INR', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 10.2381, 77.4892, TRUE, 'Rent a cycle to explore the lake. Try the local cheese and chocolates. Visit during weekdays for a peaceful experience.', 'Kodai Cheese, Homemade Chocolates, Local Plums, Fresh Vegetables', 'Police: 100, Ambulance: 108', 'Slippery roads during monsoon. Carry rain gear. Stay on marked paths.'),

('Munnar', 'India', 'Kerala', 'A magical highland destination in Kerala famous for its endless tea plantations, misty mountains, and rich biodiversity including Eravikulam National Park.', 'Munnar is a picturesque hill station located in the Idukki district of Kerala. Situated at an elevation of 1,600 meters above sea level, Munnar is renowned for its vast stretches of tea gardens, misty mountains, and valleys filled with the fragrance of tea and cardamom. The region is home to Eravikulam National Park, which shelters the endangered Nilgiri Tahr.', 'Nature', 4.6, 14000, 'September to March', 'Cool and pleasant, 5°C - 25°C', 'Malayalam, Tamil, English', 'INR', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 10.0889, 77.0595, TRUE, 'Visit tea factories for a guided tour. Book homestays for authentic local experience. Carry layered clothing.', 'Appam, Kerala Stew, Puttu, Kadala Curry, Fresh Tea', 'Police: 100, Ambulance: 108', 'Leeches common in monsoon trekking. Use insect repellent. Book permits for national park in advance.'),

('Goa', 'India', 'Goa', 'India''s party capital with pristine beaches, vibrant nightlife, Portuguese colonial heritage, and fresh seafood cuisine.', 'Goa, on India''s west coast, is a former Portuguese colony known for its beaches, nightlife, and year-round tropical atmosphere. The state is renowned for its unique blend of Indian and Portuguese cultures, evident in its architecture, cuisine, and festivals. From the bustling beaches of North Goa to the serene shores of South Goa, the destination offers something for every traveler.', 'Beach', 4.5, 25000, 'November to March', 'Tropical, warm all year', 'Konkani, English, Hindi', 'INR', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 15.2993, 74.1240, TRUE, 'Rent a scooter to explore. Book beachside shacks for fresh seafood. Bargain in local markets.', 'Fish Curry Rice, Prawn Balchão, Bebinca, Feni, Fresh Seafood', 'Police: 100, Tourist Police: 0832-2459545', 'Use sunscreen on beaches. Avoid isolated beaches at night. Keep documents safe.'),

('Coorg', 'India', 'Karnataka', 'Scotland of India with dense coffee plantations, rolling hills, cascading waterfalls, and the vibrant Kodava culture.', 'Coorg, also known as Kodagu, is a hidden gem nestled in the Western Ghats of Karnataka. Often referred to as the "Scotland of India," this misty hill station is famous for its vast coffee and spice plantations, verdant forests, and the pristine Kaveri River. Coorg has a unique culture, the Kodavas, with their own distinct customs, language, and cuisine.', 'Nature', 4.5, 18000, 'October to April', 'Pleasant, 15°C - 28°C', 'Kodava, Kannada, English', 'INR', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', 12.3375, 75.8069, FALSE, 'Visit coffee estates during harvest season (October-February). Try Coorgi cuisine. Carry rain gear as it rains frequently.', 'Pandi Curry, Kadumbuttu, Coorg Coffee, Bamboo Shoot Curry', 'Police: 100, Ambulance: 108', 'Leeches common during monsoon. Stay on marked trails. Be cautious of wildlife.'),

('Manali', 'India', 'Himachal Pradesh', 'A paradise for adventure seekers with snow-capped peaks, adventure sports, ancient monasteries, and the famous Rohtang Pass.', 'Manali is a high-altitude Himalayan resort town in Himachal Pradesh. It is a popular destination for adventure lovers and nature enthusiasts, offering a wide range of activities including skiing, snowboarding, paragliding, and trekking. The town is situated at the northern end of the Kullu Valley and offers stunning views of the surrounding snow-capped Himalayan peaks.', 'Adventure', 4.6, 20000, 'October to February (snow), March to June (trekking)', 'Alpine, cold winters', 'Hindi, Manali dialect', 'INR', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 32.2432, 77.1892, TRUE, 'Acclimatize before high-altitude activities. Check weather and road conditions. Carry warm clothing year-round.', 'Trout Fish, Sidu, Babru, Mittha, Local Rajma', 'Police: 100, Ambulance: 108, HRTC: 01902-252314', 'Altitude sickness risk. Do not rush to higher altitudes. Carry altitude sickness medication.'),

('Jaipur', 'India', 'Rajasthan', 'The Pink City of India, a royal heritage destination with magnificent forts, palaces, bazaars, and vibrant Rajasthani culture.', 'Jaipur, the capital of Rajasthan and the first planned city of India, is a vibrant and colorful destination. Known as the "Pink City" because of the distinctively-painted buildings in the old city, Jaipur is part of the famous Golden Triangle tourist circuit. The city is home to magnificent forts, palaces, temples, and bustling bazaars that showcase Rajasthani heritage.', 'Historical', 4.7, 22000, 'October to March', 'Semi-arid, hot summers, mild winters', 'Hindi, Rajasthani, English', 'INR', 'https://images.unsplash.com/photo-1477587458883-47145ed68b15?w=800', 26.9124, 75.7873, TRUE, 'Hire an auto-rickshaw or tuk-tuk for local transport. Bargain hard in bazaars. Respect dress codes at temples and palaces.', 'Dal Baati Churma, Laal Maas, Ghevar, Kachori, Lassi', 'Police: 100, Tourist Police: 0141-2744000', 'Watch for aggressive touts near tourist sites. Agree on prices before rides. Keep hydrated in summers.'),

('Udaipur', 'India', 'Rajasthan', 'The City of Lakes, a romantic destination with shimmering lakes, opulent palaces, and the floating Lake Palace Hotel.', 'Udaipur, fondly called the "City of Lakes" or the "Venice of the East," is one of the most romantic destinations in India. The city is built around a series of artificial lakes and is dominated by stunning palaces, temples, and havelis. The Lake Palace, which appears to float on Lake Pichola, is one of the most iconic images of Rajasthan.', 'Romantic', 4.8, 28000, 'September to March', 'Semi-arid, pleasant winters', 'Hindi, Rajasthani', 'INR', 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800', 24.5854, 73.7125, TRUE, 'Take a boat ride on Lake Pichola at sunset. Visit Sajjangarh (Monsoon Palace) for panoramic views. Book heritage hotels for a royal experience.', 'Dal Baati Churma, Mawa Kachori, Haldi ki Sabzi, Malpua', 'Police: 100, Tourist Helpline: 0294-2411535', 'Be cautious of overpriced shops near tourist sites. Use official guides. Keep valuables safe.'),

('Kerala Backwaters', 'India', 'Kerala', 'God''s Own Country with tranquil backwaters, lush paddy fields, coconut groves, and unique houseboat experiences in Alleppey.', 'Kerala, often described as "God''s Own Country," offers one of the most unique travel experiences in the world through its famous backwaters. The backwater network of interconnected canals, rivers, lakes, and inlets covers hundreds of kilometers and is best explored on traditional rice boats (kettuvallam). Alleppey, the Venice of the East, is the hub for backwater tourism.', 'Nature', 4.7, 18000, 'September to March', 'Tropical, warm and humid', 'Malayalam', 'INR', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 9.4981, 76.3388, TRUE, 'Book houseboat stays in advance. Hire a local guide for authentic experiences. Try Ayurvedic treatments.', 'Karimeen Pollichathu, Appam, Puttu, Kerala Prawn Curry, Banana Chips', 'Police: 100, Tourism: 0477-2253308', 'Life jackets provided on boats - use them. Be cautious of monsoon flooding. Respect local customs.'),

('Pondicherry', 'India', 'Puducherry', 'A serene French Riviera of the East with charming colonial streets, Sri Aurobindo Ashram, pristine beaches, and fusion cuisine.', 'Pondicherry, now officially known as Puducherry, is a former French colony on India''s southeastern coast. The city is divided into two distinct areas: the French Quarter (Ville Blanche) with its charming colonial architecture, tree-lined boulevards, and trendy cafes, and the Indian Quarter (Ville Noire). The city is known for the Sri Aurobindo Ashram and Auroville, an experimental township dedicated to human unity.', 'City', 4.4, 15000, 'October to March', 'Tropical, warm', 'Tamil, French, English', 'INR', 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=800', 11.9416, 79.8083, FALSE, 'Rent a bicycle to explore the French Quarter. Visit the Ashram for a peaceful experience. Try French-Tamil fusion cuisine.', 'Baguette, Crepes, Bouillabaisse, Prawn Rougaille, Bonda', 'Police: 100, Coastal Security: 0413-2220100', 'Strong sea currents at beaches. Avoid swimming in restricted areas. Respect Ashram rules.'),

-- ============================================================
-- International Destinations
-- ============================================================
('Bali', 'Indonesia', 'Bali Province', 'The Island of Gods with stunning temples, terraced rice paddies, vibrant arts scene, surf beaches, and rich Hindu-Balinese culture.', 'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple and Pura Tanah Lot. The active volcano Mount Batur is a popular sunrise trekking destination. Bali''s cultural landscape is woven with artistic traditions—from dance and music to handicrafts and cuisine.', 'Beach', 4.8, 80000, 'April to October', 'Tropical, warm all year', 'Balinese, Indonesian', 'IDR (INR 5 = 900 IDR approx.)', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', -8.3405, 115.0920, TRUE, 'Dress respectfully at temples. Bargain at markets. Hire a local guide for authentic experiences. Try local warung restaurants.', 'Nasi Goreng, Babi Guling, Sate Lilit, Lawar, Pisang Goreng', 'Police: 110, Tourist Police: 0361-224111, Emergency: 112', 'Respect temple dress codes. Avoid drinking tap water. Use registered tour operators.'),

('Dubai', 'United Arab Emirates', 'Dubai Emirate', 'A futuristic desert city with the world''s tallest buildings, luxury malls, desert safaris, and stunning waterfront architecture.', 'Dubai is a city and emirate in the United Arab Emirates known for luxury shopping, ultramodern architecture, and a lively nightlife scene. Burj Khalifa, the tallest building in the world, dominates the skyline. The city is a major hub for business and tourism, blending traditional Arabic culture with ultra-modern development. Dubai offers experiences ranging from desert safaris to indoor skiing.', 'Luxury', 4.7, 150000, 'November to April', 'Hot desert, cooler November-March', 'Arabic, English', 'AED', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 25.2048, 55.2708, TRUE, 'Book attractions online for discounts. Respect local culture and dress codes. Use Dubai Metro for efficient travel.', 'Shawarma, Al Harees, Machboos, Luqaimat, Camel Milk', 'Police: 999, Ambulance: 998, Tourism: 800-4848', 'Respect local laws and culture. Dress modestly in public spaces. Carry sunscreen—extreme UV exposure.'),

('Singapore', 'Singapore', NULL, 'A modern city-state with futuristic gardens, hawker food culture, Marina Bay Sands, and a perfect blend of cultures.', 'Singapore is a city-state in Southeast Asia known for its multicultural heritage, modern architecture, and pristine urban environment. The city is a global hub for finance, trade, and travel. Key attractions include the futuristic Gardens by the Bay, the iconic Marina Bay Sands, Sentosa Island, and the bustling Chinatown and Little India districts.', 'City', 4.7, 120000, 'February to April (dry season)', 'Tropical, hot and humid', 'English, Malay, Mandarin, Tamil', 'SGD', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', 1.3521, 103.8198, TRUE, 'Use EZ-Link card for public transport. Try hawker centers for affordable food. Book Gardens by the Bay in advance.', 'Hainanese Chicken Rice, Chili Crab, Laksa, Char Kway Teow, Kaya Toast', 'Police: 999, Ambulance: 995, STB: 1800-736-2000', 'Very safe city. Fines for jaywalking and littering. Follow all traffic rules strictly.'),

('Tokyo', 'Japan', 'Tokyo Prefecture', 'Japan''s capital, a thrilling metropolis where ancient temples coexist with neon-lit skyscrapers, world-class food, and cutting-edge technology.', 'Tokyo, Japan''s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. The opulent Meiji Shinto Shrine is known for its towering gate and surrounding woods. The Imperial Palace sits amid large public gardens. The city''s many museums offer exhibits ranging from classical art (in the Tokyo National Museum) to a reconstructed kabuki theater (in the Edo-Tokyo Museum).', 'City', 4.8, 180000, 'March-April (Cherry Blossom), October-November', 'Temperate, four seasons', 'Japanese', 'JPY', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 35.6762, 139.6503, TRUE, 'Get a Suica card for metro travel. Learn basic Japanese phrases. Book popular restaurants in advance.', 'Sushi, Ramen, Tempura, Wagyu Beef, Matcha Desserts', 'Police: 110, Fire/Ambulance: 119, Tourist: 03-3201-3331', 'Japan is very safe. Carry cash as many places don''t accept cards. Follow social etiquette—be quiet on trains.'),

('Paris', 'France', 'Île-de-France', 'The City of Light, romance capital of the world with the Eiffel Tower, Louvre, charming cafes, haute cuisine, and fashion.', 'Paris, France''s capital, is a major European city and a global center for art, fashion, gastronomy, and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. Beyond such landmarks as the Eiffel Tower and the 12th-century, Gothic Notre-Dame cathedral, the city is known for its cafe culture and designer boutiques along the Rue du Faubourg Saint-Honoré.', 'Romantic', 4.8, 200000, 'April to October', 'Temperate oceanic, mild', 'French', 'EUR', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 48.8566, 2.3522, TRUE, 'Book Eiffel Tower tickets online. Get the Paris Museum Pass for multiple museums. Use Metro for transportation.', 'Croissants, Baguette, Crêpes, Escargot, Coq au Vin, Macarons', 'Police: 17, Ambulance: 15, Fire: 18, Emergency: 112', 'Beware of pickpockets in tourist areas. Keep documents safe. Watch out for scammers near Eiffel Tower.'),

('London', 'United Kingdom', 'England', 'The vibrant capital of England with iconic landmarks like Big Ben, Buckingham Palace, world-class museums, and a multicultural food scene.', 'London, the capital of England and the United Kingdom, is a 21st-century city with history stretching back to Roman times. At its centre stand the imposing Houses of Parliament, the iconic Big Ben clock tower, and Westminster Abbey. The Tower of London dates to 1066. The British Museum tells the story of human civilization. Modern London is a global financial centre and a melting pot of cultures.', 'City', 4.7, 220000, 'June to September', 'Temperate oceanic, mild and rainy', 'English', 'GBP', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 51.5074, -0.1278, FALSE, 'Get an Oyster card for public transport. Many museums are free. Book popular attractions online.', 'Fish and Chips, Full English Breakfast, Chicken Tikka Masala, Afternoon Tea, Pie and Mash', 'Police: 999, Ambulance: 999, Non-emergency: 101', 'Generally safe city. Beware of pickpockets in tourist areas and on the Underground.'),

('Maldives', 'Maldives', NULL, 'A tropical paradise with overwater bungalows, crystal-clear lagoons, colorful coral reefs, and unparalleled luxury in the Indian Ocean.', 'The Maldives is a tropical nation in the Indian Ocean comprising over a thousand coral islands grouped in a double chain of 26 atolls. It is known for its beaches, blue lagoons, and extensive reefs. The Maldives is one of the world''s top scuba diving and snorkeling destinations. The archipelago is also known for its overwater villas and luxury resorts that dot the atolls.', 'Luxury', 4.9, 300000, 'November to April', 'Tropical, warm all year', 'Dhivehi, English', 'MVR', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 3.2028, 73.2207, TRUE, 'Book resorts well in advance. Seaplane transfers are an experience in themselves. All-inclusive packages offer better value.', 'Garudhiya, Mas Huni, Roshi, Freshly Caught Tuna, Tropical Fruits', 'Police: 119, Ambulance: 102, Coast Guard: 191', 'Strong currents in open water. Always dive/snorkel with guides. Respect local Islamic customs on inhabited islands.'),

('Switzerland', 'Switzerland', NULL, 'A breathtaking alpine wonderland with snow-capped peaks, pristine lakes, charming villages, luxury watches, and fine chocolate.', 'Switzerland is a mountainous Central European country, home to numerous lakes, villages, and the high Alps. Its cities contain medieval quarters, with landmarks like capital Bern''s Zytglogge clock tower and Lucerne''s wooden chapel bridge. The country is also known for its ski resorts and hiking trails. Banking and finance are key industries, and Swiss watches and chocolate are world-renowned.', 'Mountains', 4.9, 350000, 'June to September (summer), December to March (skiing)', 'Alpine, varies by region', 'German, French, Italian, Romansh', 'CHF', 'https://images.unsplash.com/photo-1482192505345-5852718df90b?w=800', 46.8182, 8.2275, TRUE, 'Get Swiss Travel Pass for unlimited transport. Book ski resorts well in advance. Carry layers for mountain weather.', 'Cheese Fondue, Raclette, Rösti, Swiss Chocolate, Zürcher Geschnetzeltes', 'Police: 117, Ambulance: 144, Fire: 118, Emergency: 112', 'Mountain safety is crucial. Check weather before hiking. Respect wildlife and nature reserves.');

-- ============================================================
-- SEED: Attractions for Ooty
-- ============================================================
INSERT INTO attractions (destination_id, name, description, category, rating, entry_fee, opening_hours, latitude, longitude, image) VALUES
(1, 'Botanical Garden', 'A 22-hectare garden established in 1848, home to over 650 varieties of plants, trees, and flowers including a fossilized tree trunk.', 'Nature', 4.6, 30, '7:00 AM - 6:30 PM', 11.4142, 76.7078, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
(1, 'Ooty Lake', 'A beautiful lake created in 1824 by John Sullivan, offering boating facilities and picturesque surroundings with eucalyptus trees.', 'Nature', 4.3, 20, '9:00 AM - 6:00 PM', 11.4064, 76.7030, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'),
(1, 'Nilgiri Mountain Railway', 'UNESCO World Heritage Site toy train that runs from Mettupalayam to Ooty through stunning mountain scenery.', 'Transport', 4.8, 50, '7:00 AM - 5:00 PM', 11.4102, 76.6950, 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400'),
(1, 'Tea Factory', 'Visit the Dodabetta Tea Factory to see how tea is processed from leaf to cup with guided tours available.', 'Cultural', 4.4, 40, '9:00 AM - 4:00 PM', 11.3985, 76.7343, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'),
(1, 'Doddabetta Peak', 'The highest peak in the Nilgiri Mountains at 2,637m offering panoramic views, telescope viewing facility available.', 'Adventure', 4.5, 10, '7:00 AM - 6:00 PM', 11.3985, 76.7343, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400');

-- ============================================================
-- SEED: Attractions for Goa
-- ============================================================
INSERT INTO attractions (destination_id, name, description, category, rating, entry_fee, opening_hours, latitude, longitude, image) VALUES
(4, 'Baga Beach', 'One of Goa''s most popular beaches, famous for water sports, beach shacks, and vibrant nightlife.', 'Beach', 4.4, 0, 'Open 24 hours', 15.5540, 73.7517, 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400'),
(4, 'Basilica of Bom Jesus', 'UNESCO World Heritage Site, a 16th-century baroque church that houses the mortal remains of St. Francis Xavier.', 'Historical', 4.7, 0, '9:00 AM - 6:30 PM', 15.5009, 73.9118, 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=400'),
(4, 'Dudhsagar Falls', 'One of India''s largest waterfalls at 310m height, located on the Goa-Karnataka border in Mollem National Park.', 'Nature', 4.8, 200, '8:00 AM - 5:00 PM', 15.3144, 74.3148, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'),
(4, 'Fort Aguada', 'A 17th-century Portuguese fort with a lighthouse offering stunning views of the Arabian Sea.', 'Historical', 4.5, 25, '10:00 AM - 5:30 PM', 15.5004, 73.7739, 'https://images.unsplash.com/photo-1477587458883-47145ed68b15?w=400');

-- ============================================================
-- SEED: Demo Users
-- ============================================================
-- Password for demo@travelmate.com: Demo@123
-- Password for admin@travelmate.com: Admin@123
-- (Passwords will be set by seeder.js with bcrypt hashing)
INSERT INTO users (name, email, phone, password, role) VALUES
('Demo User', 'demo@travelmate.com', '+91-9876543210', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
('Admin User', 'admin@travelmate.com', '+91-9876543211', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ============================================================
-- SEED: Sample Trip for Demo User
-- ============================================================
INSERT INTO trips (user_id, destination_id, trip_name, destination_name, start_date, end_date, travelers, budget, travel_style, travel_pace, status, cover_image) VALUES
(1, 1, 'Ooty Escape', 'Ooty', '2024-12-12', '2024-12-15', 4, 20000, 'standard', 'balanced', 'upcoming', 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=800'),
(1, 4, 'Goa Winter Getaway', 'Goa', '2025-01-10', '2025-01-15', 2, 40000, 'luxury', 'relaxed', 'planning', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800');

-- ============================================================
-- SEED: Sample Itinerary for Ooty Trip
-- ============================================================
INSERT INTO itinerary (trip_id, day_number, activity_name, description, activity_type, activity_date, start_time, end_time, estimated_cost, location_name, latitude, longitude) VALUES
(1, 1, 'Check-in & Breakfast', 'Check into hotel and enjoy a fresh South Indian breakfast', 'food', '2024-12-12', '08:00:00', '09:30:00', 500, 'Hotel Restaurant, Ooty', 11.4102, 76.6950),
(1, 1, 'Botanical Garden', 'Explore the stunning 22-hectare botanical garden with 650+ plant varieties', 'attraction', '2024-12-12', '10:00:00', '12:30:00', 120, 'Government Botanical Garden, Ooty', 11.4142, 76.7078),
(1, 1, 'Lunch', 'Authentic Tamil Nadu meals at a local restaurant', 'food', '2024-12-12', '13:00:00', '14:00:00', 400, 'Local Restaurant, Ooty', 11.4102, 76.6950),
(1, 1, 'Ooty Lake & Boating', 'Enjoy boating on the scenic Ooty Lake with mountain backdrop', 'attraction', '2024-12-12', '14:30:00', '17:00:00', 200, 'Ooty Lake', 11.4064, 76.7030),
(1, 1, 'Tea Factory Visit', 'Tour the tea factory and learn about tea processing', 'attraction', '2024-12-12', '17:30:00', '18:30:00', 160, 'Dodabetta Tea Factory', 11.3985, 76.7343),
(1, 1, 'Dinner', 'Traditional Varkey dinner with local specialties', 'food', '2024-12-12', '19:30:00', '21:00:00', 600, 'Shinkow''s Restaurant, Ooty', 11.4102, 76.6950),
(1, 2, 'Breakfast', 'Hotel breakfast with fresh fruits and juices', 'food', '2024-12-13', '08:00:00', '09:00:00', 400, 'Hotel, Ooty', 11.4102, 76.6950),
(1, 2, 'Doddabetta Peak', 'Trek to the highest peak in Nilgiris for panoramic views', 'adventure', '2024-12-13', '09:30:00', '12:00:00', 40, 'Doddabetta Peak, Ooty', 11.3985, 76.7343),
(1, 2, 'Nilgiri Mountain Railway', 'Iconic toy train ride through scenic mountain routes', 'transport', '2024-12-13', '13:00:00', '16:00:00', 200, 'Ooty Railway Station', 11.4102, 76.6950),
(1, 2, 'Local Market Shopping', 'Shop for local chocolates, spices, and handicrafts', 'shopping', '2024-12-13', '16:30:00', '18:30:00', 1500, 'Ooty Market', 11.4102, 76.6950),
(1, 3, 'Breakfast & Check-out', 'Farewell breakfast and check-out from hotel', 'food', '2024-12-14', '08:00:00', '09:30:00', 400, 'Hotel, Ooty', 11.4102, 76.6950),
(1, 3, 'Kodaikanal Day Trip', 'Quick excursion to nearby Kodaikanal for stunning views', 'attraction', '2024-12-14', '10:00:00', '15:00:00', 800, 'Kodaikanal Viewpoints', 10.2381, 77.4892),
(1, 3, 'Departure', 'Drive back to starting destination', 'transport', '2024-12-14', '15:30:00', '20:00:00', 1500, 'Ooty to Destination', 11.4102, 76.6950);

-- ============================================================
-- SEED: Sample Budget Plan
-- ============================================================
INSERT INTO budget_plans (trip_id, transportation, hotels, food, activities, shopping, miscellaneous, total_budget) VALUES
(1, 5000, 7000, 3000, 2000, 1500, 500, 19000),
(2, 8000, 15000, 6000, 5000, 3000, 2000, 39000);

-- ============================================================
-- SEED: Sample Favorites
-- ============================================================
INSERT INTO favorites (user_id, destination_id) VALUES
(1, 13), (1, 15), (1, 3);

-- ============================================================
-- SEED: Sample Expenses
-- ============================================================
INSERT INTO expenses (trip_id, user_id, category, description, amount, expense_date) VALUES
(1, 1, 'hotels', 'Hotel accommodation - 2 nights', 3500, '2024-12-12'),
(1, 1, 'food', 'Day 1 meals and snacks', 1200, '2024-12-12'),
(1, 1, 'activities', 'Botanical Garden + Lake entry fees', 320, '2024-12-12'),
(1, 1, 'transportation', 'Taxi from Coimbatore to Ooty', 2000, '2024-12-12');

-- ============================================================
-- SEED: Sample Packing Items
-- ============================================================
INSERT INTO packing_items (trip_id, item, category, is_completed) VALUES
(1, 'Warm jacket', 'Clothing', FALSE),
(1, 'Thermal innerwear', 'Clothing', FALSE),
(1, 'Comfortable walking shoes', 'Clothing', TRUE),
(1, 'Passport/ID proof', 'Documents', TRUE),
(1, 'Hotel booking confirmation', 'Documents', TRUE),
(1, 'Camera', 'Electronics', FALSE),
(1, 'Phone charger', 'Electronics', TRUE),
(1, 'Power bank', 'Electronics', FALSE),
(1, 'Sunscreen SPF 50', 'Toiletries', FALSE),
(1, 'Basic medicines', 'Health', FALSE),
(1, 'Umbrella/Rain jacket', 'Clothing', FALSE),
(1, 'Snacks for journey', 'Food', FALSE);
