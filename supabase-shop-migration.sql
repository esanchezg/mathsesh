-- Shop migration — run in Supabase SQL editor when ready to launch
-- Also reset all kid accounts afterward via the parent dashboard

-- 1. Add shop columns to kid_profile
ALTER TABLE public.kid_profile
  ADD COLUMN IF NOT EXISTS coins int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS equipped_board text NOT NULL DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS equipped_wheels text NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS equipped_trucks text NOT NULL DEFAULT 'steel',
  ADD COLUMN IF NOT EXISTS equipped_character text NOT NULL DEFAULT 'default';

-- 2. Owned items table
CREATE TABLE IF NOT EXISTS public.owned_items (
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE,
  item_id text NOT NULL,
  category text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, item_id)
);

ALTER TABLE public.owned_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kid rw owned" ON public.owned_items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "parent reads owned" ON public.owned_items FOR SELECT
  USING (public.current_user_role() = 'parent');

GRANT ALL ON public.owned_items TO authenticated;

-- 3. Seed starter items for all existing kids
INSERT INTO public.owned_items (user_id, item_id, category)
SELECT user_id, 'default',  'board'     FROM public.kid_profile
UNION ALL
SELECT user_id, 'classic',  'wheels'    FROM public.kid_profile
UNION ALL
SELECT user_id, 'steel',    'trucks'    FROM public.kid_profile
UNION ALL
SELECT user_id, 'default',  'character' FROM public.kid_profile
ON CONFLICT DO NOTHING;

-- 4. purchase_item RPC
CREATE OR REPLACE FUNCTION public.purchase_item(
  p_item_id text,
  p_category text,
  p_price int
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_coins int;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.owned_items
    WHERE user_id = auth.uid() AND item_id = p_item_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_owned');
  END IF;

  SELECT coins INTO v_coins FROM public.kid_profile WHERE user_id = auth.uid();

  IF v_coins < p_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_coins');
  END IF;

  UPDATE public.kid_profile SET coins = coins - p_price WHERE user_id = auth.uid();

  INSERT INTO public.owned_items (user_id, item_id, category)
  VALUES (auth.uid(), p_item_id, p_category);

  RETURN jsonb_build_object('success', true, 'coins_remaining', v_coins - p_price);
END;
$$;

-- 5. equip_item RPC
CREATE OR REPLACE FUNCTION public.equip_item(
  p_item_id text,
  p_category text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.owned_items
    WHERE user_id = auth.uid() AND item_id = p_item_id
  ) THEN
    RAISE EXCEPTION 'Item not owned';
  END IF;

  UPDATE public.kid_profile SET
    equipped_board     = CASE WHEN p_category = 'board'     THEN p_item_id ELSE equipped_board     END,
    equipped_wheels    = CASE WHEN p_category = 'wheels'    THEN p_item_id ELSE equipped_wheels    END,
    equipped_trucks    = CASE WHEN p_category = 'trucks'    THEN p_item_id ELSE equipped_trucks    END,
    equipped_character = CASE WHEN p_category = 'character' THEN p_item_id ELSE equipped_character END
  WHERE user_id = auth.uid();
END;
$$;

-- 6. Update update_kid_after_session — add coins, remove deck unlocks
CREATE OR REPLACE FUNCTION public.update_kid_after_session(
  p_user_id uuid,
  p_xp_earned int,
  p_coins_earned int DEFAULT 0,
  p_session_date date DEFAULT current_date
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total_xp int;
  v_new_level int;
BEGIN
  UPDATE public.kid_profile SET
    total_xp = total_xp + p_xp_earned,
    coins = coins + p_coins_earned,
    last_session_date = p_session_date,
    current_streak_days = CASE
      WHEN last_session_date = p_session_date     THEN current_streak_days
      WHEN last_session_date = p_session_date - 1 THEN current_streak_days + 1
      ELSE 1
    END
  WHERE user_id = p_user_id
  RETURNING total_xp INTO v_total_xp;

  v_new_level := CASE
    WHEN v_total_xp >= 8000 THEN 8
    WHEN v_total_xp >= 5500 THEN 7
    WHEN v_total_xp >= 3500 THEN 6
    WHEN v_total_xp >= 2000 THEN 5
    WHEN v_total_xp >= 1000 THEN 4
    WHEN v_total_xp >= 500  THEN 3
    WHEN v_total_xp >= 200  THEN 2
    ELSE 1
  END;

  UPDATE public.kid_profile SET current_level = v_new_level WHERE user_id = p_user_id;
END;
$$;

-- 7. Update reset_kid_progress — include shop data
CREATE OR REPLACE FUNCTION public.reset_kid_progress(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.kid_profile SET
    total_xp = 0,
    current_level = 1,
    current_streak_days = 0,
    last_session_date = NULL,
    coins = 0,
    equipped_board = 'default',
    equipped_wheels = 'classic',
    equipped_trucks = 'steel',
    equipped_character = 'default'
  WHERE user_id = p_user_id;

  DELETE FROM public.sessions WHERE user_id = p_user_id;
  DELETE FROM public.question_results WHERE user_id = p_user_id;
  DELETE FROM public.owned_items WHERE user_id = p_user_id;

  -- Re-seed starter items
  INSERT INTO public.owned_items (user_id, item_id, category) VALUES
    (p_user_id, 'default', 'board'),
    (p_user_id, 'classic', 'wheels'),
    (p_user_id, 'steel',   'trucks'),
    (p_user_id, 'default', 'character');
END;
$$;
