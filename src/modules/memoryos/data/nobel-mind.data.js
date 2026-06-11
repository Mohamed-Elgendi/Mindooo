// ============================================================
// MEMORYOS — NOBEL MIND DATA
// Version: 1.0.0
//
// 6 domains × combined great minds
// Each domain: mental models + thinkers + memorizable cards
// + thinking exercises + connection to box system
// ============================================================

// ─── TYPES ───────────────────────────────────────────────────









// ─── DOMAIN 1: SCIENTIFIC THINKING ──────────────────────────

export const SCIENTIFIC_THINKING = {
  id:       'scientific-thinking',
  label:    'Scientific Thinking',
  icon:     '🔬',
  colorKey: 'teal',
  tagline:  'The most powerful method humans have ever devised for understanding reality.',
  description: 'The mental frameworks, reasoning patterns, and epistemic habits shared by the greatest scientists in history. Learning to think like a scientist transforms how you evaluate evidence, form hypotheses, and update your beliefs in every area of life.',

  thinkers: [
    { name: 'Richard Feynman',  years: '1918-1988', nationality: 'American', field: 'Physics',    tagline: 'If you cannot explain it simply, you do not understand it.',         coreIdea: 'First principles thinking and the pleasure of finding things out.' },
    { name: 'Albert Einstein',  years: '1879-1955', nationality: 'German',   field: 'Physics',    tagline: 'Imagination is more important than knowledge.',                     coreIdea: 'Thought experiments as the primary tool of scientific discovery.' },
    { name: 'Marie Curie',      years: '1867-1934', nationality: 'Polish',   field: 'Chemistry',  tagline: 'Nothing in life is to be feared, only to be understood.',          coreIdea: 'Rigorous empirical methodology and the refusal to accept unexamined assumptions.' },
    { name: 'Charles Darwin',   years: '1809-1882', nationality: 'British',  field: 'Biology',    tagline: 'A man who dares to waste one hour of time has not discovered the value of life.', coreIdea: 'Patient observation over decades as the foundation of revolutionary theory.' },
    { name: 'Carl Sagan',       years: '1934-1996', nationality: 'American', field: 'Astronomy',  tagline: 'Extraordinary claims require extraordinary evidence.',               coreIdea: 'The baloney detection kit — tools for skeptical thinking.' },
  ],

  cards: [
    {
      id:       'sci-001',
      title:    'First Principles Thinking',
      icon:     '🧱',
      colorKey: 'teal',
      thinkers: ['Richard Feynman', 'Aristotle'],
      unit:     'First principles thinking breaks a problem down to its fundamental truths — the irreducible facts that cannot be derived from anything else — and reasons upward from there. It bypasses assumptions, conventions, and analogies. Where conventional thinking asks "what has always been done?" first principles thinking asks "what is actually true?" Elon Musk used first principles to conclude that rocket components were mostly aluminum, steel, and aerospace-grade alloys — not $50 million per launch in magic materials. The rockets cost $500,000 to build from first principles. First principles thinking is the engine of every paradigm shift in the history of science.',
      keyPoints: ['Break to irreducible facts', 'Bypass assumptions and analogies', 'Reason upward from truth', 'Engine of paradigm shifts'],
    },
    {
      id:       'sci-002',
      title:    'The Scientific Method',
      icon:     '🔁',
      colorKey: 'sky',
      thinkers: ['Francis Bacon', 'Karl Popper', 'Marie Curie'],
      unit:     'The scientific method proceeds through five stages: observation (notice a phenomenon), hypothesis (propose an explanation that makes testable predictions), experiment (design a test that could falsify the hypothesis), analysis (examine results without bias), and conclusion (update the hypothesis or reject it based on evidence). Karl Popper\'s critical addition: a hypothesis that cannot be falsified is not science. Unfalsifiable claims — those that can accommodate any possible evidence — are immune to disproof and therefore immune to progress. Falsifiability is not a weakness. It is the definition of scientific knowledge.',
      keyPoints: ['Observation → Hypothesis → Experiment → Analysis → Conclusion', 'Falsifiability required (Popper)', 'Unfalsifiable = not science', 'Update beliefs based on evidence'],
    },
    {
      id:       'sci-003',
      title:    'Feynman\'s Learning Technique',
      icon:     '📝',
      colorKey: 'sage',
      thinkers: ['Richard Feynman'],
      unit:     'The Feynman Technique has four steps: choose a concept, explain it in plain language as if teaching a child, identify every point where your explanation breaks down or becomes vague, and return to the source material to fill exactly those gaps. Repeat until your explanation contains no vague points. Feynman\'s insight was that the ability to explain something simply is the test of genuine understanding, not the possession of technical vocabulary. Technical vocabulary is often a way of hiding from yourself that you do not truly understand. Simplicity is the proof.',
      keyPoints: ['Step 1: Choose concept', 'Step 2: Explain simply', 'Step 3: Find vague points', 'Step 4: Fill gaps → repeat'],
    },
    {
      id:       'sci-004',
      title:    'Sagan\'s Baloney Detection Kit',
      icon:     '🛡️',
      colorKey: 'amber',
      thinkers: ['Carl Sagan'],
      unit:     'Carl Sagan\'s Baloney Detection Kit is a set of cognitive tools for skeptical thinking: independent confirmation of facts, open debate by knowledgeable proponents, no arguments from authority, more than one hypothesis considered, no over-attachment to a hypothesis, quantification of claims where possible, testing every link in the argument chain, and Occam\'s Razor — if two explanations explain equally well, prefer the simpler one. Most importantly: extraordinary claims require extraordinary evidence. The kit is not cynicism. It is the minimum intellectual hygiene required for accurate beliefs about a complex world.',
      keyPoints: ['Independent confirmation', 'No argument from authority', 'Multiple hypotheses', 'Extraordinary claims need extraordinary evidence'],
    },
    {
      id:       'sci-005',
      title:    'The Thought Experiment',
      icon:     '💭',
      colorKey: 'violet',
      thinkers: ['Albert Einstein', 'Galileo', 'Newton'],
      unit:     'A thought experiment is a hypothetical scenario constructed in the mind to explore the logical consequences of a principle without requiring physical apparatus. Einstein discovered special relativity by imagining what it would look like to ride alongside a beam of light at its own speed. Galileo refuted Aristotle\'s gravity theory by imagining two balls of different weights tied together — the combined object would both fall faster (heavier) and slower (lighter) than either alone, which is a contradiction. Newton developed calculus partly through thought experiments about instantaneous rates of change. The thought experiment is the primary creative tool of theoretical science.',
      keyPoints: ['Hypothetical scenario in the mind', 'Explore logical consequences', 'No physical apparatus needed', 'Primary tool of theoretical science'],
    },
  ],

  exercises: [
    {
      id:       'sci-ex-01',
      title:    'First Principles Deconstruction',
      prompt:   'Choose a belief you hold about learning, productivity, or education. Deconstruct it to first principles: what assumptions are you taking for granted? What would you conclude if you started only from verified facts? Write your deconstruction in 200 words.',
      duration: '15 minutes',
    },
    {
      id:       'sci-ex-02',
      title:    'Feynman Test',
      prompt:   'Choose any concept from your Knowledge Archive. Without looking at the card, explain it as simply as possible in writing — as if explaining to a 12-year-old. Identify every point where your explanation becomes vague. Those gaps are exactly what you do not yet fully understand.',
      duration: '20 minutes',
    },
  ],
};

// ─── DOMAIN 2: MATHEMATICAL THINKING ────────────────────────

export const MATHEMATICAL_THINKING = {
  id:       'mathematical-thinking',
  label:    'Mathematical Thinking',
  icon:     '∑',
  colorKey: 'gold',
  tagline:  'Mathematics is not about numbers. It is about patterns, structures, and the logic of necessity.',
  description: 'The reasoning patterns, problem-solving frameworks, and mental models that separate mathematical thinkers from everyone else. Mathematical thinking is not arithmetic — it is the discipline of finding patterns, proving certainty, and reasoning about abstract structures.',

  thinkers: [
    { name: 'Leonhard Euler',     years: '1707-1783', nationality: 'Swiss',    field: 'Mathematics',    tagline: 'The most prolific mathematician in history.',                      coreIdea: 'Mathematical beauty as a guide to truth — aesthetics in proof.' },
    { name: 'Srinivasa Ramanujan',years: '1887-1920', nationality: 'Indian',   field: 'Mathematics',    tagline: 'An equation for me has no meaning unless it represents a thought of God.', coreIdea: 'Intuition as a legitimate mathematical instrument.' },
    { name: 'John von Neumann',   years: '1903-1957', nationality: 'Hungarian',field: 'Mathematics',    tagline: 'In mathematics you do not understand things. You just get used to them.', coreIdea: 'Game theory, computing architecture, and the mathematics of complexity.' },
    { name: 'Terence Tao',        years: '1975-',     nationality: 'Australian',field: 'Mathematics',   tagline: 'The Mozart of mathematics.',                                       coreIdea: 'Collaborative mathematics and the systematic decomposition of hard problems.' },
    { name: 'Euclid',             years: '300 BC',    nationality: 'Greek',    field: 'Geometry',       tagline: 'There is no royal road to geometry.',                              coreIdea: 'The axiomatic method — building all knowledge from a small set of self-evident truths.' },
  ],

  cards: [
    {
      id:       'math-001',
      title:    'The Axiomatic Method',
      icon:     '📐',
      colorKey: 'gold',
      thinkers: ['Euclid', 'David Hilbert'],
      unit:     'The axiomatic method builds an entire system of knowledge from a minimal set of axioms — self-evident truths that require no proof — using only logical deduction. Euclid\'s Elements constructed all of geometry from five axioms. From these five statements, 465 theorems follow with absolute certainty. The method\'s power is that it converts uncertainty into necessity: if you accept the axioms, you must accept every theorem derived from them. The method\'s limitation, discovered by Gödel in 1931, is that any axiomatic system complex enough to include arithmetic must contain true statements it cannot prove. This is Gödel\'s Incompleteness Theorem — the most stunning result in the history of logic.',
      keyPoints: ['Start from minimal axioms', 'Build by logical deduction', 'Results are necessarily true', 'Gödel: all systems have unprovable truths'],
    },
    {
      id:       'math-002',
      title:    'Abstraction — The Mathematical Superpower',
      icon:     '🔺',
      colorKey: 'amber',
      thinkers: ['Emmy Noether', 'Leonhard Euler'],
      unit:     'Mathematical abstraction is the process of stripping away specific details to reveal the underlying structure that multiple situations share. When you abstract "3 apples + 2 apples = 5 apples" to "3 + 2 = 5," you reveal a structure that applies to any three things and any two things in the universe. Abstraction multiplies the power of every insight: solve a problem at the abstract level and you have simultaneously solved every specific instance. Emmy Noether\'s theorem, considered by Einstein the most important mathematical discovery in modern physics, showed that every conservation law in physics (conservation of energy, momentum, charge) corresponds exactly to a symmetry of the underlying equations. One abstract insight. Infinite physical consequences.',
      keyPoints: ['Strip away specifics', 'Reveal underlying structure', 'Solve abstract = solve all instances', 'Noether: symmetry ↔ conservation laws'],
    },
    {
      id:       'math-003',
      title:    'Proof by Contradiction',
      icon:     '⚡',
      colorKey: 'rose',
      thinkers: ['Euclid', 'Georg Cantor'],
      unit:     'Proof by contradiction (reductio ad absurdum) assumes the opposite of what you want to prove, then shows that this assumption leads to a logical contradiction. Since a contradiction cannot be true, the opposite assumption must be false — which means the original claim must be true. Euclid used it to prove there are infinitely many prime numbers: assume there are finitely many, multiply them all together and add 1, the resulting number is not divisible by any prime in your list (always leaves remainder 1), contradiction — there must be more primes. Cantor used it to prove that some infinities are larger than others. The technique turns the enemy\'s strength against itself.',
      keyPoints: ['Assume the opposite', 'Derive a contradiction', 'Therefore original claim is true', 'Used for infinity, primes, irrationality'],
    },
    {
      id:       'math-004',
      title:    'Game Theory — The Mathematics of Strategy',
      icon:     '♟️',
      colorKey: 'sky',
      thinkers: ['John von Neumann', 'John Nash'],
      unit:     'Game theory is the mathematical study of strategic decision-making between rational agents whose outcomes depend on each other\'s choices. John Nash\'s equilibrium concept — for which he won the Nobel Prize in Economics — describes a state where no player can improve their outcome by unilaterally changing their strategy, given what all other players are doing. Nash equilibria explain price wars, arms races, traffic patterns, evolutionary biology, and international relations. The Prisoner\'s Dilemma demonstrates why rational individual choices can produce collectively irrational outcomes. Game theory reveals that rationality is not a sufficient condition for cooperation — and that cooperation requires either communication, reputation, or institutional design.',
      keyPoints: ['Strategic decisions with interdependent outcomes', 'Nash Equilibrium: no unilateral improvement possible', 'Prisoner\'s Dilemma: individual rationality ≠ collective rationality', 'Explains arms races, markets, evolution'],
    },
    {
      id:       'math-005',
      title:    'The Power of Compounding',
      icon:     '📈',
      colorKey: 'sage',
      thinkers: ['Jacob Bernoulli', 'Albert Einstein'],
      unit:     'Compound growth is exponential growth — growth applied to a base that itself grows. The formula is A = P(1+r)^t where P is principal, r is rate, t is time. Einstein allegedly called compound interest the eighth wonder of the world. The counterintuitive feature of compounding is that results are negligible in the early stages and overwhelming in the late stages. A 1% daily improvement compounds to 37.78x improvement over a year. A 1% daily decline compounds to 0.03x — nearly nothing — over the same year. The key insight is that compounding rewards patience and punishes impatience: you must invest consistently through the period of negligible results to reach the period of overwhelming ones.',
      keyPoints: ['A = P(1+r)^t', 'Exponential, not linear growth', 'Negligible early, overwhelming late', '1% daily improvement = 37.78x per year'],
    },
  ],

  exercises: [
    {
      id:       'math-ex-01',
      title:    'Abstract Pattern Finder',
      prompt:   'Find a problem in your daily life — a decision, a recurring challenge, a system. Abstract it to its mathematical structure: what are the variables? What are the constraints? What is being optimized? Write the abstract structure, then solve it at the abstract level. Apply the solution back to the specific problem.',
      duration: '20 minutes',
    },
    {
      id:       'math-ex-02',
      title:    'Game Theory Analysis',
      prompt:   'Choose a recurring conflict or negotiation in your life. Map it as a game: who are the players? What are their possible strategies? What are the payoffs for each combination of strategies? Is there a Nash Equilibrium? Is there a Prisoner\'s Dilemma structure? What does this reveal about why the situation keeps recurring?',
      duration: '25 minutes',
    },
  ],
};

// ─── DOMAIN 3: ECONOMIC THINKING ────────────────────────────

export const ECONOMIC_THINKING = {
  id:       'economic-thinking',
  label:    'Economic Thinking',
  icon:     '💡',
  colorKey: 'amber',
  tagline:  'Economics is not about money. It is about how people make decisions under scarcity.',
  description: 'The decision-making frameworks, incentive analysis tools, and systems thinking models from the greatest economic minds. Economic thinking transforms how you see choices, costs, incentives, and systems in every area of life.',

  thinkers: [
    { name: 'Adam Smith',         years: '1723-1790', nationality: 'Scottish', field: 'Economics',         tagline: 'It is not from the benevolence of the butcher that we expect our dinner.',  coreIdea: 'The invisible hand — how self-interest produces social coordination.' },
    { name: 'John Maynard Keynes',years: '1883-1946', nationality: 'British',  field: 'Economics',         tagline: 'In the long run we are all dead.',                                        coreIdea: 'Aggregate demand and the role of government in stabilizing economies.' },
    { name: 'Friedrich Hayek',    years: '1899-1992', nationality: 'Austrian', field: 'Economics',         tagline: 'The curious task of economics is to demonstrate how little we know.',      coreIdea: 'The knowledge problem and the impossibility of central planning.' },
    { name: 'Daniel Kahneman',    years: '1934-2024', nationality: 'Israeli',  field: 'Behavioral Econ',   tagline: 'We are prone to overestimate how much we understand about the world.',      coreIdea: 'System 1 and System 2 thinking, cognitive biases, and prospect theory.' },
    { name: 'Charlie Munger',     years: '1924-2023', nationality: 'American', field: 'Practical Wisdom',  tagline: 'Invert, always invert.',                                                  coreIdea: 'Mental models as the foundation of worldly wisdom.' },
  ],

  cards: [
    {
      id:       'econ-001',
      title:    'Opportunity Cost — The True Cost of Every Choice',
      icon:     '🔄',
      colorKey: 'amber',
      thinkers: ['Adam Smith', 'Frédéric Bastiat'],
      unit:     'Opportunity cost is the value of the next best alternative you give up when making any choice. It is the true cost of every decision — not just what you spend, but what you could have done instead. Frédéric Bastiat called this the seen and the unseen: economists see both what happens as a result of a decision (the seen) and what would have happened under the alternative (the unseen). Most people see only the seen. When a government builds a bridge, the seen is the bridge. The unseen is everything that same money could have produced elsewhere. Every choice closes off alternatives. The discipline is to make those alternatives visible before choosing.',
      keyPoints: ['Value of next best alternative foregone', 'True cost = spending + alternatives lost', 'Bastiat: the seen and the unseen', 'Make the unseen visible before deciding'],
    },
    {
      id:       'econ-002',
      title:    'Incentives — The Master Key',
      icon:     '🔑',
      colorKey: 'gold',
      thinkers: ['Charlie Munger', 'Adam Smith'],
      unit:     'Show me the incentives and I will show you the outcome. This is Charlie Munger\'s master principle. People respond to incentives with remarkable predictability, whether those incentives are financial, social, or psychological. The cobra effect — where a British colonial government in India offered bounties for dead cobras, causing people to breed cobras for the bounty — illustrates how well-intentioned incentive systems produce perverse outcomes. Before implementing any policy, hiring any person, designing any system, or choosing any relationship structure, ask: what are the incentives? What behavior do those incentives actually reward? And what unintended behavior might they produce?',
      keyPoints: ['People respond predictably to incentives', 'Financial, social, and psychological incentives all work', 'Cobra effect: good intentions + wrong incentives = perverse outcomes', 'Always ask: what does this system actually reward?'],
    },
    {
      id:       'econ-003',
      title:    'System 1 and System 2 — Two Ways of Thinking',
      icon:     '🧠',
      colorKey: 'violet',
      thinkers: ['Daniel Kahneman', 'Amos Tversky'],
      unit:     'Daniel Kahneman\'s Nobel Prize-winning framework distinguishes two cognitive systems. System 1 is fast, automatic, intuitive, emotional, and operates below conscious awareness — it handles driving, facial recognition, and gut reactions. System 2 is slow, deliberate, effortful, and logical — it handles arithmetic, careful reasoning, and novel problems. The critical insight: System 1 handles far more cognitive work than we realize, and it is systematically biased. Confirmation bias, anchoring, availability heuristic, and loss aversion all emerge from System 1 operating on problems that actually require System 2. The discipline of good thinking is recognizing when System 1 has taken over problems it cannot handle and deliberately activating System 2.',
      keyPoints: ['System 1: fast, automatic, intuitive, biased', 'System 2: slow, deliberate, effortful, rational', 'Most errors = System 1 handling System 2 problems', 'Discipline = recognizing which system is running'],
    },
    {
      id:       'econ-004',
      title:    'Marginal Thinking — Decisions at the Margin',
      icon:     '➕',
      colorKey: 'teal',
      thinkers: ['Alfred Marshall', 'David Ricardo'],
      unit:     'The most important economic insight for daily decision-making is that decisions should be made at the margin — based on the next unit, not the average or the total. The question is never "is college education worth it?" It is "is one more year of education worth the marginal cost?" The question is never "is this business profitable?" It is "does this additional unit of production add more to revenue than to cost?" Sunk costs — money or time already spent — are irrelevant to marginal decisions because they cannot be recovered. The only relevant question is: given where I am now, what does the next step cost and what does it produce? This eliminates the sunk cost fallacy and produces cleaner decisions.',
      keyPoints: ['Decide based on the NEXT unit, not total or average', 'Marginal benefit vs marginal cost', 'Sunk costs are irrelevant (cannot be recovered)', 'Eliminates the sunk cost fallacy'],
    },
    {
      id:       'econ-005',
      title:    'The Knowledge Problem',
      icon:     '🌐',
      colorKey: 'sky',
      thinkers: ['Friedrich Hayek'],
      unit:     'Hayek\'s most important insight is that economic knowledge is not centralizable. The information required to coordinate a complex economy — prices, preferences, local conditions, capabilities — is dispersed across millions of individuals, no single one of whom possesses more than a tiny fraction. Prices in a free market are not just numbers. They are information signals — compressed, decentralized summaries of the dispersed knowledge of millions of people. When a commodity becomes scarce, its price rises, and this single signal — without any central direction — causes millions of independent people to economize on its use and seek substitutes. No central planner can replicate this because no central planner has access to the dispersed local knowledge that prices encode.',
      keyPoints: ['Economic knowledge is dispersed, not centralizable', 'Prices = compressed information signals', 'Rising prices signal scarcity without central direction', 'Central planning fails because it lacks local knowledge'],
    },
  ],

  exercises: [
    {
      id:       'econ-ex-01',
      title:    'Opportunity Cost Audit',
      prompt:   'List your top three time commitments this week. For each one, identify the opportunity cost — what you would be doing with that time if this commitment did not exist. Is the value of each commitment greater than its opportunity cost? This exercise often reveals that the most time-consuming activities are not the most valuable ones.',
      duration: '15 minutes',
    },
    {
      id:       'econ-ex-02',
      title:    'Incentive System Design',
      prompt:   'Choose a system in your life that is not working — a habit, a relationship dynamic, a work process. Map the current incentives: what does the system currently reward? What behaviors do those rewards actually produce? Redesign the incentive structure so that the behavior you want is what gets rewarded. Write the redesigned system.',
      duration: '20 minutes',
    },
  ],
};

// ─── DOMAIN 4: PHILOSOPHICAL THINKING ───────────────────────

export const PHILOSOPHICAL_THINKING = {
  id:       'philosophical-thinking',
  label:    'Philosophical Thinking',
  icon:     '🦉',
  colorKey: 'violet',
  tagline:  'Philosophy is not an academic subject. It is the practice of thinking clearly about things that matter.',
  description: 'The logical frameworks, epistemological tools, and ethical reasoning patterns from history\'s greatest philosophers. Philosophical thinking develops the capacity to examine assumptions, construct valid arguments, and reason carefully about complex questions.',

  thinkers: [
    { name: 'Aristotle',          years: '384-322 BC', nationality: 'Greek',   field: 'Philosophy',  tagline: 'The whole is greater than the sum of its parts.',                  coreIdea: 'Logic, virtue ethics, and the systematic organization of knowledge.' },
    { name: 'Immanuel Kant',      years: '1724-1804',  nationality: 'German',  field: 'Philosophy',  tagline: 'Act only according to that maxim by which you can at the same time will that it should become a universal law.', coreIdea: 'The categorical imperative and the structure of human knowledge.' },
    { name: 'Karl Popper',        years: '1902-1994',  nationality: 'Austrian',field: 'Philosophy',  tagline: 'Our knowledge can only be finite, while our ignorance must necessarily be infinite.', coreIdea: 'Falsifiability, the open society, and the theory of piecemeal social engineering.' },
    { name: 'Epictetus',          years: '50-135 AD',  nationality: 'Greek',   field: 'Stoicism',    tagline: 'It is not things that disturb us, but our judgments about things.',  coreIdea: 'The dichotomy of control and equanimity through reason.' },
    { name: 'Bertrand Russell',   years: '1872-1970',  nationality: 'British', field: 'Philosophy',  tagline: 'The whole problem with the world is that fools and fanatics are always so certain of themselves.',coreIdea: 'Analytical philosophy and the importance of uncertainty.' },
  ],

  cards: [
    {
      id:       'phil-001',
      title:    'The Dichotomy of Control',
      icon:     '⚖️',
      colorKey: 'violet',
      thinkers: ['Epictetus', 'Marcus Aurelius'],
      unit:     'The Stoic dichotomy of control divides all things into two categories: things within our control (our judgments, desires, aversions, and voluntary actions) and things outside our control (our bodies, reputations, possessions, and outcomes in the world). Epictetus taught that all suffering comes from failing to observe this distinction — from treating things outside our control as if they were within it. The practice: before every response to a situation, ask "is this within my control?" If yes, act. If no, accept. This does not mean passive resignation — it means directing energy exclusively toward things you can actually influence, which dramatically increases both effectiveness and equanimity.',
      keyPoints: ['Within control: judgments, desires, choices', 'Outside control: body, reputation, outcomes', 'Suffering = treating outside-control things as inside-control', 'Practice: "is this within my control?" before every response'],
    },
    {
      id:       'phil-002',
      title:    'The Categorical Imperative',
      icon:     '🌍',
      colorKey: 'gold',
      thinkers: ['Immanuel Kant'],
      unit:     'Kant\'s categorical imperative is the central principle of his moral philosophy: act only according to principles that you could will to be universal laws — principles that would still make sense if everyone followed them. If it is acceptable for you to lie when convenient, then it must be acceptable for everyone to lie when convenient — but then language loses its function as a communication tool, and lying becomes impossible because no one would believe anyone. The categorical imperative reveals that many self-serving actions are self-contradicting when universalized. It also generates the practical imperative: treat every person as an end in themselves, never merely as a means. People have inherent dignity that cannot be reduced to their usefulness.',
      keyPoints: ['Act only on principles you could universalize', 'Universal lying = lying impossible (contradiction)', 'Treat people as ends, never merely as means', 'Inherent dignity of every person'],
    },
    {
      id:       'phil-003',
      title:    'Logical Fallacies — The Errors of Argument',
      icon:     '🚫',
      colorKey: 'rose',
      thinkers: ['Aristotle', 'Bertrand Russell'],
      unit:     'A logical fallacy is an error in reasoning that makes an argument invalid regardless of whether its conclusion happens to be true. Key fallacies: Ad Hominem (attacking the person rather than the argument), Straw Man (misrepresenting an opponent\'s position to make it easier to attack), False Dichotomy (presenting only two options when more exist), Appeal to Authority (citing authority as proof in place of evidence), Post Hoc (assuming that because A preceded B, A caused B), and Slippery Slope (assuming one step inevitably leads to an extreme endpoint). Recognizing these fallacies in real time — in arguments you hear and arguments you make — is the fundamental skill of critical thinking.',
      keyPoints: ['Ad Hominem: attack person not argument', 'Straw Man: misrepresent to attack easily', 'False Dichotomy: only two options presented', 'Post Hoc: sequence ≠ causation'],
    },
    {
      id:       'phil-004',
      title:    'Epistemic Humility — Knowing What You Do Not Know',
      icon:     '🌫️',
      colorKey: 'sky',
      thinkers: ['Socrates', 'Karl Popper', 'Bertrand Russell'],
      unit:     'Epistemic humility is the intellectual virtue of accurately calibrating the confidence you place in your beliefs — holding beliefs with exactly the strength that the available evidence supports, neither more nor less. Socrates was considered the wisest man in Athens because he alone knew that he knew nothing. Russell argued that the problem with the world is that fools are certain while the wise are full of doubt. Epistemic humility does not mean believing nothing — it means maintaining a clear distinction between what you know, what you believe, and what you merely assume. It also means actively seeking evidence that might disconfirm your beliefs, not just evidence that confirms them.',
      keyPoints: ['Calibrate confidence to evidence', 'Socrates: wisdom = knowing you know nothing', 'Distinguish: know vs believe vs assume', 'Actively seek disconfirming evidence'],
    },
  ],

  exercises: [
    {
      id:       'phil-ex-01',
      title:    'Control Audit',
      prompt:   'List everything causing you stress or anxiety right now. For each item, classify it: within my control, partially within my control, or outside my control. For everything outside your control, write one sentence of acceptance. For everything within your control, write one specific action you will take. Notice how the list becomes shorter and more actionable.',
      duration: '15 minutes',
    },
    {
      id:       'phil-ex-02',
      title:    'Universalization Test',
      prompt:   'Choose three decisions you are currently facing. For each decision, apply the categorical imperative: what principle would guide this decision? Could you will that principle to be universal — that everyone in this situation should follow it? If universalization produces a contradiction or absurdity, the principle is ethically suspect. Write your analysis.',
      duration: '20 minutes',
    },
  ],
};

// ─── DOMAIN 5: SYSTEMS THINKING ─────────────────────────────

export const SYSTEMS_THINKING = {
  id:       'systems-thinking',
  label:    'Systems Thinking',
  icon:     '🔄',
  colorKey: 'sky',
  tagline:  'You cannot understand a system by analyzing its parts in isolation. The whole behaves differently than the sum of its parts.',
  description: 'The frameworks for understanding complex systems — feedback loops, emergence, leverage points, and unintended consequences. Systems thinking transforms how you see organizations, ecosystems, economies, and human behavior.',

  thinkers: [
    { name: 'Donella Meadows',    years: '1941-2001', nationality: 'American', field: 'Systems Science', tagline: 'You think because you understand one you understand two, because one and one make two. But you must also understand and.', coreIdea: 'Leverage points and the structure of complex systems.' },
    { name: 'Peter Senge',        years: '1947-',     nationality: 'American', field: 'Systems Thinking', tagline: 'The language of systems thinking is circles, not straight lines.',             coreIdea: 'The fifth discipline and learning organizations.' },
    { name: 'W. Ross Ashby',      years: '1903-1972', nationality: 'British',  field: 'Cybernetics',    tagline: 'Only variety can absorb variety.',                                               coreIdea: 'The law of requisite variety in complex systems.' },
    { name: 'Jay Forrester',      years: '1918-2016', nationality: 'American', field: 'Systems Dynamics', tagline: 'Counterintuitive behavior is the hallmark of complex systems.',               coreIdea: 'System dynamics and computer modeling of complex systems.' },
  ],

  cards: [
    {
      id:       'sys-001',
      title:    'Feedback Loops — How Systems Talk to Themselves',
      icon:     '🔄',
      colorKey: 'sky',
      thinkers: ['Donella Meadows', 'Norbert Wiener'],
      unit:     'A feedback loop exists when a system\'s output is fed back as input, influencing the system\'s future behavior. Reinforcing feedback loops amplify change — they produce exponential growth or collapse. A bank account earns interest on interest. A viral idea spreads to people who spread it further. Fear causes selling which causes more fear. Balancing feedback loops resist change and maintain stability. A thermostat turns on heating when temperature falls below target, and turns it off when target is reached. Most stable systems contain balancing loops. Most runaway systems contain reinforcing loops with insufficient balancing loops. The first step in understanding any complex situation is mapping its feedback structure.',
      keyPoints: ['Reinforcing loops: amplify change (growth or collapse)', 'Balancing loops: resist change (stability)', 'Runaway systems: reinforcing without sufficient balancing', 'First step: map the feedback structure'],
    },
    {
      id:       'sys-002',
      title:    'Leverage Points — Where to Intervene in a System',
      icon:     '⚡',
      colorKey: 'teal',
      thinkers: ['Donella Meadows'],
      unit:     'Donella Meadows identified 12 leverage points in complex systems, ranked from least to most effective. The counterintuitive finding: the most obvious interventions — changing numbers like tax rates or speed limits — are among the least effective. Far more effective are changing the structure of feedback loops. Most powerful of all: changing the goals of the system, the power to change the paradigm the system operates from, and the ability to question and change paradigms themselves. The highest leverage point is the ability to recognize that paradigms are not reality — they are shared mental models — and that changing them changes everything downstream. This is why ideas are the most powerful force in history.',
      keyPoints: ['Numbers: least leverage', 'Feedback structure: medium leverage', 'Goals and paradigms: highest leverage', 'Ideas change paradigms which change everything'],
    },
    {
      id:       'sys-003',
      title:    'Emergence — The Whole Is Not the Sum of Its Parts',
      icon:     '🌊',
      colorKey: 'violet',
      thinkers: ['Aristotle', 'Stuart Kauffman'],
      unit:     'Emergence is the phenomenon where complex systems exhibit properties and behaviors that none of their individual components possess. Water is wet but neither hydrogen nor oxygen is wet. Consciousness emerges from neurons but no individual neuron is conscious. Traffic jams emerge from individual driving decisions but no individual driver is a traffic jam. Markets exhibit price discovery that no individual participant designed. Emergence explains why you cannot understand a system by analyzing its parts in isolation — the interactions between parts produce properties that exist only at the level of the whole. Reductionist analysis is necessary but insufficient. Systems thinking adds the understanding of emergent wholes.',
      keyPoints: ['Whole exhibits properties that parts do not', 'Water is wet; H and O are not', 'Cannot understand system by parts alone', 'Reductionism necessary but insufficient'],
    },
    {
      id:       'sys-004',
      title:    'Unintended Consequences',
      icon:     '🐍',
      colorKey: 'amber',
      thinkers: ['Robert Merton', 'Friedrich Hayek'],
      unit:     'Sociologist Robert Merton identified five causes of unintended consequences: ignorance (not knowing all the relevant factors), error (applying past experience to situations where it does not apply), the imperious immediate interest (focusing on short-term gain while ignoring long-term effects), basic values that require certain actions regardless of consequences, and self-defeating prophecies (predictions that prevent themselves). The cobra effect — breeding cobras for colonial bounties — illustrates all five. Complex systems produce unintended consequences because they have feedback structures, delays, and nonlinearities that human intuition cannot predict without systematic analysis. The discipline is to map feedback structures before intervening.',
      keyPoints: ['5 causes: ignorance, error, short-termism, values, self-defeating prophecy', 'Cobra effect: intervention produces opposite of intended result', 'Complex systems resist intuitive prediction', 'Map feedback before intervening'],
    },
  ],

  exercises: [
    {
      id:       'sys-ex-01',
      title:    'Feedback Loop Mapping',
      prompt:   'Choose a pattern in your life that keeps repeating — a conflict, a habit, a recurring problem. Draw its feedback structure: what are the key variables? What reinforces the pattern (reinforcing loop)? What resists change (balancing loop)? Where is the delay that makes the system hard to manage in real time? Once you see the structure, identify the highest-leverage intervention point.',
      duration: '25 minutes',
    },
    {
      id:       'sys-ex-02',
      title:    'Pre-Mortem Analysis',
      prompt:   'Choose a plan or decision you are about to implement. Imagine it is one year in the future and the plan has failed completely. Write a detailed explanation of why it failed — be specific. Now identify which failure modes are most likely and what you can change now to prevent them. This exercise (developed by Gary Klein) activates systems thinking before the system produces unintended consequences.',
      duration: '20 minutes',
    },
  ],
};

// ─── DOMAIN 6: LEARNING SCIENCE ─────────────────────────────

export const LEARNING_SCIENCE = {
  id:       'learning-science',
  label:    'Learning Science',
  icon:     '📚',
  colorKey: 'sage',
  tagline:  'How to learn how to learn — the master skill that multiplies every other skill.',
  description: 'The scientific evidence on how humans learn, what makes practice effective, and what study techniques actually work (versus what merely feels productive). Learning science is the foundation that makes all other knowledge acquisition faster, deeper, and more permanent.',

  thinkers: [
    { name: 'Hermann Ebbinghaus',  years: '1850-1909', nationality: 'German',    field: 'Psychology',        tagline: 'It is by no means the same thing to recall a fact once and to remember it again after it has been forgotten.', coreIdea: 'The forgetting curve and the experimental science of memory.' },
    { name: 'Barbara Oakley',      years: '1955-',     nationality: 'American',  field: 'Learning Science',  tagline: 'Focused and diffuse modes of thinking are both essential.',               coreIdea: 'Focused vs diffuse thinking and the neuroscience of learning.' },
    { name: 'Carol Dweck',         years: '1946-',     nationality: 'American',  field: 'Psychology',        tagline: 'In a growth mindset, challenges are exciting rather than threatening.',  coreIdea: 'Fixed vs growth mindset and the malleability of intelligence.' },
    { name: 'Anders Ericsson',     years: '1947-2020', nationality: 'Swedish',   field: 'Psychology',        tagline: 'Expert performance is the product of deliberate practice, not innate talent.', coreIdea: 'Deliberate practice and the 10,000-hour framework.' },
    { name: 'Robert Bjork',        years: '1939-',     nationality: 'American',  field: 'Cognitive Science', tagline: 'Desirable difficulties make learning harder in the short term but stronger in the long term.', coreIdea: 'Desirable difficulties and the science of long-term retention.' },
  ],

  cards: [
    {
      id:       'learn-001',
      title:    'Desirable Difficulties',
      icon:     '💪',
      colorKey: 'sage',
      thinkers: ['Robert Bjork', 'Elizabeth Bjork'],
      unit:     'Desirable difficulties are learning conditions that slow down and complicate the learning process in the short term but produce stronger, more durable, and more transferable knowledge in the long term. The three most important desirable difficulties are: spaced practice (distributing study over time rather than massing it), interleaving (mixing different types of problems rather than practicing one type at a time), and retrieval practice (testing yourself rather than reviewing). All three feel harder and produce worse immediate performance than their alternatives. All three produce dramatically superior long-term retention. The difficulty is not a side effect — it is the mechanism. Struggling to retrieve information strengthens the memory far more than passively reviewing it.',
      keyPoints: ['Short-term difficulty → long-term strength', 'Spaced practice: distribute over time', 'Interleaving: mix problem types', 'Retrieval practice: test, do not review'],
    },
    {
      id:       'learn-002',
      title:    'Deliberate Practice — What Practice Actually Means',
      icon:     '🎯',
      colorKey: 'gold',
      thinkers: ['Anders Ericsson', 'Joshua Foer'],
      unit:     'Deliberate practice is a specific type of practice that produces expert performance: it operates at the edge of current ability, with full concentration, with immediate and informative feedback, and with specific attention to weaknesses rather than strengths. Most practice is not deliberate practice — it is comfortable repetition of what you can already do. Comfortable repetition produces the OK Plateau: performance stabilizes and stops improving despite continued effort. Deliberate practice is uncomfortable by design. It is uncomfortable because it is always operating at the boundary between what you can do and what you cannot yet do. That boundary is where learning happens.',
      keyPoints: ['At the edge of current ability', 'Full concentration required', 'Immediate informative feedback', 'Focus on weaknesses, not strengths'],
    },
    {
      id:       'learn-003',
      title:    'Growth Mindset — Intelligence',
      icon:     '🌱',
      colorKey: 'teal',
      thinkers: ['Carol Dweck'],
      unit:     'Carol Dweck\'s research distinguishes two mindsets. The fixed mindset believes that intelligence, talent, and ability are innate and fixed — you either have them or you do not. The growth mindset believes that intelligence, talent, and ability are developed through effort, strategy, and persistence. These are not just different beliefs — they produce different behaviors. Fixed mindset people avoid challenges (to avoid exposing limitations), give up after setbacks (which confirm their fixed limits), and feel threatened by others\' success. Growth mindset people seek challenges (as opportunities to grow), persist through setbacks (as information about what to try differently), and are inspired by others\' success (as proof that growth is possible). Neuroscience confirms: the brain physically changes through learning. Intelligence is trainable.',
      keyPoints: ['Fixed mindset: ability is innate and fixed', 'Growth mindset: ability is developed through effort', 'Fixed: avoids challenges → Growth: seeks challenges', 'Neuroscience confirms: brain physically changes'],
    },
    {
      id:       'learn-004',
      title:    'The Testing Effect — Why Retrieval Beats Review',
      icon:     '✅',
      colorKey: 'rose',
      thinkers: ['Hermann Ebbinghaus', 'Henry Roediger'],
      unit:     'The testing effect (retrieval practice effect) is one of the most robustly replicated findings in cognitive psychology: actively retrieving information from memory strengthens that memory far more than passively studying or reviewing it. A single retrieval attempt produces 50% better retention one week later than an additional study session. Three retrieval attempts produce nearly 100% better retention. The effect is not merely about assessment — it is about the act of retrieval itself, which actively rebuilds and strengthens neural pathways. This means that every minute spent actively recalling information is approximately 10 times more productive than every minute spent passively re-reading it. The implication: close the book and test yourself constantly.',
      keyPoints: ['Active retrieval > passive review', '1 retrieval = 50% better after 1 week', '3 retrievals = nearly 100% better', 'Retrieval = actively rebuilds neural pathways'],
    },
    {
      id:       'learn-005',
      title:    'Focused and Diffuse Modes',
      icon:     '🔦',
      colorKey: 'sky',
      thinkers: ['Barbara Oakley', 'Santiago Ramón y Cajal'],
      unit:     'The focused mode is a state of tight, directed concentration on a specific problem using familiar neural pathways. The diffuse mode is a relaxed, wide-ranging state of mind that occurs during breaks, exercise, and sleep, during which the brain makes distant connections between disparate ideas. Both modes are essential for learning and problem-solving. Focused mode is needed to engage with material directly. Diffuse mode is needed to integrate it, find patterns across domains, and generate creative insights. The mistake is spending all study time in focused mode without allowing diffuse mode processing. Interleaving focused study with breaks, sleep, and non-demanding activity produces dramatically superior learning outcomes because diffuse mode processing happens automatically during rest.',
      keyPoints: ['Focused: tight concentration on specific problem', 'Diffuse: relaxed wide-ranging connection-making', 'Both essential: focus to engage, diffuse to integrate', 'Sleep and breaks activate diffuse mode automatically'],
    },
  ],

  exercises: [
    {
      id:       'learn-ex-01',
      title:    'Deliberate Practice Design',
      prompt:   'Choose one skill you want to improve. Design a 20-minute deliberate practice session: what is the specific weakness you will target? What would success look like for this session? What feedback mechanism will tell you if you succeeded? After the session, record what you learned about your current ability edge and what you will target next.',
      duration: '20 minutes',
    },
    {
      id:       'learn-ex-02',
      title:    'Mindset Audit',
      prompt:   'Write down three areas of your life where you feel limited. For each area, identify which belief is operating: "I am not smart/talented/capable enough" (fixed) or "I have not yet developed the skills/knowledge/practice required" (growth). Rewrite each fixed mindset statement as a growth mindset statement. Notice how the rewritten statement implies a specific action.',
      duration: '15 minutes',
    },
  ],
};

// ─── NOBEL MIND REGISTRY ─────────────────────────────────────

export const NOBEL_DOMAINS = [
  SCIENTIFIC_THINKING,
  MATHEMATICAL_THINKING,
  ECONOMIC_THINKING,
  PHILOSOPHICAL_THINKING,
  SYSTEMS_THINKING,
  LEARNING_SCIENCE,
];

export const NOBEL_REGISTRY = Object.fromEntries(
  NOBEL_DOMAINS.map(d => [d.id, d])
);

export function getNobelDomain(id) {
  return NOBEL_REGISTRY[id];
}

export function getAllNobelDomains() {
  return NOBEL_DOMAINS;
}

// All Nobel cards as flat array (for use with box system)
export function getAllNobelCards() {
  return NOBEL_DOMAINS.flatMap(d => d.cards);
}
