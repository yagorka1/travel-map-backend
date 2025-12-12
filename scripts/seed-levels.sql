-- Seed levels table with English data
-- Truncate the table first to avoid duplicates
TRUNCATE TABLE levels CASCADE;

-- Insert 10 levels with English names and descriptions
INSERT INTO levels (name, "minPoints", "levelNumber", description) VALUES
('Beginner', 0, 1, 'Just starting your traveler journey'),
('Tourist', 100, 2, 'First steps in the world of travel'),
('Explorer', 300, 3, 'Discovering new horizons'),
('Wayfarer', 600, 4, 'The road has become your home'),
('Wanderer', 1000, 5, 'You know many secret places'),
('Travel Master', 1500, 6, 'Travel is your passion'),
('Expert', 2500, 7, 'Few have seen as much'),
('Legend', 4000, 8, 'Your stories inspire others'),
('Globetrotter', 6000, 9, 'The whole world is open to you'),
('World Traveler', 10000, 10, 'There are no limits to your travels');
