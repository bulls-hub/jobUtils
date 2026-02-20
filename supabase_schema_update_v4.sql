-- Add scenes column to shorts_contents table
ALTER TABLE public.shorts_contents 
ADD COLUMN IF NOT EXISTS scenes jsonb;

-- Comment on the column for clarity
COMMENT ON COLUMN public.shorts_contents.scenes IS 'Stores array of scenes with visual_prompt and script';
