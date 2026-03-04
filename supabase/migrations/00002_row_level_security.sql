-- Crunchy App Row Level Security Policies
-- Migration: 00002_row_level_security.sql
-- Description: RLS policies for all tables

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_made_it ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USERS
-- =============================================================================
-- Users can read their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can read other users' basic info (for community features)
CREATE POLICY users_select_public ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY users_insert_own ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- PRODUCTS (public read, admin write)
-- =============================================================================
CREATE POLICY products_select_all ON products
  FOR SELECT USING (true);

-- =============================================================================
-- INGREDIENTS (public read)
-- =============================================================================
CREATE POLICY ingredients_select_all ON ingredients
  FOR SELECT USING (true);

-- =============================================================================
-- ALTERNATIVES (public read)
-- =============================================================================
CREATE POLICY alternatives_select_all ON alternatives
  FOR SELECT USING (true);

-- =============================================================================
-- SCANS
-- =============================================================================
-- Users can view their own scans
CREATE POLICY scans_select_own ON scans
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY scans_insert_own ON scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scans
CREATE POLICY scans_delete_own ON scans
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- RECIPES (public read)
-- =============================================================================
CREATE POLICY recipes_select_all ON recipes
  FOR SELECT USING (true);

-- =============================================================================
-- RECIPE INGREDIENTS (public read)
-- =============================================================================
CREATE POLICY recipe_ingredients_select_all ON recipe_ingredients
  FOR SELECT USING (true);

-- =============================================================================
-- RECIPE STEPS (public read)
-- =============================================================================
CREATE POLICY recipe_steps_select_all ON recipe_steps
  FOR SELECT USING (true);

-- =============================================================================
-- POSTS
-- =============================================================================
-- Anyone can read posts
CREATE POLICY posts_select_all ON posts
  FOR SELECT USING (true);

-- Users can insert their own posts
CREATE POLICY posts_insert_own ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY posts_update_own ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY posts_delete_own ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- COMMENTS
-- =============================================================================
-- Anyone can read comments
CREATE POLICY comments_select_all ON comments
  FOR SELECT USING (true);

-- Users can insert their own comments
CREATE POLICY comments_insert_own ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY comments_update_own ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY comments_delete_own ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- POST LIKES
-- =============================================================================
-- Anyone can see likes
CREATE POLICY post_likes_select_all ON post_likes
  FOR SELECT USING (true);

-- Users can insert their own likes
CREATE POLICY post_likes_insert_own ON post_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY post_likes_delete_own ON post_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- COMMENT LIKES
-- =============================================================================
CREATE POLICY comment_likes_select_all ON comment_likes
  FOR SELECT USING (true);

CREATE POLICY comment_likes_insert_own ON comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY comment_likes_delete_own ON comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- FOLLOWS
-- =============================================================================
-- Anyone can see follow relationships
CREATE POLICY follows_select_all ON follows
  FOR SELECT USING (true);

-- Users can follow others
CREATE POLICY follows_insert_own ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY follows_delete_own ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- =============================================================================
-- SAVED ITEMS
-- =============================================================================
-- Users can view their own saved items
CREATE POLICY saved_items_select_own ON saved_items
  FOR SELECT USING (auth.uid() = user_id);

-- Users can save items
CREATE POLICY saved_items_insert_own ON saved_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can unsave items
CREATE POLICY saved_items_delete_own ON saved_items
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- QUIZ RESULTS
-- =============================================================================
-- Users can view their own quiz results
CREATE POLICY quiz_results_select_own ON quiz_results
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz results (user_id can be null for anonymous)
CREATE POLICY quiz_results_insert_own ON quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- =============================================================================
-- RECIPE MADE IT
-- =============================================================================
-- Anyone can see made-it counts
CREATE POLICY recipe_made_it_select_all ON recipe_made_it
  FOR SELECT USING (true);

-- Users can mark recipes as made
CREATE POLICY recipe_made_it_insert_own ON recipe_made_it
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their made-it
CREATE POLICY recipe_made_it_delete_own ON recipe_made_it
  FOR DELETE USING (auth.uid() = user_id);
