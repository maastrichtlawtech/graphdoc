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

<style lang="scss">
.EasyMDEContainer {
    text-align: initial;

    .editor-preview-full {
        // default markdown css from: https://gist.github.com/splorp/4269641/9da499a4322ac9796549cb1ba67b901c4f945d53

        // background-color: #FFF;
        color: #333;
        font: 15px Helvetica, arial, freesans, clean, sans-serif;
        word-wrap: break-word;
        line-height: 1.7;
        padding: 0 20px 20px 20px;
        width: 722px;
        -webkit-font-smoothing: antialiased;
        
        a {
            color: #4183c4;
            text-decoration: none;
            }

        a:hover {
            text-decoration: underline;
            }

        p, blockquote, ul, ol, dl, table, pre {
            margin: 15px 0;
            }

        ul, ol {
            padding-left: 30px;
            }

        h1 {
            border-bottom: 1px solid #ddd;
            color: #000;
            font-size: 2.5em;
            }

        h2 {
            border-bottom: 1px solid #eee;
            color: #000;
            font-size: 2.0em;
            }

        h3 {
            font-size: 1.5em;
            }

        h4 {
            font-size: 1.2em;
            }

        h5 {
            font-size: 1.0em;
            }

        h6 {
            color: #777;
            font-size: 1.0em;
            }

        h1, h2, h3, h4, h5, h6 {
            font-weight: bold;
            line-height: 1.7;
            margin: 1em 0 15px 0;
            }

        h1 + p, h2 + p, h3 + p {
            margin-top: 10px;
            }
            
        img {
            max-width: 100%;
            }

        code,
        pre {
            background-color: #F8F8F8;
            border-radius: 3px;
            border: 1px solid #DDD;
            font-family: Consolas, "Liberation Mono", Courier, monospace;
            font-size: 12px;
            margin: 0 2px;
            padding: 0 5px;
            white-space: pre;
            }

        pre code {
            border: none;
            margin: 0;
            padding: 0;
            white-space: pre;
        }
    }
}
</style>