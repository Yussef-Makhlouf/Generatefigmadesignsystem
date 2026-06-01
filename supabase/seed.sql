-- =====================================================================
-- KHIBRA PLATFORM — PREMIUM DATABASE SEED SCRIPT (ARABIC)
-- =====================================================================
-- Description: Completely clears existing testing data and populates
--              the database with high-quality Arabic content and expert profiles.
-- Instructions: Copy and run this script in your Supabase SQL Editor.
-- =====================================================================

-- =====================================================================
-- ── STEP 1: DATABASE CLEANUP (FACTORY RESET)
-- =====================================================================
TRUNCATE auth.users CASCADE;
TRUNCATE public.tags CASCADE;
TRUNCATE public.spaces CASCADE;

-- Ensure enum tables are populated (safeguard)
INSERT INTO public.account_types (value, label_ar, label_en) VALUES
  ('individual',  'فرد',         'Individual'),
  ('business',    'نشاط تجاري',  'Business'),
  ('restaurant',  'مطعم',        'Restaurant'),
  ('clinic',      'عيادة',       'Clinic'),
  ('doctor',      'طبيب',        'Doctor'),
  ('activity',    'نشاط',        'Activity'),
  ('admin',       'مدير',        'Admin')
ON CONFLICT (value) DO UPDATE
SET label_ar = EXCLUDED.label_ar, label_en = EXCLUDED.label_en;

INSERT INTO public.vote_types (value, label_ar) VALUES
  ('up',   'إيجابي'),
  ('down', 'سلبي')
ON CONFLICT (value) DO UPDATE SET label_ar = EXCLUDED.label_ar;

INSERT INTO public.attachment_types (value, label_ar) VALUES
  ('image',    'صورة'),
  ('link',     'رابط'),
  ('location', 'موقع')
ON CONFLICT (value) DO UPDATE SET label_ar = EXCLUDED.label_ar;

INSERT INTO public.notification_types (value, label_ar) VALUES
  ('like',        'إعجاب'),
  ('answer',      'إجابة'),
  ('comment',     'تعليق'),
  ('follow',      'متابعة'),
  ('review',      'تقييم'),
  ('system',      'نظام'),
  ('achievement', 'إنجاز')
ON CONFLICT (value) DO UPDATE SET label_ar = EXCLUDED.label_ar;


-- =====================================================================
-- ── STEP 2: CREATE PREMIUM EXPERT USER ACCOUNTS
-- =====================================================================
-- Password for all accounts: '12345678'
-- Note: All UUIDs use valid hex characters only (0-9, a-f)

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES
-- 1. Ahmed Al-Jabri (Cloud Solutions Architect)
(
  'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1',
  'ahmed@khibra.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name": "م. أحمد الجابري", "username": "ahmed_jabri", "account_type": "individual"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated'
),
-- 2. Mona Al-Khalidi (UI/UX Designer)
(
  'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2',
  'mona@khibra.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name": "منى الخالدي", "username": "mona_ux", "account_type": "individual"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated'
),
-- 3. Dr. Noura Al-Sudairy (Dentist - Verified Doctor)
(
  'a3b3c3d3-e3f3-43a3-b3c3-d3e3f3a3b3c3',
  'dr.noura@khibra.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name": "د. نورة السديري", "username": "dr_noura", "account_type": "doctor"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated'
),
-- 4. Al-Mathaq Restaurant (Verified Restaurant)
(
  'a4b4c4d4-e4f4-44a4-b4c4-d4e4f4a4b4c4',
  'restaurant@khibra.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name": "مطعم المذاق الأصيل", "username": "al_mathaq", "account_type": "restaurant"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated'
),
-- 5. Khaled Al-Harbi (Business Advisor)
(
  'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5',
  'khaled@khibra.com',
  extensions.crypt('12345678', extensions.gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name": "خالد الحربي", "username": "khaled_advisor", "account_type": "individual"}'::jsonb,
  NOW(), NOW(), 'authenticated', 'authenticated'
);


-- =====================================================================
-- ── STEP 3: ENRICH PROFILE META-DATA
-- =====================================================================
-- Profiles are auto-created by handle_new_user() trigger.
-- We now fill in bios, avatars, and business details.

UPDATE public.profiles
SET bio = 'استشاري حلول سحابية ومطور برمجيات أول. مهتم بهندسة الأنظمة الموزعة وتطوير تطبيقات الويب فائقة الأداء والتفاعل الفوري.',
    location = 'الرياض، السعودية',
    reputation = 1420,
    avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
WHERE id = 'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1';

UPDATE public.profiles
SET bio = 'مصممة تجربة واجهة مستخدم (UI/UX) شغوفة بتبسيط الأنظمة الرقمية المعقدة وتصميم تجارب مستخدم ممتعة وتفاعلية وجذابة.',
    location = 'الخبر، السعودية',
    reputation = 980,
    avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
WHERE id = 'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2';

UPDATE public.profiles
SET bio = 'استشارية طب وجراحة الفم والأسنان. خبرة 12 عاماً في تجميل الأسنان وزراعتها وإعادة تأهيل الابتسامة بالأجهزة الطبية الحديثة.',
    location = 'الرياض، السعودية',
    reputation = 2150,
    avatar_url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    business_category = 'صحة وعيادات',
    business_license = 'M-553229',
    business_address = 'شارع التخصصي، الرياض',
    business_rating = 4.9,
    reviews_count = 1,
    operating_hours = '9:00 ص - 8:00 م',
    is_verified_entity = true
WHERE id = 'a3b3c3d3-e3f3-43a3-b3c3-d3e3f3a3b3c3';

UPDATE public.profiles
SET bio = 'مطعم عربي أصيل يقدم أشهى المأكولات الشرقية والمشويات الطازجة المحضرة يومياً بأيدي أمهر الطهاة المحترفين.',
    location = 'جدة، السعودية',
    reputation = 1200,
    avatar_url = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    business_category = 'مأكولات',
    business_license = '1010203040',
    business_address = 'طريق الملك عبد العزيز، جدة',
    business_rating = 5.0,
    reviews_count = 1,
    operating_hours = '12:00 م - 2:00 ص',
    is_verified_entity = true
WHERE id = 'a4b4c4d4-e4f4-44a4-b4c4-d4e4f4a4b4c4';

UPDATE public.profiles
SET bio = 'مستشار مالي وريادي أعمال. أساعد الشركات الناشئة في التخطيط المالي وتطوير استراتيجيات النمو وجلب الاستثمارات الجريئة.',
    location = 'جدة، السعودية',
    reputation = 740,
    avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
WHERE id = 'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5';


-- =====================================================================
-- ── STEP 4: SEED SPACES
-- =====================================================================
-- ✅ All UUIDs use valid hex only (0-9, a-f). s→5, q→9, t→f, r→e
INSERT INTO public.spaces (id, name, description, icon_url, is_active)
VALUES
  ('51111111-1111-4111-b111-111111111111', 'برمجة وتطوير', 'فضاء لمناقشة لغات البرمجة، تقنيات الويب، والذكاء الاصطناعي وهندسة الأنظمة الحديثة.', 'Code', true),
  ('52222222-2222-4222-b222-222222222222', 'ريادة وأعمال', 'مساحة لتبادل النصائح المالية والقانونية للشركات الناشئة والمستشارين الماليين.', 'TrendingUp', true),
  ('53333333-3333-4333-b333-333333333333', 'صحة واستشارات', 'فضاء طبي لمناقشة مواضيع الأسنان، الصحة العامة، والتغذية السليمة.', 'Heart', true);


-- =====================================================================
-- ── STEP 5: SEED PREMIUM ARABIC QUESTIONS
-- =====================================================================
INSERT INTO public.questions (
  id, author_id, title, content, category, location,
  votes_count, answers_count, views_count, created_at, updated_at
)
VALUES
-- Question 1: Tech
(
  '91111111-1111-4111-b111-111111111111',
  'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2',
  'ما هي أفضل الطرق للتعامل مع إدارة الحالة (State Management) في تطبيقات React الكبيرة؟',
  'نعمل حالياً على تطوير لوحة تحكم إدارية ضخمة تحتوي على العشرات من النماذج التفاعلية والبيانات المشتركة بين عدة واجهات. نجد صعوبة في اختيار الأداة المناسبة بين Context API و Redux Toolkit و Zustand. ما هي معايير الاختيار وأفضل الممارسات لتجنب بطء إعادة الرندرة (Re-rendering)؟',
  'تقنية', 'الرياض', 25, 1, 142,
  NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'
),
-- Question 2: Business
(
  '92222222-2222-4222-b222-222222222222',
  'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1',
  'كيف يمكن لشركة ناشئة تقليل تكاليف الاستضافة السحابية في المراحل الأولى؟',
  'قمنا بإطلاق النسخة التجريبية لتطبيقنا، وفوجئنا بفاتورة استضافة مرتفعة جداً من AWS على الرغم من أن عدد المستخدمين النشطين لا يتجاوز بضعة آلاف. كيف يمكننا هيكلة خوادمنا لتقليل التكاليف دون التأثير على استقرار التطبيق وسرعته؟',
  'أعمال', 'جدة', 14, 1, 89,
  NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
),
-- Question 3: Health
(
  '93333333-3333-4333-b333-333333333333',
  'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5',
  'هل ابتسامة هوليود (الفينير) تلحق ضرراً بالأسنان الطبيعية على المدى البعيد؟',
  'أفكر في عمل عدسات الأسنان (الفينير) للحصول على ابتسامة متناسقة، ولكنني متخوف من فكرة برد الأسنان الطبيعية وهل ستصبح ضعيفة وعرضة للتسوس لاحقاً. أرجو الحصول على نصيحة طبية موثوقة.',
  'صحة', 'الرياض', 32, 1, 210,
  NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
);


-- =====================================================================
-- ── STEP 6: SEED TAGS & LINK TO QUESTIONS
-- =====================================================================
INSERT INTO public.tags (id, name, usage_count)
VALUES
  ('f1111111-1111-4111-b111-111111111111', 'React', 1),
  ('f2222222-2222-4222-b222-222222222222', 'برمجة', 1),
  ('f3333333-3333-4333-b333-333333333333', 'تطوير ويب', 2),
  ('f4444444-4444-4444-b444-444444444444', 'JavaScript', 1),
  ('f5555555-5555-4555-b555-555555555555', 'ريادة أعمال', 1),
  ('f6666666-6666-4666-b666-666666666666', 'أعمال', 1),
  ('f7777777-7777-4777-b777-777777777777', 'الحوسبة السحابية', 1),
  ('f8888888-8888-4888-b888-888888888888', 'صحة', 1),
  ('f9999999-9999-4999-b999-999999999999', 'طب الأسنان', 1),
  ('faaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa', 'تجميل', 1);

INSERT INTO public.question_tags (question_id, tag_id)
VALUES
  ('91111111-1111-4111-b111-111111111111', 'f1111111-1111-4111-b111-111111111111'),
  ('91111111-1111-4111-b111-111111111111', 'f2222222-2222-4222-b222-222222222222'),
  ('91111111-1111-4111-b111-111111111111', 'f3333333-3333-4333-b333-333333333333'),
  ('91111111-1111-4111-b111-111111111111', 'f4444444-4444-4444-b444-444444444444'),

  ('92222222-2222-4222-b222-222222222222', 'f5555555-5555-4555-b555-555555555555'),
  ('92222222-2222-4222-b222-222222222222', 'f3333333-3333-4333-b333-333333333333'),
  ('92222222-2222-4222-b222-222222222222', 'f6666666-6666-4666-b666-666666666666'),
  ('92222222-2222-4222-b222-222222222222', 'f7777777-7777-4777-b777-777777777777'),

  ('93333333-3333-4333-b333-333333333333', 'f8888888-8888-4888-b888-888888888888'),
  ('93333333-3333-4333-b333-333333333333', 'f9999999-9999-4999-b999-999999999999'),
  ('93333333-3333-4333-b333-333333333333', 'faaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa');


-- =====================================================================
-- ── STEP 7: SEED PREMIUM ARABIC EXPERT ANSWERS
-- =====================================================================
INSERT INTO public.answers (
  id, question_id, author_id, content, votes_count, is_accepted, created_at, updated_at
)
VALUES
-- Answer 1: React State Management (By Ahmed Al-Jabri)
(
  'a1111111-1111-4111-b111-111111111111',
  '91111111-1111-4111-b111-111111111111',
  'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1',
  'أهلاً بكِ أخت منى. هذا التحدي شائع جداً في المشاريع الكبيرة ذات النماذج المتشعبة. إليكِ الخلاصة العملية المبنية على تجربة إطلاق مشاريع ضخمة:

1. **Context API:** ممتاز للحالات شبه الثابتة (مثل المظهر الداكن/الفاتح، لغة التطبيق، بيانات المستخدم المسجل). لا يُنصح به إطلاقاً لإدارة البيانات سريعة التغير لأنه يعيد رندرة كافة المكونات التابعة (Children) عند أي تغيير، مما يسبب بطئاً ملحوظاً.

2. **Redux Toolkit:** الخيار التقليدي للمشاريع الضخمة التي يعمل عليها فرق متعددة. يوفر بنية تنظيمية ممتازة وتتبعاً رائعاً للأخطاء عبر DevTools، ولكنه يحتوي على الكثير من الأكواد المكررة (Boilerplate) ويعقد قراءة الكود في البدايات.

3. **Zustand:** الخيار الحديث والأكثر مرونة حالياً. بسيط جداً، وسريع للغاية، ويسمح بالاشتراك الجزئي (Selectors) مما يمنع تماماً إعادة الرندرة غير الضرورية في المكونات الأخرى.

**نصيحتي العملية للمشروع:**
ابدأوا باستخدام **Zustand** لإدارة الحالات المشتركة المحلية في الواجهات، واستخدموا كاش السيرفر مثل **React Query (TanStack Query)** لإدارة البيانات القادمة من الواجهات الخلفية (APIs). هذا الدمج سيقلل من حجم الحالات المحلية بنسبة 80% ويجعل التطبيق سريعاً بشكل استثنائي.',
  18, true,
  NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'
),
-- Answer 2: Cloud Costs (By Khaled Al-Harbi)
(
  'a2222222-2222-4222-b222-222222222222',
  '92222222-2222-4222-b222-222222222222',
  'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5',
  'توفير التكاليف السحابية في المراحل الأولى للشركات الناشئة هو عامل حاسم لاستمرار نموها. إليك عدة خطوات عملية قمنا بتطبيقها في عدة شركات تقنية ووفرت ما يصل إلى 60% من فاتورة AWS:

1. **الاعتماد على التقنيات اللامركزية (Serverless):** بدلاً من تشغيل خوادم EC2 تعمل على مدار الساعة دون استغلال كامل لقدرتها، استخدم AWS Lambda و DynamoDB حيث تدفع فقط بالملي ثانية مقابل الطلبات الفعلية.

2. **استخدام خوادم Spot Instances:** للبيئات التجريبية (Staging) والاختبارات، توفر خوادم Spot ما يصل إلى 90% من سعر الخوادم العادية، وتكفي جداً في مراحل التطوير الأولى.

3. **تفعيل CloudFront (CDN):** تخزين الملفات والصور الثابتة على شبكة توصيل المحتوى يقلل الضغط والتحميل المباشر من الخوادم الأساسية، مما يوفر تكاليف نقل البيانات (Data Transfer).

4. **الانتقال إلى خيارات اقتصادية:** في البداية، منصات مثل Vercel لتطوير الواجهات أو Supabase لإدارة قواعد البيانات والخدمات الخلفية تقدم باقات مجانية أو منخفضة التكلفة تغطي احتياجاتك بالكامل وتوفر عليك كلفة توظيف مهندس سحابي متخصص.',
  9, true,
  NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours'
),
-- Answer 3: Dental Veneers (By Dr. Noura Al-Sudairy)
(
  'a3333333-3333-4333-b333-333333333333',
  '93333333-3333-4333-b333-333333333333',
  'a3b3c3d3-e3f3-43a3-b3c3-d3e3f3a3b3c3',
  'أهلاً بك أخي الكريم. سؤالك في غاية الأهمية ويتكرر دائماً لدى المراجعين المتخوفين من تجميل الأسنان. الإجابة الدقيقة تعتمد على **طريقة التحضير الطبية والخبرة المهنية للطبيب المعالج**.

**1. برد الأسنان الطبيعي:** في الفينير التقليدي، نحتاج لبرد طبقة بسيطة جداً من المينا (حوالي 0.3 إلى 0.5 ملم) وهي سماكة طفيفة لا تضعف السن بشكل كبير إذا تمت بدقة وحرفية. ومع ذلك، هناك خيارات حديثة مثل **اللومينير (Lumineers)** أو عدسات بدون برد تماماً، لكنها لا تناسب كل الحالات (خصوصاً من لديهم بروز أو تلون شديد بالأسنان).

**2. مخاطر التسوس والتهاب اللثة:** العدسات التجميلية نفسها لا تسوس لأنها مصنعة من البورسلين، ولكن السن الطبيعي خلفها يمكن أن يسوس أو تلتهب اللثة المحيطة بها إذا لم يكن هناك إطباق تام ودقيق للعدسة على السن، أو إذا أهمل المريض نظافة الفم اليومية.

**نصائحي الذهبية للسلامة:**
- اختر طبيباً استشارياً متخصصاً وذا خبرة عالية في التركيبات التجميلية لتجنب البرد الجائر لطبقة المينا.
- التزم بالتنظيف اليومي بالفرشاة والمعجون واستخدام خيط الأسنان المائي بانتظام لمنع تراكم البلاك حول حواف العدسات.
- الفحص الدوري كل 6 أشهر يضمن سلامة اللثة والعدسات ويكشف أي تسرب مبكراً.',
  22, true,
  NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
);


-- =====================================================================
-- ── STEP 8: SEED ARABIC COMMENTS
-- =====================================================================
INSERT INTO public.comments (
  id, answer_id, author_id, content, created_at
)
VALUES
-- Comment 1: Mona praises Ahmed's React answer
(
  'c1111111-1111-4111-b111-111111111111',
  'a1111111-1111-4111-b111-111111111111',
  'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2',
  'إجابة ممتازة ووافية يا مهندس أحمد! فعلاً دمج Zustand مع React Query يحل أغلب مشاكل إدارة الحالة ويجعل الكود أنظف بكثير.',
  NOW() - INTERVAL '3 hours'
),
-- Comment 2: Ahmed replies to Mona
(
  'c2222222-2222-4222-b222-222222222222',
  'a1111111-1111-4111-b111-111111111111',
  'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1',
  'شكراً لكِ أخت منى. هذا التوجه هو السائد حالياً في كبرى الشركات التقنية لتبسيط دورة حياة البيانات وتوفير الأداء العالي وموثوقية الكود.',
  NOW() - INTERVAL '2 hours'
),
-- Comment 3: Ahmed comments on Khaled's cloud answer
(
  'c3333333-3333-4333-b333-333333333333',
  'a2222222-2222-4222-b222-222222222222',
  'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1',
  'إضافة قيمة جداً يا أستاذ خالد. فعلاً الكثير من الشركات الناشئة ترتكب خطأ تشغيل خوادم EC2 ضخمة في البداية دون الحاجة لها، والتحول إلى Serverless أو Supabase يوفر آلاف الدولارات شهرياً ويسمح بالتركيز على تطوير المنتج الأساسي.',
  NOW() - INTERVAL '15 hours'
),
-- Comment 4: Mona thanks Dr. Noura
(
  'c4444444-4444-4444-b444-444444444444',
  'a3333333-3333-4333-b333-333333333333',
  'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2',
  'شكراً دكتورة نورة على هذا الشرح الدقيق والواعي. طمأنتيني كثيراً بخصوص موضوع البرد، فالكثير من المعلومات المغلوطة تنتشر على وسائل التواصل الاجتماعي وتجعلنا نتردد كثيراً قبل العلاج.',
  NOW() - INTERVAL '18 hours'
);


-- =====================================================================
-- ── STEP 9: SEED BUSINESS REVIEWS
-- =====================================================================
INSERT INTO public.reviews (
  id, reviewer_id, entity_id, rating, comment, visit_date, created_at
)
VALUES
-- Review 1: Mona reviews Dr. Noura's clinic
(
  'e1111111-1111-4111-b111-111111111111',
  'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2',
  'a3b3c3d3-e3f3-43a3-b3c3-d3e3f3a3b3c3',
  5,
  'قمت بزيارة العيادة لعمل عدسات الفينير التجميلية بعد استشارة الدكتورة نورة. التعامل كان قمة في الاحترافية والأمانة، لم تقم ببرد الأسنان إلا بالقدر الأدنى والنتيجة طبيعية ورائعة جداً. أنصح بالتعامل معها بشدة لمن يبحث عن الجودة والمصداقية الطبية.',
  '2026-05-15',
  NOW() - INTERVAL '15 days'
),
-- Review 2: Khaled reviews Al-Mathaq restaurant
(
  'e2222222-2222-4222-b222-222222222222',
  'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5',
  'a4b4c4d4-e4f4-44a4-b4c4-d4e4f4a4b4c4',
  5,
  'أفضل مطعم يقدم المشويات الحلبية والأكلات الشرقية في جدة بلا منازع. كباب اللحم طازج ولذيذ جداً، والخدمة سريعة وممتازة. المكان نظيف ومرتب ومناسب جداً للعائلات.',
  '2026-05-20',
  NOW() - INTERVAL '10 days'
);


-- =====================================================================
-- ── STEP 10: FOLLOWS, VOTES & REPUTATION LOGS
-- =====================================================================

-- Follows
INSERT INTO public.follows (id, follower_id, following_id, created_at)
VALUES
  (uuid_generate_v4(), 'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1', 'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5', NOW() - INTERVAL '10 days'),
  (uuid_generate_v4(), 'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2', 'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1', NOW() - INTERVAL '10 days');

-- Votes
INSERT INTO public.votes (id, user_id, target_id, target_type, vote_type, created_at)
VALUES
  (uuid_generate_v4(), 'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2', 'a1111111-1111-4111-b111-111111111111', 'answer', 'up', NOW() - INTERVAL '3 hours'),
  (uuid_generate_v4(), 'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5', 'a3333333-3333-4333-b333-333333333333', 'answer', 'up', NOW() - INTERVAL '20 hours');

-- Reputation logs (for leaderboard display)
INSERT INTO public.reputation_logs (id, user_id, points, reason, created_at)
VALUES
  (uuid_generate_v4(), 'a3b3c3d3-e3f3-43a3-b3c3-d3e3f3a3b3c3', 2000, 'النقاط التأسيسية للاستشاريين المعتمدين', NOW() - INTERVAL '30 days'),
  (uuid_generate_v4(), 'a1b1c1d1-e1f1-41a1-b1c1-d1e1f1a1b1c1', 1300, 'النقاط التأسيسية للمساهمين الذهبيين',   NOW() - INTERVAL '30 days'),
  (uuid_generate_v4(), 'a4b4c4d4-e4f4-44a4-b4c4-d4e4f4a4b4c4', 1100, 'النقاط التأسيسية للمطاعم الموثقة',      NOW() - INTERVAL '30 days'),
  (uuid_generate_v4(), 'a2b2c2d2-e2f2-42a2-b2c2-d2e2f2a2b2c2',  900, 'النقاط التأسيسية لمساهمي التصميم',      NOW() - INTERVAL '30 days'),
  (uuid_generate_v4(), 'a5b5c5d5-e5f5-45a5-b5c5-d5e5f5a5b5c5',  700, 'النقاط التأسيسية للمستشارين الماليين',   NOW() - INTERVAL '30 days');

-- =====================================================================
-- ── SEEDING COMPLETED SUCCESSFULLY ✅
-- =====================================================================
