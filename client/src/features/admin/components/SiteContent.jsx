import React, { useEffect, useRef, useState } from 'react';
import { Newspaper, Quote, Plus, Pencil, MoreVertical, Star, Upload, Eye, EyeOff, Sparkles, Flame, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import siteContentService from '@/features/admin/services/siteContentService';
import { contentToEditor, editorToContent } from '@/features/admin/utils/siteContentUtils';
import { resolveBlogImage } from '@/data/blogData';
import CourseHomepagePlacements from '@/features/admin/components/CourseHomepagePlacements';
import { SWITCH_KNOB, SWITCH_OFF_TRACK, SWITCH_ON_TRACK } from '@/components/ui/Switch';

const inputClass =
  'w-full rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#9e30ff]/50';
const labelClass = 'block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/40 mb-1.5';
const cardActionClass =
  'inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-200 dark:border-zinc-400/40 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-100';

const emptyBlog = {
  title: '',
  category: '',
  description: '',
  readTime: '5 Min read',
  image: '',
  body: '',
  published: true,
  sortOrder: 0,
};

const emptyTestimonial = {
  category: '',
  text: '',
  author: '',
  journey: '',
  date: '',
  rating: 5,
  featured: false,
  published: true,
  sortOrder: 0,
};

function GradientButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-90 disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function CardOverflowMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`${cardActionClass} h-[34px] w-[34px] py-0 ${
          open ? 'bg-zinc-200 dark:bg-zinc-100' : ''
        }`}
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-30 mb-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#12140e] dark:shadow-black/50">
          {actions.map((action, index) => {
            const isDanger = action.variant === 'danger';
            const showToggle = typeof action.active === 'boolean';
            return (
              <React.Fragment key={action.id}>
                {isDanger && index > 0 && (
                  <div className="my-1 h-px bg-gray-100 dark:bg-white/10" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    action.onClick();
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    isDanger
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                      : 'text-gray-800 hover:bg-gray-50 dark:text-white/85 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 font-semibold">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isDanger
                          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/70'
                      }`}
                    >
                      {action.icon}
                    </span>
                    {action.label}
                  </span>
                  {showToggle && (
                    <span
                      aria-hidden
                      className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full p-[2px] transition-all duration-200 ${
                        action.active ? SWITCH_ON_TRACK : SWITCH_OFF_TRACK
                      }`}
                    >
                      <span
                        className={`h-[18px] w-[18px] ${SWITCH_KNOB} transition-transform duration-200 ease-out ${
                          action.active ? 'translate-x-[18px]' : 'translate-x-0'
                        }`}
                      />
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SiteContent = () => {
  const { confirm } = useConfirmDialog();
  const [tab, setTab] = useState('blogs');
  const [blogs, setBlogs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogModal, setBlogModal] = useState(null);
  const [testimonialModal, setTestimonialModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const placementsRef = useRef(null);
  const [placementsBusy, setPlacementsBusy] = useState({ saving: false, loading: false });

  const load = async () => {
    setError(null);
    const [blogRes, testimonialRes] = await Promise.all([
      siteContentService.listBlogs(),
      siteContentService.listTestimonials(),
    ]);
    setBlogs(blogRes.data || []);
    setTestimonials(testimonialRes.data || []);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load()
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load site content');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openNewBlog = () => setBlogModal({ ...emptyBlog });
  const openEditBlog = (item) =>
    setBlogModal({
      ...item,
      body: contentToEditor(item.content),
    });

  const saveBlog = async () => {
    if (!blogModal?.title?.trim() || !blogModal?.category?.trim() || !blogModal?.description?.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: blogModal.title,
        category: blogModal.category,
        description: blogModal.description,
        readTime: blogModal.readTime || '5 Min read',
        image: blogModal.image || '',
        content: editorToContent(blogModal.body),
        published: blogModal.published !== false,
        sortOrder: Number(blogModal.sortOrder) || 0,
      };
      if (blogModal.id) await siteContentService.updateBlog(blogModal.id, payload);
      else await siteContentService.createBlog(payload);
      setBlogModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save article');
    } finally {
      setSaving(false);
    }
  };

  const toggleBlogPublished = async (item) => {
    const next = item.published === false;
    setBlogs((prev) => prev.map((row) => (row.id === item.id ? { ...row, published: next } : row)));
    try {
      await siteContentService.updateBlog(item.id, { published: next });
      await load();
    } catch (err) {
      setBlogs((prev) => prev.map((row) => (row.id === item.id ? { ...row, published: item.published } : row)));
      setError(err.response?.data?.message || 'Could not update article visibility');
    }
  };

  const deleteBlog = async (item) => {
    const ok = await confirm({
      title: 'Delete article',
      message: `Delete “${item.title}”? This cannot be undone.`,
      confirmText: 'Delete',
    });
    if (!ok) return;
    const previous = blogs;
    setBlogs((prev) => prev.filter((row) => row.id !== item.id));
    try {
      await siteContentService.deleteBlog(item.id);
    } catch (err) {
      setBlogs(previous);
      setError(err.response?.data?.message || 'Could not delete article');
    }
  };

  const openNewTestimonial = () => setTestimonialModal({ ...emptyTestimonial });
  const openEditTestimonial = (item) => setTestimonialModal({ ...item });

  const saveTestimonial = async () => {
    if (!testimonialModal?.category?.trim() || !testimonialModal?.text?.trim() || !testimonialModal?.author?.trim()) return;
    setSaving(true);
    try {
      const payload = {
        category: testimonialModal.category,
        text: testimonialModal.text,
        author: testimonialModal.author,
        journey: testimonialModal.journey,
        date: testimonialModal.date,
        rating: Number(testimonialModal.rating) || 5,
        featured: Boolean(testimonialModal.featured),
        published: testimonialModal.published !== false,
        sortOrder: Number(testimonialModal.sortOrder) || 0,
      };
      if (testimonialModal.id) await siteContentService.updateTestimonial(testimonialModal.id, payload);
      else await siteContentService.createTestimonial(payload);
      setTestimonialModal(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const toggleTestimonialFeatured = async (item) => {
    const next = !item.featured;
    setTestimonials((prev) => prev.map((row) => (row.id === item.id ? { ...row, featured: next } : row)));
    try {
      await siteContentService.updateTestimonial(item.id, { featured: next });
      await load();
    } catch (err) {
      setTestimonials((prev) => prev.map((row) => (row.id === item.id ? { ...row, featured: item.featured } : row)));
      setError(err.response?.data?.message || 'Could not update testimonial');
    }
  };

  const deleteTestimonial = async (item) => {
    const ok = await confirm({
      title: 'Delete testimonial',
      message: `Delete “${item.author}”? This cannot be undone.`,
      confirmText: 'Delete',
    });
    if (!ok) return;
    const previous = testimonials;
    setTestimonials((prev) => prev.filter((row) => row.id !== item.id));
    try {
      await siteContentService.deleteTestimonial(item.id);
    } catch (err) {
      setTestimonials(previous);
      setError(err.response?.data?.message || 'Could not delete testimonial');
    }
  };

  const toggleTestimonialPublished = async (item) => {
    const next = item.published === false;
    setTestimonials((prev) => prev.map((row) => (row.id === item.id ? { ...row, published: next } : row)));
    try {
      await siteContentService.updateTestimonial(item.id, { published: next });
      await load();
    } catch (err) {
      setTestimonials((prev) => prev.map((row) => (row.id === item.id ? { ...row, published: item.published } : row)));
      setError(err.response?.data?.message || 'Could not update testimonial visibility');
    }
  };

  const onUploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !blogModal) return;
    try {
      const res = await siteContentService.uploadImage(file);
      setBlogModal((prev) => ({ ...prev, image: res.data?.url || prev.image }));
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed');
    }
  };

  const navItems = [
    { id: 'trending', label: 'Trending courses', icon: Flame },
    { id: 'popular', label: 'Popular courses', icon: Star },
    { id: 'blogs', label: 'Blogs', icon: Newspaper },
    { id: 'testimonials', label: 'Testimonials', icon: Quote },
  ];

  const sectionMeta = {
    blogs: { title: 'Blogs', subtitle: 'Landing page articles.' },
    testimonials: { title: 'Testimonials', subtitle: 'Learner quotes on the homepage.' },
    trending: { title: 'Trending courses', subtitle: 'Hero carousel placements (up to 4).' },
    popular: { title: 'Popular courses', subtitle: 'Popular section placements (up to 8).' },
  }[tab];

  return (
    <DashboardLayout>
      <div className="relative -mx-3 sm:-mx-5 -mb-6 min-h-[calc(100dvh-5.5rem)] bg-gray-50 dark:bg-[#0b0d08] sm:min-h-[calc(100dvh-6rem)]">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#FF8C42]/12 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-[#9e30ff]/12 blur-3xl" />

        <div className="relative flex min-h-[calc(100dvh-5.5rem)] flex-col lg:flex-row sm:min-h-[calc(100dvh-6rem)]">
          <aside className="shrink-0 border-b border-gray-200 bg-gray-50 dark:border-white/[0.08] dark:bg-[#0b0d08] lg:sticky lg:top-0 lg:h-[calc(100dvh-6rem)] lg:w-[220px] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="px-4 pb-2 pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400 dark:text-white/35">Site content</p>
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-6">
              {navItems.map((item) => {
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`sidebar-nav-link flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold select-none ${
                      active
                        ? 'inner-nav-active text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white'
                    }`}
                  >
                    <item.icon size={15} className={`shrink-0 ${active ? 'text-white' : ''}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 border-b border-gray-200 dark:border-white/[0.08] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <h2 className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-white">{sectionMeta.title}</h2>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">{sectionMeta.subtitle}</p>
              </div>
              {tab === 'blogs' && (
                <GradientButton onClick={openNewBlog}>
                  <Plus size={16} /> Add article
                </GradientButton>
              )}
              {tab === 'testimonials' && (
                <GradientButton onClick={openNewTestimonial}>
                  <Plus size={16} /> Add testimonial
                </GradientButton>
              )}
              {(tab === 'trending' || tab === 'popular') && (
                <GradientButton
                  disabled={placementsBusy.loading || placementsBusy.saving}
                  onClick={() => placementsRef.current?.save()}
                >
                  {placementsBusy.saving ? 'Saving…' : 'Save placements'}
                </GradientButton>
              )}
            </div>

            <div className="px-5 py-6 sm:px-7">
              {tab === 'trending' ? (
                <CourseHomepagePlacements ref={placementsRef} section="trending" onBusyChange={setPlacementsBusy} />
              ) : tab === 'popular' ? (
                <CourseHomepagePlacements ref={placementsRef} section="popular" onBusyChange={setPlacementsBusy} />
              ) : (
                <>
                  {error && (
                    <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-72 rounded-2xl" />
                      ))}
                    </div>
                  ) : tab === 'blogs' ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {blogs.length === 0 && (
                        <p className="col-span-full py-16 text-center text-gray-400 dark:text-white/40">No articles yet. Add the first one.</p>
                      )}
                      {blogs.map((article) => (
                        <article
                          key={article.id}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/16 dark:hover:bg-white/[0.05]"
                        >
                          <div className="relative aspect-[16/9] overflow-hidden">
                            <img src={resolveBlogImage(article)} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                              {article.category}
                            </span>
                            {!article.published && (
                              <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-sm">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <h3 className="mb-1.5 text-[15px] font-bold leading-snug text-gray-900 dark:text-white">{article.title}</h3>
                            <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-gray-600 dark:text-white/55">{article.description}</p>
                            <p className="mb-4 text-[11px] text-gray-400 dark:text-white/35">{article.readTime}</p>
                            <div className="mt-auto flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEditBlog(article)}
                                className={`${cardActionClass} flex-1`}
                              >
                                <Pencil size={13} /> Edit
                              </button>
                              <CardOverflowMenu
                                actions={[
                                  {
                                    id: 'show',
                                    label: article.published === false ? 'Show on site' : 'Hide from site',
                                    active: article.published !== false,
                                    icon: article.published === false ? <EyeOff size={13} /> : <Eye size={13} />,
                                    onClick: () => toggleBlogPublished(article),
                                  },
                                  {
                                    id: 'delete',
                                    label: 'Delete',
                                    variant: 'danger',
                                    icon: <Trash2 size={13} />,
                                    onClick: () => deleteBlog(article),
                                  },
                                ]}
                              />
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {testimonials.length === 0 && (
                        <p className="col-span-full py-16 text-center text-gray-400 dark:text-white/40">No testimonials yet. Add the first one.</p>
                      )}
                      {testimonials.map((item) => (
                        <article
                          key={item.id}
                          className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-white/16 dark:hover:bg-white/[0.05]"
                        >
                          {item.featured && (
                            <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                              Featured
                            </span>
                          )}
                          {item.published === false && (
                            <span className="absolute right-4 top-12 rounded-full bg-gray-200 px-2.5 py-1 text-[10px] font-bold text-gray-600 dark:bg-white/15 dark:text-white/80">
                              Hidden
                            </span>
                          )}
                          <h3 className="mb-2 pr-20 text-lg font-bold">
                            <span className="bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text text-transparent">
                              “{item.category}”
                            </span>
                          </h3>
                          <div className="mb-3 flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${i < (item.rating || 5) ? 'fill-gray-800 text-gray-800 dark:fill-white dark:text-white' : 'text-gray-300 dark:text-white/20'}`}
                              />
                            ))}
                          </div>
                          <p className="mb-4 line-clamp-4 text-sm text-gray-700 dark:text-white/80">{item.text}</p>
                          <p className="mb-1 text-sm font-bold text-gray-900 dark:text-white">— {item.author}</p>
                          <p className="mb-4 text-xs text-gray-400 dark:text-white/40">{item.journey}</p>
                          <div className="mt-auto flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEditTestimonial(item)}
                              className={`${cardActionClass} flex-1`}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <CardOverflowMenu
                              actions={[
                                {
                                  id: 'show',
                                  label: item.published === false ? 'Show on site' : 'Hide from site',
                                  active: item.published !== false,
                                  icon: item.published === false ? <EyeOff size={13} /> : <Eye size={13} />,
                                  onClick: () => toggleTestimonialPublished(item),
                                },
                                {
                                  id: 'feature',
                                  label: item.featured ? 'Unfeature' : 'Feature',
                                  active: Boolean(item.featured),
                                  icon: <Sparkles size={13} />,
                                  onClick: () => toggleTestimonialFeatured(item),
                                },
                                {
                                  id: 'delete',
                                  label: 'Delete',
                                  variant: 'danger',
                                  icon: <Trash2 size={13} />,
                                  onClick: () => deleteTestimonial(item),
                                },
                              ]}
                            />
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(blogModal)}
        onClose={() => setBlogModal(null)}
        title={blogModal?.id ? 'Edit article' : 'Add article'}
        maxWidth="720px"
        className="dark:bg-[#0d0d12]"
      >
        {blogModal && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category tag</label>
                <input className={inputClass} value={blogModal.category} onChange={(e) => setBlogModal({ ...blogModal, category: e.target.value })} placeholder="Mindset" />
              </div>
              <div>
                <label className={labelClass}>Read time</label>
                <input className={inputClass} value={blogModal.readTime} onChange={(e) => setBlogModal({ ...blogModal, readTime: e.target.value })} placeholder="6 Min read" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={blogModal.title} onChange={(e) => setBlogModal({ ...blogModal, title: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Excerpt</label>
              <textarea rows={3} className={inputClass} value={blogModal.description} onChange={(e) => setBlogModal({ ...blogModal, description: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Cover image</label>
              <div className="flex gap-2">
                <input className={inputClass} value={blogModal.image} onChange={(e) => setBlogModal({ ...blogModal, image: e.target.value })} placeholder="https://… or upload" />
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-800 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onUploadImage} />
                </label>
              </div>
              {blogModal.image && (
                <img src={resolveBlogImage(blogModal)} alt="" className="mt-3 h-28 w-full rounded-xl object-cover" />
              )}
            </div>
            <div>
              <label className={labelClass}>Article body</label>
              <p className="mb-1 text-[11px] text-gray-400 dark:text-white/35">Use a blank line between paragraphs. Start a line with ## for a heading.</p>
              <textarea rows={8} className={inputClass} value={blogModal.body} onChange={(e) => setBlogModal({ ...blogModal, body: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
              <input type="checkbox" checked={blogModal.published !== false} onChange={(e) => setBlogModal({ ...blogModal, published: e.target.checked })} />
              Visible on the landing page
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setBlogModal(null)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 dark:text-white/60">
                Cancel
              </button>
              <GradientButton onClick={saveBlog} disabled={saving}>
                {saving ? 'Saving…' : 'Save article'}
              </GradientButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(testimonialModal)}
        onClose={() => setTestimonialModal(null)}
        title={testimonialModal?.id ? 'Edit testimonial' : 'Add testimonial'}
        maxWidth="640px"
        className="dark:bg-[#0d0d12]"
      >
        {testimonialModal && (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-black/30">
              <div className="mb-2 flex items-center gap-2 text-gray-400 dark:text-white/40">
                <Eye size={14} /> Preview
              </div>
              <p className="bg-gradient-to-r from-gradient-start via-gradient-mid to-gradient-end bg-clip-text text-lg font-bold text-transparent">
                “{testimonialModal.category || 'Title'}”
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-white/80">{testimonialModal.text || 'Quote…'}</p>
              <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">— {testimonialModal.author || 'Name'}</p>
            </div>
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={testimonialModal.category} onChange={(e) => setTestimonialModal({ ...testimonialModal, category: e.target.value })} placeholder="Freelancer to Corporate" />
            </div>
            <div>
              <label className={labelClass}>Quote</label>
              <textarea rows={4} className={inputClass} value={testimonialModal.text} onChange={(e) => setTestimonialModal({ ...testimonialModal, text: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={testimonialModal.author} onChange={(e) => setTestimonialModal({ ...testimonialModal, author: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input className={inputClass} value={testimonialModal.date} onChange={(e) => setTestimonialModal({ ...testimonialModal, date: e.target.value })} placeholder="May 12, 2025" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Career path</label>
              <input className={inputClass} value={testimonialModal.journey} onChange={(e) => setTestimonialModal({ ...testimonialModal, journey: e.target.value })} placeholder="Freelancer → Product Developer" />
            </div>
            <div>
              <label className={labelClass}>Star rating</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTestimonialModal({ ...testimonialModal, rating: i + 1 })}
                    className="p-1"
                  >
                    <Star className={`h-5 w-5 ${i < (testimonialModal.rating || 5) ? 'fill-[#FF8C42] text-[#FF8C42]' : 'text-gray-300 dark:text-white/20'}`} />
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70">
              <input type="checkbox" checked={Boolean(testimonialModal.featured)} onChange={(e) => setTestimonialModal({ ...testimonialModal, featured: e.target.checked })} />
              Featured badge
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setTestimonialModal(null)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 dark:text-white/60">
                Cancel
              </button>
              <GradientButton onClick={saveTestimonial} disabled={saving}>
                {saving ? 'Saving…' : 'Save testimonial'}
              </GradientButton>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default SiteContent;
