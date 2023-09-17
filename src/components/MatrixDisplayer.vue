<template>
    <div class="flex w-min">
        <div class="inline flex-grow w-2 border-y border-l">

        </div>
        <table class="inline" @click="console.log(matrix)">
            <tbody class="flex flex-col">
                <tr v-for="r in matrix" :key="r.join()" class="flex gap-3">
                    <td v-for="c in r" :key="r.join() + c" class="flex justify-center">
                        <div class="cell">
                            
                            {{ c}}

                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <div class="inline flex-grow w-2 border-y border-r">

        </div>
    </div>
</template>

<script>
import { computed } from 'vue';

export default {
    setup (p) {
        const matrix = computed(() => p.matrix);

        return {
            matrix
        }
    },
    props: ['matrix']
}
</script>

<style lang="scss" scoped>
.cell {
    @apply flex items-center justify-center;

    $dim: 30px;

    min-width: $dim;
    width: min-content;
    white-space: nowrap;
    height: $dim;
}
</style>