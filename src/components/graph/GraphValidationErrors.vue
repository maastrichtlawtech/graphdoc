<template>

    <!-- <div class="border border-gray-500 rounded mt-4 mb-2 py-2 px-3" :class="{ 'bg-red-50': props.formatted_validation_errors.length > 0 }"> -->
    <div class="overflow-hidden rounded-lg border hover:shadow-sm transition ease-in-out mt-4 mb-2 py-2 px-4"
        :class="{
            'bg-red-50 border-red-900/20 hover:border-red-900/30': props.formatted_validation_errors.length > 0,
            'bg-sky-100/10 border-sky-900/20 hover:border-sky-900/30': !(props.formatted_validation_errors.length > 0),
        }">
        <template v-if="props.formatted_validation_errors.length > 0">
            <span class="block font-semibold mb-1 text-red-900">There are {{props.formatted_validation_errors.length}} errors in your graph</span>
            <ul class="list-disc list-inside">
                <li class="validation-error text-red-800" v-for="(validation_error, vei) in props.formatted_validation_errors" :key="vei">
                    <!-- {{ validation_error }} -->
                    <template v-for="err_part in validation_error" :key="err_part">
                        <component v-if="(err_part as any).__v_isVNode ?? false" :is="err_part" />
                        <template v-else>{{ err_part }}</template>
                    </template>
                </li>
            </ul>
        </template>
        <span v-else class="block text-sky-800">Graph contains no errors</span>
    </div>

</template>

<script lang="ts" setup>

    import { VNode } from 'vue';
    
    const props = defineProps<{formatted_validation_errors: (string | VNode)[][]}>();

</script>

<style lang="scss">
.validation-error {
    span.clickable-entity {
        @apply font-mono text-sm;
        font-size: 0.7rem;

        color: rgb(63, 19, 19);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 4px;

        &:hover {
            // @apply text-black;
            text-decoration: initial;
        }
    }
}

</style>