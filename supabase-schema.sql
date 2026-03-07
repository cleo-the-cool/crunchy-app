-- Crunchy App - Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  bio text,
  crunchy_score integer default 0,
  crunchy_tier text default 'seedling',
  interests text[] default '{}',
  total_scans integer default 0,
  quiz_answers jsonb,
  quiz_completed_at timestamptz,
  onboarding_completed boolean default false,
  is_premium boolean default false,
  premium_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products (our growing ingredient database)
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  brand text,
  category text not null check (category in ('food', 'cosmetics', 'cleaning', 'baby', 'clothing', 'supplement', 'other')),
  image_url text,
  ingredients text[] default '{}',
  overall_score integer,
  gemini_analysis jsonb,
  scan_count integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ingredients master safety database
create table public.ingredients (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  aliases text[] default '{}',
  safety_score integer check (safety_score between 1 and 10),
  category text,
  concerns text[] default '{}',
  description text,
  sources text[] default '{}',
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- User scan history
create table public.scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  product_id uuid references public.products on delete set null,
  scan_type text not null check (scan_type in ('item', 'ingredients', 'label')),
  photo_url text,
  gemini_response jsonb,
  score integer,
  created_at timestamptz default now()
);

-- Recipes
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text not null check (category in ('cleaning', 'skincare', 'cooking', 'home', 'baby', 'other')),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  prep_time text,
  ingredients jsonb not null default '[]',
  instructions jsonb not null default '[]',
  image_url text,
  tags text[] default '{}',
  is_featured boolean default false,
  likes_count integer default 0,
  created_at timestamptz default now()
);

-- Community posts
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  image_url text,
  post_type text default 'general' check (post_type in ('general', 'review', 'tip', 'recipe', 'question')),
  product_id uuid references public.products on delete set null,
  likes_count integer default 0,
  comments_count integer default 0,
  is_flagged boolean default false,
  created_at timestamptz default now()
);

-- Comments
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Likes
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- User lists (storefronts/collections)
create table public.user_lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  description text,
  is_public boolean default true,
  category text,
  created_at timestamptz default now()
);

-- List items
create table public.list_items (
  id uuid default uuid_generate_v4() primary key,
  list_id uuid references public.user_lists on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  note text,
  position integer default 0,
  created_at timestamptz default now()
);

-- Follows
create table public.follows (
  follower_id uuid references public.profiles on delete cascade not null,
  following_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Reports (content moderation)
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles on delete cascade not null,
  content_type text not null check (content_type in ('post', 'comment', 'user')),
  content_id uuid not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

-- Blocked users
create table public.blocked_users (
  blocker_id uuid references public.profiles on delete cascade not null,
  blocked_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- Saved recipes
create table public.saved_recipes (
  user_id uuid references public.profiles on delete cascade not null,
  recipe_id uuid references public.recipes on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, recipe_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.ingredients enable row level security;
alter table public.scans enable row level security;
alter table public.recipes enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.user_lists enable row level security;
alter table public.list_items enable row level security;
alter table public.follows enable row level security;
alter table public.reports enable row level security;
alter table public.blocked_users enable row level security;
alter table public.saved_recipes enable row level security;

-- RLS Policies

-- Profiles: anyone can read, users can update their own
create policy "Public profiles" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Products: anyone can read, authenticated users can insert
create policy "Public products" on public.products for select using (true);
create policy "Auth users create products" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Auth users update products" on public.products for update using (auth.role() = 'authenticated');

-- Ingredients: anyone can read
create policy "Public ingredients" on public.ingredients for select using (true);

-- Scans: users see their own
create policy "Users see own scans" on public.scans for select using (auth.uid() = user_id);
create policy "Users create own scans" on public.scans for insert with check (auth.uid() = user_id);

-- Recipes: anyone can read
create policy "Public recipes" on public.recipes for select using (true);

-- Posts: anyone can read, users create their own
create policy "Public posts" on public.posts for select using (true);
create policy "Users create own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- Comments: anyone can read, users create their own
create policy "Public comments" on public.comments for select using (true);
create policy "Users create own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Likes: anyone can read, users manage their own
create policy "Public likes" on public.likes for select using (true);
create policy "Users create own likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users delete own likes" on public.likes for delete using (auth.uid() = user_id);

-- User lists: public lists visible to all, private only to owner
create policy "Public lists visible" on public.user_lists for select using (is_public = true or auth.uid() = user_id);
create policy "Users manage own lists" on public.user_lists for insert with check (auth.uid() = user_id);
create policy "Users update own lists" on public.user_lists for update using (auth.uid() = user_id);
create policy "Users delete own lists" on public.user_lists for delete using (auth.uid() = user_id);

-- List items: visible if list is visible
create policy "List items visible" on public.list_items for select using (
  exists (select 1 from public.user_lists where id = list_id and (is_public = true or user_id = auth.uid()))
);
create policy "Users manage own list items" on public.list_items for insert with check (
  exists (select 1 from public.user_lists where id = list_id and user_id = auth.uid())
);
create policy "Users delete own list items" on public.list_items for delete using (
  exists (select 1 from public.user_lists where id = list_id and user_id = auth.uid())
);

-- Follows: anyone can read, users manage their own
create policy "Public follows" on public.follows for select using (true);
create policy "Users create follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users delete follows" on public.follows for delete using (auth.uid() = follower_id);

-- Reports: users create their own, only see their own
create policy "Users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Users see own reports" on public.reports for select using (auth.uid() = reporter_id);

-- Blocked users: users manage their own
create policy "Users see own blocks" on public.blocked_users for select using (auth.uid() = blocker_id);
create policy "Users create blocks" on public.blocked_users for insert with check (auth.uid() = blocker_id);
create policy "Users delete blocks" on public.blocked_users for delete using (auth.uid() = blocker_id);

-- Saved recipes: users manage their own
create policy "Users see own saved" on public.saved_recipes for select using (auth.uid() = user_id);
create policy "Users save recipes" on public.saved_recipes for insert with check (auth.uid() = user_id);
create policy "Users unsave recipes" on public.saved_recipes for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index idx_scans_user_id on public.scans(user_id);
create index idx_scans_product_id on public.scans(product_id);
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_comments_post_id on public.comments(post_id);
create index idx_likes_post_id on public.likes(post_id);
create index idx_products_category on public.products(category);
create index idx_products_name on public.products(name);
create index idx_ingredients_name on public.ingredients(name);
create index idx_recipes_category on public.recipes(category);
create index idx_follows_following on public.follows(following_id);
