-- Enable RLS
alter table auth.users enable row level security;

-- Create tables
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  job_title text,
  image_url text,
  about text,
  website text,
  calendar_link text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.contact_methods (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  type text not null,
  value text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.social_links (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  platform text not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references public.contacts(id) on delete cascade not null,
  date date not null,
  summary text not null,
  transcript text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.contacts enable row level security;
alter table public.contact_methods enable row level security;
alter table public.social_links enable row level security;
alter table public.conversations enable row level security;

-- Create policies
create policy "Users can view their own contacts"
  on contacts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own contacts"
  on contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own contacts"
  on contacts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own contacts"
  on contacts for delete
  using (auth.uid() = user_id);

-- Contact methods policies
create policy "Users can view contact methods for their contacts"
  on contact_methods for select
  using (exists (
    select 1 from contacts
    where contacts.id = contact_methods.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can insert contact methods for their contacts"
  on contact_methods for insert
  with check (exists (
    select 1 from contacts
    where contacts.id = contact_methods.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can update contact methods for their contacts"
  on contact_methods for update
  using (exists (
    select 1 from contacts
    where contacts.id = contact_methods.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can delete contact methods for their contacts"
  on contact_methods for delete
  using (exists (
    select 1 from contacts
    where contacts.id = contact_methods.contact_id
    and contacts.user_id = auth.uid()
  ));

-- Social links policies
create policy "Users can view social links for their contacts"
  on social_links for select
  using (exists (
    select 1 from contacts
    where contacts.id = social_links.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can insert social links for their contacts"
  on social_links for insert
  with check (exists (
    select 1 from contacts
    where contacts.id = social_links.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can update social links for their contacts"
  on social_links for update
  using (exists (
    select 1 from contacts
    where contacts.id = social_links.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can delete social links for their contacts"
  on social_links for delete
  using (exists (
    select 1 from contacts
    where contacts.id = social_links.contact_id
    and contacts.user_id = auth.uid()
  ));

-- Conversations policies
create policy "Users can view conversations for their contacts"
  on conversations for select
  using (exists (
    select 1 from contacts
    where contacts.id = conversations.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can insert conversations for their contacts"
  on conversations for insert
  with check (exists (
    select 1 from contacts
    where contacts.id = conversations.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can update conversations for their contacts"
  on conversations for update
  using (exists (
    select 1 from contacts
    where contacts.id = conversations.contact_id
    and contacts.user_id = auth.uid()
  ));

create policy "Users can delete conversations for their contacts"
  on conversations for delete
  using (exists (
    select 1 from contacts
    where contacts.id = conversations.contact_id
    and contacts.user_id = auth.uid()
  ));