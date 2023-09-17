<template>
    <v-sheet class="p-4 flex flex-col gap-2" id="root">
        <div class="text-h5">
            <v-text-field 
                label="Matrix Name"
                :rules="[matrixNameValidator]"
                v-model="matrixName"
                />
        </div>

        <div class="text-caption h-full flex items-center">Note: You can press tab while entering numbers to traverse in the matrix easily</div>
        <div>
            <v-container fluid>
                <v-row no-gutters>
                    <v-col cols="1">
                            <v-btn @click="changeDim(-1)" class="together" variant="tonal">
                                -
                            </v-btn>
                    </v-col>
                    <v-col cols="10">
                        <div class="flex justify-between">
                            
                            <v-btn @click="changeColumns(-1)" class="together" variant="tonal">-</v-btn>
                            <div>Columns</div>
                            <div></div>

                        </div>
                    </v-col>
                    <v-col cols="1">
                        <div>
                            
                            <v-btn @click="changeColumns(1)" class="together" variant="tonal">+</v-btn>

                        </div>
                    </v-col>
                </v-row>
                <v-row no-gutters class="pt-2">
                    <v-col cols="1">
                        <div class="flex flex-col justify-between h-full" style="min-height: 200px;">
                            
                            <div>
                                <v-btn @click="changeRows(-1)" class="together" variant="tonal">-</v-btn>
                            </div>
                            <div class="text-vertical flex items-center">Rows</div>
                            <div>
                                <v-btn @click="changeRows(1)" class="together" variant="tonal">+</v-btn>
                            </div>

                        </div>
                    </v-col>
                    <v-col cols="10">
                        <div class="px-2 flex flex-col" id="matrix-table">
                            <div v-for="(r, i) in value" :key="r.join() + Math.random()" class="flex">
                                <div v-for="(c, j) in r" :key="`${r.join()}-${c}-${Math.random()}`" class="">

                                    <input type="text" class="border cinput" 
                                    :value="c" 
                                    @input="set(i, j, $event.target.value)"
                                    @click="$event.target.select()">

                                </div>
                            </div>
                        </div>
                    </v-col>
                    
                    <v-col cols="1">
                        <div class="flex h-full items-end">
                            <v-btn @click="changeDim(1)" class="together" variant="tonal">
                                +
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
            <div>
                <v-form v-model="isSaveable">
                    
                    <v-btn color="success" variant="tonal" block :disabled="!isSaveable" @click="saveMatrix">Save</v-btn>
                
                </v-form>
            </div>
        </div>

    </v-sheet>
</template>

<script>
import useMatrixStore from '@/stores/useMatrixStore';
import { reactive } from 'vue';
import { ref } from 'vue';
import { computed } from 'vue';
import { JMatrix } from '@/common/JMatrix';
import { getCurrentInstance } from 'vue';

export default {
    setup (p , { emit }) {

        const store = useMatrixStore(),
            value = ref(structuredClone(store.matrixPlaceholder)),
            tvalue = ref(structuredClone(store.matrixPlaceholder));

        const inst = getCurrentInstance();

        const jvalue = (r) => JMatrix.create(...r.value);

        const changeColumns = v => {
            const res = jvalue(tvalue);
            res.cols += v;
            value.value = structuredClone(res.v);
            tvalue.value = structuredClone(res.v);
        }

        const changeRows = v => {
            const res = jvalue(tvalue);
            res.rows += v;
            value.value = structuredClone(res.v);
            tvalue.value = structuredClone(res.v);
            inst?.proxy?.$forceUpdate();
        }

        const changeDim = v => {
            const res = jvalue(tvalue);
            res.cols += v;
            res.rows += v;
            value.value = structuredClone(res.v);
            tvalue.value = structuredClone(res.v);
            inst?.proxy?.$forceUpdate();
        }

        const set = (r, c, v) => {
            const res = jvalue(tvalue);
            res.set(r, c, v);
            tvalue.value = structuredClone(res.v);
        }

        const matrixName = ref(store.matrixNamePlaceholder);

        const isSaveable = ref(false);
        
        const matrixNameValidator = v => {
            let result = true;
            value.value = structuredClone(tvalue.value);

            if(!v || v === '' || v === undefined) result = 'Matrix Name is required';
            else if(v.match(/\s/g)) result = `Name shouldn't contain spaces`;
            else if(!isNaN(Number(v[0]))) result = 'Name should start with alphabet characters';

            isSaveable.value = result === true;
            return result;
        }

        function saveMatrix(){
            store.saveMatrix(matrixName.value, structuredClone(tvalue.value));
            emit('save');
        }

        return {
            value,
            changeColumns,
            changeRows,
            tvalue,
            set,
            changeDim,
            matrixName,
            matrixNameValidator,
            isSaveable,
            saveMatrix
        }
    },
    emits: ['save'],
    methods: {
        update(){
            this.$forceUpdate();
        }
    }
}
</script>

<style lang="scss" scoped>
#root {
    min-width: 500px;
    width: 40vw;
    max-width: 700px;
}
  .together{
    min-width: 0
  }

.text-vertical {

    writing-mode: vertical-lr;
  transform: rotate(180deg);
  text-align: center;
}

#matrix-table {
    $dim : 50px;
    $gap : 5px;

    gap: $gap * 1.5;
    & > div {
        gap: $gap;
        height: $dim;

        & > div {
            width: $dim;

            input {
                min-width: $dim;
                width: $dim;
                height: $dim;
                text-align: center;

                &:focus{
                    
                    outline: none;
                    box-shadow: none!important;

                }
            }
        }
    }
}



.v-text-field .v-input__control .v-input__slot {
    min-height: auto !important;
    display: flex !important;
    align-items: center !important;
  }
</style>