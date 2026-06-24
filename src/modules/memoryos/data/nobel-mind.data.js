export const SCIENTIFIC_THINKING = {
  id:'scientific-thinking', label:'Scientific Thinking', icon:'🔬', colorKey:'teal',
  tagline:'The most powerful method humans have ever devised for understanding reality.',
  description:'The mental frameworks and reasoning patterns shared by the greatest scientists in history.',
  thinkers:[
    {name:'Richard Feynman',years:'1918-1988',nationality:'American',field:'Physics',tagline:'If you cannot explain it simply, you do not understand it.',coreIdea:'First principles thinking and the pleasure of finding things out.'},
    {name:'Albert Einstein',years:'1879-1955',nationality:'German',field:'Physics',tagline:'Imagination is more important than knowledge.',coreIdea:'Thought experiments as the primary tool of scientific discovery.'},
    {name:'Marie Curie',years:'1867-1934',nationality:'Polish',field:'Chemistry',tagline:'Nothing in life is to be feared, only to be understood.',coreIdea:'Rigorous empirical methodology.'},
    {name:'Carl Sagan',years:'1934-1996',nationality:'American',field:'Astronomy',tagline:'Extraordinary claims require extraordinary evidence.',coreIdea:'The baloney detection kit.'},
  ],
  cards:[
    {id:'sci-001',title:'First Principles Thinking',icon:'🧱',colorKey:'teal',thinkers:['Richard Feynman'],unit:'First principles thinking breaks a problem down to its fundamental truths and reasons upward from there. It bypasses assumptions, conventions, and analogies. Elon Musk used first principles to conclude that rockets could be built for $500,000 from raw materials rather than $50 million by buying assembled components.',keyPoints:['Break to irreducible facts','Bypass assumptions','Reason upward from truth','Engine of paradigm shifts']},
    {id:'sci-002',title:'The Scientific Method',icon:'🔁',colorKey:'sky',thinkers:['Karl Popper'],unit:'The scientific method proceeds through five stages: observation, hypothesis, experiment, analysis, conclusion. Karl Popper\'s critical addition: a hypothesis that cannot be falsified is not science. Unfalsifiable claims are immune to disproof and therefore immune to progress.',keyPoints:['Observation → Hypothesis → Experiment','Falsifiability required','Unfalsifiable = not science','Update beliefs based on evidence']},
    {id:'sci-003',title:'The Feynman Technique',icon:'📝',colorKey:'sage',thinkers:['Richard Feynman'],unit:'Four steps: choose a concept, explain it in plain language as if teaching a child, identify every point where your explanation breaks down, and return to fill exactly those gaps. The ability to explain something simply is the test of genuine understanding.',keyPoints:['Choose concept','Explain simply','Find vague points','Fill gaps and repeat']},
    {id:'sci-004',title:"Sagan's Baloney Detection Kit",icon:'🛡️',colorKey:'amber',thinkers:['Carl Sagan'],unit:'Tools for skeptical thinking: independent confirmation, no arguments from authority, multiple hypotheses, quantification, and Occam\'s Razor. Most importantly: extraordinary claims require extraordinary evidence.',keyPoints:['Independent confirmation','No argument from authority','Multiple hypotheses','Extraordinary claims need extraordinary evidence']},
  ],
  exercises:[
    {id:'sci-ex-01',title:'First Principles Deconstruction',prompt:'Choose a belief about learning. Deconstruct it to first principles: what assumptions are you taking for granted?',duration:'15 minutes'},
    {id:'sci-ex-02',title:'Feynman Test',prompt:'Choose a concept from your Archive. Explain it as simply as possible. Identify every vague point — that is what you do not yet understand.',duration:'20 minutes'},
  ],
};

export const MATHEMATICAL_THINKING = {
  id:'mathematical-thinking', label:'Mathematical Thinking', icon:'∑', colorKey:'gold',
  tagline:'Mathematics is about patterns, structures, and the logic of necessity.',
  description:'The reasoning patterns that separate mathematical thinkers from everyone else.',
  thinkers:[
    {name:'Leonhard Euler',years:'1707-1783',nationality:'Swiss',field:'Mathematics',tagline:'The most prolific mathematician in history.',coreIdea:'Mathematical beauty as a guide to truth.'},
    {name:'John von Neumann',years:'1903-1957',nationality:'Hungarian',field:'Mathematics',tagline:'In mathematics you do not understand things. You just get used to them.',coreIdea:'Game theory and the mathematics of complexity.'},
    {name:'Euclid',years:'300 BC',nationality:'Greek',field:'Geometry',tagline:'There is no royal road to geometry.',coreIdea:'The axiomatic method.'},
  ],
  cards:[
    {id:'math-001',title:'The Axiomatic Method',icon:'📐',colorKey:'gold',thinkers:['Euclid'],unit:"The axiomatic method builds knowledge from a minimal set of self-evident axioms using only logical deduction. Euclid's Elements constructed all of geometry from five axioms, producing 465 theorems with absolute certainty. Gödel proved any system complex enough to include arithmetic must contain unprovable truths.",keyPoints:['Start from minimal axioms','Build by logical deduction','Results are necessarily true',"Gödel: systems have unprovable truths"]},
    {id:'math-002',title:'Abstraction',icon:'🔺',colorKey:'amber',thinkers:['Emmy Noether'],unit:'Mathematical abstraction strips away specific details to reveal underlying structure. Solve a problem at the abstract level and you have simultaneously solved every specific instance. Noether\'s theorem showed every conservation law in physics corresponds to a symmetry.',keyPoints:['Strip away specifics','Reveal underlying structure','Solve abstract = solve all instances','Noether: symmetry and conservation']},
    {id:'math-003',title:'Game Theory',icon:'♟️',colorKey:'sky',thinkers:['John Nash'],unit:"Game theory studies strategic decisions between agents whose outcomes depend on each other's choices. Nash equilibrium describes a state where no player can improve by unilaterally changing strategy. The Prisoner's Dilemma shows rational individual choices can produce collectively irrational outcomes.",keyPoints:['Strategic interdependent outcomes','Nash Equilibrium','Individual vs collective rationality','Explains arms races and markets']},
  ],
  exercises:[
    {id:'math-ex-01',title:'Abstract Pattern Finder',prompt:'Find a daily problem. Abstract it: what are the variables, constraints, and optimization target? Solve at the abstract level.',duration:'20 minutes'},
    {id:'math-ex-02',title:'Game Theory Analysis',prompt:'Map a recurring conflict as a game: players, strategies, payoffs. Is there a Nash Equilibrium?',duration:'25 minutes'},
  ],
};

export const ECONOMIC_THINKING = {
  id:'economic-thinking', label:'Economic Thinking', icon:'💡', colorKey:'amber',
  tagline:'Economics is about how people make decisions under scarcity.',
  description:'Decision-making frameworks from the greatest economic minds.',
  thinkers:[
    {name:'Adam Smith',years:'1723-1790',nationality:'Scottish',field:'Economics',tagline:'It is not from the benevolence of the butcher that we expect our dinner.',coreIdea:'The invisible hand.'},
    {name:'Daniel Kahneman',years:'1934-2024',nationality:'Israeli',field:'Behavioral Econ',tagline:'We overestimate how much we understand the world.',coreIdea:'System 1 and System 2 thinking.'},
    {name:'Charlie Munger',years:'1924-2023',nationality:'American',field:'Practical Wisdom',tagline:'Invert, always invert.',coreIdea:'Mental models as worldly wisdom.'},
  ],
  cards:[
    {id:'econ-001',title:'Opportunity Cost',icon:'🔄',colorKey:'amber',thinkers:['Adam Smith'],unit:'Opportunity cost is the value of the next best alternative you give up when making a choice. Bastiat called this the seen and the unseen — most people see only what happens, not what would have happened under the alternative. Every choice closes off alternatives.',keyPoints:['Value of next best alternative','True cost = spending + lost alternatives','The seen and the unseen','Make the unseen visible']},
    {id:'econ-002',title:'Incentives — The Master Key',icon:'🔑',colorKey:'gold',thinkers:['Charlie Munger'],unit:'Show me the incentives and I will show you the outcome. People respond to incentives predictably. The cobra effect — bounties for dead cobras causing people to breed them — shows how good intentions with wrong incentives produce perverse outcomes.',keyPoints:['People respond predictably to incentives','Cobra effect','Financial, social, psychological','Ask: what does this reward?']},
    {id:'econ-003',title:'System 1 and System 2',icon:'🧠',colorKey:'violet',thinkers:['Daniel Kahneman'],unit:'System 1 is fast, automatic, intuitive, and biased. System 2 is slow, deliberate, and rational. Most cognitive errors emerge from System 1 operating on problems that actually require System 2. The discipline of good thinking is recognizing which system is running.',keyPoints:['System 1: fast, automatic, biased','System 2: slow, deliberate, rational','Most errors = wrong system','Recognize which system is running']},
  ],
  exercises:[
    {id:'econ-ex-01',title:'Opportunity Cost Audit',prompt:'List your top 3 time commitments. For each, identify the opportunity cost — what else you would be doing.',duration:'15 minutes'},
    {id:'econ-ex-02',title:'Incentive System Design',prompt:'Choose a broken system in your life. Map current incentives. Redesign so the behavior you want gets rewarded.',duration:'20 minutes'},
  ],
};

export const PHILOSOPHICAL_THINKING = {
  id:'philosophical-thinking', label:'Philosophical Thinking', icon:'🦉', colorKey:'violet',
  tagline:'Philosophy is the practice of thinking clearly about things that matter.',
  description:"Logical frameworks from history's greatest philosophers.",
  thinkers:[
    {name:'Aristotle',years:'384-322 BC',nationality:'Greek',field:'Philosophy',tagline:'The whole is greater than the sum of its parts.',coreIdea:'Logic and virtue ethics.'},
    {name:'Immanuel Kant',years:'1724-1804',nationality:'German',field:'Philosophy',tagline:'Act only on principles you could will to be universal.',coreIdea:'The categorical imperative.'},
    {name:'Epictetus',years:'50-135 AD',nationality:'Greek',field:'Stoicism',tagline:'It is not things that disturb us, but our judgments.',coreIdea:'The dichotomy of control.'},
  ],
  cards:[
    {id:'phil-001',title:'The Dichotomy of Control',icon:'⚖️',colorKey:'violet',thinkers:['Epictetus'],unit:'Divides all things into: within our control (judgments, desires, actions) and outside our control (body, reputation, outcomes). All suffering comes from treating outside-control things as if within our control. Practice: ask "is this within my control?" before responding.',keyPoints:['Within control: judgments, choices','Outside control: body, outcomes','Suffering = wrong category','Ask before responding']},
    {id:'phil-002',title:'The Categorical Imperative',icon:'🌍',colorKey:'gold',thinkers:['Immanuel Kant'],unit:'Act only according to principles you could will to be universal laws. If lying were universal, language would lose its function. Also: treat every person as an end in themselves, never merely as a means.',keyPoints:['Act only on universalizable principles','Universal lying = impossible','Treat people as ends not means','Inherent human dignity']},
    {id:'phil-003',title:'Logical Fallacies',icon:'🚫',colorKey:'rose',thinkers:['Aristotle'],unit:'Ad Hominem (attack person not argument), Straw Man (misrepresent to attack easily), False Dichotomy (only two options when more exist), Post Hoc (sequence mistaken for causation). Recognizing these in real time is the core skill of critical thinking.',keyPoints:['Ad Hominem','Straw Man','False Dichotomy','Post Hoc ≠ causation']},
  ],
  exercises:[
    {id:'phil-ex-01',title:'Control Audit',prompt:'List your stresses. Classify each: within control, outside control. Write one acceptance or one action for each.',duration:'15 minutes'},
    {id:'phil-ex-02',title:'Universalization Test',prompt:'Choose 3 decisions. Apply the categorical imperative: could this principle be universal without contradiction?',duration:'20 minutes'},
  ],
};

export const SYSTEMS_THINKING = {
  id:'systems-thinking', label:'Systems Thinking', icon:'🔄', colorKey:'sky',
  tagline:'The whole behaves differently than the sum of its parts.',
  description:'Frameworks for understanding complex systems.',
  thinkers:[
    {name:'Donella Meadows',years:'1941-2001',nationality:'American',field:'Systems Science',tagline:'You must understand and, not just one and one.',coreIdea:'Leverage points in complex systems.'},
    {name:'Peter Senge',years:'1947-',nationality:'American',field:'Systems Thinking',tagline:'The language of systems thinking is circles, not lines.',coreIdea:'Learning organizations.'},
  ],
  cards:[
    {id:'sys-001',title:'Feedback Loops',icon:'🔄',colorKey:'sky',thinkers:['Donella Meadows'],unit:'Reinforcing loops amplify change — exponential growth or collapse. Balancing loops resist change and maintain stability. Most runaway systems have reinforcing loops with insufficient balancing.',keyPoints:['Reinforcing: amplify change','Balancing: resist change','Runaway = insufficient balancing','Map the structure first']},
    {id:'sys-002',title:'Leverage Points',icon:'⚡',colorKey:'teal',thinkers:['Donella Meadows'],unit:'The most obvious interventions (changing numbers) are least effective. Most powerful: changing the goals and paradigms a system operates from. Ideas change paradigms which change everything downstream.',keyPoints:['Numbers: least leverage','Feedback structure: medium','Goals and paradigms: highest','Ideas change everything']},
    {id:'sys-003',title:'Emergence',icon:'🌊',colorKey:'violet',thinkers:['Stuart Kauffman'],unit:'Complex systems exhibit properties none of their parts possess. Water is wet but neither hydrogen nor oxygen is wet. You cannot understand a system by analyzing parts in isolation.',keyPoints:['Whole has properties parts lack','Water is wet; atoms are not','Cannot understand by parts alone','Reductionism insufficient']},
  ],
  exercises:[
    {id:'sys-ex-01',title:'Feedback Loop Mapping',prompt:'Choose a repeating pattern in your life. Map its feedback structure. Identify the highest-leverage intervention point.',duration:'25 minutes'},
    {id:'sys-ex-02',title:'Pre-Mortem Analysis',prompt:'Imagine your current plan failed completely one year from now. Write why. Identify the most likely failure modes.',duration:'20 minutes'},
  ],
};

export const LEARNING_SCIENCE = {
  id:'learning-science', label:'Learning Science', icon:'📚', colorKey:'sage',
  tagline:'How to learn how to learn.',
  description:'The scientific evidence on how humans learn.',
  thinkers:[
    {name:'Hermann Ebbinghaus',years:'1850-1909',nationality:'German',field:'Psychology',tagline:'Recalling once differs from remembering after forgetting.',coreIdea:'The forgetting curve.'},
    {name:'Carol Dweck',years:'1946-',nationality:'American',field:'Psychology',tagline:'Challenges are exciting, not threatening.',coreIdea:'Growth vs fixed mindset.'},
    {name:'Anders Ericsson',years:'1947-2020',nationality:'Swedish',field:'Psychology',tagline:'Expert performance is deliberate practice, not innate talent.',coreIdea:'Deliberate practice.'},
  ],
  cards:[
    {id:'learn-001',title:'Desirable Difficulties',icon:'💪',colorKey:'sage',thinkers:['Robert Bjork'],unit:'Spaced practice, interleaving, and retrieval practice all feel harder short-term but produce dramatically superior long-term retention. The difficulty is the mechanism, not a side effect.',keyPoints:['Short-term hard, long-term strong','Spaced practice','Interleaving','Retrieval practice beats review']},
    {id:'learn-002',title:'Deliberate Practice',icon:'🎯',colorKey:'gold',thinkers:['Anders Ericsson'],unit:'Deliberate practice operates at the edge of current ability with immediate feedback, focused on weaknesses. Comfortable repetition produces the OK Plateau — performance stops improving.',keyPoints:['Edge of current ability','Immediate feedback','Focus on weaknesses','Avoids the OK Plateau']},
    {id:'learn-003',title:'Growth Mindset',icon:'🌱',colorKey:'teal',thinkers:['Carol Dweck'],unit:'Fixed mindset believes ability is innate. Growth mindset believes ability develops through effort. Growth mindset people seek challenges; fixed mindset people avoid them. Neuroscience confirms the brain physically changes through learning.',keyPoints:['Fixed: ability is innate','Growth: ability develops','Growth seeks challenges','Brain physically changes']},
    {id:'learn-004',title:'The Testing Effect',icon:'✅',colorKey:'rose',thinkers:['Hermann Ebbinghaus'],unit:'Active retrieval strengthens memory far more than passive review. One retrieval attempt produces 50% better retention after a week. Three attempts produce nearly 100% better retention.',keyPoints:['Active retrieval beats review','1 retrieval = 50% better','3 retrievals = nearly 100% better','Retrieval rebuilds pathways']},
  ],
  exercises:[
    {id:'learn-ex-01',title:'Deliberate Practice Design',prompt:'Design a 20-minute deliberate practice session targeting one specific weakness with clear feedback.',duration:'20 minutes'},
    {id:'learn-ex-02',title:'Mindset Audit',prompt:'List 3 areas where you feel limited. Identify the fixed belief. Rewrite as growth mindset statements.',duration:'15 minutes'},
  ],
};

export const NOBEL_DOMAINS = [SCIENTIFIC_THINKING, MATHEMATICAL_THINKING, ECONOMIC_THINKING, PHILOSOPHICAL_THINKING, SYSTEMS_THINKING, LEARNING_SCIENCE];
export const NOBEL_REGISTRY = Object.fromEntries(NOBEL_DOMAINS.map(d => [d.id, d]));
export function getNobelDomain(id) { return NOBEL_REGISTRY[id]; }
export function getAllNobelDomains() { return NOBEL_DOMAINS; }
export function getAllNobelCards() { return NOBEL_DOMAINS.flatMap(d => d.cards); }
