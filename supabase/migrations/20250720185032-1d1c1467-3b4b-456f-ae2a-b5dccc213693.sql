-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Create media table to store file metadata
CREATE TABLE public.media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  width integer,
  height integer,
  duration numeric, -- for videos
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Create policies for media access
CREATE POLICY "Anyone can view media files" 
ON public.media 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage media files" 
ON public.media 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Create storage policies for media bucket
CREATE POLICY "Public can view media files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Admins can upload media files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND get_current_user_role() = 'admin');

CREATE POLICY "Admins can update media files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete media files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND get_current_user_role() = 'admin');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_media_updated_at
BEFORE UPDATE ON public.media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update site_settings table to include logo_id reference (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings') THEN
        ALTER TABLE public.site_settings 
        ADD COLUMN IF NOT EXISTS logo_id uuid REFERENCES public.media(id);
    END IF;
END $$;