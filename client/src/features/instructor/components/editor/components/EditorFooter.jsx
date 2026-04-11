import React from 'react';
import { Save, Eye, Rocket } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Footer actions for course editor: Save Draft, Preview, Publish.
 * Memoized to prevent re-renders when tab content changes.
 */
const EditorFooter = React.memo(({ onSaveDraft, onPreview, onPublish }) => (
  <div className="flex items-center justify-end gap-3 mt-10 pb-10 pt-6">
    <Button
      variant="secondary"
      onClick={() => onSaveDraft('Draft')}
      className="bg-white dark:bg-black border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 gap-2 px-5 h-11 rounded-lg transition-colors duration-300"
    >
      <Save size={16} /> Save as Draft
    </Button>
    <Button
      variant="secondary"
      onClick={onPreview}
      className="bg-gray-100 dark:bg-[#3A3A3A] border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-[#4A4A4A] gap-2 px-5 h-11 rounded-lg transition-colors duration-300"
    >
      <Eye size={16} /> Preview
    </Button>
    <Button
      onClick={() => onPublish('Published')}
      className="hover:bg-gray-50 gap-2 px-5 h-11 font-bold rounded-lg shadow-sm"
      style={{ background: 'white', color: '#C946C6', backgroundImage: 'none' }}
    >
      <Rocket size={16} style={{ color: '#C946C6' }} /> Publish Course
    </Button>
  </div>
));

EditorFooter.displayName = 'EditorFooter';

export default EditorFooter;
