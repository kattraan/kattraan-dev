// import React from 'react'
// import { ArrowRight } from 'lucide-react'

// const RelatedCourses = ({ courseData }) => {
//     return (
//         <div className="mt-20 border-t border-white/10 pt-12">
//             <h2 className="text-2xl font-bold mb-8 text-white">Fullstack Development Career Track</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 {[1, 2, 3].map((_, idx) => (
//                     <div key={idx} className="group cursor-pointer">
//                         <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video border border-white/10 group-hover:border-white/20 transition-all">
//                             <img
//                                 src={courseData.videoPreview}
//                                 alt="Course"
//                                 className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
//                             />
//                             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

//                             {/* Thumbnail Overlays */}
//                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
//                                 <span className="text-[80px] font-black text-white/10 tracking-tighter leading-none select-none mix-blend-overlay scale-125 translate-y-2">2025</span>
//                             </div>
//                             <div className="absolute bottom-3 left-0 right-0 text-center z-10">
//                                 <h3 className="text-white font-[800] text-[10px] uppercase tracking-[0.1em] drop-shadow-lg">
//                                     Watch Before <span className="text-[#d8ea38]">Coding In</span>
//                                 </h3>
//                             </div>

//                             {/* Bestseller Badge */}
//                             <div className="absolute top-3 left-3 z-20">
//                                 <div className="bg-[#de5da1] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-lg">
//                                     Bestseller
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="space-y-2">
//                             <div className="inline-block bg-[#de5da1] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mb-1">
//                                 Bestseller
//                             </div>
//                             <h3 className="font-bold text-white text-lg leading-tight group-hover:text-primary-pink transition-colors line-clamp-2">
//                                 The Complete Python Pro Bootcamp
//                             </h3>
//                             <p className="text-xs text-[#a1a1aa] font-medium leading-relaxed line-clamp-2">
//                                 Learn data science, automation, build websites, games and apps!
//                             </p>
//                         </div>
//                     </div>
//                 ))}

//                 {/* View All Card */}
//                 <div className="group cursor-pointer h-full min-h-[220px] rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden backdrop-blur-sm">
//                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
//                     <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform bg-white/5 relative z-10">
//                         <ArrowRight className="w-6 h-6 text-white" />
//                     </div>
//                     <span className="font-medium text-white text-sm relative z-10">View all</span>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default RelatedCourses



import React from 'react'
import { ArrowRight, Star } from 'lucide-react'

const RelatedCourses = ({ courseData }) => {
    const related = [
        {
            title: "Advanced React & Next.js Patterns",
            instructor: "Sarah Johnson",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
            badge: "New"
        },
        {
            title: "Node.js Microservices Architecture",
            instructor: "Marcus Aurelius",
            image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
            badge: "Popular"
        },
        {
            title: "UI/UX Design for Developers",
            instructor: "Elena Gilbert",
            image: "https://images.unsplash.com/photo-1541462608141-ad60397d5873?auto=format&fit=crop&w=800&q=80",
            badge: "Top Rated"
        }
    ];

    return (
        <div className="mt-20 border-t border-white/10 pt-12 font-satoshi">
            <h2 className="text-2xl font-bold mb-8 text-white">Fullstack Development Career Track</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((course, idx) => (
                    <div key={idx} className="group cursor-pointer">
                        <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video border border-white/10 group-hover:border-white/20 transition-all duration-500">
                            <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60 transition-colors" />

                            {/* Thumbnail Overlays */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                <span className="text-[80px] font-black text-white/5 tracking-tighter leading-none select-none mix-blend-overlay scale-150 group-hover:scale-125 transition-transform duration-700">2025</span>
                            </div>

                            <div className="absolute bottom-3 left-0 right-0 text-center z-10">
                                <h3 className="text-white font-[800] text-[10px] uppercase tracking-[0.2em] drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                                    Watch Before <span className="text-[#d8ea38]">Coding In</span>
                                </h3>
                            </div>

                            {/* Badge */}
                            <div className="absolute top-3 left-3 z-20">
                                <div className="bg-gradient-brand text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest shadow-brand-badge">
                                    {course.badge}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-white text-[16px] leading-tight transition-colors line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--color-gradient-start)] group-hover:to-[var(--color-gradient-end)]">
                                {course.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-[#a1a1aa] font-medium">
                                <span>{course.instructor}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                    <span>4.9</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* View All Card */}
                <div className="group cursor-pointer h-full min-h-[160px] rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-500 flex flex-col items-center justify-center gap-4 relative overflow-hidden backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[color:var(--color-gradient-start)]/45 transition-all duration-500 bg-white/5 relative z-10 shadow-xl shadow-black/20">
                        <ArrowRight className="w-5 h-5 text-white group-hover:text-[color:var(--color-gradient-start)] transition-colors" />
                    </div>
                    <span className="font-bold text-white text-xs uppercase tracking-widest relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--color-gradient-start)] group-hover:to-[var(--color-gradient-end)] transition-colors">Explore All</span>
                </div>
            </div>
        </div>
    )
}

export default RelatedCourses;