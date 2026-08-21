import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Flame, GripVertical, Plus, Search, Star, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import adminService from '@/features/admin/services/adminService';
import { useToast } from '@/components/ui/Toast';
import { CardListSkeleton } from '@/components/skeleton';
import { coursesApi } from '@/features/courses/api/coursesApi';
import { useDispatch } from 'react-redux';

const TRENDING_MAX = 4;
const POPULAR_MAX = 8;

function courseId(c) {
  return String(c?._id || c?.id || '');
}

function reorderItem(list, from, to) {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function SlotNumber({ index }) {
  return (
    <span className="w-8 h-8 rounded-xl bg-gradient-to-r from-primary-pink to-[#ff8c42] text-white text-[11px] font-black flex items-center justify-center shrink-0">
      {String(index + 1).padStart(2, '0')}
    </span>
  );
}

function EmptySlot({ index, onFill }) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const incomingId = e.dataTransfer.getData('application/x-course-id');
        if (incomingId) onFill(incomingId);
      }}
      className="flex min-h-[4.25rem] items-center gap-3 p-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-white/25 dark:bg-white/[0.04]"
    >
      <SlotNumber index={index} />
      <p className="text-sm text-gray-500 dark:text-white/50">Empty slot — add a course or drag one here</p>
    </div>
  );
}

function PlacementRow({ course, index, total, onReorder, onReplace, onRemove }) {
  const thumb = course.thumbnail || course.image;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copyMove';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const incomingId = e.dataTransfer.getData('application/x-course-id');
        if (incomingId) {
          onReplace(incomingId);
          return;
        }
        const from = Number(e.dataTransfer.getData('text/plain'));
        if (Number.isInteger(from) && from !== index) onReorder(from, index);
      }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10"
    >
      <span
        className="inline-flex cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 dark:text-white/35 dark:hover:text-white/70 shrink-0"
        aria-label={`Reorder ${course.title || 'course'} (${index + 1} of ${total})`}
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </span>
      <SlotNumber index={index} />
      {thumb ? (
        <img src={thumb} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10" />
      ) : (
        <div className="w-12 h-12 rounded-xl shrink-0 bg-gradient-to-br from-gradient-start/40 via-gradient-mid/40 to-gradient-end/30" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{course.title || 'Untitled'}</p>
        <p className="text-[11px] text-gray-500 dark:text-white/40 truncate">{course.category || 'Course'}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 shrink-0"
        aria-label="Remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function PlacementPanel({
  title,
  subtitle,
  icon: Icon,
  items,
  max,
  catalog,
  onChange,
  hideChrome = false,
}) {
  const [query, setQuery] = useState('');
  const selectedIds = useMemo(() => new Set(items.map(courseId)), [items]);
  const unused = useMemo(
    () => catalog.filter((c) => !selectedIds.has(courseId(c))),
    [catalog, selectedIds],
  );
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return unused
      .filter((c) => !q || (c.title || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q));
  }, [unused, query]);

  const add = (course) => {
    if (items.length >= max) return;
    onChange([...items, course]);
    setQuery('');
  };

  const replaceAt = (index, course) => {
    const next = [...items];
    next[index] = course;
    onChange(next);
  };

  return (
    <div className={hideChrome ? 'space-y-5' : 'bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[28px] p-6 space-y-5'}>
      {!hideChrome && (
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-gradient-to-r from-primary-pink/20 to-[#ff8c42]/20 text-primary-pink">
              <Icon size={16} />
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-white/40">{subtitle}</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50 dark:border-white/10 dark:text-white/50 dark:bg-black/30">
          {items.length}/{max}
        </span>
      </div>
      )}
      {hideChrome && (
        <div className="flex justify-end">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50 dark:border-white/10 dark:text-white/50 dark:bg-black/30">
            {items.length}/{max}
          </span>
        </div>
      )}

      {unused.length > 0 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search published courses"
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 outline-none focus:border-primary-pink/50"
          />
        </div>
      )}

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40 mb-2">
          Slots ({items.length}/{max})
        </p>
        <div className="space-y-2">
          {Array.from({ length: max }).map((_, index) => {
            const course = items[index];
            if (!course) {
              return (
                <EmptySlot
                  key={`empty-${index}`}
                  index={index}
                  onFill={(incomingId) => {
                    const nextCourse = unused.find((c) => courseId(c) === incomingId);
                    if (nextCourse && items.length < max) add(nextCourse);
                  }}
                />
              );
            }
            return (
              <PlacementRow
                key={`${index}-${courseId(course)}`}
                course={course}
                index={index}
                total={items.length}
                onReorder={(from, to) => onChange(reorderItem(items, from, to))}
                onReplace={(incomingId) => {
                  const nextCourse = unused.find((c) => courseId(c) === incomingId);
                  if (nextCourse) replaceAt(index, nextCourse);
                }}
                onRemove={() => onChange(items.filter((_, i) => i !== index))}
              />
            );
          })}
        </div>
      </div>

      {unused.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40 mb-2">
            {items.length >= max
              ? `${unused.length} more published — drag a grip onto a slot above, or remove one to add`
              : 'Published courses not in this list'}
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {suggestions.map((course) => (
              <div
                key={courseId(course)}
                className="flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100 bg-gray-50 dark:border-white/5 dark:bg-white/[0.02]"
              >
                {items.length < max ? (
                  <button
                    type="button"
                    onClick={() => add(course)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left hover:text-primary-pink"
                  >
                    <Plus size={14} className="text-primary-pink shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</span>
                  </button>
                ) : (
                  <>
                    <span
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'copy';
                        e.dataTransfer.setData('application/x-course-id', courseId(course));
                      }}
                      className="inline-flex cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 dark:text-white/35 dark:hover:text-white/70 shrink-0"
                      title="Drag onto a slot above to replace"
                      aria-label={`Drag ${course.title || 'course'} onto a slot`}
                    >
                      <GripVertical size={16} />
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 min-w-0">{course.title}</span>
                  </>
                )}
              </div>
            ))}
            {query && suggestions.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-white/40 px-1">No matching published courses.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const CourseHomepagePlacements = forwardRef(function CourseHomepagePlacements({ section = 'all', onBusyChange }, ref) {
  const toast = useToast();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const readyRef = useRef(false);
  const skipNextSaveRef = useRef(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminService.getPublishedCourses(), adminService.getHomepageFeatured()])
      .then(([publishedRes, featuredRes]) => {
        if (cancelled) return;
        setCatalog(publishedRes?.data ?? []);
        const data = featuredRes?.data ?? {};
        setTrending(data.trending ?? []);
        setPopular(data.popular ?? []);
        skipNextSaveRef.current = true;
        readyRef.current = true;
      })
      .catch((err) => {
        toast.error('Load failed', err.response?.data?.message || 'Could not load homepage placements.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const persist = async ({ silent } = {}) => {
    setSaving(true);
    try {
      const res = await adminService.saveHomepageFeatured({
        trendingCourseIds: trending.map(courseId).filter(Boolean),
        popularCourseIds: popular.map(courseId).filter(Boolean),
      });
      dispatch(coursesApi.util.invalidateTags(['HomepageFeatured', 'PublicCourses']));
      if (!silent) {
        const data = res?.data ?? {};
        setTrending(data.trending ?? trending);
        setPopular(data.popular ?? popular);
        toast.success('Saved', 'Homepage Trending and Popular now match this order.');
      }
    } catch (err) {
      toast.error('Save failed', err.response?.data?.message || 'Could not save placements.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!readyRef.current || loading) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      persist({ silent: true });
    }, 400);
    return () => clearTimeout(timer);
    // persist reads latest trending/popular from this render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trending, popular, loading]);

  useImperativeHandle(ref, () => ({
    save: () => persist({ silent: false }),
  }));

  useEffect(() => {
    onBusyChange?.({ saving, loading });
  }, [saving, loading, onBusyChange]);

  const showTrending = section === 'all' || section === 'trending';
  const showPopular = section === 'all' || section === 'popular';
  const compact = section !== 'all';

  return (
    <section className="space-y-5">
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Homepage course panel</h2>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
              Manually set which published courses appear in Trending and Popular. Reorder or swap a slot — the homepage updates to this order.
            </p>
          </div>
          <Button variant="primary" size="sm" isLoading={saving} onClick={() => persist({ silent: false })} disabled={loading}>
            Save placements
          </Button>
        </div>
      )}
      {loading ? (
        <CardListSkeleton count={compact ? 1 : 2} height={220} />
      ) : (
        <div className={showTrending && showPopular ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' : ''}>
          {showTrending && (
            <PlacementPanel
              title="Trending courses"
              subtitle="Shown in the hero carousel (up to 4)."
              icon={Flame}
              items={trending}
              max={TRENDING_MAX}
              catalog={catalog}
              onChange={setTrending}
              hideChrome={compact}
            />
          )}
          {showPopular && (
            <PlacementPanel
              title="Popular courses"
              subtitle="Shown in the Popular Courses section (up to 8)."
              icon={Star}
              items={popular}
              max={POPULAR_MAX}
              catalog={catalog}
              onChange={setPopular}
              hideChrome={compact}
            />
          )}
        </div>
      )}
    </section>
  );
});

export default CourseHomepagePlacements;
