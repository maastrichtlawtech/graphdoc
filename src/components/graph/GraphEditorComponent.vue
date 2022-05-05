<template>

    <div class="mb-8 mt-4 mx-auto max-w-6xl">
        <GraphModeler />
    </div>

</template>

<script lang="ts" setup>

    import { onMounted } from 'vue'

    import GraphModeler from './GraphModeler.vue'

    onMounted(() => {
        console.log('Editor window mounted.')
    });
    
</script>