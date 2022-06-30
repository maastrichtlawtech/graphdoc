import { reactive, ref } from "vue";

export class Modal<DataT extends object> {
    data;
    
    constructor(data: DataT) {
        this.data = reactive(data);
    }

    is_open = ref(false);
    open() {
        this.is_open.value = true;
    }
    close() {
        this.is_open.value = false;
    }
}