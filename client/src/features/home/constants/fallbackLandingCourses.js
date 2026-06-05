import webDevImg from '@/assets/TopCourses/Develop-1.png';
import designImg from '@/assets/TopCourses/Design.png';
import htmlImg from '@/assets/TopCourses/Development.png';
import marketingImg from '@/assets/TopCourses/Marketing.png';

/** Shown when /courses/public returns no published courses yet. */
export const FALLBACK_LANDING_COURSES = [
  {
    title: 'Web Development For Beginners',
    category: 'Development',
    rating: '4.8',
    description: 'Learn to build responsive websites from scratch using HTML, CSS, and JavaScript.',
    lessons: '05',
    duration: '11h 20m',
    projects: '22',
    image: webDevImg,
  },
  {
    title: 'UI/UX Designer Masterclass-2025',
    category: 'Design',
    rating: '4.5',
    description:
      'Learn User Research, Wireframing, Prototyping, Figma, Design Systems, and Usability Testing.',
    lessons: '06',
    duration: '14h 00m',
    projects: '30',
    image: designImg,
  },
  {
    title: 'HTML - The Complete Guide 2026',
    category: 'Development',
    rating: '4.5',
    description:
      'Build real-world, responsive websites with hands-on training from industry experts.',
    lessons: '04',
    duration: '09h 00m',
    projects: '40',
    image: htmlImg,
  },
  {
    title: 'Content Marketing Masterclass',
    category: 'Marketing',
    rating: '4.8',
    description:
      'Master storytelling, strategy, and digital growth with our Content Marketing Masterclass.',
    lessons: '07',
    duration: '08h 30m',
    projects: '45',
    image: marketingImg,
  },
];
