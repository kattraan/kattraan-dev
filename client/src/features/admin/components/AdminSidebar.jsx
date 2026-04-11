import { NavLink, Link, useNavigate } from 'react-router-dom';
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
    ChevronLeft, 
    ChevronRight,
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
        { label: 'System Settings', icon: Settings, path: ROUTES.ADMIN_SETTINGS },
    ];

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} bg-[#0c091a]/60 backdrop-blur-3xl border-r border-white/5 transition-all duration-300 flex flex-col z-50 sticky top-0 h-screen`}>
            <div className={`h-[72px] flex items-center px-6 border-b border-white/5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed ? (
                    <BrandLogo />
                ) : (
                    <Link to={ROUTES.HOME}>
                        <img src={logo} alt="Logo" className="h-8 w-auto" loading="lazy" />
                    </Link>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="flex-grow py-8 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group
                            ${isActive 
                                ? 'bg-gradient-to-r from-[#FF8C42]/20 to-[#FF3FB4]/20 text-white border border-primary-pink/30 shadow-lg shadow-pink-500/10' 
                                : 'text-white/40 hover:bg-white/5 hover:text-white'}
                        `}
                    >
                        <item.icon size={20} className={`${isCollapsed ? 'mx-auto' : ''} transition-colors group-hover:text-primary-pink`} />
                        {!isCollapsed && <span className="text-[15px] font-bold">{item.label}</span>}
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
