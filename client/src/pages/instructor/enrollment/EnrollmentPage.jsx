import React from 'react';
import EnrollmentForm from '@/features/instructor/components/enrollment/EnrollmentForm';
import heroBackground from "@/assets/hero-background.png";

import BrandLogo from '@/components/common/BrandLogo';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

/**
 * Page wrapper for the Instructor Enrollment process.
 * Maintains production-level architectural separation by delegating 
 * complex form logic to the instructor feature module.
 */
const EnrollmentPage = () => {
    return (
        <div className="min-h-screen bg-[#0c091a] relative overflow-hidden flex flex-col font-satoshi selection:bg-primary-pink/30">
            {/* Background Assets */}
            <img 
                src={heroBackground} 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" 
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c091a]/80 to-[#0c091a] pointer-events-none" />
            
            {/* Header with Logo */}
            <div className="relative z-20 pt-6 lg:pt-8 w-full">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-between items-center">
                    <BrandLogo />
                    <div className="flex items-center gap-6">
                        <Link to={ROUTES.HOME} className="text-white/50 hover:text-white text-sm font-medium transition-colors hidden sm:block">Back to Website</Link>
                    </div>
                </div>
            </div>

            <main className="relative z-10 flex-grow py-12 px-4 container mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Trainer Profile Setup</h1>
                    <p className="text-white/70 text-sm">Complete your profile to start teaching on our platform</p>
                </div>

                <EnrollmentForm />
            </main>
        </div>
    );
};

export default EnrollmentPage;
