<template>
    <textarea ref="editorRef"></textarea>
</template>
<script setup lang="ts">
// inspired from: https://github.com/nhn/tui.editor/blob/66db3f8d4099141332fab88e88a8afd191808648/apps/vue-editor/src/Editor.vue

import { onMounted, onUnmounted, Ref, ref, watch } from 'vue';

import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

const props = defineProps<{
    // initialValue?: string,
    options: EasyMDE.Options,
    value?: string
}>();
const emit = defineEmits(['change', 'input'])


const editor: Ref<EasyMDE | null> = ref(null);
const editorRef: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
    // // https://stackoverflow.com/a/71094531/17864167

    console.log(props);
    
    if (editorRef.value != null) {
        const options = {
            element: editorRef.value,
            
            initialValue: props.value,
            spellChecker: false,

            ...props.options
        };
        
        editor.value = new EasyMDE(options);

        editor.value.codemirror.on('change', (...args) => {
            emit('change', editor.value, ...args);
            emit('input', editor.value?.value());
        })

    }

});

onUnmounted(() => {
    if (editor.value !== null) {
        editor.value.cleanup();
    }
});
</script>

<style>
.EasyMDEContainer {
    text-align: initial;
}
</style>