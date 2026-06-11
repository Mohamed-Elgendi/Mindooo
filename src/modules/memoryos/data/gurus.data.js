// ============================================================
// MEMORYOS — GURU CENTER DATA
// Version: 1.0.0
//
// Complete guru definitions including:
// - Biography and background
// - Books and resources
// - Teaching philosophy
// - Step-by-step training roadmap
// - Each step: lesson + practical action
// ============================================================

// ─── TYPES ───────────────────────────────────────────────────








// ─── GURU 1: TONY BUZAN ──────────────────────────────────────

export const TONY_BUZAN = {
  id:          'tony-buzan',
  name:        'Tony Buzan',
  title:       'The Father of Mind Mapping',
  nationality: 'British',
  born:        '1942',
  died:        '2019',
  icon:        '🗺️',
  colorKey:    'gold',
  tagline:     'Your brain is not a vessel to be filled. It is a fire to be ignited.',
  bio: `Tony Buzan was a British psychology author, educational consultant, and inventor of Mind Mapping. He studied at the University of British Columbia, graduating with a double honours degree in psychology, English, mathematics and science. He began his career as a journalist, then became one of the world's most recognized authorities on the brain and learning. He advised governments, corporations, universities and schools across 100 countries and consulted for organizations including Microsoft, IBM, and Disney. He authored over 100 books translated into 30 languages, sold more than 3 million copies worldwide. Buzan hosted the BBC television series Use Your Head and founded the World Memory Championships in 1991 together with chess grandmaster Raymond Keene. He dedicated his life to proving that every human brain has virtually unlimited potential — and that conventional education systematically fails to unlock it.`,
  philosophy: `Buzan believed that the human brain is the most complex object in the known universe, capable of making more neural connections than there are atoms in the observable universe. Yet most people use it at less than 1% of its true capacity — not because of biology, but because they were never taught HOW to use it. His mission was to teach people the operating manual for their own mind. He called this Mental Literacy — the ability to use the full range of the brain's cognitive tools as fluently as one uses language.`,
  coreTeaching: `The brain thinks in images, not words. The brain thinks associatively, not linearly. The brain craves color, pattern, rhythm and exaggeration. Every conventional study technique — linear notes, passive reading, rote repetition — works against the brain's natural architecture. Buzan's techniques work WITH it. The result is not just better memory, but a fundamentally different relationship with knowledge.`,

  books: [
    {
      title:     'Use Your Head',
      year:      1974,
      summary:   'The foundational book that introduced Mind Mapping and the principles of radiant thinking to the general public. Became a bestseller after the BBC television series.',
      keyLesson: 'Your brain operates through radiant associations, not linear sequences. Note-taking should mirror this.',
    },
    {
      title:     'Use Your Memory',
      year:      1986,
      summary:   'A complete memory training system covering the major system, pegging, linking, and the memory palace. Considered one of the most comprehensive memory books ever written.',
      keyLesson: 'Memory is a skill that follows specific laws. Master the laws and you master memory.',
    },
    {
      title:     'The Mind Map Book',
      year:      1993,
      summary:   'Co-authored with Barry Buzan. The definitive guide to Mind Mapping with research, applications, and hundreds of examples across business, education, and personal life.',
      keyLesson: 'A Mind Map is not a note-taking tool. It is a thinking tool that mirrors the brain\'s own architecture.',
    },
    {
      title:     'Speed Reading',
      year:      1977,
      summary:   'Introduces techniques for tripling reading speed while improving comprehension by eliminating subvocalization, regression, and passive reading.',
      keyLesson: 'Reading efficiency = speed × comprehension. Both can be trained simultaneously.',
    },
    {
      title:     'Master Your Memory',
      year:      1988,
      summary:   'A systematic course for developing extraordinary memory using visualization, association, and spaced repetition, with over 1,000 practice exercises.',
      keyLesson: 'Memory training is not memorization. It is the training of imagination.',
    },
  ],

  aiSystemPrompt: `You are Tony Buzan, the British psychology author and creator of Mind Mapping, speaking directly to your student in a warm, enthusiastic, and deeply encouraging coaching style. You speak with the passion of someone who genuinely believes in the unlimited potential of every human brain. You use vivid language, ask engaging questions, and always bring your teaching back to the fundamental principle: the brain thinks in images and associations, not words and lines. You guide your student through one practical action at a time. You never overwhelm. You celebrate small wins enthusiastically. You speak in the present tense, as if you are physically present with the student. You occasionally reference your books and television work. Your goal is to make the student feel that their brain is already extraordinary — it just needs to be shown how to use itself.`,

  roadmap: [
    {
      id:              'buzan-01',
      stepNumber:      1,
      title:           'Understand Your Brain\'s True Nature',
      lesson:          `Your brain is not a filing cabinet. It does not store information in neat folders and drawers. It stores information as a vast web of interconnected associations — more like a living ecosystem than a machine. Every single thought you have triggers dozens, hundreds, sometimes thousands of related thoughts simultaneously. This is called Radiant Thinking. When you think of the word "apple," your brain does not retrieve one file labeled "apple." It simultaneously activates taste, color, smell, memories, associations with teachers, Newton, health, seasons, and hundreds of other nodes. This is your brain's natural language. Every conventional study technique — linear notes, passive re-reading, highlighting, rote repetition — forces your radiant brain into a linear box. The result is fatigue, boredom, and poor retention. The solution is to study in the brain's own language: images, associations, colors, and patterns.`,
      practicalAction: 'Experience Radiant Thinking firsthand',
      actionPrompt:    `Take a blank piece of paper. Write the word MEMORY in the center and draw a circle around it. Now set a timer for 2 minutes. Without thinking, write every single word, image, or idea that comes to mind — draw lines outward from the center word like branches on a tree. Go as fast as possible. Do not judge any association. When the timer stops, count how many branches you have. Most people get 20-40. This is your brain thinking radiationally — this is its natural speed. Notice how effortless it felt compared to writing a linear list.`,
      duration:        '10 minutes',
      aiPrompt:        'Guide me through a radiant thinking exercise for the word MEMORY. Ask me what I see and help me expand each association.',
    },
    {
      id:              'buzan-02',
      stepNumber:      2,
      title:           'Activate the Visual Memory System',
      lesson:          `The brain's visual processing system occupies approximately 30% of the cortex — far more than any other sense. Evolutionary biology explains why: for millions of years, survival depended on remembering what things looked like — predators, safe plants, terrain, faces. Your visual memory is ancient, powerful, and almost automatic. Your verbal memory, by contrast, is evolutionarily new, trained, and relatively weak. When you try to memorize a phone number by repeating it silently, you are using your newest and weakest memory system. When you convert that number into a vivid visual scene, you are using your oldest and most powerful system. The rule is absolute: if you can see it, you can remember it. The training therefore has one goal — to become so skilled at creating vivid mental images that any piece of information, no matter how abstract, can be instantly converted into a picture.`,
      practicalAction: 'Build your first vivid memory image',
      actionPrompt:    `You need to remember this fact: The hippocampus is the brain structure responsible for forming new memories. Here is how to convert it into an image. Close your eyes. Imagine a HIPPOPOTAMUS wearing a CAMPUS BACKPACK — it is walking through a university campus (hippo + campus = hippocampus). The hippopotamus is enormous, bright purple, and is FORMING new paths through the campus by stamping its feet — because the hippocampus FORMS new memories. See the scene vividly. Make the hippopotamus as ridiculous as possible. Make it stamp its feet three times. Now look away and say the sentence: "The hippocampus is responsible for forming new memories." Notice how the image gave you an instant hook.`,
      duration:        '15 minutes',
      aiPrompt:        'Help me create a vivid visual image for any memory science concept I give you. Ask me for the concept first, then guide me step by step.',
    },
    {
      id:              'buzan-03',
      stepNumber:      3,
      title:           'Master the Five Dimensions of Powerful Images',
      lesson:          `Not all mental images are equal. A weak image fades within hours. A powerful image lasts decades. The difference lies in five dimensions that Buzan identified through decades of research and working with thousands of students. These are: SIZE (exaggerate it — make it enormous or microscopic), COLOR (make it vivid, specific, saturated — not just red, but blood red pulsing in sunlight), ACTION (make it move, explode, dance, crash — static images fade, moving images persist), EMOTION (inject feeling — humor, disgust, love, awe — the amygdala amplifies emotional memories), and SENSORY RICHNESS (add smell, texture, sound, taste). An image built on all five dimensions is virtually impossible to forget. An image built on none of them is forgotten within 20 minutes. This is not metaphor — it is neuroscience. The more dimensions you activate, the more neural pathways you create, and the more retrieval routes exist.`,
      practicalAction: 'Build a five-dimensional image',
      actionPrompt:    `Choose any single fact you need to memorize. Write it down. Now build a five-dimensional image for it using this checklist: SIZE — make one element enormous or microscopic. COLOR — name the exact colors you see (not just blue — electric cyan, not just red — deep burgundy). ACTION — what is moving? What is happening? Make it absurd. EMOTION — what feeling does this scene provoke? Aim for humor or mild disgust — both are highly memorable. SENSORY RICHNESS — what does the scene smell like? What sounds does it make? What would it feel like to touch? Write out your complete five-dimensional image in one paragraph. Then close your eyes and run the scene for 10 seconds. Test yourself one hour later.`,
      duration:        '20 minutes',
    },
    {
      id:              'buzan-04',
      stepNumber:      4,
      title:           'Build Your First Mind Map',
      lesson:          `A Mind Map is not a diagram. It is a mirror of the way your brain actually thinks. Unlike linear notes, which force your brain into a sequence, a Mind Map allows your brain to think radiationally — outward from a center in all directions simultaneously. This is why Mind Maps produce 10 times more associations than linear notes in the same time, are 3-4 times faster to review, and are retained 2-3 times longer. The seven laws of Mind Mapping: 1. Start with a vivid central image (not a word). 2. Use images throughout the map. 3. Use at least three colors. 4. Connect branches to the center and to each other. 5. Make branches curved, not straight. 6. Use exactly one keyword per branch. 7. Leave space — the map should breathe. Breaking any law reduces effectiveness. Following all seven laws produces a tool that works WITH your brain instead of against it.`,
      practicalAction: 'Create your first complete Mind Map',
      actionPrompt:    `Choose a topic you want to understand or remember — it can be anything from a book chapter to a list of tasks to a concept you are studying. Take a blank unlined page and turn it sideways (landscape). Draw a vivid colored image in the center representing your topic — do NOT just write the word. Draw at least 6 main branches from the center, each a different color. Write exactly ONE keyword per branch. From each main branch, draw sub-branches with more keywords. Add small images wherever possible. When done, your map should have at least 20 nodes. Time yourself: the first map takes 15 minutes. After 10 maps, you will complete one in under 5 minutes.`,
      duration:        '25 minutes',
    },
    {
      id:              'buzan-05',
      stepNumber:      5,
      title:           'The SEA Principles — Making Anything Memorable',
      lesson:          `Buzan distilled all memory techniques into five principles he called the SEA framework. Every powerful memory technique in history obeys these five laws. S — Sensation: engage as many senses as possible (sight, sound, smell, touch, taste). E — Exaggeration: make elements impossibly large, small, fast, or slow. A — Association: connect the new information to something already known. Absurdity: make the scene physically impossible — the brain prioritizes novelty. Action: put everything in vivid motion. Any piece of information that satisfies all five SEA criteria becomes virtually unforgettable. This is not theory — it is the operating principle behind every world memory record ever set. The challenge is not memorization. The challenge is creative encoding. Once you master creative encoding, memorization takes care of itself.`,
      practicalAction: 'Apply SEA to a full list',
      actionPrompt:    `Write down any list of 10 items you need to remember (grocery items, vocabulary words, historical dates, concepts — anything). For each item, create a vivid SEA image: sensory (which senses?), exaggerated (how impossible?), associated (linked to what you already know), absurd (what makes it impossible?), and in action (what is it doing?). Write one sentence describing each image. Then link all 10 images into a chain — each image interacts with the next in a ridiculous way. Test yourself immediately by recalling the chain without looking. Most people get 8-10 correct on their first attempt using this method.`,
      duration:        '30 minutes',
    },
    {
      id:              'buzan-06',
      stepNumber:      6,
      title:           'Speed Reading — Information at Full Bandwidth',
      lesson:          `The average person reads at 200-250 words per minute with 50-70% comprehension. A trained reader achieves 500-700 words per minute with HIGHER comprehension. The reason most people read slowly is three bad habits: subvocalization (mentally pronouncing every word, which limits speed to speaking speed), regression (re-reading words already passed, wasting 20-30% of reading time), and narrow fixation (reading one word at a time instead of phrases). Eliminating these three habits immediately doubles reading speed. The techniques: use a finger or pen as a visual pacer moving forward without stopping (eliminates regression), hum softly while reading (breaks subvocalization), and train peripheral vision to absorb 3-5 words per fixation. The result is that the brain receives information at a higher bandwidth, stays engaged rather than drifting, and actually comprehends MORE because the narrative flows faster than distraction can form.`,
      practicalAction: 'Speed reading drill',
      actionPrompt:    `Take any book or article. Read one page at your normal speed. Note the time. Now read the next page using a pen as a pacer — move it along each line at 1.5x your normal speed, following it with your eyes. Do not stop. Do not re-read. Hum quietly if you find yourself sounding words. After the page, immediately write down everything you remember without looking. Compare your recall to the first page. Most people discover that the faster page produced equal or better recall because their attention was fully engaged. Do this for 10 pages daily for one week. Your reading speed will permanently increase.`,
      duration:        '20 minutes',
    },
    {
      id:              'buzan-07',
      stepNumber:      7,
      title:           'The Review System — Defeating the Forgetting Curve',
      lesson:          `Ebbinghaus discovered in 1885 that without review, 80% of learned information is forgotten within 24 hours. Buzan's response was to map the optimal review moments: immediately after learning, then at 10 minutes, 24 hours, 1 week, 1 month, 3 months, 6 months, and 1 year. Each review at the right moment resets the forgetting curve and embeds the memory more deeply. The critical insight: each review takes exponentially less time than the original learning, because the brain is re-tracing a path rather than building it. A 30-minute learning session requires a 5-minute review at 24 hours, a 2-minute review at 1 week, and a 1-minute review at 1 month. The total investment for lifelong retention is approximately 40 minutes — less than a single additional study session would provide using conventional methods.`,
      practicalAction: 'Set up your review system',
      actionPrompt:    `Take the Mind Map you created in Step 4. Without looking at it, take a blank page and reconstruct it from memory — draw the center image, the main branches, the keywords, as many details as you can recall. This is your immediate review. Compare to the original. Note any gaps. Now schedule four future reviews: tomorrow, in 7 days, in 30 days, in 90 days. Add them to your calendar now. Each future review will take under 3 minutes because you are just glancing at the map to confirm it is still in place. This single action — scheduling your reviews — is the most powerful thing you can do for long-term retention. Most people skip it. Champions do not.`,
      duration:        '15 minutes',
    },
    {
      id:              'buzan-08',
      stepNumber:      8,
      title:           'Integrate: The iMind Daily Practice',
      lesson:          `Buzan called the fully activated human mind the iMind — integrated, imaginative, infinite. The iMind is not a destination. It is a daily practice. The four habits that sustain it: 1. Daily Mind Mapping (any topic, any size — keeps radiant thinking fluid). 2. Daily visualization practice (convert 5 abstract concepts to images every day). 3. Daily reading with the speed techniques (20 minutes minimum). 4. Scheduled reviews (3 minutes per subject at the right intervals). These four habits, practiced daily, compound. After 30 days, you notice your thinking is faster and more associative. After 90 days, you notice concepts connect across domains you never linked before. After one year, you notice that learning anything new is dramatically easier because your associative network is so rich that new information has hundreds of hooks to attach to. This is the iMind. It is available to everyone. It requires only practice.`,
      practicalAction: 'Design your iMind daily routine',
      actionPrompt:    `Design a daily MemoryOS routine using Buzan's four iMind habits. Time-box each activity: Mind Map (10 min, any topic), Visualization practice (5 min, 3 concepts converted to images), Speed reading (20 min, any book), Reviews (5 min, scheduled cards). Total: 40 minutes. Write your routine as a specific schedule: what time, where, in what order. The exact content changes daily — the routine stays fixed. Commit to this routine for 21 consecutive days. Track your streak. After 21 days, the habits become automatic and the cognitive benefits begin to compound. Your brain is already capable of everything described in this roadmap. It simply needs consistent practice to activate what was always there.`,
      duration:        '15 minutes',
    },
  ],
};

// ─── GURU 2: DOMINIC O'BRIEN ─────────────────────────────────

export const DOMINIC_OBRIEN = {
  id:          'dominic-obrien',
  name:        'Dominic O\'Brien',
  title:       'Eight-Time World Memory Champion',
  nationality: 'British',
  born:        '1957',
  icon:        '🃏',
  colorKey:    'rose',
  tagline:     'Imagination is the key that unlocks the door to memory.',
  bio: `Dominic O'Brien is a British mnemonist who won the World Memory Championship eight times between 1991 and 2005. He holds records for memorizing 54 shuffled decks of playing cards (2,808 cards), 2,808 binary digits, and 2,385 random numbers. He was banned from multiple Las Vegas casinos for card counting using his memory techniques. O'Brien discovered his talent for memory training relatively late in life — he was watching a television program featuring a memory demonstration by Creighton Carvello at age 30 when he realized memorization was a learnable skill. Within months of self-directed practice, he had mastered the techniques and began competing. He has since taught his methods to thousands of students worldwide and consulted for corporate clients including Goldman Sachs and British Telecom.`,
  philosophy: `O'Brien believes that exceptional memory is not a gift but a discipline — specifically, the discipline of attention. His core insight is that all memory failure is ultimately attention failure: we forget things not because our brains cannot hold them, but because we never truly paid attention to them in the first place. His entire system is designed to force complete, vivid, multisensory attention to every piece of information at the moment of encoding. The PAO system, the Journey Method, the Rule of Five — each technique is, at its core, an attention discipline in disguise.`,
  coreTeaching: `Memory is not a passive recording device. It is an active creative process. Every memory you form is something you construct — you are always the author. The question is whether you construct it deliberately, with full attention and vivid imagery, or accidentally, with half-attention and no imagery. O'Brien's system makes the construction deliberate. When you deliberately construct a memory using his techniques, you can recall it perfectly years later. When you construct it accidentally, you may not recall it even an hour later.`,

  books: [
    {
      title:     'How to Develop a Brilliant Memory Week by Week',
      year:      2005,
      summary:   'A 52-week structured program for building memory from beginner to advanced using the Journey Method, PAO system, and spaced review. Considered his most complete practical guide.',
      keyLesson: 'Extraordinary memory is built in weeks, not years, through daily structured practice.',
    },
    {
      title:     'Quantum Memory Power',
      year:      2003,
      summary:   'Audio program accompanying his complete memory training system. Covers names, numbers, cards, and lists with specific exercises for each.',
      keyLesson: 'The Journey Method combined with PAO is the most powerful memory system ever devised.',
    },
    {
      title:     'Never Forget a Name or Face',
      year:      2007,
      summary:   'Focused specifically on social memory — names, faces, personal details — using substitute images, facial features, and the linking system.',
      keyLesson: 'Remembering someone\'s name is the highest compliment you can pay them.',
    },
    {
      title:     'Learn to Remember',
      year:      2000,
      summary:   'Introduction to his complete system with an emphasis on building the first memory journeys and applying them immediately to real-world memory tasks.',
      keyLesson: 'Your first journey of 10 stations is the foundation of everything.',
    },
  ],

  aiSystemPrompt: `You are Dominic O'Brien, eight-time World Memory Champion, speaking to your student in a calm, precise, and deeply practical coaching style. You are methodical and specific — you never give vague advice. You always give exact, concrete instructions that can be followed immediately. You speak from the perspective of someone who has memorized 54 decks of playing cards and sat in the Memory Zone for hundreds of hours. You know from experience exactly what works and what does not. You guide your student through one technique at a time, always with a specific exercise. You reference your championship experiences when relevant. Your tone is encouraging but never effusive — you trust that the techniques speak for themselves when properly applied.`,

  roadmap: [
    {
      id:              'obrien-01',
      stepNumber:      1,
      title:           'The Rule of Five — Your Foundation',
      lesson:          `Before learning any technique, you must understand the Rule of Five. Any piece of information requires five reviews at specific intervals before it can be considered reliably stored in long-term memory. The five moments are: immediately after encoding (within 10 minutes), after one hour, after one day, after one week, and after one month. Missing any single review resets the retention clock — the memory weakens and must be rebuilt. This rule is non-negotiable. It is the infrastructure that supports every technique in my system. Without it, even the most vivid memory images will fade. With it, even moderately vivid images will last a lifetime. Before you learn anything else, commit to the Rule of Five. Schedule your reviews. This is not optional.`,
      practicalAction: 'Set up your Rule of Five system',
      actionPrompt:    `Write down three pieces of information you want to remember permanently — they can be facts, names, concepts, anything. For each one, write the current time and date. Then schedule five review appointments: now (review immediately after creating your memory), +1 hour, +1 day, +1 week, +1 month. Add these to your calendar as actual appointments. This exercise is about building the habit of scheduling reviews, not about the content. The content changes every day. The system stays fixed.`,
      duration:        '10 minutes',
    },
    {
      id:              'obrien-02',
      stepNumber:      2,
      title:           'Build Your First Journey',
      lesson:          `The Journey Method — my version of the ancient Memory Palace — is the most powerful memory tool ever invented. A journey is any familiar route with distinct, ordered stations. The stations are where you place your memory images. The journey provides the order. The images provide the content. Your first journey should have exactly 10 stations in a location you know extremely well — ideally your home. Walk the route mentally right now: front door, entrance hall, living room sofa, television, kitchen table, kitchen sink, refrigerator, bathroom sink, bedroom door, bedroom window. Each station must be visually distinct, reliably ordered, and large enough to hold an image. Once your journey is built, you can reuse it indefinitely by placing new images at each station and clearing old ones between uses.`,
      practicalAction: 'Build and walk your first 10-station journey',
      actionPrompt:    `Walk through your home (physically or mentally) and identify exactly 10 stations in fixed order. Write them down in a numbered list. For each station, note one distinctive visual feature. Now mentally walk the journey three complete times without stopping, naming each station aloud as you pass it. On the third walk, pause at each station for 3 seconds and form a vivid image of an orange at that location — an orange doing something ridiculous at each station. After completing all 10 stations, close your eyes and walk the journey mentally, recalling the orange at each station. This exercise proves the Journey Method works before you spend any time memorizing real information.`,
      duration:        '20 minutes',
    },
    {
      id:              'obrien-03',
      stepNumber:      3,
      title:           'The Dominic System — Encode Any Number',
      lesson:          `The Dominic System converts any two-digit number into a memorable person using a simple letter code: A=1, B=2, C=3, D=4, E=5, S=6, G=7, H=8, N=9, O=0. So the number 35 becomes the letters CE — Charlie Chaplin. His action is twirling his cane. His object is his bowler hat. To memorize a sequence of six numbers (say, 358421), split into pairs: 35, 84, 21. This gives you three people: 35=CC (Charlie Chaplin), 84=HD (your choice — perhaps Halle Davis, a friend whose initials are H.D.), 21=BA (Boris Abrams, or any person with initials B.A.). Now use PAO: Charlie Chaplin (person from pair 1) performs Halle Davis's action (pair 2) using Boris Abrams's object (pair 3). This creates ONE vivid scene from SIX numbers. Place it at a journey station. The number is now retrievable for as long as the journey exists.`,
      practicalAction: 'Build your personal Dominic System for 00-19',
      actionPrompt:    `Using the letter code (A=1,B=2,C=3,D=4,E=5,S=6,G=7,H=8,N=9,O=0), assign a real person to each two-digit number from 00 to 19. The person can be anyone — celebrity, friend, family member, fictional character — as long as their initials match the code. Write your list. Then for each person, assign: one signature ACTION they are known for, and one distinctive OBJECT associated with them. This is your personal PAO library for 00-19. Memorize the first 10 (00-09) this week. The full system (00-99) takes approximately 4 weeks to build. Once built, you can encode any sequence of digits in real time.`,
      duration:        '30 minutes',
    },
    {
      id:              'obrien-04',
      stepNumber:      4,
      title:           'Linking Journeys — Infinite Memory Networks',
      lesson:          `One 10-station journey holds 10 pieces of information. Ten journeys hold 100. One hundred journeys hold 1,000. There is no theoretical upper limit. The key to building an unlimited memory network is linking journeys together. At the end of journey one, create a dramatic bridging image that contains elements from both the last station of journey one and the first station of journey two. This image acts as a doorway. When you arrive at the last station of journey one and see your bridging image, it automatically transports you to the first station of journey two. I have built journey networks containing thousands of stations across dozens of interconnected locations. Each new journey expands the network. Each journey you build becomes permanent mental real estate that retains its value forever.`,
      practicalAction: 'Build your second journey and link it to your first',
      actionPrompt:    `Choose a second familiar location — your workplace, school, or a route you walk regularly. Identify 10 stations in order. Write them down. Walk the journey three times mentally. Then create a bridging image: at the last station of your first journey (bedroom window), place a vivid image that contains one element from that station and one element from the first station of your second journey. The bridge should be dramatic and physically impossible — this makes it memorable. Walk through both journeys mentally three times, crossing the bridge. You now have 20 stations in a linked network. This is the beginning of your permanent memory architecture.`,
      duration:        '25 minutes',
    },
    {
      id:              'obrien-05',
      stepNumber:      5,
      title:           'The Memory Zone — Training Your Focus',
      lesson:          `The Memory Zone is the mental state in which images form instantly, vividly, and automatically without conscious effort. It is identical to what psychologist Mihaly Csikszentmihalyi called Flow. In the Memory Zone, encoding is effortless and retrieval is instantaneous. Outside the Zone, encoding is laborious and retrieval is uncertain. I enter the Memory Zone through a brief ritual before every practice session and every competition: three slow breaths, eyes closed, and a vivid mental image of the entrance to my first memory palace. This ritual signals to my brain that we are shifting into encoding mode. Within 30 seconds, the Zone opens. Every image I encounter goes directly into a journey station without conscious effort. Training your ability to enter the Zone on demand is as important as training the techniques themselves.`,
      practicalAction: 'Practice entering the Memory Zone',
      actionPrompt:    `Create your personal Zone entry ritual. It should take 30-60 seconds and involve: physical stillness (sitting or standing comfortably), controlled breathing (three slow breaths, inhale 4 counts, hold 2, exhale 6), a mental anchor (a vivid image of the entrance to your first memory journey — see it in full color and detail), and an intention statement (said internally: "I am ready to remember"). Practice this ritual 3 times right now without any memory task. On the third attempt, notice the quality of your mental imagery — it should be clearer and more vivid than at first attempt. Do this ritual before every MemoryOS session. Over time, the brain learns to enter the Zone within the first breath.`,
      duration:        '10 minutes',
    },
    {
      id:              'obrien-06',
      stepNumber:      6,
      title:           'Speed Encoding — Building Toward Championship Performance',
      lesson:          `Championship memory performance requires one skill above all others: speed of image formation. A world record requires placing one vivid PAO scene per second. Beginners take 10-30 seconds per image. Intermediates take 3-5 seconds. Experts take 1-2 seconds. The path from beginner to expert is deliberate speed training, exactly like athletic training. I used a metronome set to one beat per 5 seconds for my first sessions. Each week, I increased the tempo slightly. After 18 months of daily practice, I could place a complete PAO scene at one station per second. The key is that speed is not about rushing. It is about automation. When your PAO system is perfectly memorized and your journey stations are crystal clear, image formation becomes automatic — like reading words instead of decoding letters. Speed is the byproduct of automation. Automation comes from repetition.`,
      practicalAction: 'Begin timed encoding practice',
      actionPrompt:    `Set a timer for 5 minutes. Using your first 10-station journey, place a random image at each station as quickly as possible — aim for one image per 10 seconds initially. After 5 minutes, close your eyes and recall all 10 images in order. Record your time and accuracy. The next day, attempt the same exercise targeting one image per 8 seconds. Decrease by 2 seconds each session. Track your progress. When you can place and recall 10 images with 100% accuracy at one image per 5 seconds, move to a 20-station journey. This timed practice is the single most effective training exercise for building toward championship-level speed.`,
      duration:        '15 minutes',
    },
  ],
};

// ─── GURU 3: HARRY LORAYNE ───────────────────────────────────

export const HARRY_LORAYNE = {
  id:          'harry-lorayne',
  name:        'Harry Lorayne',
  title:       'The Father of Modern Memory Training',
  nationality: 'American',
  born:        '1926',
  died:        '2023',
  icon:        '🔗',
  colorKey:    'sage',
  tagline:     'There is no such thing as a bad memory. Only an untrained one.',
  bio: `Harry Lorayne was an American mnemonist and author widely considered the father of modern memory training. Born in New York City in 1926, he grew up in poverty on the Lower East Side and struggled academically throughout school. He discovered memory techniques as a teenager and used them to transform his academic performance. He performed memory demonstrations on The Tonight Show with Johnny Carson, The Ed Sullivan Show, The Dick Cavett Show, and in Carnegie Hall — where he memorized the name of every person in the audience (over 1,000 people) and recalled them all at the end of the show. His 1957 book How to Develop a Super-Power Memory was the first mass-market memory training book and sold millions of copies worldwide. Over a career spanning 60 years, he authored 63 books and personally performed his memory demonstrations before more than 35 million people. He demonstrated at age 90 that age does not diminish memory capacity when it is properly trained.`,
  philosophy: `Lorayne's philosophy is radical in its simplicity: you cannot remember something you never truly noticed in the first place. All memory failure is awareness failure. His entire system is built on one insight — to remember anything, you must form what he called an Original Awareness at the moment of encounter. An Original Awareness is a vivid, absurd, actively engaged mental image formed at the instant of first contact with the information. Without this original awareness, information passes through the brain like water through a sieve. With it, information is grabbed, held, and accessible for retrieval.`,
  coreTeaching: `Memory is not a storage problem. It is an attention problem. Solve the attention problem and memory solves itself. Every technique in Lorayne's system — the Link System, the Peg System, the Substitute Word System — is an attention engineering tool. Each technique forces you to pay the exact quality of attention that encodes information permanently. The techniques feel like tricks. They are not tricks. They are attention disciplines in disguise.`,

  books: [
    {
      title:     'How to Develop a Super-Power Memory',
      year:      1957,
      summary:   'The foundational text of modern memory training. Introduced the Link System, Peg System, and Original Awareness concept to the general public for the first time.',
      keyLesson: 'You already have a super-power memory. You just have not learned to use it yet.',
    },
    {
      title:     'The Memory Book',
      year:      1974,
      summary:   'Co-authored with Jerry Lucas. Became a #1 New York Times bestseller. Made memory techniques mainstream for the first time in America.',
      keyLesson: 'Memory techniques are not for geniuses. They are for anyone willing to apply them.',
    },
    {
      title:     'Ageless Memory',
      year:      2007,
      summary:   'Written in his 80s, this book demonstrates that memory can improve with age when properly trained. Includes specific techniques for older learners.',
      keyLesson: 'Age does not weaken memory. Disuse weakens memory. Training at any age produces results.',
    },
    {
      title:     'Harry Lorayne\'s Page-A-Minute Memory Book',
      year:      1985,
      summary:   'A rapid-application guide for memorizing vocabulary, names, numbers, speeches, and foreign languages using all of Lorayne\'s core techniques.',
      keyLesson: 'Any piece of information can be memorized in the time it takes to read one page — if you apply the right technique.',
    },
  ],

  aiSystemPrompt: `You are Harry Lorayne, the legendary American memory trainer, speaking to your student with the directness, warmth, and humor of a New York showman who has spent 60 years proving that anyone can have a spectacular memory. You are deeply practical — you never waste time on theory that does not immediately translate into action. Every insight you share comes with a specific example and a specific exercise. You reference your television performances, your Carnegie Hall demonstrations, and your thousands of students. You are enthusiastic about the student's potential but completely no-nonsense about the work required. Your motto is your life's work: there is no such thing as a bad memory, only an untrained one. You never let a student believe their memory is fixed or limited.`,

  roadmap: [
    {
      id:              'lorayne-01',
      stepNumber:      1,
      title:           'Original Awareness — The Foundation of All Memory',
      lesson:          `Here is the single most important insight in all of memory training: you cannot remember something you never truly noticed in the first place. Read that again. Most people believe they have a memory problem. They do not. They have an attention problem. When you "forget" where you put your keys, you did not forget — you never noticed where you put them. Your brain cannot store what it never received. The solution is Original Awareness — a vivid, engaged, active mental image formed at the exact moment of first contact with any information. When you form an Original Awareness, you are forcing your brain to receive the information completely. When you do not form one, you are allowing information to pass through your brain like water through open fingers. Every technique in my system is a tool for forming Original Awareness. But the concept itself is the foundation.`,
      practicalAction: 'Practice forming Original Awarenesses',
      actionPrompt:    `For the next 30 minutes, practice forming an Original Awareness for every single thing you encounter. If you put down a pen, form a vivid image of the pen doing something ridiculous at that exact location. If someone tells you their name, immediately form a vivid substitute image for that name. If you read a fact, immediately convert it to a vivid scene. Do not overthink the images — the first image that comes to mind is always the best one. The goal is to develop the habit of instant image formation. After 30 minutes, test yourself: recall every item you placed, every name you heard, every fact you read. You will be astonished by how much you retained.`,
      duration:        '30 minutes',
    },
    {
      id:              'lorayne-02',
      stepNumber:      2,
      title:           'The Link System — Memorize Any List',
      lesson:          `The Link System is the simplest and most immediately applicable memory technique I know. To memorize any ordered list, link each item to the next through a ridiculous, impossible, exaggerated action image. Item 1 does something absurd TO item 2. Item 2 does something absurd TO item 3. And so on. Each link contains exactly two items in vivid interaction. To recall the list, start with item 1 — its interaction with item 2 fires automatically. Item 2 fires item 3. And the chain plays itself. I have memorized shopping lists of 50 items, sequences of 100 objects, and the order of 52 playing cards using nothing but the Link System. The images must be ridiculous, impossible, and in action. If the image is logical and static, it will fade. If it is absurd and moving, it will last for days.`,
      practicalAction: 'Memorize a 10-item list using the Link System',
      actionPrompt:    `Here is a list of 10 random items: TELEPHONE, APPLE, PIANO, ELEPHANT, CLOUD, COFFEE CUP, BICYCLE, MOON, DICTIONARY, FIRE. Using the Link System, create a vivid, ridiculous, action-filled image connecting each item to the next. Item 1 (TELEPHONE) does something absurd to Item 2 (APPLE) — perhaps a giant telephone is eating an apple while ringing loudly. The apple then does something absurd to the piano. Continue through all 10. Write your chain in one paragraph. Then close your eyes and recall the list from memory. Test yourself again in one hour without reviewing. You will get 9-10 correct. This is the Link System working. Practice with a new 10-item list every day this week.`,
      duration:        '20 minutes',
    },
    {
      id:              'lorayne-03',
      stepNumber:      3,
      title:           'The Peg System — Random Access Memory',
      lesson:          `The Link System is perfect for ordered recall — each item triggers the next in sequence. But what if you need to recall item number 7 directly, without running through items 1-6 first? For this, you need the Peg System. The Peg System assigns a permanent image to each number using phonetic sounds: T or D sounds for 1, N for 2, M for 3, R for 4, L for 5, J or SH for 6, K or G for 7, F or V for 8, P or B for 9, S or Z for 0. The classic peg words: 1=TIE, 2=NOAH, 3=MA, 4=RYE, 5=LAW, 6=SHOE, 7=COW, 8=IVY, 9=BEE, 10=TOES. To memorize item 7, interact it with COW. To memorize item 3, interact it with MA. The peg is fixed and permanent. Any new item simply interacts with its peg. The result: you can recall any numbered item instantly without sequential searching.`,
      practicalAction: 'Memorize the first 10 peg words and test them',
      actionPrompt:    `Memorize these 10 peg words through vivid association: 1=TIE (tie around the number 1), 2=NOAH (Noah's Ark has 2 of everything), 3=MA (the M in Ma has 3 strokes), 4=RYE (4 sounds like R), 5=LAW (L is the Roman numeral 50), 6=SHOE (6 looks like a shoe), 7=COW (7 looks like a cow's back leg), 8=IVY (8 looks like ivy vines), 9=BEE (9 looks like a bee with its stinger), 10=TOES (T and S for 10). Test yourself: I say a number, you say the peg word instantly. Practice until all 10 are automatic. Then use them: pick 10 facts you want to remember, assign one to each peg, and interact them vividly. Recall 3 facts: what is fact 7? What is fact 3? What is fact 9?`,
      duration:        '25 minutes',
    },
    {
      id:              'lorayne-04',
      stepNumber:      4,
      title:           'Names and Faces — Never Forget a Person Again',
      lesson:          `Forgetting names is the number one memory complaint in the world. I have spent 60 years solving this problem. The solution is a four-step process: Step 1 — Get the name clearly. Most people forget names because they never heard them properly in the first place. Repeat the name immediately in conversation. Step 2 — Find one outstanding facial feature. Every face has one feature that stands out — a prominent nose, deep-set eyes, a wide forehead. Find it and commit to it. Do not change it. Step 3 — Convert the name to a vivid Substitute Image using sound-alike words. John = a toilet. Smith = a blacksmith's anvil. Margaret = a sailor who marries and greets. Step 4 — Link the Substitute Image to the outstanding facial feature in a ridiculous action. The feature triggers the substitute image which translates back to the name. Practice this sequence until it takes under 5 seconds.`,
      practicalAction: 'Practice the name-face system with 5 names',
      actionPrompt:    `Look at 5 people in your environment (or find 5 photos online). For each person: write their name, identify their single most outstanding facial feature, create a vivid substitute image for their name, and write a one-sentence connecting image linking the substitute to the feature. Example: Robert has a large forehead. Robert sounds like ROBOT. Image: a ROBOT is crashing through his large FOREHEAD. Practice until you can complete the full four steps for one person in under 10 seconds. This is the speed required for real-world social use. Test yourself the following day by looking at the photos and recalling each name.`,
      duration:        '25 minutes',
    },
    {
      id:              'lorayne-05',
      stepNumber:      5,
      title:           'The Substitute Word System — Memorize the Abstract',
      lesson:          `The biggest challenge in memory training is not memorizing concrete objects — anyone can picture an apple or a bicycle. The challenge is memorizing abstract concepts, unfamiliar terms, foreign words, and technical vocabulary. The Substitute Word System solves this by converting any abstract word into a concrete, visualizable substitute using sound-alike words. The word UBIQUITOUS (meaning everywhere) might become YOU-BIG-QUIT-US — a giant version of yourself quitting something while standing everywhere simultaneously. The substitute does not need to be logical. It only needs to: sound like the original word, be instantly visualizable, and be capable of interacting with the word's meaning. Once you have a substitute image for a word, you can use it in any other memory technique — Link System, Peg System, Memory Palace.`,
      practicalAction: 'Build substitute images for 10 vocabulary words',
      actionPrompt:    `Choose 10 words you need to memorize (vocabulary, foreign language, technical terms — any words). For each word: write the definition, find sound-alike syllables that form a concrete image, create a vivid scene linking the sound-alike image to the meaning. Example: AMELIORATE (to improve) — sounds like A-MEAL-YOU-RATE. Image: a meal so good that you give it a perfect rating, and everything around it improves. Write your 10 substitute images. Test yourself the following day: given only the word, can you recall the meaning? Given only the definition, can you recall the word? The Substitute Word System should produce near-perfect recall in both directions.`,
      duration:        '30 minutes',
    },
    {
      id:              'lorayne-06',
      stepNumber:      6,
      title:           'Memorizing Speeches and Presentations',
      lesson:          `Public speaking from memory is the most valued demonstration of a trained mind. I have delivered hour-long lectures without notes using this system. The method: reduce your speech to its essential structure — main points and sub-points. Convert each main point to a vivid key image using the Substitute Word System. Link all main point images using the Link System. Sub-points hang from their parent image as mini-chains. During delivery, the first image fires automatically from your opening thought. Each subsequent image fires from the previous one. You can give any speech, in any order, recovering instantly from any interruption, because the images are spatially organized — not linearly memorized. The speech does not feel memorized because it was not memorized as words. It was memorized as images, which you then translate back into words in real time.`,
      practicalAction: 'Memorize a 5-point presentation',
      actionPrompt:    `Take any presentation or speech you need to give (or create a 5-point speech about any topic). Write your 5 main points in one sentence each. Convert each main point to a vivid key image using the Substitute Word System. Link all 5 images using the Link System — each image interacts absurdly with the next. Practice by closing your eyes and running the chain 3 times. Then deliver the speech aloud using only the images as your guide — translate each image back into spoken words in real time. Record yourself. On first attempt, most people deliver a near-perfect speech without notes. This is the system working. Add sub-points by hanging short mini-chains from each main image.`,
      duration:        '30 minutes',
    },
  ],
};

// ─── GURU 4: KEVIN TRUDEAU ───────────────────────────────────

export const KEVIN_TRUDEAU = {
  id:          'kevin-trudeau',
  name:        'Kevin Trudeau',
  title:       'Creator of Mega Memory',
  nationality: 'American',
  born:        '1963',
  icon:        '🌊',
  colorKey:    'sky',
  tagline:     'Every human being has a photographic memory. Most people just have not learned how to use it.',
  bio: `Kevin Trudeau is an American author and entrepreneur whose Mega Memory audio program became one of the best-selling memory training products in history, selling millions of copies in the early 1990s through infomercials reaching over 100 million viewers. His approach to memory training was characterized by radical accessibility — he believed that the existing memory training literature was unnecessarily complex and that the core principles could be reduced to three fundamental laws that anyone could apply immediately. His programs made memory techniques available to mainstream audiences who had never heard of mnemonics, pegging, or the memory palace. Despite the controversies surrounding other aspects of his career, his memory training content remains widely regarded as effective and well-structured for beginners.`,
  philosophy: `Trudeau believed that the educational system had committed a systematic error by teaching students WHAT to learn but never HOW to learn. He called this the Memory Revolution — his mission to restore the natural memory capacity that every human being possesses but most have never been taught to use. His core claim: every human being already has a photographic memory. The question is not whether you have the capacity — you do. The question is whether you have been taught the access code.`,
  coreTeaching: `Three laws govern all memory. Law 1: You only remember things that are unusual, illogical, or exaggerated — normal things are filtered out by the brain as unimportant. Law 2: You only remember new information if you associate it with something you already know — the brain learns exclusively by making connections. Law 3: You only remember what you truly focus on — divided attention produces zero retention. Every memory technique in history is an application of one or more of these three laws. Master the laws and you master memory.`,

  books: [
    {
      title:     'Mega Memory',
      year:      1991,
      summary:   'The foundational audio program that introduced the Number Alphabet, Room System, and three laws of memory to millions of people through infomercial distribution.',
      keyLesson: 'The three laws of memory are the master key. Apply them to anything.',
    },
    {
      title:     'Mega Speed Reading',
      year:      1993,
      summary:   'Companion program to Mega Memory covering speed reading, comprehension, and information retention from books.',
      keyLesson: 'Reading faster while understanding more is not a contradiction. It is the natural result of active engagement.',
    },
  ],

  aiSystemPrompt: `You are Kevin Trudeau, creator of the Mega Memory program, speaking to your student with the high energy, directness, and accessibility that characterized your infomercial teaching style. You believe completely and passionately that every human being already has a photographic memory and simply needs to be shown how to activate it. You are enthusiastic, encouraging, and you break everything down into the simplest possible components. You always return to your three laws. You make every concept feel immediately actionable. You speak quickly and confidently. You use lots of examples from everyday life. You never use academic language when plain language will do. Your goal is to make the student feel that extraordinary memory is already within their reach — today, not after months of practice.`,

  roadmap: [
    {
      id:              'trudeau-01',
      stepNumber:      1,
      title:           'The Three Laws of Memory',
      lesson:          `Everything you will ever learn about memory comes from three laws. Law 1 — Unusual: Your brain filters out the ordinary. It is biologically programmed to ignore things that are normal, expected, and logical — because normal things do not require special attention for survival. Your brain only assigns priority storage to things that are unusual, illogical, exaggerated, or unexpected. This means every memory technique must make information unusual. Law 2 — Association: The brain stores information as a network of connections. A new piece of information with no connections to existing knowledge is almost impossible to retain. A new piece of information connected to something already known becomes immediately accessible. Every memory technique must associate the new with the known. Law 3 — Focus: Your brain can only encode what it fully receives. Half-attention produces zero retention. Full focused attention is the prerequisite for all memory. Every memory technique forces complete focus by requiring active image creation.`,
      practicalAction: 'Apply the three laws to three facts',
      actionPrompt:    `Write down three facts you need to remember. For each fact, apply all three laws: UNUSUAL — what can you add to make this fact bizarre, exaggerated, and impossible? ASSOCIATION — what do you already know that this connects to? How can you make that connection visual? FOCUS — close your eyes and hold the complete image in mind for 5 seconds without distraction. Write your three enhanced facts. Test yourself one hour later. Compare your recall of the enhanced facts to any other facts you tried to memorize the conventional way today. The difference in retention will be dramatic.`,
      duration:        '15 minutes',
    },
    {
      id:              'trudeau-02',
      stepNumber:      2,
      title:           'The Number Alphabet — Numbers to Words to Images',
      lesson:          `Numbers are the hardest thing to memorize because they are completely abstract. There is no image for the number 7. There is no smell, no color, no texture. But once you convert 7 into a word — and that word into an image — the number becomes as memorable as any concrete object. The Number Alphabet assigns a consonant sound to each digit: 0=S/Z, 1=T/D, 2=N, 3=M, 4=R, 5=L, 6=J/CH/SH, 7=K/G, 8=F/V, 9=P/B. Vowels have no number value — they are free to use as connectors. So the number 1984 becomes T,N,F,R — which can form the word DINNER (D=1, N=2, R=4, and we add a vowel to make the word flow). The word DINNER creates an instant vivid image. The number 1984 is now encoded as a plate of dinner — completely unforgettable.`,
      practicalAction: 'Memorize your first number using the Number Alphabet',
      actionPrompt:    `Choose a number you need to memorize — a phone number, PIN, date, or any sequence. Convert it to pairs of digits. Convert each pair to consonant sounds using the Number Alphabet. Add vowels to form real words. Convert each word to a vivid image. Link the images using the Link System. Test yourself immediately and again in one hour. For a four-digit PIN: the consonants for 7264 are K/G, N, J/SH, R — which could form the word GINGER (G=7, N=2, J=6, R=4). A vivid image of ginger root becomes your PIN. Visualize ginger doing something ridiculous at your ATM. The PIN is now encoded and accessible.`,
      duration:        '20 minutes',
    },
    {
      id:              'trudeau-03',
      stepNumber:      3,
      title:           'The Room System — Your Built-in Memory Palace',
      lesson:          `The Room System is my simplified version of the Memory Palace — designed to be immediately usable without weeks of preparation. Your home already contains your Room System. Living room is Room 1. Kitchen is Room 2. Bathroom is Room 3. Bedroom is Room 4. Garage or another room is Room 5. Within each room, identify 10 fixed stations in a consistent order. This gives you 50 permanent memory stations available immediately, without constructing any artificial journeys. The stations should be memorable objects or areas: sofa, television, coffee table, bookshelf, plant, window, lamp, door, rug, ceiling fan. Each station holds one memory image. New information goes in, old information clears out. The Room System is infinitely reusable.`,
      practicalAction: 'Set up your personal Room System',
      actionPrompt:    `Walk through your home and assign stations to your first two rooms. Room 1 (Living Room): list 10 specific objects or areas in order as you would naturally scan the room. Room 2 (Kitchen): list 10 specific objects or areas. Write both lists. Memorize them by walking through each room mentally 3 times, naming each station. Then test the system: I will give you 10 random items to place in Room 1 using vivid images. Place one item at each station. Close your eyes and recall all 10 items in order by mentally walking Room 1. After this exercise, you will have direct experience of the Room System working and be ready to use it for any real-world memory task.`,
      duration:        '20 minutes',
    },
    {
      id:              'trudeau-04',
      stepNumber:      4,
      title:           'Book Memory — Store an Entire Book in Your Mind',
      lesson:          `Reading a book and retaining it are two entirely different activities. Most people read and retain 5-10% of what they read. Using the three laws and the Room System, you can retain 80-90%. The method: as you read each chapter, identify the 5 most important ideas. Convert each idea to a vivid image using the three laws — make it unusual, associate it with something known, focus completely. Link the 5 images into a mini-story. Place the mini-story at one station in your Room System — one chapter, one station. A 20-chapter book requires 20 stations. Reviewing the Room System takes 5 minutes and reconstructs the entire book's main ideas. This method does not replace reading. It captures what reading reveals.`,
      practicalAction: 'Apply book memory to one chapter',
      actionPrompt:    `Take any chapter from any book you are currently reading (or have recently read). Identify exactly 5 key ideas from that chapter — write them as single sentences. Convert each idea to a vivid unusual image using all three laws. Link the 5 images into a 5-scene mini-story where each scene connects to the next. Place the mini-story at the first station of your Room System (the sofa, for example) — imagine all 5 scenes playing out on and around the sofa. Close your eyes and run the mini-story 3 times. Test yourself tomorrow: without looking at the chapter, can you recall all 5 key ideas? The Room System makes each chapter as memorable as a vivid movie scene.`,
      duration:        '25 minutes',
    },
  ],
};

// ─── GURU 5: JOSHUA FOER ─────────────────────────────────────

export const JOSHUA_FOER = {
  id:          'joshua-foer',
  name:        'Joshua Foer',
  title:       'USA Memory Champion & Science Journalist',
  nationality: 'American',
  born:        '1982',
  icon:        '📘',
  colorKey:    'violet',
  tagline:     'The mind is not a vessel to be filled but a fire to be kindled — by making information spatial, emotional, and alive.',
  bio: `Joshua Foer is an American science journalist who won the 2006 USA Memory Championship after spending one year training with the world's top memory athletes. He documented his journey in the 2011 New York Times bestseller Moonwalking with Einstein: The Art and Science of Remembering Everything. Unlike the other gurus in this section who are professional memory trainers, Foer approached memory from the perspective of a curious journalist — skeptical, scientific, and deeply interested in the cognitive science behind the techniques. His book is unique in that it simultaneously teaches memory techniques and explains the neuroscience, cognitive psychology, and history behind them. He trained under Ed Cooke and Tony Buzan and developed a rigorous deliberate practice regime that took him from zero memory training knowledge to US champion in 12 months.`,
  philosophy: `Foer's central insight is that the ancient Greek and Roman memory techniques — the Method of Loci, vivid imagery, spatial organization — are not tricks or shortcuts. They are the natural expression of how the human brain is actually designed to learn. The brain evolved to remember experiences in space, not abstract information on pages. Every memory technique that works does so by converting abstract information into spatial, sensory, emotional experience — the kind of information the brain evolved to handle. Forgetting is not a failure of memory. It is the brain's refusal to store information that does not feel like an experience.`,
  coreTeaching: `The brain is not designed to remember abstract information. It is extraordinarily well-designed to remember experiences in space. The Memory Palace works not because it is clever, but because it exploits the brain's most ancient and powerful memory system — spatial navigation. When you place information in a familiar space and walk through it, you are using the same neural architecture that allowed your ancestors to navigate landscapes and survive. Converting any information into spatial, vivid, emotional experience is the fundamental act of all memory training.`,

  books: [
    {
      title:     'Moonwalking with Einstein',
      year:      2011,
      summary:   'The story of one journalist\'s transformation from complete beginner to USA Memory Champion in one year. Simultaneously a memoir, a science book, and a practical guide to memory techniques.',
      keyLesson: 'Extraordinary memory is not a gift. It is a learnable skill. And it reveals profound things about what it means to know something.',
    },
  ],

  aiSystemPrompt: `You are Joshua Foer, the American science journalist who became USA Memory Champion in 2011 and wrote Moonwalking with Einstein. You speak with the voice of a thoughtful, curious, slightly self-deprecating journalist who still finds it mildly surreal that he won a memory championship. You combine practical memory technique instruction with fascinating cognitive science and history. You quote research findings, reference your trainers Ed Cooke and Tony Buzan, and occasionally share anecdotes from your championship training year. You are encouraging but realistic — you know from experience exactly how hard the training is and you do not pretend it is easy. You are especially interested in the deeper question: what does it mean to truly know something? Memory training, you believe, changes not just what you remember but how you think.`,

  roadmap: [
    {
      id:              'foer-01',
      stepNumber:      1,
      title:           'Understanding Why You Forget',
      lesson:          `You forget because your brain is working correctly. This sounds paradoxical, but it is true. The human brain evolved to process enormous amounts of sensory information every second. Most of it is irrelevant. The brain's primary job is to filter out irrelevant information, not to store it. What gets stored is determined by the brain's ancient priority system: things that are emotional, spatial, narrative, and social get high-priority encoding. Things that are abstract, decontextualized, and repetitive get filtered out. A phone number has no emotion. It has no location in space. It tells no story. So the brain filters it out within minutes. The remedy is not to try harder to remember the phone number. The remedy is to convert the phone number into something the brain naturally prioritizes: a vivid, emotional, spatial, narrative experience.`,
      practicalAction: 'Identify what your brain naturally remembers',
      actionPrompt:    `Write down 10 things you remember vividly from your past — memories that come back in full sensory detail without effort. Analyze what they have in common. You will discover: they are emotional, they are spatial (you remember WHERE you were), they are social (other people are involved), and they are unusual or unexpected. These are your brain's natural priority signals. Now write 5 things you tried to memorize recently and failed. Analyze why they failed: were they emotional? Spatial? Social? Unusual? Almost certainly not. The gap between what you naturally remember and what you try to force yourself to remember is the gap that memory techniques are designed to close.`,
      duration:        '15 minutes',
    },
    {
      id:              'foer-02',
      stepNumber:      2,
      title:           'The Baker-Baker Paradox — Context is Everything',
      lesson:          `Here is a remarkable finding from cognitive psychology: if you tell someone that a person they just met is a baker, they are far more likely to remember this fact than if you tell them the person's last name is Baker. Same word. Completely different memorability. Why? The word baker-the-occupation connects to a rich network of associations — smell of bread, white apron, early mornings, warmth, flour, rolling pins. The name Baker-the-surname connects to nothing. It is a floating, disconnected piece of information with no hooks. This is the Baker-baker paradox, and it reveals the most important principle in all of memory training: context is not just helpful — it IS memory. The richer the context you build around a piece of information, the more hooks it has for retrieval. Memory techniques work by artificially creating rich contexts around information that naturally has none.`,
      practicalAction: 'Create context for three abstract facts',
      actionPrompt:    `Choose three facts that feel abstract and hard to remember — perhaps scientific terms, historical dates, or vocabulary words. For each fact, build a rich context using this method: place it in a specific location you know well, involve a person you know emotionally, give it a narrative (what happened before? what happened after?), add sensory details (what does it smell like? sound like?), and make it slightly surprising or funny. Write your three contextualized facts as short scenes. Test yourself in one hour. Compare the recall of your contextualized facts to any other facts you tried to remember this week without context. The difference in retention will demonstrate exactly why context is memory.`,
      duration:        '20 minutes',
    },
    {
      id:              'foer-03',
      stepNumber:      3,
      title:           'The OK Plateau — Why Practice Alone is Not Enough',
      lesson:          `Here is a counterintuitive truth discovered by psychologists Bryan and Harter in 1897: practicing a skill does not automatically make you better at it. Once a skill becomes automated — once you can do it without thinking — performance freezes at what they called the OK Plateau. You keep practicing but stop improving. This is why people who have been typing for 20 years are often no faster than those who have been typing for 10. The skill is automated, but it is not improving because automation removes the conscious engagement that drives improvement. The remedy is deliberate practice: practicing specifically at the edges of your current ability, with immediate feedback, focused on one specific improvement target at a time. Memory training produces rapid improvement only when practiced deliberately — with timed exercises, tracked results, and specific targets. Without deliberate practice, memory training stalls at mediocre.`,
      practicalAction: 'Set up a deliberate practice session',
      actionPrompt:    `Choose one memory skill to practice deliberately today — memorizing a list, converting numbers to words, building a memory palace journey. Set a timer for 10 minutes. Your target: push to the edge of your current ability. After 10 minutes, test yourself fully and record your score. Identify where you failed — not just that you forgot something, but precisely which image broke down and why. Modify your image for that specific failure. Practice the modified image 5 times. Test yourself again. Record your improved score. This single session of deliberate practice — identify failure, modify, retest — will produce more improvement than 2 hours of casual practice. Do this every session.`,
      duration:        '20 minutes',
    },
    {
      id:              'foer-04',
      stepNumber:      4,
      title:           'The Memory Palace — Exploiting Ancient Neural Architecture',
      lesson:          `The hippocampus — the brain structure at the center of all memory formation — evolved primarily to encode and navigate spatial environments. It is, at its core, a map-making machine. Neuroscientists John O'Keefe, May-Britt Moser, and Edvard Moser won the 2014 Nobel Prize in Physiology for discovering the cellular mechanisms of this system — place cells that fire when you occupy specific locations, and grid cells that provide the coordinate system for spatial memory. The Memory Palace works because it hijacks this ancient, powerful, neurologically hardwired spatial system and uses it to store arbitrary information. When you place a vivid image at a location in your memory palace and walk through it mentally, you are activating the same neural architecture that your ancestors used to navigate landscapes. This is not a metaphor. Brain imaging studies show that memory athletes using the Memory Palace show dramatically different brain activation patterns than non-trained people, with massive increased activity in the hippocampal-entorhinal system.`,
      practicalAction: 'Build a neuroscience-informed Memory Palace',
      actionPrompt:    `Choose your most familiar location — ideally where you grew up or a place you spent years. Walk through it physically or in detail mentally. Identify 20 stations in a consistent order — the stations must be spatially distinct (different corners of rooms, not adjacent objects). Write your 20 stations in numbered order. Practice walking the route 5 times mentally, spending 2 seconds at each station. The goal is that each station triggers the next automatically. Once the route is automatic, test it: walk it in both directions. Walk it starting from station 10. Name station 17 directly. When you can do all three, your palace is ready to receive information.`,
      duration:        '25 minutes',
    },
    {
      id:              'foer-05',
      stepNumber:      5,
      title:           'Championship Thinking — What Elite Memory Reveals About the Mind',
      lesson:          `After winning the USA Memory Championship, I realized the training had changed more than my memory. It had changed how I think. Here is what championship-level memory training taught me: First, expertise is a form of memory. A chess grandmaster who sees a board position as a small number of strategic chunks and a memory athlete who sees ten random digits as two PAO scenes are both doing the same thing — compressing complexity into meaningful units through practiced pattern recognition. Second, to truly know something is to be able to recall it, apply it, and connect it to other knowledge on demand. Passive recognition is not knowledge. Third, the ancient memory techniques are not cheats or workarounds. They are the natural expression of how minds work. The students who use them are not outsmarting the system — they are finally using the system correctly.`,
      practicalAction: 'Reflect on your memory training transformation',
      actionPrompt:    `After completing the previous four steps, take 15 minutes to write answers to these questions: What is the most surprising thing you have discovered about how your memory works? What piece of information have you successfully encoded using a memory technique that you could not have retained by conventional means? How has the act of creating vivid images changed your relationship to the information you are trying to learn? What do you now understand about the difference between reading something and truly knowing it? These reflections are not exercises — they are the beginning of a permanent shift in how you approach all future learning. Write at least one full paragraph for each question.`,
      duration:        '20 minutes',
    },
  ],
};

// ─── GURU REGISTRY ───────────────────────────────────────────

export const GURUS = [
  TONY_BUZAN,
  DOMINIC_OBRIEN,
  HARRY_LORAYNE,
  KEVIN_TRUDEAU,
  JOSHUA_FOER,
];

export const GURU_REGISTRY = Object.fromEntries(
  GURUS.map(g => [g.id, g])
);

export function getGuru(id) {
  return GURU_REGISTRY[id];
}

export function getAllGurus() {
  return GURUS;
}
