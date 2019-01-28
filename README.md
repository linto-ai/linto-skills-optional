# LinTo-Skills-Optional
Will containt the Linto Skills that allow LinTo to speak.
Each skills work on their own and have different setup in their configuration template

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
Depend if it's the say or conversational mode

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