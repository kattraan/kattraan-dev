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
      { type: 'paragraph', text: "When you follow a tutorial step-by-step, you aren't solving problems—you're just typing what someone else solved. The real learning happens when you face a blank screen, get stuck, read documentation, and piece together a solution on your own." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "If you want to break out of tutorial hell, you need to shift your ratio of consuming to building. Start a project that you don't fully know how to finish. Break it down, search for specific solutions, and build the muscle of independent problem-solving. That's the only metric that counts in the real world." }
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
      { type: 'paragraph', text: "Many entry-level job descriptions ask for '2-3 years of experience,' which leaves new graduates and career transitioners feeling completely locked out. But hiring managers don't actually care about the passage of time; they care about de-risking their hiring decision." },
      { type: 'paragraph', text: "A portfolio full of generic, copied projects (like a standard to-do list or a weather app clone) screams 'high risk.' It shows you can follow instructions, but not that you can deliver business value." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "To bypass the experience requirement, you must build 'Proof of Work' that addresses real-world complexity. Find a real business problem, build a solution, document your trade-offs, and present it. When you show that you can think like an experienced professional, the arbitrary years of experience suddenly stop mattering." }
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
      { type: 'paragraph', text: "The mythical 'Full-Stack Developer' who is perfectly adept at database architecture, backend microservices, responsive frontend design, and cloud infrastructure deployment is largely a fiction." },
      { type: 'paragraph', text: "What companies usually mean when they ask for a 'full-stack' developer is they want someone who is deeply specialized in one area (usually backend or frontend) but is capable of navigating and understanding the rest of the stack without breaking things. This is often called a 'T-shaped' developer." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "Instead of trying to be mediocre at ten different technologies, pick your primary domain and master it. Then, learn just enough about the adjacent technologies to communicate effectively with those teams. Positioning yourself as a 'Frontend-heavy Full-Stack' or 'Backend-heavy Full-Stack' makes you far more hirable than a generalist." }
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
      { type: 'paragraph', text: "Dribbble and Behance are filled with stunning, pixel-perfect UI designs that would completely fall apart the moment they met a real user or a real engineering team." },
      { type: 'paragraph', text: "While aesthetic execution is important, hiring managers are looking for product thinking. Can you explain why you chose a specific user flow? How does this design handle edge cases, empty states, or error messages? Did you consider the technical constraints of implementing these complex animations?" },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "A messy Figma file that solves a genuine user problem and documents the research, iterations, and engineering hand-off process is infinitely more valuable than a beautiful mockup that only works in a perfect vacuum. Stop designing for other designers and start designing for users." }
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
      { type: 'paragraph', text: "There is widespread anxiety that AI tools like ChatGPT, Copilot, and Midjourney are going to automate away our jobs. While AI is certainly changing the landscape, it is currently functioning as an amplifier, not an autonomous replacement." },
      { type: 'paragraph', text: "The professional who refuses to use AI will be outpaced by the professional who uses AI to draft boilerplate code, generate structural ideas, or summarize dense documentation in seconds." },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "Your goal shouldn't be to compete with AI on speed; it should be to leverage AI to elevate your output. The future belongs to those who know how to ask the right questions, orchestrate AI tools effectively, and apply human judgment to curate and refine the results." }
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
      { type: 'paragraph', text: "Knowing how to write a complex VLOOKUP or construct a pivot table in Excel is a great tactical skill, but it is not what makes a great data analyst. Tools change, but the core objective remains the same: extracting actionable insights from noise." },
      { type: 'paragraph', text: "Too often, analysts deliver beautiful dashboards filled with charts that look impressive but fail to answer the fundamental business question: 'What should we do next?'" },
      { type: 'heading', text: "Why this matters" },
      { type: 'paragraph', text: "True analytical skill lies in problem framing. Before touching a spreadsheet or a SQL database, you must understand the business context, define the right metrics, and ensure your analysis drives a specific decision. Stop focusing on the tool, and start focusing on the outcome." }
    ]
  }
];
