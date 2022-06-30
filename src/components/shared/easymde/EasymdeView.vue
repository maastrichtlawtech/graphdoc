<template>
    <textarea ref="editorRef"></textarea>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, Ref, ref } from 'vue';

import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';

// :value and @input to mimick v-model. (does this work?)
const props = defineProps<{
    options: EasyMDE.Options,
    value?: string
}>();
const emit = defineEmits(['change', 'input'])

const editor: Ref<EasyMDE | null> = ref(null);
const editorRef: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
    
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