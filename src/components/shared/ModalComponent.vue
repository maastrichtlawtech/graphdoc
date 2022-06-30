<template>
    <Teleport to="body">
        <Transition name="modal-transition" appear>
            <!-- from: https://tailwindui.com/components/application-ui/overlays/modals -->
            <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true"
                v-if="props.modal.is_open.value"
                @mousedown="mousedown"
                @mouseup="mouseup"
            >
                <div class="modal-bg fixed inset-0 bg-gray-500 bg-opacity-75"></div>

                <div class="fixed z-20 inset-0 overflow-y-auto">
                    <div class="flex items-end sm:items-center justify-center min-h-full p-4 text-center">
                        <div class="modal-container relative bg-white rounded-lg text-left overflow-hidden shadow-xl sm:my-8 sm:max-w-3xl sm:w-full">
                            <slot></slot>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
import { Modal } from '@/utils/modal';

const props = defineProps<{
    modal: Modal<object>
}>();

let down_target: Element | null = null;

const mousedown = (e: Event) => {
    down_target = e.target as Element;
}

const mouseup = (e: Event) => {
    if (down_target != null) {
        const container = document.querySelector('.modal-container');
        if (container != null && !container.contains(down_target as Element)) {
            props.modal.close();
        }
    }

    down_target = null;
}
</script>

<style scoped lang="scss">
/* Modal Transitions on name 'modal-transition' */
.modal-transition-enter-active {
    .modal-bg {
        transition: opacity 0.1s ease;
    }

    &, .modal-container {
        transition: all 0.2s ease;
        transition-delay: 0.06s;
    }
}

.modal-transition-leave-active {
    pointer-events: none;

    .modal-bg {
        transition: opacity 0.2s ease;
        transition-delay: 0.06s;
    }

    &, .modal-container {
        transition: all 0.3s ease;
    }
}

.modal-transition-enter-from,
.modal-transition-leave-to {
    .modal-bg {
        opacity: 0;
    }
    .modal-container {
        opacity: 0;
        transform: translateY(10px)  scale(0.9);
    }
}

</style>