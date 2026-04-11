import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import CourseViewPreviewHeader from './CourseViewPreviewHeader';
import CourseViewPreviewVideo from './CourseViewPreviewVideo';
import CourseViewPreviewContentTabs from './CourseViewPreviewContentTabs';
import CourseViewPreviewSidebar from './CourseViewPreviewSidebar';

const CourseViewPreview = ({ isOpen, onClose, courseData }) => {
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeTab, setActiveTab] = useState('Description');
  const [expandedSections, setExpandedSections] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (courseData?.sections?.length > 0) {
      const firstSec = courseData.sections[0];
      const firstSecId = firstSec._id || firstSec.id;
      setExpandedSections({ [firstSecId]: true });
      if (firstSec.chapters?.length > 0) {
        setActiveChapter(firstSec.chapters[0]);
      }
    }
  }, [courseData]);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black text-white flex flex-col font-satoshi animate-in fade-in duration-300 overflow-hidden">
      <svg aria-hidden className="absolute w-0 h-0 overflow-hidden pointer-events-none" focusable="false">
        <defs>
          <linearGradient id="coursePreviewBrandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF8C42" />
            <stop offset="100%" stopColor="#FF3FB4" />
          </linearGradient>
        </defs>
      </svg>
      <CourseViewPreviewHeader
        courseTitle={courseData?.title}
        onClose={onClose}
        profileRef={profileRef}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
      />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] flex flex-col custom-scrollbar">
          <div className="w-full aspect-video bg-[#121212] relative group">
            <CourseViewPreviewVideo activeChapter={activeChapter} posterUrl={courseData?.image} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          </div>
          <CourseViewPreviewContentTabs
            activeChapter={activeChapter}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            courseId={courseData?._id || courseData?.id}
          />
        </main>
        <CourseViewPreviewSidebar
          courseData={courseData}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          activeChapter={activeChapter}
          setActiveChapter={setActiveChapter}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
      </div>
    </div>
  );
};

export default CourseViewPreview;
