import type { BlogPost } from "@/lib/types";

/**
 * Bundled blog library — also the offline fallback for /blog when Supabase is
 * not configured. All content is original, arachnology-based and publish-ready.
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "how-ai-spider-identifier-works",
    title: "How an AI Spider Identifier Works (From Photo to Species in Seconds)",
    excerpt:
      "Computer vision, machine learning and a dash of arachnology turn a single photo into a confident species match. Here is exactly what happens between upload and result.",
    category: "How It Works",
    tags: ["AI", "computer vision", "machine learning", "identification"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 7,
    region: "Worldwide",
    level: "Intermediate",
    cover_accent: "dual",
    status: "published",
    is_featured: true,
    published_at: "2026-05-22T09:00:00.000Z",
    meta_title: "How an AI Spider Identifier Works — From Photo to Species in Seconds",
    meta_description:
      "A clear, technical-but-friendly breakdown of how AI identifies spiders from a photo: computer vision, machine learning, feature extraction and confidence scores.",
    content: `An AI spider identifier analyses a photo of a spider and predicts its species by combining image recognition with biological data. In simple terms, the system uses **computer vision** to "see" features like leg length, body shape, colours and markings, then applies **machine-learning** models trained on thousands of labelled images to find the closest match. It also leans on knowledge from **arachnology** — such as eye patterns and web types — to improve accuracy. The result is a fast, friendly way to identify spiders from a picture, often within seconds.

## What is an AI spider identifier?

It is a photo-based recognition tool — an app or website — that classifies spider species using trained algorithms. In practice it:

- Accepts an image, from your camera or an upload
- Extracts visual features such as shape, colour and pattern
- Compares them against a trained dataset
- Returns the most likely species plus a confidence score

General tools like Google Lens use a similar pipeline, but specialised spider tools are typically far more precise because they are tuned for one job.

## The core technologies behind it

### 1. Image understanding with computer vision

First the AI has to find the spider. **Object detection** locates it in the frame, **segmentation** separates it from noise like leaves, walls and shadows, and **feature extraction** captures edges, textures and colour patterns. This stage is pure computer vision.

### 2. Pattern learning with machine learning

Next, the model compares those extracted features with what it learned during training. Having seen thousands of labelled spider images, it has learned the distinguishing traits — markings, proportions, eye layout — and outputs a ranked list of possible species.

### 3. Biological context from arachnology

Raw image matching is not enough. Domain knowledge refines the result: eye arrangements (jumping spiders versus web-builders), leg proportions and stance, and typical habitats or web structures. These biological rules nudge the prediction toward the right answer.

## Step by step: from photo to identification

1. **Upload or capture an image** using your phone or desktop.
2. **Preprocessing** enhances contrast, removes noise and standardises the size.
3. **Detection and segmentation** isolates the spider from its background.
4. **Feature extraction** measures leg length and thickness, body segmentation (cephalothorax versus abdomen) and colour patterns.
5. **Model prediction** compares those features against the trained model to generate the top matches.
6. **Result and confidence score** displays the likely species — house spider, wolf spider, and so on — with a confidence level.

## What features does the AI look at?

- **Body shape:** round abdomen versus elongated
- **Legs:** length, hairiness and stance
- **Patterns:** stripes, spots, an hourglass or a violin shape
- **Eyes:** arrangement and size
- **Web clues:** orb, cobweb or funnel, if visible

For example, a glossy black body with a red hourglass points to a **black widow**, while a violin marking on the cephalothorax points to a **brown recluse**.

## How reliable is it?

Accuracy depends on image quality and how similar species are to one another.

| Scenario | Accuracy |
| --- | --- |
| Clear image, common species | High |
| Average image, similar species | Medium |
| Poor image | Low |

Accuracy is highest with clear, well-lit, close-up images of distinctive species, and lowest with blurry photos, juveniles (which look different from adults) or look-alike orb-weavers. That is why a good tool always shows a confidence score to guide your decision.

## Limitations you should know

- The AI suggests the closest match, **not a guaranteed identification**.
- Environmental noise can mislead detection.
- Some species require microscopic traits to confirm.
- Location data is not always considered unless you enable it.

> For safety-critical cases such as a possible venomous bite, seek expert or medical advice rather than relying on a photo.

## Why it beats manual methods

| Feature | AI Identifier | Field Guide |
| --- | --- | --- |
| Speed | Instant | Slow |
| Ease | Beginner-friendly | Requires expertise |
| Accuracy | High with a good image | Variable |
| Accessibility | Mobile and online | Books and manuals |

AI bridges technology and biology, making identification accessible to everyone — instant answers for beginners, a powerful shortcut for enthusiasts, and safer decisions in real-world encounters.`,
  },
  {
    slug: "spider-anatomy-explained",
    title: "Spider Anatomy Explained: Body, Legs, Eyes and Webs",
    excerpt:
      "Two body parts, eight legs, up to eight eyes and silk on demand. Understanding spider anatomy is the fastest way to identify what you are looking at.",
    category: "Anatomy",
    tags: ["anatomy", "biology", "identification", "webs"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 6,
    region: "Worldwide",
    level: "Beginner",
    cover_accent: "gold",
    status: "published",
    is_featured: true,
    published_at: "2026-05-08T09:00:00.000Z",
    meta_title: "Spider Anatomy Explained — Body, Legs, Eyes and Webs",
    meta_description:
      "A beginner-friendly guide to spider anatomy: the two body sections, eight legs, eye arrangements and web types that make identification possible.",
    content: `Every spider shares the same blueprint: **two main body parts, eight legs, multiple eyes and silk-producing organs**. Learn that blueprint and identification stops being guesswork. Unlike insects, spiders have no wings and no antennae — a quick way to rule out look-alikes before you start.

## Body structure

A spider's body has two sections joined by a narrow waist:

- The **cephalothorax** combines the head and thorax. It carries the eyes, fangs (chelicerae), pedipalps and all eight legs.
- The **abdomen** houses the internal organs and the silk glands.

The relative size and shape of these two parts is one of the most useful identification signals — compare the bulbous abdomen of a widow with the long, slim body of a cellar spider.

## Legs and how they move

Each of the eight legs is built from seven segments: coxa, trochanter, femur, patella, tibia, metatarsus and tarsus. Legs do far more than walk — they detect vibration, capture prey, aid climbing and even communicate through tapping.

Here is the surprising part: **spiders have no muscles to extend their legs**. Instead they pump body fluid into the limb under hydraulic pressure to push it straight. It is why a dead spider curls up — without pressure, the legs simply fold.

When you are identifying a spider, pay attention to leg **length, thickness, hairiness and stance**. A crab-like sideways splay (huntsman) looks nothing like the tight, upright posture of a widow.

## Eyes and vision

Most spiders have **eight eyes**, but their abilities vary enormously. Jumping spiders have excellent vision — they detect colour and fine detail and will visibly turn to watch you. Web-builders, by contrast, rely mostly on sensing vibration and see little.

Because the number and arrangement of eyes is so consistent within groups, **eye pattern is a key feature used by AI spider identifiers**. The brown recluse, for instance, breaks the usual rule with just six eyes in three pairs — an instant tell.

## Web types {#webs}

Not every spider builds a web, and the ones that do leave a signature you can read:

- **Orb webs** — the classic circular wheel of garden spiders
- **Funnel webs** — a tube-like retreat at ground level
- **Sheet webs** — flat, dense horizontal layers
- **Cobwebs** — irregular three-dimensional tangles, typical of widows

Web-building spiders trap prey passively and wait. Hunting spiders — wolves, jumpers and huntsmen — actively chase prey down and may build only a silk retreat. So the *presence and style* of a web instantly narrows the possibilities.

## Putting it together for identification

Four features do most of the work:

1. **Leg dimensions** — long and spindly, or short and robust?
2. **Eye pattern** — two big eyes, or six in pairs?
3. **Web structure** — orb, funnel, sheet, cobweb, or none?
4. **Body markings** — an hourglass, a violin, a cross, banded legs?

Read those four signals and you have already done what an AI identifier does in its first moments — narrowing thousands of species down to a confident shortlist.`,
  },
  {
    slug: "black-widow-spider-identification",
    title: "Black Widow Spider Identification: Spotting the Red Hourglass",
    excerpt:
      "The glossy black body and red hourglass make the black widow one of the most recognisable — and most medically significant — spiders in the world. Here is how to be sure.",
    category: "Species Guide",
    tags: ["black widow", "venomous", "identification", "safety"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 5,
    region: "Americas",
    level: "Beginner",
    cover_accent: "crimson",
    status: "published",
    is_featured: false,
    published_at: "2026-04-18T09:00:00.000Z",
    meta_title: "Black Widow Spider Identification — The Red Hourglass Explained",
    meta_description:
      "How to identify a black widow spider: the red hourglass, glossy black body, web style, look-alikes and what to do if you find one.",
    content: `Few spiders are as instantly recognisable as the **black widow**. A glossy, jet-black body and a vivid red hourglass make it stand out — and as the most medically significant spider in North America, it is one worth identifying correctly.

## The key identifiers

- **Glossy black, globular abdomen** that looks almost lacquered
- A **red (sometimes orange) hourglass** on the *underside* of the abdomen
- A **messy, strong, irregular web** built low to the ground
- **Females much larger than males** — it is the female that delivers a significant bite

The hourglass is the decisive mark, but remember it sits underneath. A widow hanging upside-down in her web — as they usually do — conveniently displays it.

## Where you will find them

Black widows like undisturbed, sheltered spaces: woodpiles, sheds, garage corners, garden debris and the underside of outdoor furniture. They are not aggressive and will retreat if they can; most bites happen when one is accidentally pressed against skin.

## Look-alikes to rule out

Several harmless spiders are mistaken for widows:

- **False widow spiders** are browner, with faint cream markings and no clean red hourglass.
- **Common house spiders** share the round abdomen but are mottled brown, not glossy black.

When colour and markings are ambiguous, an AI identifier helps by weighing body gloss, abdomen shape and web style together rather than relying on one trait.

## Venom and safety

Black widow venom is neurotoxic and, drop for drop, far more potent than a rattlesnake's — though the actual dose injected is tiny. A bite can cause muscle cramps, sweating and abdominal pain (a syndrome called latrodectism).

> If you are bitten and develop spreading pain, cramping or difficulty breathing, seek medical care immediately. Effective treatment exists, and serious outcomes are rare with prompt attention.

Never handle a spider you suspect is a widow. Photograph it from a safe distance, confirm the identification, and if it is indoors and a concern, contact pest control rather than approaching it.`,
  },
  {
    slug: "brown-recluse-spider-identification",
    title: "Brown Recluse Identification: The Violin Marking Explained",
    excerpt:
      "The brown recluse is shy, plain and easy to misjudge. The violin marking helps — but the real giveaway is something most people never think to check: its eyes.",
    category: "Species Guide",
    tags: ["brown recluse", "venomous", "identification", "safety"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 5,
    region: "United States",
    level: "Intermediate",
    cover_accent: "crimson",
    status: "published",
    is_featured: false,
    published_at: "2026-03-30T09:00:00.000Z",
    meta_title: "Brown Recluse Identification — The Violin Marking and Six Eyes",
    meta_description:
      "How to correctly identify a brown recluse spider using the violin marking, six-eye arrangement and uniform colour — plus the look-alikes people get wrong.",
    content: `The **brown recluse** earns its name. It is shy, hides in quiet places and wants nothing to do with you. The trouble is that it is also plain and brown, which means harmless spiders get blamed for it constantly. Knowing the real identifiers prevents a lot of needless worry.

## The violin — useful, but not enough

The classic tell is a **dark violin shape** on the cephalothorax, with the neck of the violin pointing back toward the abdomen. It is genuinely helpful, but it is also over-relied upon: several harmless spiders carry vaguely violin-like markings, and lighting can invent one that is not there.

## The real giveaway: six eyes

Here is the identifier the experts trust. Most spiders have eight eyes. The brown recluse has **six, arranged in three pairs** (dyads). If you can get a clear macro photo, counting the eyes is far more reliable than judging a smudge that might be a violin.

Other supporting signs:

- **Uniform tan to brown colour** with no banding on the legs
- **Smooth legs** with no spines
- A body roughly the size of a small coin, legs included

## Habitat

Recluses favour dark, undisturbed storage: closets, attics, basements, cardboard boxes and the backs of rarely moved furniture. They are native to the central and southern United States; sightings far outside that range are usually misidentifications.

## Why correct ID matters

Brown recluse venom is **cytotoxic** and can, in some cases, cause a slow-healing wound. But genuine bites are far rarer than reported — countless "recluse bites" turn out to be infections or other conditions in regions where the spider does not even live.

> If you have a slow-healing, worsening wound, see a doctor for the wound itself rather than trying to confirm the spider. Treat the symptom, not the assumption.

This is exactly where careful identification pays off: confirming six eyes and a uniform body — or ruling them out — turns a frightening guess into a calm, informed answer.`,
  },
  {
    slug: "wolf-spider-vs-house-spider",
    title: "Wolf Spider vs House Spider: How to Tell Them Apart",
    excerpt:
      "One races across the floor, the other hangs quietly in a corner. Size, eyes, behaviour and webs make these two common spiders easy to separate once you know the cues.",
    category: "Comparison",
    tags: ["wolf spider", "house spider", "identification", "comparison"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 5,
    region: "Worldwide",
    level: "Beginner",
    cover_accent: "gold",
    status: "published",
    is_featured: false,
    published_at: "2026-03-12T09:00:00.000Z",
    meta_title: "Wolf Spider vs House Spider — How to Tell Them Apart",
    meta_description:
      "A simple side-by-side comparison of wolf spiders and house spiders: size, eyes, web, behaviour and the fastest way to tell which one you have found.",
    content: `Two of the spiders people meet most often indoors are the **wolf spider** and the **common house spider** — and they could hardly be more different once you know what to look at. One is a fast ground hunter, the other a patient web-sitter.

## At a glance

| Feature | Wolf Spider | House Spider |
| --- | --- | --- |
| Build | Stocky, hairy, robust | Slender, delicate |
| Size | Large (up to 35 mm body) | Small (5–8 mm body) |
| Web | None — actively hunts | Tangled cobweb |
| Behaviour | Runs fast across the floor | Hangs in its web |
| Eyes | Two large forward eyes that shine | Eight small, even eyes |

## The behaviour test

The quickest separator is what the spider is *doing*. A wolf spider is almost always on the move — sprinting across a floor or wall, never sitting in a web, because it chases prey down. A house spider is the opposite: it sits quietly, often upside-down, in a messy cobweb spun into a corner.

## The eye-shine trick

Wolf spiders have a reflective layer in their eyes. Shine a torch at one in the dark and you will catch a distinct **greenish eye-shine** — something a house spider will not give you. It is a favourite field trick for spotting them on a lawn at night.

## Size and body

Wolf spiders are noticeably bigger and **hairy**, with thick, powerful legs built for running. House spiders are small and fine-limbed, with a rounder, smoother abdomen. A wolf spider mother is unmistakable when she is carrying her egg sac attached to her spinnerets, or her spiderlings riding on her back.

## Are either dangerous?

Neither is a serious threat. A wolf spider can deliver a defensive nip if cornered — comparable to a bee sting and nothing more for most people — while the common house spider is entirely harmless. Both are, in fact, useful housemates that quietly reduce the insect population indoors.

When you are unsure, photograph the spider and let an identifier weigh the cues together — body bulk, leg thickness, eye layout and whether there is a web — to confirm which of the two you are looking at.`,
  },
  {
    slug: "perfect-spider-photo-for-ai-identification",
    title: "How to Take the Perfect Spider Photo for AI Identification",
    excerpt:
      "The single biggest factor in an accurate identification is your photo. Five quick habits dramatically improve your results — without getting any closer than you need to.",
    category: "Tips",
    tags: ["photography", "tips", "identification", "accuracy"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 4,
    region: "Worldwide",
    level: "Beginner",
    cover_accent: "dual",
    status: "published",
    is_featured: false,
    published_at: "2026-02-20T09:00:00.000Z",
    meta_title: "How to Take the Perfect Spider Photo for AI Identification",
    meta_description:
      "Five practical tips for photographing a spider so an AI identifier can return an accurate species match — lighting, angle, focus, scale and safety.",
    content: `Image quality is the number-one factor in identification accuracy. A model can only work with what it can see, so a few seconds spent on the photo pays off in a far more confident result. Here is how to get it right — safely.

## 1. Get the lighting right

Soft, even light is ideal. Natural daylight or a diffused lamp reveals true colours and real markings. Avoid harsh direct flash, which blows out detail and can invent shadows the model mistakes for patterns. If the spider is in a dark corner, light it from the side rather than straight on.

## 2. Fill the frame, but stay focused

Get the spider as large in the frame as you can **while keeping it sharp**. A crisp spider occupying half the photo gives the model far more to read than a tiny, perfectly-focused dot. On a phone, tap the screen to lock focus on the body before you shoot.

## 3. Choose a revealing angle

A slight **side angle** is usually best because it shows the body shape and the stance of the legs at the same time. A flat, top-down silhouette hides exactly the proportions the model relies on. If you safely can, capture the underside too — that is where a widow's hourglass lives.

## 4. Include a sense of scale

Size narrows the options quickly. If there is a coin, a leaf or a fingertip *safely* near the spider, include it for scale — just never put your hand close to a spider you suspect is dangerous.

## 5. Capture the markings and the web

Zoom in on any standout markings — an hourglass, a violin, banded legs, a cross of spots. And if there is a web, photograph that too: an orb, a funnel or a tangled cobweb is a strong clue to the family.

## A note on safety

> Never handle or crowd a spider to get a shot. Use your camera's zoom, keep your distance, and if you suspect a dangerous species, photograph it from well back and let the identification — not your hand — do the work.

Follow these five habits and you will routinely turn an uncertain guess into a high-confidence match.`,
  },
  {
    slug: "are-jumping-spiders-dangerous",
    title: "Are Jumping Spiders Dangerous? Identification and Facts",
    excerpt:
      "Big eyes, a curious tilt of the head and an acrobatic pounce make jumping spiders the internet's favourite arachnid. Here is how to identify them — and whether they bite.",
    category: "Species Guide",
    tags: ["jumping spider", "identification", "facts", "harmless"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 4,
    region: "Worldwide",
    level: "Beginner",
    cover_accent: "gold",
    status: "published",
    is_featured: false,
    published_at: "2026-01-28T09:00:00.000Z",
    meta_title: "Are Jumping Spiders Dangerous? Identification and Facts",
    meta_description:
      "How to identify a jumping spider by its huge eyes and hopping movement, plus the facts on whether jumping spiders are dangerous to humans.",
    content: `If a small, fuzzy spider has ever turned to look at you and then *hopped*, you have met a **jumping spider**. With more than 6,000 species, the Salticidae are the largest spider family — and among the most endearing.

## How to identify a jumping spider

- **Two enormous central eyes** that give them sharp, almost cartoonish vision
- A **compact, hairy body**, often black with a white, red or iridescent spot
- **Iridescent green or blue fangs** (chelicerae) in many species
- A habit of moving in **quick hops** and turning to track movement

That forward-facing stare is the giveaway. Jumping spiders are visual hunters, so their two big eyes face front like headlights, with smaller eyes wrapping around the head for a near-360-degree field of view.

## Behaviour you can recognise

Unlike web-builders, jumpers do not sit and wait. They stalk prey in the open, judge the distance with that excellent eyesight, and pounce — anchoring a safety line of silk before they leap so they can climb back if they miss. They are active by day and genuinely seem to notice you, often tilting to watch.

## So, are they dangerous?

**No.** Jumping spiders are harmless to humans. They are tiny, shy and far more likely to flee or jump away than to confront you. A bite is extremely rare and, in the unlikely event one happens, typically amounts to no more than a brief pinprick and mild redness — comparable to a mosquito bite.

In fact they are welcome visitors: they hunt flies, mosquitoes and other pests around windows and gardens, and their curiosity makes them one of the easiest spiders to observe up close — no web required.

> A spider that watches you, hops, and has two big round eyes is almost certainly a harmless jumper. When you want to be certain of the exact species, a clear photo of those eyes and the body markings is all an identifier needs.`,
  },
  {
    slug: "spider-bites-identify-treat-when-to-worry",
    title: "Spider Bites: How to Identify, Treat and When to Worry",
    excerpt:
      "Most 'spider bites' are not bites at all, and most real bites are harmless. Here is how to tell the difference and recognise the few situations that need a doctor.",
    category: "Safety",
    tags: ["spider bites", "safety", "first aid", "health"],
    author_name: "Marcus Webb",
    author_role: "Spider Researcher",
    read_time: 5,
    region: "Worldwide",
    level: "Beginner",
    cover_accent: "crimson",
    status: "published",
    is_featured: false,
    published_at: "2026-01-10T09:00:00.000Z",
    meta_title: "Spider Bites — How to Identify, Treat and When to Worry",
    meta_description:
      "A calm, practical guide to spider bites: what a real bite looks like, simple first aid, and the warning signs that mean you should see a doctor.",
    content: `Spider bites are widely feared and widely misunderstood. The reassuring reality is that the vast majority of spiders cannot meaningfully harm you, and many marks blamed on spiders are something else entirely. Here is a calm, practical guide.

## Most "spider bites" are not bites

Doctors regularly find that lesions reported as spider bites are in fact bacterial infections, insect stings or skin conditions. True spider bites are uncommon because spiders bite to subdue prey, not people — they bite humans only when trapped against skin. If you did not see a spider do it, it most likely was not a spider.

## What a harmless bite looks like

A typical bite from a common spider resembles other insect bites:

- A small red bump, sometimes with two faint puncture points
- Mild swelling, itching or tenderness around the spot
- Symptoms that fade over a few days

This kind of bite needs nothing more than basic care.

## Simple first aid

1. **Wash** the area with soap and water.
2. **Apply a cold compress** to reduce swelling and pain.
3. **Elevate** the limb if it is a hand or foot.
4. **Avoid scratching**, which invites infection.
5. Take an over-the-counter antihistamine or pain reliever if needed.

## The two species that warrant caution

In most of the world, only two groups are medically significant: **widow** spiders and **recluse** spiders.

- A **widow** bite may bring muscle cramps, sweating and abdominal pain within hours.
- A **recluse** bite is usually painless at first but can, in some cases, develop into a slow-healing wound.

## When to see a doctor

> Seek medical care promptly if you experience spreading or severe pain, muscle cramps, fever, nausea, difficulty breathing, or a wound that worsens over days — or if a child, an older adult or anyone with a known sensitivity is bitten.

If you can do so safely, photograph the spider for identification — it genuinely helps clinicians. But never delay medical care to catch a spider, and never handle one you suspect is dangerous. Identify from a distance, treat the symptoms, and when in doubt, get it checked.`,
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogCategories = Array.from(new Set(blogPosts.map((p) => p.category)));
