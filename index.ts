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
    readonly id:number;
    constructor(props?:Partial<T>)
    {
        for (let k in props)
        {
            (this as any)[k] = props[k];
        }
    }
    _mutation:Partial<T> = {};
    popMutation():Partial<T>
    {
        const res = this._mutation;
        delete this._mutation;
        return res;
    }

    init() {};
}


interface Mutations<T>
{
    added:{[id:number]:T};
    changes:{[id:number]:Partial<T>};
    removed:{[id:number]:T};
}

/** Encapsulates the state of zero or more entities */
export class Collection<T extends AbstractEntity<T>>
{
    nextId:number = 0;
    entities:{[id:number]:T} = {};
    added:{[id:number]:T} = {};
    removed:{[id:number]:T} = {};
    entityConstructor:(new ()=>T);

    constructor(entityConstructor:new ()=>T)
    {
        this.entityConstructor = entityConstructor;
    }

    /** Pushes the entity to the collection, assigning it an id within the collection */
    pushEntity(e:T):T
    {
        (e.id as any) = this.nextId++;
        this.entities[e.id] = e;
        this.added[e.id] = e;
        return e;
    }

    forEach(f:(e:T)=>any)
    {
        for (let id in this.entities)
        {
            if (f(this.entities[parseInt(id)]) == true)
                break;
        }
    }

    filter(f:(e:T)=>boolean)
    {
        let filtered = [] as T[];
        for (let id in this.entities)
        {
            let e = this.entities[id];
            if (f(e))
            {
                filtered.push(e);
            }
        }

        return filtered;
    }

    /** Removes the entity from the collection */
    removeEntity(e:T)
    {
        delete this.entities[e.id];
        this.removed[e.id] = e;
    }

    private popEntityMutations()
    {
        const mutations:{[id:number] : Partial<T>} = {};
        for (let id in this.entities)
        {
            let e = this.entities[id];
            let mut = e.popMutation();
            if (mut != null)
            {
                mutations[id] = mut;
            }
        }

        return mutations;
    }

    /** Collects all mutations and pops them from the collection */
    popMutations()
    {
        let added = {...this.added};
        let removed = {...this.removed};
        let changes = this.popEntityMutations()
        this.added = [];
        this.removed = [];
        return {
            added:added,
            changes:changes,
            removed:removed
        } as Mutations<T>
    }

    /** Pushes mutations to the collection */
    pushMutations(mutations:Mutations<T>)
    {
        for (let id in mutations.added)
        {
            let added = mutations.added[id];
            (Object as any).setPrototypeOf(added, this.entityConstructor.prototype);
            added.init();
            if (added.id >= this.nextId)
                this.nextId = added.id + 1;
            this.entities[added.id] = added;
        }

        for (let id in mutations.changes)
        {
            const change = mutations.changes[id];
            let e = this.entities[id];
            if (e != null)
            {
                for (let k in change)
                {
                    e[k] = change[k];
                }
            }
        }
    }
}