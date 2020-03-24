import {capture, AbstractEntity} from '../';

@capture
class Entity extends AbstractEntity<Entity>
{
    x:number = null;
    y:number = null;
}