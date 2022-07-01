import { reactive, Ref, ref, UnwrapNestedRefs } from "vue";

type TEvents = {
    onOpen?: () => void;
    onClose?: () => void;
}

export class Modal<DataT extends object> {
    // private _data: DataT; // for resetting state, like https://stackoverflow.com/a/61509432/17864167
    data: UnwrapNestedRefs<DataT>;

    events: TEvents
    
    constructor(data?: DataT, events?: TEvents) {
        if (data)
            this.data = reactive(data) as UnwrapNestedRefs<DataT>;
        else
            this.data = reactive({}) as UnwrapNestedRefs<DataT>;

        this.events = {...events};
    }

    is_open = ref(false);
    open() {
        if (this.events.onOpen)
            this.events.onOpen();
        this.is_open.value = true;
    }
    close() {
        if (this.events.onClose)
            this.events.onClose();
        this.is_open.value = false;
    }
}