export function capture<T>(t:any):any
{
    return class Entity extends t
    {
        constructor(id:string)
        {
            super(id);
            this.init();
        }

        init()
        {
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
        this._mutation = null;
        return res;
    }

    init() {};
}


interface Mutations<T>
{
    added:T[],
    changes:{id:string, m:Partial<T>}[],
    removed:T[]
}

/** Encapsulates the state of zero or more entities */
export class State<T extends AbstractEntity<T>>
{
    entities:{[id:string]:T} = {};
    added:T[] = [];
    removed:T[] = [];
    entityConstructor:(new (id:string)=>T);

    constructor(entityConstructor:new (id:string)=>T)
    {
        this.entityConstructor = entityConstructor;
    }

    pushEntity(e:T):T
    {
        this.entities[e.id] = e;
        this.added.push({...e});
        return e;
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
            if (mut != null)
            {
                mutations.push({id:e.id,m:mut});
            }
        }

        return mutations;
    }

    popMutations()
    {
        let added = [...this.added];
        let removed = [...this.removed];
        let changes = this.popEntityMutations()
        this.added = [];
        this.removed = [];
        return {
            added:added,
            changes:changes,
            removed:removed
        } as Mutations<T>
    }

    pushMutations(mutations:Mutations<T>)
    {
        for (let added of mutations.added)
        {
            (Object as any).setPrototypeOf(added, this.entityConstructor.prototype);
            added.init();
            this.entities[added.id] = added;
        }

        for (let mut of mutations.changes)
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