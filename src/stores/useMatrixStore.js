import { defineStore } from "pinia";
import { reactive, ref } from "vue";

/**
 * @typedef {Object} SavedMatrix
 * @property {Number[][]} matrix
 * @property {String} name
 */

export default defineStore('matrix', () => {
    const matrixPlaceholder = reactive([[0, 0, 0], [0, 0, 0], [0, 0, 0]]),
        matrixNamePlaceholder = ref(''),
        isEditing = ref('');

    function setPlaceholder(v = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]){
        matrixPlaceholder.splice(0);
        v.forEach(r => matrixPlaceholder.push(Array(r.length).fill(0).map((a, i) => r[i])))
    }

    /**@type {SavedMatrix[]} */
    const saved = reactive([]);
    
    function isExisting(name){
        return saved.findIndex(sm => sm.name === name) !== -1;
    }

    function setPlaceholderOnName(name){
        const index = saved.findIndex(sm => sm.name === name);
        if(index === -1) return;
        setPlaceholder(saved[index].matrix);
    }

    function saveMatrix(name, matrix){
        if(isEditing.value !== '') {
            const sm = saved.find(sm => sm.name === isEditing.value);
            sm.matrix = matrix;
            sm.name = name;
        }
        else if(isExisting(name)) saved.find(sm => sm.name === name).matrix = matrix;
        else saved.push({name, matrix});
    }

    function cloneMatrix(name){
        const index = saved.findIndex(sm => sm.name === name);
        if(index === -1) return;
        saved.push({
            name: name+"copy",
            matrix: structuredClone(saved[index].matrix)
        })
    }

    function getSaved(name){
        return saved.find(sm => sm.name === name).matrix;
    }

    function removeMatrix(name){
        const index = saved.findIndex(sm => sm.name === name);
        if(index === -1) return;
        saved.splice(index, 1);
    }

    return {
        matrixPlaceholder,
        matrixNamePlaceholder,
        setPlaceholder,
        
        saved,
        isExisting,
        saveMatrix,
        cloneMatrix,
        isEditing,
        
        setPlaceholderOnName,
        getSaved,
        removeMatrix
    }
})