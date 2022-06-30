<template>
    <div ref="toastuiEditor"></div>
</template>
<script setup lang="ts">
// inspired from: https://github.com/nhn/tui.editor/blob/66db3f8d4099141332fab88e88a8afd191808648/apps/vue-editor/src/Editor.vue
import Editor, { EditorOptions, PreviewStyle, EditorType } from '@toast-ui/editor';
import { onMounted, onUnmounted, Ref, ref, watch } from 'vue';

import { defaultValueMap, editorEvents,  } from ".";

// When added in <style> section, preflight overrides button backgrounds
import '@toast-ui/editor/dist/toastui-editor.css';

const emit = defineEmits(Object.values(editorEvents));
const props = defineProps<{
    previewStyle?: PreviewStyle,
    height?: string, 
    initialEditType?: EditorType,
    initialValue?: string,
    options?: Partial<EditorOptions>
}>();

const editor: Ref<Editor | null> = ref(null);

const toastuiEditor: Ref<HTMLElement | null> = ref(null)

watch(() => props.previewStyle, (value) => {
    if (editor.value != null && value != undefined)
        editor.value.changePreviewStyle(value);
});

watch(() => props.height, (value) => {
    if (editor.value != null && value != undefined)
        editor.value.setHeight(value);
});

onMounted(() => {
    // https://stackoverflow.com/a/71094531/17864167
    
    const eventOptions: {[event: string]: () => void} = {};
    editorEvents.forEach((event) => {
        eventOptions[event] = (...args) => {
            emit(event, editor, ...args);
        };
    });

    const options = {
        el: toastuiEditor.value as HTMLElement,

        ...props.options,

        initialEditType: props.initialEditType ?? defaultValueMap['initialEditType'] as EditorType,
        initialValue: props.initialValue ?? defaultValueMap['initialValue'],
        height: props.height ?? defaultValueMap['height'],
        previewStyle: props.previewStyle ?? defaultValueMap['previewStyle'] as PreviewStyle,

        events: eventOptions,
    };

    editor.value = new Editor(options);

    return editor;
});


const getRootElement = () => {
    return toastuiEditor;
}

// From mixin

onUnmounted(() => {
    if (editor.value !== null) {
        for (const event in editorEvents) {
            editor.value.off(event);
        }
        editor.value.destroy();
    }
});

const invoke = (methodName: string, ...args: any) => {
    if (editor.value != null) {
        let result = null;

        if ((editor.value as any)[methodName]) {
            result = (editor.value as any)[methodName](...args);
        }
    
        return result;
    }
}
</script>

<style lang="scss">
// @import "~@toast-ui/editor/dist/toastui-editor.css";
</style>