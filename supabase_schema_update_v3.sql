-- User Widget Settings Table
create table public.user_widget_settings (
  user_id uuid references auth.users not null primary key,
  stocks jsonb default '[]'::jsonb,
  coins jsonb default '[]'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_widget_settings enable row level security;

-- RLS Policies
create policy "Users can view their own settings"
on public.user_widget_settings for select
using ( auth.uid() = user_id );

create policy "Users can insert their own settings"
on public.user_widget_settings for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own settings"
on public.user_widget_settings for update
using ( auth.uid() = user_id );

create policy "Users can delete their own settings"
on public.user_widget_settings for delete
using ( auth.uid() = user_id );

-- Function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger set_updated_at
  before update on public.user_widget_settings
  for each row
  execute function public.handle_updated_at();
