import communicateImg from '@/assets/blog/Communicate.png';
import careerImg from '@/assets/blog/Career.png';
import developmentImg from '@/assets/blog/Development.png';
import designsImg from '@/assets/blog/Designs.png';
import workImg from '@/assets/blog/Work.png';
import analyticsImg from '@/assets/blog/Analystics.png';

export const articles = [
  {
    id: 1,
    category: 'Mindset',
    title: "Why 'Learning' is Keeping you Stuck",
    description: "Stop consuming content. Start building capability. The uncomfortable truth about why your course collection isn't helping.",
    readTime: '5 Min read',
    image: communicateImg,
    content: [
      { type: 'paragraph', text: "The internet is flooded with tutorials, courses, and 'how-to' guides. It's easier than ever to feel productive by simply watching another 4-hour bootcamp video. But here's the harsh truth: passive consumption gives you the illusion of competence without any of the actual capability." },
      { type: 'paragraph', text: "We call this 'Tutorial Hell.' It is a comfortable place where everything works perfectly, the code always compiles, and the instructor holds your hand through every error. The problem is that the real world is messy, undocumented, and full of edge cases." },
      { type: 'heading', text: "The Illusion of Progress" },
      { type: 'paragraph', text: "When you finish a course, your brain gives you a massive dopamine hit. You get a certificate, you check off a box, and you feel like you've leveled up. But if someone asked you to build the exact same project from scratch without the video, could you do it? For most beginners, the answer is a terrifying no." },
      { type: 'paragraph', text: "This happens because following a tutorial isn't problem-solving. It's transcription. You are simply typing what someone else has already figured out." },
      { type: 'heading', text: "Building vs. Consuming" },
      { type: 'paragraph', text: "The real learning happens when you face a blank screen. It happens when you get an incomprehensible error message and have to spend three hours reading Stack Overflow and documentation to fix a single line of code. That frustration you feel? That is the feeling of your brain actually forming new neural pathways." },
      { type: 'heading', text: "How to Break Free" },
      { type: 'paragraph', text: "If you want to escape tutorial hell, you need to drastically shift your ratio of consuming to building. A good rule of thumb is the 1:3 ratio. For every one hour you spend watching a tutorial, spend three hours building something on your own." },
      { type: 'paragraph', text: "Start small. Don't try to build the next Facebook. Build a simple habit tracker. When you inevitably get stuck, resist the urge to find a tutorial. Read the documentation. Break the problem into smaller, searchable pieces. Embrace the struggle." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "In the professional world, nobody cares how many courses you've finished. They care about what you can build, how you troubleshoot, and whether you can operate independently. Start building the muscle of independent problem-solving today—it's the only metric that counts." }
    ]
  },
  {
    id: 2,
    category: 'Career',
    title: 'How to Get Hired Without "Years of Experience"',
    description: "Why showing beautiful screens isn't enough. What separates portfolio projects from portfolio theater.",
    readTime: '6 Min read',
    image: careerImg,
    content: [
      { type: 'paragraph', text: "It's the classic catch-22 of the modern job market: you need experience to get a job, but you need a job to get experience. Many entry-level job descriptions ask for '2-3 years of experience,' leaving new graduates and career transitioners feeling completely locked out." },
      { type: 'paragraph', text: "But here is a secret that most applicants don't understand: hiring managers don't actually care about the passage of time. They aren't looking for someone who has simply occupied a chair for 24 months. They are looking for someone who has de-risked themselves." },
      { type: 'heading', text: "De-risking the Hire" },
      { type: 'paragraph', text: "Hiring someone is an incredibly expensive and risky bet for a company. If they hire a junior who needs constant hand-holding, it drains productivity from senior team members. 'Years of experience' is simply a lazy proxy metric that companies use to filter out people who might be a massive drain on resources." },
      { type: 'heading', text: "The Problem with Clone Projects" },
      { type: 'paragraph', text: "To bypass the experience filter, candidates often build portfolios. But a portfolio full of generic, copied projects—like a standard to-do list, a weather app, or a Netflix clone—screams 'high risk.' It shows you can follow instructions, but it doesn't prove that you can deliver actual business value or navigate ambiguity." },
      { type: 'paragraph', text: "Real projects have messy data, edge cases, user authentication issues, and deployment challenges. Clone projects are sterile." },
      { type: 'heading', text: "Proof of Work" },
      { type: 'paragraph', text: "Instead of portfolio theater, you need 'Proof of Work.' Find a real business problem. Maybe a local bakery needs a better way to track inventory, or a non-profit needs a volunteer management dashboard. Build a solution for them." },
      { type: 'paragraph', text: "Document your process. Write about the trade-offs you made. Why did you choose PostgreSQL over MongoDB? How did you handle user permissions? What was the hardest bug you fixed?" },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "When you walk into an interview and can speak intelligently about architectural trade-offs, real-user feedback, and navigating deployment pipelines, you stop sounding like a junior. When you show that you can think like an experienced professional, the arbitrary 'years of experience' requirement suddenly stops mattering." }
    ]
  },
  {
    id: 3,
    category: 'Development',
    title: "The Full-Stack Developer Doesn't Exist",
    description: "Why that's actually good news. What employers really mean when they say 'full-stack' and how to position yourself.",
    readTime: '8 Min read',
    image: developmentImg,
    content: [
      { type: 'paragraph', text: "Read almost any modern engineering job description, and you'll see a laundry list of requirements: React, Node.js, PostgreSQL, AWS, Docker, Kubernetes, CI/CD, CSS animations, and sometimes even a sprinkle of machine learning. The industry is obsessed with the 'Full-Stack Developer.'" },
      { type: 'paragraph', text: "But the mythical 'Full-Stack Developer' who is perfectly and equally adept at database architecture, backend microservices, responsive frontend design, and cloud infrastructure deployment is largely a fiction. It's a unicorn that startups hunt for but rarely find." },
      { type: 'heading', text: "The Myth of the Generalist" },
      { type: 'paragraph', text: "Technology moves too fast for anyone to be an expert in everything. If you spend your weekend mastering the latest CSS Grid techniques, you are missing out on the latest updates to Postgres indexing strategies. Attempting to be perfectly balanced across the entire stack usually results in a developer who is mediocre at everything and masterful at nothing." },
      { type: 'heading', text: "The T-Shaped Professional" },
      { type: 'paragraph', text: "What companies usually mean when they ask for a 'full-stack' developer is that they want a 'T-shaped' developer. This is someone who is deeply specialized and highly competent in one specific area (the vertical bar of the T), but is capable of navigating and understanding the rest of the stack without breaking things (the horizontal bar)." },
      { type: 'paragraph', text: "A frontend-heavy full-stack developer can build world-class UIs, but they also know how to spin up an Express server and write basic SQL queries to get the data they need. A backend-heavy developer can architect scalable microservices, and they know just enough React to wire up an admin dashboard." },
      { type: 'heading', text: "Positioning Yourself" },
      { type: 'paragraph', text: "Instead of burning yourself out trying to learn ten different technologies at once, pick your primary domain and master it. Become undeniably good at the frontend, or incredibly sharp at backend logic. Then, dedicate 20% of your time to learning the adjacent technologies." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "Positioning yourself as a 'Frontend-heavy Full-Stack' or 'Backend-heavy Full-Stack' makes you far more hirable than a pure generalist. It sets clear expectations, allows you to shine in your zone of genius, and makes you a versatile team player who can communicate effectively across boundaries." }
    ]
  },
  {
    id: 4,
    category: 'Design',
    title: "Your Figma Files Won't Get You Hired",
    description: "Why showing beautiful screens isn't enough. What separates portfolio projects from actually useful.",
    readTime: '6 Min read',
    image: designsImg,
    content: [
      { type: 'paragraph', text: "Scroll through Dribbble or Behance, and you will see an endless feed of stunning, pixel-perfect UI designs. They feature glassmorphism, perfectly balanced drop shadows, incredibly vibrant gradients, and elegant typography." },
      { type: 'paragraph', text: "There's just one problem: 90% of those designs would completely fall apart the moment they met a real user or a real engineering team." },
      { type: 'heading', text: "Pretty vs. Practical" },
      { type: 'paragraph', text: "Many junior designers fall into the trap of designing for other designers. They create 'happy path' mockups where every user has a perfectly proportioned profile picture, names are exactly 12 characters long, and no one ever triggers an error message." },
      { type: 'paragraph', text: "While aesthetic execution is undeniably important, hiring managers are looking for product thinking. A beautiful interface that doesn't solve a business problem is just art, not design." },
      { type: 'heading', text: "Product Thinking Over Pixel Pushing" },
      { type: 'paragraph', text: "During a portfolio review, a senior design manager isn't just looking at your color palette. They are asking: Can you explain why you chose this specific user flow? How does this design handle edge cases or empty states? What happens when the user loses internet connection mid-task?" },
      { type: 'paragraph', text: "They want to know if you did user research to validate your assumptions, or if you just built what looked cool." },
      { type: 'heading', text: "The Handoff Reality" },
      { type: 'paragraph', text: "Furthermore, design does not exist in a vacuum. It has to be built. Did you consider the technical constraints of implementing those complex animations? Have you organized your Figma file with a clear design system, auto-layout, and proper component naming so that an engineer doesn't lose their mind trying to inspect it?" },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "A messy Figma file that solves a genuine user problem and documents the research, iterations, and engineering hand-off process is infinitely more valuable than a beautiful mockup that only works in a perfect vacuum. Stop designing for Dribbble likes, and start designing for human friction." }
    ]
  },
  {
    id: 5,
    category: 'Future Of Work',
    title: 'AI Won\'t Replace You. Someone Using AI Will.',
    description: "The uncomfortable truth about AI augmentation. How to 10x your output instead of becoming obsolete.",
    readTime: '9 Min read',
    image: workImg,
    content: [
      { type: 'paragraph', text: "There is widespread anxiety sweeping across the knowledge work sector. Writers, designers, programmers, and analysts are watching tools like ChatGPT, GitHub Copilot, and Midjourney generate in seconds what used to take them hours or days." },
      { type: 'paragraph', text: "The fear is palpable: are our jobs going to be automated away? While AI is certainly shifting the tectonic plates of the industry, it is currently functioning as an amplifier, not an autonomous replacement." },
      { type: 'heading', text: "AI as an Amplifier" },
      { type: 'paragraph', text: "AI does not have intent. It does not understand business context, office politics, or the nuanced needs of a specific client. It generates probabilistic outputs based on training data. Therefore, an AI tool in the hands of a novice will generate mediocre, confidently incorrect results." },
      { type: 'paragraph', text: "But an AI tool in the hands of a master? That is a superpower. The professional who refuses to use AI will be outpaced by the professional who uses AI to draft boilerplate code, generate structural ideas, summarize dense documentation, and accelerate their workflow." },
      { type: 'heading', text: "The Prompt Engineering Fallacy" },
      { type: 'paragraph', text: "Many people think the future belongs to 'Prompt Engineers' who know the secret magic words to get AI to do what they want. This is a fallacy. Prompting will become natural language. The real future belongs to people with deep domain expertise." },
      { type: 'paragraph', text: "If you don't know what good code looks like, you won't know when Copilot generates bad code. If you don't understand typography and layout, you won't know how to refine an AI-generated design. AI raises the floor, but human taste and expertise raise the ceiling." },
      { type: 'heading', text: "Future-Proofing Your Career" },
      { type: 'paragraph', text: "To survive the AI transition, you need to move up the value chain. Stop defining your value by the raw output of words or lines of code. Start defining your value by your ability to orchestrate, architecture, and apply human judgment." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "Your goal shouldn't be to compete with AI on speed; it should be to leverage AI to elevate your output. Embrace these tools, learn their limitations, and focus on the deeply human skills: empathy, strategic framing, and complex problem-solving. AI won't replace you, but the person who masters it definitely will." }
    ]
  },
  {
    id: 6,
    category: 'Analytics',
    title: "Excel Isn't a Skill. Problem-Solving Is.",
    description: "Why technical proficiency doesn't equal analytical thinking. What makes a dashboard actually useful vs. just pretty.",
    readTime: '7 Min read',
    image: analyticsImg,
    content: [
      { type: 'paragraph', text: "If you look at resumes for data analysts or business intelligence roles, you will see a massive emphasis on tools: 'Expert in Excel, SQL, Tableau, PowerBI, Python.' Candidates spend hundreds of hours memorizing complex DAX formulas and SQL window functions." },
      { type: 'paragraph', text: "Knowing how to write a complex VLOOKUP or construct a pivot table is a great tactical skill, but it is fundamentally not what makes a great data analyst. Tools change, syntaxes evolve, and AI can now write most queries for you. But the core objective remains the same: extracting actionable insights from noise." },
      { type: 'heading', text: "The Dashboard Trap" },
      { type: 'paragraph', text: "Too often, highly technical analysts fall into the 'Dashboard Trap.' They get a request from a stakeholder and immediately jump into their tool of choice. They spend weeks building a beautiful, interactive dashboard with 15 different charts, drill-downs, and custom color palettes." },
      { type: 'paragraph', text: "They present it to the executive team, who say 'Wow, this looks great!' ...and then no one ever looks at it again. Why? Because the dashboard failed to answer the fundamental business question: 'What should we do next?'" },
      { type: 'heading', text: "Framing the Right Questions" },
      { type: 'paragraph', text: "True analytical skill lies in problem framing. Before ever touching a spreadsheet or a SQL database, a great analyst behaves like a consultant. They interrogate the stakeholder's request. Why do we need this data? What decision will be made once we have it? What is the core KPI?" },
      { type: 'paragraph', text: "Often, the stakeholder asks for a complex dashboard when all they really need is a single, clear metric delivered via email every Monday morning." },
      { type: 'heading', text: "Actionable Insights" },
      { type: 'paragraph', text: "An insight is only valuable if it drives action. If your analysis shows that user retention dropped by 10%, that is an observation. If your analysis shows that user retention dropped by 10% because the new onboarding flow is confusing Android users, and we should revert to the previous flow—that is an actionable insight." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "Stop identifying as an 'Excel Wizard' or a 'SQL Ninja.' Identify as a problem solver. Understand the business context, define the right metrics, ensure your analysis drives a specific decision, and learn to communicate your findings clearly. When you do that, the tool you use to get the answer becomes completely irrelevant." }
    ]
  }
];
