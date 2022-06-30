// from: https://github.com/nhn/tui.editor/blob/66db3f8d4099141332fab88e88a8afd191808648/apps/vue-editor/src/index.js
import Editor from './TUIEditor.vue';
// import Viewer from './TUIViewer.vue';

export { Editor };

// From mixin
export const editorEvents = [
    'load',
    'change',
    'caretChange',
    'focus',
    'blur',
    'keydown',
    'keyup',
    'beforePreviewRender',
    'beforeConvertWysiwygToMarkdown',
] as const;

export const defaultValueMap = {
    initialEditType: 'markdown',
    initialValue: '',
    height: '320px',
    previewStyle: 'vertical',
};