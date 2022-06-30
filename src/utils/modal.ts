// export type Modal = {
//     is_open: boolean,
//     open: () => void,
//     close: () => void
// };

import { ref } from "vue";

export class Modal {
    is_open = ref(false);
    open() {
        this.is_open.value = true;
    }
    close() {
        this.is_open.value = false;
    }
}