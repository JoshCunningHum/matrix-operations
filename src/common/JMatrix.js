function tryParse(str){
    const p = Number.parseFloat(str);
    return isNaN(p) ? str : p;
}

function tryMultiply(s, v){
    let res = 0;

    if(typeof s === 'number' && typeof v === 'number') res = s * v;
    else res = `(${v})(${s})`;

    return res;
}

function tryAdd(v, bv){
    let rs = 0;

    if(typeof v === 'string' || typeof bv === 'string'){
        if(v == 0) rs = bv;
        else if(bv == 0) rs = v;
        else {
            return bv.toString().trim()[0] === '-' ? v+bv : `${v}+${bv}`
        }
    }else rs = bv + v;

    return rs;
}

export class JMatrix {
    /**@type {Number[][]} */
    v;

    get rows(){ return this.v.length }
    get cols(){ return this.v[0]?.length || 0 }
    get dim(){ return [this.cols, this.rows] }

    set cols(n){
        if(n <= 0) return;
        const diff = n - this.cols;
        if(diff === 0) return;

        this.v.forEach(r => {
            diff < 0 ? r.splice(diff) : r.push(...Array(diff).fill(0))
        });
    }

    set rows(n){
        if(n <= 0) return;
        const diff = n - this.rows;
        if(diff === 0) return;

        diff < 0 ? this.v.splice(diff) : this.v.push(...Array(diff).fill(0).map(() => Array(this.cols).fill(0)))
    }

    get(row, col){ return this.v[row][col] }
    set(row, col, value){ this.v[row][col] = value }

    /**
     * Expands a JMatrix by n
     * @param {Number} n Amount of increase in dimension (for both sides)
     * @param {Boolean} identity Elements at r, c; where r is row index and c is column index and c === r
     * @returns {JMatrix}
     */
    expand(n, identity = true){
        const { cols: ocols, rows: orows } = this;

        // Expand the JMatrix
        this.cols += n;
        this.rows += n;

        if(identity) for(let i = 0; i < n; i++) this.set(orows + i, ocols + i, 1);
        
        return this;
    }

    scale(s){
        s = tryParse(s);
        this.v.forEach((r) => {
            r.forEach((v, i) => {
                v = tryParse(v);

                let res = 0;
                if(typeof s === 'number' && typeof v === 'number') res = s * v;
                else res = `(${v})(${s})`;

                r[i] = res;
            })
        });
        return this;
    }

    offset(s){
        s = tryParse(s);
        this.v.forEach((r) => {
            r.forEach((v, i) => {
                v = tryParse(v);

                let res = tryAdd(v, s);

                r[i] = res;
            })
        });
        return this;
    }

    /**
     * Creates a JMatrix, easier way for hard coding
     * @param  {Number[][]} rows arrays containing numbers
     * @returns {JMatrix}
     */
    static create(...rows){
        return new JMatrix(rows);
    }

    /**
     * Generates an identity JMatrix with n by n dimensions
     * @param {Number} dim Determines the dimensions of the identity JMatrix to be generated
     * @returns {JMatrix}
     */
    static identity(dim){
        return new JMatrix(new Array(dim).fill(0).map((v, i) => (new Array(dim)).fill(0).map((w, j) => i === j ? 1 : 0)));
    }

    static empty(row, col){
        return JMatrix.create(...Array(row).map(() => new Array(col).fill(0)));
    }

    /**
     * 
     * @param {JMatrix} a 
     * @param {JMatrix} b
     * @returns {JMatrix}
     */
    static mult(a, b){
        if(a.rows !== b.cols) throw new Error(`JMatrix ${a.dim} can't be multiplied with JMatrix ${b.dim}`);

        /**@type {Number[][]} */
        const res = [];

        // Loop through the rows of JMatrix A
        for(let r = 0; r < a.rows; r++){
            res.push(new Array(b.cols).fill(0));
            // Loop through the columns of JMatrix B
            for(let c = 0; c < b.cols; c++){
                // Push the total when multiplying the a[rai][i] with a[i][cbi]

                for(let i = 0; i < a.cols; i++){
                    const v = tryParse(a.get(r, i)),
                        bv = tryParse(b.get(i, c));
                    
                    let t = 0;

                    if(typeof v === 'string' || typeof bv === 'string'){
                        if(v == 0 || bv == 0) t = 0;
                        else if(v == 1) t = bv;
                        else if(bv == 1) t = v;
                        else t = `(${v})(${bv})`;
                    }else t = v * bv;

                    const curr = tryParse(res[r][c]);

                    res[r][c] = tryAdd(curr, t);
                }

                // res[r].push(a.v[r].reduce((t, v, mi) => {
                //     const bv = b.get(mi, c);

                //     if(typeof v === 'string' || typeof bv === 'string'){
                //         if(v == 0 || bv == 0) t = 0;
                //         else if(v == 1) t = bv;
                //         else if(bv == 1) t = v;
                //         else t = `(${v})(${bv})`;
                //     }else t += v * bv;

                //     return t;
                // }, 0)) ;
            }
        }

        return new JMatrix(res);
    }

    /**
     * 
     * @param {JMatrix} a 
     * @param {JMatrix} b 
     * @returns {JMatrix}
     */
    static add(a, b){
        if(a.rows !== b.rows || a.cols !== b.cols) throw new Error(`JMatrix ${a.dim} can't be added with JMatrix ${b.dim}`);

        /**@type {Number[][]} */
        const res = [];

        // Loop through each cell
        a.v.forEach((r, i) => {
            res.push([]);
            r.forEach((v, j) => {
                v = tryParse(v);
                const bv = tryParse(b.get(i, j));
                const rs = tryAdd(v, bv);

                res[i].push(rs);
            })
        })

        return new JMatrix(res);
    }


    /**
     * 
     * @param {Number[][]} values 
     */
    constructor(values){
        const max = values.reduce((l, v) => l = l < v ? v : l, 0);
        // validate the array, if any unequal length, fill
        const copy = structuredClone(values);
        // Put pads on each element
        copy.forEach(v => { 
            v = v.map(n => {
                const p = Number.parseFloat(n);
                return isNaN(p) ? n : p;
            })
            while(v.length < max) v.push(0) 
        })
        this.v = copy;
    }
}