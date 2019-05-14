# LinTo-Skills-Optional - Light
This intention will be used to give the information about the light hue
This node is part of the project [LinTO](https://linto.ai/) 

## Intent
Here the list that will be able to trigger this skills
  * light

## Entities
Here is the entities that can be interpreted by this skills
  * action_on
  * action_off
  * action_set
  * action_up
  * action_down
  * object
  * ordinal

## LinTo Skills
Here is information about their input require and the ouput of thoses skill

**Input**
```
{ 
    transcript : 'text transcript',
    nlu : {
        intent : 'intentDetected',
        entitiesNumber : 1, //integer of entities
        entities : [{
            entity: 'entitiesName',
            value: 'entitie text'
        }]
    },
    conversationData : { } //optional json from the previous intention if a conversation is require
}
```

**Output**
Depend on the speak mode (say | conversation)

__Say Mode__ :
```
{
    behavior: {
        say: 'message that linto gonna say',
    }
}
```

__Conversational Mode__ :
```
{
    behavior: {
        ask: 'message that linto gonna say',
        conversationData : { //json nlu generaly copy the intent from input but some data can be added has the skills require
            requireData :  'some data',
            requireDataJson : {}, //some other data
            intent : 'intentDetected',
            entitiesNumber : 1, //integer of entities
            entities : [{
                entity: 'entitiesName',
                value: 'entitie text'
            }]
        }
    } 
}
```