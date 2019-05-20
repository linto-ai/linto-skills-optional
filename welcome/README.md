# LinTo-Skills-Optional - Welcome
This entry provides information about the welcome skill
This node is part of the project [LinTO](https://linto.ai/)

It will manage some friendly skills (greeting, goodbye, how are you)

## LinTo Skills
The following describes the possible inputs and outputs for the welcome skill

**Input**
```
{
    transcript : 'text transcript',
    nlu : {
    intent : 'intentDetected',
        entitiesNumber : 1, //number of entities
        entities : [{
            entity: 'entity type',
            value: 'entity name'
        }]
    },
    conversationData : { } //optional json from the previous intention if a conversation is required
}
```

**Output**
Depends on the speaking mode (say or conversation).

__Say Mode__ : In say mode, LinTO provides a single response to a given question.
```
{
    behavior: {
        say: 'message that linto gonna say',
    }
}
```
For example, when asked "What time is it?", LinTO might respond, "It is 7:30 a.m."

__Conversation Mode__ : In conversation mode, LinTO first demands additional information before responding to the original request.
```
{
    behavior: {
        ask: 'message that linto gonna say',
        conversationData : { //json nlu generally copies the intent from input but  data can be added if required by the skill
            requireData :  'some data',
            requireDataJson : {}, //some other data
            intent : 'intentDetected',
            entitiesNumber : 1, //number of entities
            entities : [{
                entity: 'entity type',
                value: 'entity name'
            }]
        }
    }
}
```

For example, if asked, "What is the cheapest flight to Paris?", LinTO will first ask questions such as "What is your departure city?" and "What is your departure date?" before providing an answer to the original question.

## Intentions
The welcome skill is triggered by the following intentions:
  * `greeting`
  * `goodbye`
  * `howareyou`

## Entities
Here the supported entities for this skill:
 * `isok` determine if the user is alright for the intent `howareyou`
 * `isko` determine if the user is sad for the intent `howareyou`