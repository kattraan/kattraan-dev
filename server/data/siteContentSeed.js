const DEFAULT_BLOGS = [
  {
    sortOrder: 1,
    category: "Mindset",
    title: "Why 'Learning' is Keeping you Stuck",
    description:
      "Stop consuming content. Start building capability. The uncomfortable truth about why your course collection isn't helping.",
    readTime: "5 Min read",
    content: [
      { type: "paragraph", text: "The internet is flooded with tutorials, courses, and 'how-to' guides. It's easier than ever to feel productive by simply watching another 4-hour bootcamp video. But here's the harsh truth: passive consumption gives you the illusion of competence without any of the actual capability." },
      { type: "heading", text: "The Illusion of Progress" },
      { type: "paragraph", text: "When you finish a course, your brain gives you a massive dopamine hit. You get a certificate, you check off a box, and you feel like you've leveled up. But if someone asked you to build the exact same project from scratch without the video, could you do it? For most beginners, the answer is a terrifying no." },
      { type: "heading", text: "Building vs. Consuming" },
      { type: "paragraph", text: "The real learning happens when you face a blank screen. It happens when you get an incomprehensible error message and have to spend three hours reading documentation to fix a single line of code." },
      { type: "heading", text: "How to Break Free" },
      { type: "paragraph", text: "If you want to escape tutorial hell, shift your ratio of consuming to building. For every one hour you spend watching a tutorial, spend three hours building something on your own." },
    ],
  },
  {
    sortOrder: 2,
    category: "Career",
    title: 'How to Get Hired Without "Years of Experience"',
    description:
      "Why showing beautiful screens isn't enough. What separates portfolio projects from portfolio theater.",
    readTime: "6 Min read",
    content: [
      { type: "paragraph", text: "It's the classic catch-22 of the modern job market: you need experience to get a job, but you need a job to get experience." },
      { type: "heading", text: "De-risking the Hire" },
      { type: "paragraph", text: "Hiring managers aren't looking for someone who has simply occupied a chair for 24 months. They are looking for someone who has de-risked themselves." },
      { type: "heading", text: "Proof of Work" },
      { type: "paragraph", text: "Instead of portfolio theater, find a real business problem and build a solution. Document your process and the trade-offs you made." },
    ],
  },
  {
    sortOrder: 3,
    category: "Development",
    title: "The Full-Stack Developer Doesn't Exist",
    description:
      "Why that's actually good news. What employers really mean when they say 'full-stack' and how to position yourself.",
    readTime: "8 Min read",
    content: [
      { type: "paragraph", text: "The mythical Full-Stack Developer who is equally adept at databases, backend, frontend, and cloud is largely a fiction." },
      { type: "heading", text: "The T-Shaped Professional" },
      { type: "paragraph", text: "What companies usually want is a T-shaped developer: deep in one area, capable across the rest of the stack." },
    ],
  },
  {
    sortOrder: 4,
    category: "Design",
    title: "Your Figma Files Won't Get You Hired",
    description:
      "Why showing beautiful screens isn't enough. What separates portfolio projects from actually useful.",
    readTime: "6 Min read",
    content: [
      { type: "paragraph", text: "90% of stunning Dribbble designs would fall apart the moment they met a real user or engineering team." },
      { type: "heading", text: "Product Thinking Over Pixel Pushing" },
      { type: "paragraph", text: "Hiring managers want to know why you chose a flow, how you handle edge cases, and whether you considered engineering constraints." },
    ],
  },
  {
    sortOrder: 5,
    category: "Future Of Work",
    title: "AI Won't Replace You. Someone Using AI Will.",
    description:
      "The uncomfortable truth about AI augmentation. How to 10x your output instead of becoming obsolete.",
    readTime: "9 Min read",
    content: [
      { type: "paragraph", text: "AI is currently an amplifier, not an autonomous replacement. In the hands of a master, it is a superpower." },
      { type: "heading", text: "Future-Proofing Your Career" },
      { type: "paragraph", text: "Move up the value chain: orchestrate, apply judgment, and use AI to elevate your output rather than compete with it on speed." },
    ],
  },
  {
    sortOrder: 6,
    category: "Analytics",
    title: "Excel Isn't a Skill. Problem-Solving Is.",
    description:
      "Why technical proficiency doesn't equal analytical thinking. What makes a dashboard actually useful vs. just pretty.",
    readTime: "7 Min read",
    content: [
      { type: "paragraph", text: "Tools change. The core objective remains extracting actionable insights from noise." },
      { type: "heading", text: "Actionable Insights" },
      { type: "paragraph", text: "An observation is not an insight. An insight drives a specific next decision." },
    ],
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    sortOrder: 1,
    category: "Career Switcher",
    text: "At 32, I thought it was too late. Kattraan proved me wrong. Built a job portal from scratch. Now earning double as a developer.",
    author: "Rajesh Kumar",
    journey: "Civil Engineer → Full Stack Developer",
    date: "Jan 18, 2025",
    rating: 5,
    featured: false,
  },
  {
    sortOrder: 2,
    category: "Struggling Fresh Grad",
    text: "12 rejections broke me. Kattraan's real projects gave me confidence. Cracked interviews at product companies and a startup.",
    author: "Aditya Verma, B.Tech",
    journey: "Rejections → selection",
    date: "Feb 25, 2025",
    rating: 5,
    featured: false,
  },
  {
    sortOrder: 3,
    category: "Working Professional",
    text: "Same job, same salary for 4 years. I felt invisible. Learned automation at Kattraan. Got promoted in 2 months. Finally noticed.",
    author: "Priya Menon",
    journey: "Manual Tester → Automation Lead",
    date: "Dec 12, 2024",
    rating: 5,
    featured: true,
  },
  {
    sortOrder: 4,
    category: "Career Changer",
    text: "Switched from teaching to tech at 35. Kattraan's supportive community and structured learning path made the impossible possible.",
    author: "Sneha Patel",
    journey: "Teacher → Software Engineer",
    date: "Apr 05, 2025",
    rating: 5,
    featured: false,
  },
  {
    sortOrder: 5,
    category: "Freelancer to Corporate",
    text: "From freelancing struggles to a stable role. Kattraan taught me not just coding but professional development practices. Landed my target job in 6 months.",
    author: "Vikram Singh",
    journey: "Freelancer → Product Developer",
    date: "May 12, 2025",
    rating: 5,
    featured: false,
  },
];

module.exports = { DEFAULT_BLOGS, DEFAULT_TESTIMONIALS };
