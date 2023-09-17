<template>
  <v-app>
    <v-main>
      
      <div class="w-screen h-screen flex">

        <!-- Main Operations -->
        <div class="flex-grow flex-col gap-2 overflow-auto min-h-0">
          <div>
            <v-text-field :rules="[validateExpr]"
              v-model="expr"
              label="Operation"
              rounded="0"
              />
          </div>

          <div class="px-3">
            
            <v-card 
              title="Instructions">
              <v-card-text>
                Add a matrix using the Add Button in the top right corner. <br>
                Enter expressions and use matrix assigned names as variables to use them. <br>
                Divisions between matrices are not allowed. <br>
                Scaling a matrix should use the <pre class="inline bg-neutral-900 px-0.5">*</pre> or <pre class="inline bg-neutral-900 px-0.5">/</pre> operation. <br>
                TODO: Add a secion where you can input variables to see results
              </v-card-text>
            </v-card>

          </div>

          <!-- Results -->
          <div class="px-3 mt-2">
            <v-card
              title="Result">
              <v-card-text>

                <div v-if="(typeof result === 'number')">{{ result }}</div>
                <div v-else-if="result === undefined || result == ''">Invalid Input</div>
                <matrix-displayer v-else :matrix="result" />

              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn right variant="tonal" @click="saveResult">Save</v-btn>
              </v-card-actions>
            </v-card>
          </div>

          <!-- Steps -->
          <div class="px-3 mt-2">
            <v-card
              title="Steps">
              <v-card-text>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate minus a ut iure placeat itaque reprehenderit eveniet eligendi, labore deserunt enim quia facilis nemo natus illo harum fuga culpa voluptates?
              </v-card-text>
            </v-card>
          </div>

          <div class="p-3">

          </div>
        </div>

        <div style="width: 400px;">
          <v-sheet class="h-full w-full p-4 flex flex-col min-h-0">
              <div class="text-h5 pb-4 flex justify-between">
                <div>Saved Matrices</div>
                
                <v-btn variant="tonal" @click="resetMatrixPlaceholder">
                  Add
                  <v-dialog
                    transition="fade-transition"
                    activator="parent"
                    v-model="mfActivator"
                    width="auto">

                    <matrix-fabricator @save="mfActivator = false"/>

                  </v-dialog>
                </v-btn>

              </div>

              <div class="flex-grow flex flex-col gap-3 overflow-auto">
                
                <v-sheet v-for="m in savedMatrix" :key="m.name" rounded elevation="3">
                  <v-container class="p-0 rounded overflow-hidden">

                    <v-row no-gutters>
                      <v-col>

                          <v-expansion-panels variant="accordion" >
                            <v-expansion-panel elevation="0" rounded="0">
                              <v-expansion-panel-title color="#292929">
                                {{ m.name }}
                              </v-expansion-panel-title>
                              <v-expansion-panel-text class="p-0 innerExPan">
                                <v-sheet color="#333" class="p-3 flex justify-center">
                                  
                                  <matrix-displayer :matrix="m.matrix" />

                                </v-sheet>
                              </v-expansion-panel-text>
                            </v-expansion-panel>

                            
                          </v-expansion-panels>
                      </v-col>
                    </v-row>

                    <v-row no-gutters>
                      <v-col cols="3"> <v-btn variant="tonal" block rounded="0" @click="editMatrixPlaceholder(m.name)">Edit</v-btn> </v-col>
                      <v-col cols="3"> <v-btn variant="tonal" color="warning" block rounded="0"
                        @click="cloneMatrix(m.name)">Clone</v-btn> </v-col>
                      <v-col cols="6"> <v-btn  color="#913631" block rounded="0">Delete</v-btn> </v-col>
                    </v-row>

                  </v-container>
                </v-sheet>
                
              </div>

            </v-sheet>
        </div>

      </div>
    </v-main>
  </v-app>
</template>

<script>
import { ref, computed } from 'vue';
import { create, all, matrix, number } from 'mathjs';
import MatrixFabricator from './components/MatrixFabricator.vue';
import useMatrixStore from './stores/useMatrixStore';
import MatrixDisplayer from './components/MatrixDisplayer.vue';
import { JMatrix } from './common/JMatrix';

window.math = create(all, {});

export default {
  name: 'App',

  components: {
    MatrixFabricator,
    MatrixDisplayer
  },

  setup(){
    // Stores
    const matrixStore = useMatrixStore(),
      savedMatrix = computed(() => matrixStore.saved);

    // Evaluation
    /**@type {math.OperatorNode} */
    let etree = {};
    const resultRaw = ref(0),
      result = computed(() => {
        if(resultRaw.value === undefined) return '';
        return typeof resultRaw.value === 'number' ? resultRaw.value :
          resultRaw.value?.v;
      })

    window.etree = etree;

    const etreeSymbols = () => etree.filter(n => n.type === 'SymbolNode');

    function evaluateTree(node = etree){
      if(Object.hasOwn(node, 'value')) return node.value;
      else if(node.name) return new JMatrix(matrixStore.getSaved(node.name).matrix);
      else if(node.content) return evaluateTree(node.content);

      /**@type {(Number[] | JMatrix[])} */
      const [a, b] = node.args.map(v => {
        // Check first if either argument is an operation
        return evaluateTree(v);
      });

      const amatrix = typeof a !== 'number',
        bmatrix = typeof b !== 'number';

      switch(node.op){
        case '+':
        case '-':
          if(amatrix && bmatrix){
            return JMatrix.add(a, b);
          }else if(!amatrix && bmatrix){
            return b.offset(node.op === '-' ? -a : a)
          }else if(amatrix && !bmatrix){
            return a.offset(node.op === '-' ? -b : b)
          }else{
            return math.evaluate(`${a}${node.op}${b}`);
          }
        case '*':
          if(amatrix && bmatrix){
            return JMatrix.mult(a, b);
          }else if(!amatrix && bmatrix){
            return b.scale(a)
          }else if(amatrix && !bmatrix){
            return a.scale(b)
          }else{
            return math.evaluate(`${a}${node.op}${b}`);
          }
        }
    }

    function saveResult(){
      if(typeof result.value === 'number' || result.value == '' || result.value == undefined) return;
      matrixStore.saveMatrix('result', structuredClone(result.value));
    }

    // Expresions
    const expr = ref(''),
      validateExpr = v => {
        // Disable division
        if(v.toString().includes('/')) return 'Division of Matrices is not supported'

        // Check for disabled characters (some syntax is ok for mathjs)
        // if(v.match(/[^0-9a-zA-Z\+\-\*\s\.]*/g)) return 'An invalid character is in the expression';

        // Check Syntax
        try {
          etree = math.parse(v);
          window.etree = etree;
        }catch(e){
          return 'Syntax Error in the Expression'
        }

        // Check matrix variables
        if(!etreeSymbols().every(n => matrixStore.isExisting(n.name))) return 'An undefined matrix variable is in the expression'

        // Deep Check: Incompatible Matrix Combinations
        resultRaw.value = evaluateTree();
        console.log(resultRaw.value?.v);

        return true;
      }

    // Matrices
    const mfActivator = ref(false);
    const resetMatrixPlaceholder = () => {
      matrixStore.setPlaceholder();
      matrixStore.matrixNamePlaceholder = '';
      matrixStore.isEditing = '';
    }
    const editMatrixPlaceholder = (name) => {
      matrixStore.matrixNamePlaceholder = name;
      matrixStore.setPlaceholderOnName(name)
      matrixStore.isEditing = name;
      mfActivator.value = true;
    }
    const cloneMatrix = (name) => {
      matrixStore.cloneMatrix(name);
    }

    return {
      matrixStore,

      expr,
      validateExpr,
      
      mfActivator,
      resetMatrixPlaceholder,
      editMatrixPlaceholder,
      
      savedMatrix,
      cloneMatrix,
      
      result,
      resultRaw,
      saveResult
    }
  }
}
</script>

<style lang="scss">

html, body {
  overflow-y: hidden !important;
}

.innerExPan > * {
  padding: 0;
}

.innerExTit{
  border-radius: 0 !important;
}

</style>