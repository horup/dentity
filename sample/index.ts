import {capture, AbstractEntity, State} from '../';

@capture
class Entity extends AbstractEntity<Entity>
{
    x:number = null;
    y:number = null;
}

let state1 = new State<Entity>(Entity);

let e = state1.pushEntity(new Entity("0"));
e.x = 10;
e.y = 20;

e = state1.pushEntity(new Entity("1"));
e.x = 30;
e.y = 40;


let state2 = new State<Entity>(Entity);
state2.pushMutations(JSON.parse(JSON.stringify(state1.popMutations())));

console.log(state1.entities["0"]);
console.log(state2.entities["0"]);