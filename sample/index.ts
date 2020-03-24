import {capture, AbstractEntity, Collection} from '../';


@capture
class Monster extends AbstractEntity<Monster>
{
    x:number = null;
    y:number = null;
    hitpoints:number = null;
    speed:number = null;
    ac:number = null;
    iniative:number = null;
}

function spawnOrc(x:number, y:number)
{
    let c = new Monster();
    c.x = x;
    c.y = y;
    c.ac = 13;
    c.hitpoints = 15;
    c.speed = 30;
    return c;
}

let monsters = new Collection<Monster>(Monster);
monsters.pushEntity(spawnOrc(0, 0));
monsters.pushEntity(spawnOrc(60, 60));

let round = 0;

function d20(modifier:number = 0)
{
    return Math.ceil(Math.random() * 20) + modifier;
}

function d6(modifier:number = 0)
{
    return Math.ceil(Math.random() * 6) + modifier;
}

console.clear();
let order = [] as Monster[];


function findEnemy(me:Monster)
{
    let enemy = monsters.filter(m=>m != me && m.hitpoints > 0)[0];
    return enemy;
}

function DoRound()
{
    if (round == 0)
    {
        console.log("Roll for initiative");
        monsters.forEach((m)=>
        {
            m.iniative = d20();
            order.push(m)
        });

        order.sort((a,b)=>b.iniative - a.iniative);
    }
    else
    {
        console.log("Starting round " + round);
        for (let me of order)
        {
            if (me.hitpoints > 0)
            {
                let enemy = findEnemy(me);
                if (enemy != null)
                {
                    let attack = d20(5);
                    let hit = attack > enemy.ac;
                    
                    console.log(`${me.id} attacks ${enemy.id}, rolls ${attack}`);
                    if (hit)
                    {
                        let dmg = d6(3);
                        console.log(`and hits! for ${dmg} damage`);
                        enemy.hitpoints -= dmg;
                        if (enemy.hitpoints <= 0)
                        { 
                            enemy.hitpoints = 0;
                            console.log(`${enemy.id} was slain!`);
                        }
                    }
                    else
                    {
                        console.log("and misses!");
                    }

                }
            }
        }
    }

    round++;
}

for (let i = 0; i < 10; i++)
{
    DoRound();
}