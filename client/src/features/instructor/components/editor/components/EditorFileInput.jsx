import React from 'react';

/**
 * Hidden file input for course/media uploads. Accept attribute is driven by upload type.
 * Memoized so it only re-renders when ref, onChange, or accept change.
 */
const EditorFileInput = React.memo(function EditorFileInput({ fileInputRef, onChange, accept }) {
  return (
    <input
      type="file"
      ref={fileInputRef}
      className="hidden"
      onChange={onChange}
      accept={accept}
    />
  );
});

export default EditorFileInput;
