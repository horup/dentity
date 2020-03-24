export function capture<T>(t:any):any
{
    return class Entity extends t
    {
        constructor(id:string)
        {
            super(id);
            for (let key of Object.keys(this))
            {
                if (key[0] == "_" || key == "id")
                    continue;
                const k = "_" + key;
                Object.defineProperty(this, key, {
                    get:() => {
                        return this[k];
                    }, 
                    set:(v:any) => {
                        if (this._mutation == null)
                            this._mutation = {};
                        this._mutation[k] = v;
                        this[k] = v;
                    }
                });
            }
        }
    }
}

export abstract class AbstractEntity<T>
{
    readonly id:string;
    constructor(id:string)
    {
        this.id = id;
    }
    _mutation:Partial<T> = {};
    popMutation():Partial<T>
    {
        const res = this._mutation;
        this._mutation = {};
        return null;
    }
}


interface Mutations<T>
{
    added:T[],
    mutations:{id:string, m:Partial<T>}[],
    removed:T[]
}
export class State<T extends AbstractEntity<T>>
{
    entities:{[id:string]:T} = {};
    added:T[] = [];
    removed:T[] = [];

    addEntity(e:T)
    {
        this.entities[e.id] = e;
        this.added.push(e);
    }

    removeEntity(e:T)
    {
        delete this.entities[e.id];
        this.removed.push(e);
    }

    private popEntityMutations()
    {
        const mutations:{id:string, m:Partial<T>}[] = [];
        for (let id in this.entities)
        {
            let e = this.entities[id];
            let mut = e.popMutation();
            mutations.push({id:e.id,m:mut});
        }

        return mutations;
    }

    popMutations()
    {
        return {
            added:[...this.added],
            mutations:this.popEntityMutations(),
            removed:[...this.removed]
        }
    }

    pushMutations(mutations:Mutations<T>, entityConstructor:any)
    {
        for (let added of mutations.added)
        {
            (Object as any).setPrototypeOf(added, entityConstructor);
            this.entities[added.id] = added;
        }

        for (let mut of mutations.mutations)
        {
            let e = this.entities[mut.id];
            if (e != null)
            {
                for (let k in mut.m)
                {
                    e[k] = mut.m[k];
                }
            }
        }
    }
}