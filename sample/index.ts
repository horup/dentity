import {capture, AbstractEntity, State} from '../';

@capture
class Entity extends AbstractEntity<Entity>
{
    x:number = null;
    y:number = null;
}

let state = new State<Entity>(Entity);
console.log("\n"+JSON.stringify(state.popMutations()));

let e = state.addEntity(new Entity("0"));
e.x = 11;
e.y = 22;
console.log("\n"+JSON.stringify(state.popMutations()));






