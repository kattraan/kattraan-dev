import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Trash2,
  Video,
  ExternalLink,
  Calendar,
  RefreshCw,
  Link2,
  MoreHorizontal,
  Pencil,
  Clock,
  Repeat,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import courseService from '@/features/courses/services/courseService';
import { useToast } from '@/components/ui/Toast';
import { parseDatetimeLocal, toDatetimeLocalValue, parseYmd, formatYmd } from '@/lib/datetimeLocal';

const PAGE_SIZE = 8;
const JOIN_WINDOW_MS = 15 * 60 * 1000;
const HOST_JOIN_EARLY_TOOLTIP =
  'Meeting link will be activated 15 minutes prior to the allotted time.';

function isoToDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function inferScheduledEndLocal(s) {
  if (s?.scheduledEnd) return isoToDatetimeLocal(s.scheduledEnd);
  const start = new Date(s?.scheduledAt);
  if (Number.isNaN(start.getTime())) return '';
  const min = Number(s?.durationMinutes) > 0 ? Number(s.durationMinutes) : 60;
  const end = new Date(start.getTime() + min * 60 * 1000);
  return isoToDatetimeLocal(end.toISOString());
}

function computedDurationMinutes(startLocal, endLocal) {
  if (!startLocal || !endLocal) return null;
  const a = new Date(startLocal);
  const b = new Date(endLocal);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b <= a) return null;
  return Math.round((b.getTime() - a.getTime()) / (60 * 1000));
}

function emptyRow() {
  return {
    _id: undefined,
    title: '',
    meetingUrl: '',
    scheduledAt: '',
    scheduledEnd: '',
    recurring: false,
    recurrenceFrequency: 'weekly',
    repeatOn: [],
    recurrenceEndDate: '',
    sameLinkForAll: true,
  };
}

function normalizeFromApi(sessions) {
  if (!Array.isArray(sessions) || !sessions.length) return [];
  return sessions.map((s) => ({
    _id: s._id || s.id,
    title: s.title || '',
    meetingUrl: s.meetingUrl || '',
    scheduledAt: isoToDatetimeLocal(s.scheduledAt),
    scheduledEnd: inferScheduledEndLocal(s),
  }));
}

function parseRowEnd(row) {
  if (!row.scheduledEnd) return null;
  const d = new Date(row.scheduledEnd);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseRowStart(row) {
  if (!row.scheduledAt) return null;
  const d = new Date(row.scheduledAt);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Host join is enabled from 15 min before start through scheduled end. */
function getHostJoinState(row) {
  const start = parseRowStart(row);
  const end = parseRowEnd(row);
  if (!start || !end) return { canJoin: false, reason: 'invalid' };
  const t = Date.now();
  if (t > end.getTime()) return { canJoin: false, reason: 'ended' };
  if (t < start.getTime() - JOIN_WINDOW_MS) return { canJoin: false, reason: 'early' };
  return { canJoin: true, reason: null };
}

function isRowComplete(row) {
  return (
    String(row.meetingUrl || '').trim() &&
    row.scheduledAt &&
    row.scheduledEnd &&
    parseRowStart(row) &&
    parseRowEnd(row) &&
    parseRowEnd(row) > parseRowStart(row)
  );
}

function formatDateHeading(dt) {
  return dt.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeRange(row) {
  const a = parseRowStart(row);
  const b = parseRowEnd(row);
  if (!a || !b) return '—';
  const opts = { hour: 'numeric', minute: '2-digit' };
  return `${a.toLocaleTimeString(undefined, opts)} – ${b.toLocaleTimeString(undefined, opts)}`;
}

function dateKeyLocal(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function groupRowsByDate(rows) {
  const map = new Map();
  for (const row of rows) {
    const start = parseRowStart(row);
    if (!start) continue;
    const key = dateKeyLocal(start);
    if (!map.has(key)) map.set(key, { sort: start.getTime(), label: formatDateHeading(start), items: [] });
    map.get(key).items.push(row);
  }
  const list = [...map.values()].sort((a, b) => a.sort - b.sort);
  for (const g of list) {
    g.items.sort((r1, r2) => (parseRowStart(r1) - parseRowStart(r2)));
  }
  return list;
}

const WEEKDAY_SHORT = ['S', 'M', 'Tu', 'W', 'Th', 'F', 'S'];
const WEEKDAY_LONG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ScheduleModal({ open, mode, initial, onClose, onSave, saving }) {
  const toast = useToast();
  const [row, setRow] = useState(emptyRow());

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setRow({
        ...emptyRow(),
        ...initial,
        recurring: initial.recurring ?? false,
        recurrenceFrequency: initial.recurrenceFrequency === 'daily' ? 'daily' : 'weekly',
        repeatOn: Array.isArray(initial.repeatOn) ? initial.repeatOn.map(Number).filter((n) => n >= 0 && n <= 6) : [],
        recurrenceEndDate: initial.recurrenceEndDate || '',
        sameLinkForAll: initial.sameLinkForAll !== false,
      });
    } else {
      setRow(emptyRow());
    }
  }, [open, initial]);

  if (!open) return null;

  const { date: sessionDate, time: startTime } = parseDatetimeLocal(row.scheduledAt);
  const { time: endTime } = parseDatetimeLocal(row.scheduledEnd);
  const startDateTime = row.scheduledAt ? new Date(row.scheduledAt) : null;
  const endDateTime = row.scheduledEnd ? new Date(row.scheduledEnd) : null;

  const defaultDay = () => {
    const x = new Date();
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const setDateAndTimes = (dateObj, startT, endT) => {
    const st = startT || '09:00';
    const et = endT || '10:00';
    setRow((r) => {
      const next = {
        ...r,
        scheduledAt: toDatetimeLocalValue(dateObj, st),
        scheduledEnd: toDatetimeLocalValue(dateObj, et),
      };
      if (
        r.recurring &&
        r.recurrenceFrequency === 'weekly' &&
        (!r.repeatOn || r.repeatOn.length === 0) &&
        dateObj
      ) {
        next.repeatOn = [dateObj.getDay()];
      }
      return next;
    });
  };

  const dur = computedDurationMinutes(row.scheduledAt, row.scheduledEnd);

  const toggleRepeatDay = (dow) => {
    setRow((r) => {
      const set = new Set(r.repeatOn || []);
      if (set.has(dow)) set.delete(dow);
      else set.add(dow);
      return { ...r, repeatOn: [...set].sort((a, b) => a - b) };
    });
  };

  const submit = () => {
    if (mode === 'add' && row.recurring) {
      if (!String(row.recurrenceEndDate || '').trim()) {
        toast.error('Recurrence', 'Choose an end date (Ends on).');
        return;
      }
      if (row.recurrenceFrequency === 'weekly' && (!row.repeatOn || !row.repeatOn.length)) {
        toast.error('Recurrence', 'Select at least one weekday under Repeat on.');
        return;
      }
      const endD = parseYmd(row.recurrenceEndDate);
      const anchor = new Date(row.scheduledAt);
      if (!endD || Number.isNaN(anchor.getTime())) {
        toast.error('Recurrence', 'Set a valid session date and end date.');
        return;
      }
      const endOfEnd = new Date(endD);
      endOfEnd.setHours(23, 59, 59, 999);
      if (anchor.getTime() > endOfEnd.getTime()) {
        toast.error('Recurrence', 'End date must be on or after the first session date.');
        return;
      }
    }
    onSave({ ...row });
  };

  const fieldLabel = 'block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-white/45 mb-1.5';
  const inputBase =
    'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-pink/30';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-session-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[min(92vh,46rem)] flex flex-col rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#141414] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="shrink-0 px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
          <h2 id="live-session-modal-title" className="text-base font-bold text-gray-900 dark:text-white">
            {mode === 'edit' ? 'Edit live session' : 'Schedule a live session'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 min-h-0 px-6 py-4 space-y-3 overflow-y-auto overscroll-contain touch-pan-y [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div>
            <label className={fieldLabel}>Title (optional)</label>
            <input
              type="text"
              value={row.title}
              onChange={(e) => setRow((r) => ({ ...r, title: e.target.value }))}
              placeholder="e.g. Live Q&A"
              className={inputBase}
            />
          </div>

          <div>
            <label className={fieldLabel}>
              Meeting link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={row.meetingUrl}
              onChange={(e) => setRow((r) => ({ ...r, meetingUrl: e.target.value }))}
              placeholder="https://meet.google.com/... or https://zoom.us/j/..."
              className={inputBase}
            />
          </div>

          <div className="rounded-xl border border-gray-200/90 dark:border-white/[0.08] bg-gray-50/80 dark:bg-white/[0.03] p-3.5 sm:p-4 space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="md:min-w-0">
                <p className={fieldLabel}>Date *</p>
                <DatePicker
                  selected={sessionDate || null}
                  onChange={(d) => {
                    if (!d) return;
                    setDateAndTimes(d, startTime || '09:00', endTime || '10:00');
                  }}
                  placeholderText="Pick session date"
                  dateFormat="EEE, MMM d, yyyy"
                  className={`${inputBase} px-4 py-3 font-semibold`}
                  calendarClassName="kattraan-react-datepicker"
                  popperClassName="kattraan-react-datepicker-popper"
                  showPopperArrow={false}
                />
              </div>
              <div className="md:min-w-0">
                <p className={fieldLabel}>Start *</p>
                <DatePicker
                  selected={startDateTime}
                  onChange={(d) => {
                    if (!d) return;
                    const day = sessionDate || defaultDay();
                    setDateAndTimes(day, `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, endTime || '10:00');
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={5}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select time"
                  className={`${inputBase} px-4 py-3 font-semibold tabular-nums`}
                  calendarClassName="kattraan-react-datepicker"
                  popperClassName="kattraan-react-datepicker-popper"
                  showPopperArrow={false}
                />
              </div>
              <div className="md:min-w-0">
                <p className={fieldLabel}>End *</p>
                <DatePicker
                  selected={endDateTime}
                  onChange={(d) => {
                    if (!d) return;
                    const day = sessionDate || defaultDay();
                    setDateAndTimes(day, startTime || '09:00', `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={5}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  placeholderText="Select time"
                  className={`${inputBase} px-4 py-3 font-semibold tabular-nums`}
                  calendarClassName="kattraan-react-datepicker"
                  popperClassName="kattraan-react-datepicker-popper"
                  showPopperArrow={false}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200/80 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-1.5 text-xs">
              <span className="font-semibold text-gray-500 dark:text-white/45">Duration</span>
              <span className="font-bold tabular-nums text-gray-900 dark:text-white">
                {dur != null ? `${dur} min` : '—'}
              </span>
            </div>
          </div>

          {mode === 'add' && (
            <div className="space-y-2">
              <div className="rounded-xl border border-gray-200/90 dark:border-white/[0.08] bg-gradient-to-r from-[#FF8C42]/[0.08] to-[#FF3FB4]/[0.08] dark:from-[#FF8C42]/12 dark:to-[#FF3FB4]/12 p-3 sm:p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-white/15 bg-white/80 dark:bg-black/30">
                    <Repeat className="h-5 w-5 text-primary-pink" aria-hidden />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Recurring workshop</p>
                    <p className="text-[11px] text-gray-600 dark:text-white/45 mt-0.5 leading-snug">
                      Same start/end time on each occurrence — we expand through your end date (Tagmango-style).
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.recurring}
                    onClick={() =>
                      setRow((r) => {
                        const on = !r.recurring;
                        if (!on) return { ...r, recurring: false };
                        const sd = parseDatetimeLocal(r.scheduledAt).date;
                        const next = { ...r, recurring: true };
                        if (sd && next.recurrenceFrequency === 'weekly' && (!next.repeatOn || !next.repeatOn.length)) {
                          next.repeatOn = [sd.getDay()];
                        }
                        if (!next.recurrenceEndDate && sd) {
                          const end = new Date(sd);
                          end.setDate(end.getDate() + 56);
                          next.recurrenceEndDate = formatYmd(end);
                        }
                        return next;
                      })
                    }
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      row.recurring
                        ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]'
                        : 'bg-gray-300 dark:bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        row.recurring ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
                {row.recurring && (
                  <div className="mt-3 space-y-3 pl-0 sm:pl-[52px]">
                    <div>
                      <p className={fieldLabel}>Repeat every</p>
                      <select
                        value={row.recurrenceFrequency}
                        onChange={(e) =>
                          setRow((r) => ({
                            ...r,
                            recurrenceFrequency: e.target.value === 'daily' ? 'daily' : 'weekly',
                          }))
                        }
                        className={`${inputBase} appearance-none cursor-pointer bg-gray-50/90 dark:bg-black/25`}
                      >
                        <option value="weekly">Week</option>
                        <option value="daily">Day</option>
                      </select>
                    </div>
                    {row.recurrenceFrequency === 'weekly' && (
                      <div>
                        <p className={fieldLabel}>Repeat on</p>
                        <div className="flex flex-wrap gap-1.5">
                          {WEEKDAY_SHORT.map((label, dow) => {
                            const active = (row.repeatOn || []).includes(dow);
                            return (
                              <button
                                key={WEEKDAY_LONG[dow]}
                                type="button"
                                title={WEEKDAY_LONG[dow]}
                                onClick={() => toggleRepeatDay(dow)}
                                className={`h-9 w-9 rounded-full text-xs font-bold transition-colors ${
                                  active
                                    ? 'bg-gradient-to-br from-[#FF8C42] to-[#FF3FB4] text-white shadow-sm'
                                    : 'border border-gray-200 dark:border-white/15 bg-white/90 dark:bg-black/30 text-gray-600 dark:text-white/55 hover:border-primary-pink/40'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {row.recurrenceFrequency === 'daily' && (
                      <p className="text-[11px] text-gray-600 dark:text-white/45">Every calendar day until the end date.</p>
                    )}
                    <div>
                      <p className={fieldLabel}>Ends on</p>
                      <DatePopoverField
                        value={parseYmd(row.recurrenceEndDate) || undefined}
                        onChange={(d) =>
                          setRow((r) => ({ ...r, recurrenceEndDate: d ? formatYmd(d) : '' }))
                        }
                        placeholder="Pick last occurrence date"
                      />
                    </div>
                  </div>
                )}
              </div>
              {row.recurring && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.04] px-3 py-2.5">
                  <span className="text-xs font-semibold text-gray-700 dark:text-white/65">
                    Enable same link for all recurring calls
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={row.sameLinkForAll !== false}
                    onClick={() => setRow((r) => ({ ...r, sameLinkForAll: !r.sameLinkForAll }))}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      row.sameLinkForAll !== false
                        ? 'bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]'
                        : 'bg-gray-300 dark:bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        row.sameLinkForAll !== false ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              )}
              {row.recurring && row.sameLinkForAll === false && (
                <p className="text-[11px] text-gray-500 dark:text-white/40 px-0.5">
                  Sessions are still created with this link; you can edit each row afterward to use different links.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 px-6 py-3.5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2 bg-gray-50/80 dark:bg-black/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-white/75 hover:bg-gray-200/80 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 transition-opacity shadow-md shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add session'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LiveSessionsTab({ courseId, courseDetails, loadCourse }) {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [listTab, setListTab] = useState('upcoming');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalEditIndex, setModalEditIndex] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuRect, setMenuRect] = useState(null);

  const closeLiveMenu = useCallback(() => {
    setMenuOpenId(null);
    setMenuRect(null);
  }, []);

  const openLiveMenu = useCallback(
    (idx, anchorEl) => {
      if (menuOpenId === idx) {
        closeLiveMenu();
        return;
      }
      const r = anchorEl.getBoundingClientRect();
      const menuWidth = 176;
      const approxMenuHeight = 96;
      let top = r.bottom + 6;
      if (top + approxMenuHeight > window.innerHeight - 12) {
        top = Math.max(12, r.top - approxMenuHeight - 6);
      }
      let left = r.right - menuWidth;
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
      setMenuRect({ top, left });
      setMenuOpenId(idx);
    },
    [menuOpenId, closeLiveMenu],
  );

  useEffect(() => {
    setRows(normalizeFromApi(courseDetails?.liveSessions));
  }, [courseDetails?.liveSessions]);

  useEffect(() => {
    setPage(1);
  }, [listTab, filterStart, filterEnd]);

  useEffect(() => {
    if (menuOpenId == null) return;
    const onScrollOrResize = () => closeLiveMenu();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [menuOpenId, closeLiveMenu]);

  const persistPayload = useCallback(
    async (nextRows) => {
      if (!courseId) return;
      const payload = [];
      for (const row of nextRows) {
        if (!isRowComplete(row)) continue;
        const url = String(row.meetingUrl || '').trim();
        const startLocal = row.scheduledAt;
        const endLocal = row.scheduledEnd;
        try {
          // eslint-disable-next-line no-new
          new URL(url);
        } catch {
          toast.error('Invalid URL', 'Use a full link starting with https:// (Meet or Zoom).');
          return false;
        }
        const scheduledAt = new Date(startLocal);
        const scheduledEnd = new Date(endLocal);
        if (scheduledEnd.getTime() <= scheduledAt.getTime()) {
          toast.error('Invalid range', 'End time must be after start time.');
          return false;
        }
        const durMin = Math.round((scheduledEnd.getTime() - scheduledAt.getTime()) / (60 * 1000));
        if (durMin < 5 || durMin > 480) {
          toast.error('Duration', 'Sessions must be between 5 minutes and 8 hours.');
          return false;
        }
        const entry = {
          title: String(row.title || '').trim(),
          meetingUrl: url,
          scheduledAt: scheduledAt.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
        };
        if (row._id) entry._id = row._id;
        if (!row._id && row.recurring) {
          const endYmd = String(row.recurrenceEndDate || '').trim();
          if (!endYmd) {
            toast.error('Recurrence', 'End date is required for recurring sessions.');
            return false;
          }
          const freq = row.recurrenceFrequency === 'daily' ? 'daily' : 'weekly';
          const repeatOn =
            freq === 'daily'
              ? [0, 1, 2, 3, 4, 5, 6]
              : [...new Set((row.repeatOn || []).map(Number).filter((n) => n >= 0 && n <= 6))].sort(
                  (a, b) => a - b,
                );
          if (freq === 'weekly' && !repeatOn.length) {
            toast.error('Recurrence', 'Pick at least one weekday.');
            return false;
          }
          entry.recurring = true;
          entry.recurrenceFrequency = freq;
          entry.repeatOn = repeatOn;
          entry.recurrenceEndDate = endYmd;
          entry.sameLinkForAll = row.sameLinkForAll !== false;
        }
        payload.push(entry);
      }
      setSaving(true);
      try {
        await courseService.updateCourseLiveSessions(courseId, payload);
        toast.success('Saved', 'Live sessions updated.');
        await loadCourse();
        return true;
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || 'Could not save live sessions.';
        toast.error('Save failed', msg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [courseId, loadCourse, toast],
  );

  const completeRows = useMemo(() => rows.filter(isRowComplete), [rows]);

  const filteredByTab = useMemo(() => {
    const now = Date.now();
    let list = completeRows.filter((row) => {
      const end = parseRowEnd(row);
      if (!end) return false;
      if (listTab === 'upcoming') return end.getTime() >= now;
      return end.getTime() < now;
    });
    if (listTab === 'upcoming') {
      list = [...list].sort((a, b) => (parseRowStart(a) - parseRowStart(b)));
    } else {
      list = [...list].sort((a, b) => (parseRowEnd(b) - parseRowEnd(a)));
    }
    if (filterStart) {
      const fs = new Date(filterStart);
      fs.setHours(0, 0, 0, 0);
      list = list.filter((row) => {
        const s = parseRowStart(row);
        return s && s >= fs;
      });
    }
    if (filterEnd) {
      const fe = new Date(filterEnd);
      fe.setHours(23, 59, 59, 999);
      list = list.filter((row) => {
        const s = parseRowStart(row);
        return s && s <= fe;
      });
    }
    return list;
  }, [completeRows, listTab, filterStart, filterEnd]);

  const pagedSlice = useMemo(() => {
    const startIdx = (page - 1) * PAGE_SIZE;
    return filteredByTab.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredByTab, page]);

  const displayGroups = useMemo(() => groupRowsByDate(pagedSlice), [pagedSlice]);

  const totalPages = Math.max(1, Math.ceil(filteredByTab.length / PAGE_SIZE));

  const openAddModal = () => {
    setModalMode('add');
    setModalEditIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (indexInRows) => {
    setModalMode('edit');
    setModalEditIndex(indexInRows);
    setModalOpen(true);
    closeLiveMenu();
  };

  const handleModalSave = async (rowFromModal) => {
    if (!isRowComplete(rowFromModal)) {
      toast.error('Incomplete', 'Meeting link, start, and end are required.');
      return;
    }
    let next;
    if (modalMode === 'edit' && modalEditIndex != null) {
      next = rows.map((r, i) => (i === modalEditIndex ? { ...rowFromModal } : r));
    } else {
      next = [...rows, { ...rowFromModal }];
    }
    setModalOpen(false);
    await persistPayload(next);
  };

  const removeRowAt = async (index) => {
    const next = rows.filter((_, i) => i !== index);
    closeLiveMenu();
    await persistPayload(next);
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url).then(
      () => toast.success('Copied', 'Meeting link copied to clipboard.'),
      () => toast.error('Copy failed', 'Could not copy to clipboard.'),
    );
  };

  const refresh = () => {
    loadCourse?.();
    toast.success('Refreshed', 'Schedule reloaded.');
  };

  const modalInitial =
    modalMode === 'edit' && modalEditIndex != null ? rows[modalEditIndex] : null;

  if (!courseId) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/15 bg-gray-50/80 dark:bg-white/[0.03] p-8 text-center">
          <Video className="w-10 h-10 mx-auto text-gray-400 dark:text-white/30 mb-3" aria-hidden />
          <p className="text-gray-700 dark:text-white/80 font-semibold">Save the course first</p>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-2">
            After your course is created, you can add Meet or Zoom links and schedule times here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="p-6 sm:p-8 max-w-4xl pb-16 space-y-8">
      <ScheduleModal
        open={modalOpen}
        mode={modalMode}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
        saving={saving}
      />

      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <Video className="text-primary-pink shrink-0" size={22} aria-hidden />
        Live sessions
      </h2>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 dark:border-white/10">
        <div className="flex gap-8">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setListTab(t.id)}
              className={`relative pb-3 text-sm font-bold transition-colors ${
                listTab === t.id
                  ? 'text-transparent bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70'
              }`}
            >
              {t.label}
              {listTab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-white/35 shrink-0" aria-hidden />
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white outline-none min-w-0"
              aria-label="Filter from date"
            />
            <span className="text-gray-400 dark:text-white/30">–</span>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white outline-none min-w-0"
              aria-label="Filter to date"
            />
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-white/60 hover:border-primary-pink/40 hover:text-primary-pink transition-colors"
            title="Refresh"
            aria-label="Refresh list"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="sm:ml-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/15"
        >
          <Plus size={18} aria-hidden />
          Schedule live session
        </button>
      </div>

      {/* List */}
      {filteredByTab.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-white/12 bg-gray-50/50 dark:bg-white/[0.02] px-8 py-16 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF8C42]/20 to-[#FF3FB4]/20 border border-white/10 mb-4">
            <Video className="w-7 h-7 text-white/70" aria-hidden />
          </div>
          <p className="text-gray-800 dark:text-white font-semibold">
            {listTab === 'upcoming' ? 'No upcoming sessions' : 'No completed sessions yet'}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/45 mt-2 max-w-md mx-auto">
            {listTab === 'upcoming'
              ? 'Schedule a live session to share your Meet or Zoom link with enrolled learners.'
              : 'Completed workshops will appear here after their end time.'}
          </p>
          {listTab === 'upcoming' && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent hover:opacity-90"
            >
              <Plus size={16} />
              Schedule your first session
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {displayGroups.map((group) => (
            <div key={group.sort}>
              <div className="mb-3 rounded-lg border border-gray-200/90 bg-gray-100/90 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.05] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] dark:backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-white/55">
                  {group.label}
                </p>
              </div>
              <ul className="space-y-3">
                {group.items.map((row) => {
                  const idx = rows.indexOf(row);
                  const url = String(row.meetingUrl || '').trim();
                  const title = String(row.title || '').trim() || 'Live session';
                  const { canJoin: canHostJoin, reason: hostJoinReason } = getHostJoinState(row);
                  const showHostEarlyTooltip = hostJoinReason === 'early';
                  const hostJoinTitle =
                    hostJoinReason === 'early'
                      ? HOST_JOIN_EARLY_TOOLTIP
                      : hostJoinReason === 'ended'
                        ? 'This session has ended.'
                        : undefined;
                  return (
                    <li
                      key={row._id || `${group.sort}-${idx}`}
                      className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl sm:flex-row sm:items-stretch sm:p-5"
                    >
                      <div className="flex gap-3 sm:w-[200px] shrink-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#FF8C42]/15 to-[#FF3FB4]/15 ring-1 ring-gray-200/50 dark:ring-white/[0.08]">
                          <Clock className="w-5 h-5 text-primary-pink/90" aria-hidden />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{formatTimeRange(row)}</p>
                          <p className="text-[11px] text-gray-500 dark:text-white/40 mt-0.5">
                            {computedDurationMinutes(row.scheduledAt, row.scheduledEnd) != null
                              ? `${computedDurationMinutes(row.scheduledAt, row.scheduledEnd)} min`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug">{title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:shrink-0">
                        {canHostJoin ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-white/[0.05] text-gray-800 dark:text-white/90 hover:border-primary-pink/40 transition-colors"
                          >
                            <ExternalLink size={14} aria-hidden />
                            Join as host
                          </a>
                        ) : (
                          <div className="relative group">
                            {showHostEarlyTooltip ? (
                              <div
                                className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-[min(100vw-2rem,17rem)] -translate-x-1/2 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                role="tooltip"
                              >
                                <div className="rounded-lg bg-black px-3 py-2 text-center text-[11px] font-medium leading-snug text-white shadow-lg dark:bg-neutral-950">
                                  {HOST_JOIN_EARLY_TOOLTIP}
                                </div>
                                <div
                                  className="mx-auto h-0 w-0 border-[7px] border-transparent border-t-black dark:border-t-neutral-950"
                                  aria-hidden
                                />
                              </div>
                            ) : null}
                            <button
                              type="button"
                              disabled
                              title={hostJoinTitle}
                              className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-white/35 opacity-90"
                            >
                              <ExternalLink size={14} aria-hidden />
                              Join as host
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => copyLink(url)}
                          title="Copy meeting link"
                          aria-label="Copy meeting link"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 transition-opacity shadow-sm shadow-pink-500/25"
                        >
                          <Link2 size={14} className="shrink-0 opacity-95" aria-hidden />
                        </button>
                        <div>
                          <button
                            type="button"
                            onClick={(e) => openLiveMenu(idx, e.currentTarget)}
                            className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:text-white/50 dark:hover:bg-white/10"
                            aria-label="More options"
                            aria-expanded={menuOpenId === idx}
                          >
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-end items-center gap-2 pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 dark:border-white/10 disabled:opacity-40 text-gray-700 dark:text-white/80"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-white/45 px-2">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 dark:border-white/10 disabled:opacity-40 text-gray-700 dark:text-white/80"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {menuOpenId !== null &&
      menuRect != null &&
      createPortal(
        <>
          <button
            type="button"
            className="fixed inset-0 z-[300] cursor-default bg-black/20 dark:bg-black/40"
            aria-label="Close menu"
            onClick={closeLiveMenu}
          />
          <div
            role="menu"
            className="fixed z-[310] min-w-[176px] rounded-xl border border-gray-200/90 bg-white/95 py-1 shadow-2xl backdrop-blur-xl dark:border-white/15 dark:bg-[#1a1a1a]/95"
            style={{ top: menuRect.top, left: menuRect.left }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const i = menuOpenId;
                closeLiveMenu();
                openEditModal(i);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50 dark:text-white dark:hover:bg-white/10"
            >
              <Pencil size={14} aria-hidden />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const i = menuOpenId;
                closeLiveMenu();
                if (window.confirm('Remove this live session?')) removeRowAt(i);
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 size={14} aria-hidden />
              Delete
            </button>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
