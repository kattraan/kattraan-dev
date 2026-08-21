import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/features/auth/store/authSlice';
import logo from '@/assets/logo.png';
import BrandLogo from '@/components/common/BrandLogo';
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    Settings, 
    ShieldCheck,
    FileText,
    ChevronLeft, 
    LogOut
} from 'lucide-react';
import { ROUTES } from '@/config/routes';

const AdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate(ROUTES.LOGIN);
    };

    const navItems = [
        { label: 'Admin Panel', icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD, exact: true },
        { label: 'Instructor Approvals', icon: ShieldCheck, path: ROUTES.ADMIN_INSTRUCTORS },
        { label: 'Course Approvals', icon: BookOpen, path: ROUTES.ADMIN_COURSES },
        { label: 'User Center', icon: Users, path: ROUTES.ADMIN_USERS },
        { label: 'Site Content', icon: FileText, path: ROUTES.ADMIN_SITE_CONTENT },
        { label: 'System Settings', icon: Settings, path: ROUTES.ADMIN_SETTINGS },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-[#0c091a]/60 backdrop-blur-3xl border-r border-white/5 transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen`}>
            <div className={`h-[72px] flex items-center px-6 border-b border-white/5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed ? (
                    <BrandLogo />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsCollapsed(false)}
                        className="flex items-center justify-center bg-transparent p-0"
                        aria-label="Expand sidebar"
                    >
                        <img src={logo} alt="Logo" className="h-8 w-8 object-contain hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </button>
                )}
                {!isCollapsed && (
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all" aria-label="Collapse sidebar">
                    <ChevronLeft size={18} />
                </button>
                )}
            </div>

            <nav className="flex-grow py-8 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => `
                            sidebar-nav-link flex items-center gap-4 px-4 py-3.5 rounded-xl group select-none
                            ${isActive 
                                ? 'sidebar-link-active text-white' 
                                : 'text-white/40 hover:text-white'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={`${isCollapsed ? 'mx-auto' : ''} transition-colors ${isActive ? 'text-white' : ''}`} />
                                {!isCollapsed && <span className="text-[15px] font-bold">{item.label}</span>}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={20} className={`${isCollapsed ? 'mx-auto' : ''}`} />
                    {!isCollapsed && <span className="text-[15px] font-bold">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
