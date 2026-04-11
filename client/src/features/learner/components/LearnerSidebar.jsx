import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/store/authSlice';
import logo from '@/assets/logo.png';
import BrandLogo from '@/components/common/BrandLogo';
import { 
    LayoutDashboard, 
    BookOpen, 
    Video, 
    FileText, 
    User, 
    ChevronLeft, 
    ChevronRight,
    LogOut,
    GraduationCap
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

const LearnerSidebar = ({ isCollapsed, setIsCollapsed }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD, exact: true },
        { label: 'My Courses', icon: BookOpen, path: ROUTES.DASHBOARD_MY_COURSES },
        { label: 'Live Classes', icon: Video, path: ROUTES.DASHBOARD_CLASSES },
        { label: 'Assignments', icon: FileText, path: ROUTES.DASHBOARD_ASSIGNMENTS },
        { label: 'Certificates', icon: GraduationCap, path: ROUTES.DASHBOARD_CERTIFICATES },
        { label: 'Profile', icon: User, path: ROUTES.DASHBOARD_PROFILE },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate(ROUTES.LOGIN);
    };

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white/60 dark:bg-[#0c091a]/60 backdrop-blur-3xl border-r border-gray-200 dark:border-white/5 transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen font-satoshi`}>
            {/* Logo Area */}
            <div className={`h-[72px] flex items-center px-6 border-b border-gray-200 dark:border-white/5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed ? (
                    <BrandLogo />
                ) : (
                    <Link to={ROUTES.HOME}>
                        <img src={logo} alt="Logo" className="h-8 w-auto" loading="lazy" />
                    </Link>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-all">
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-grow py-8 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group
                            ${isActive 
                                ? 'bg-gradient-to-r from-[#FF8C42]/20 to-[#FF3FB4]/20 text-gray-900 dark:text-white border border-primary-pink/30 shadow-lg shadow-pink-500/10' 
                                : 'text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white/90 border border-transparent'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={`${isCollapsed ? 'mx-auto' : ''} ${isActive ? 'text-gray-900 dark:text-white' : 'group-hover:text-primary-pink'} transition-colors duration-300`} />
                                {!isCollapsed && <span className="text-sm font-semibold">{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all">
                    <LogOut size={20} className={`${isCollapsed ? 'mx-auto' : ''}`} />
                    {!isCollapsed && <span className="text-[15px] font-bold">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default LearnerSidebar;
