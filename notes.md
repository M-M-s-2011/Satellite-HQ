# Code Review I

## Workflow
* Love the semantic commits!
* 3 parts  - type of commit, area of commit coverage, present-tense description
* e.g, 
feat(models) Adds Campus Model
* Excellent User Stories, ticketing seems geared around Proof of Concept
* How to coordinate 5 people?
    * Who is doing what, when?
    * Pair whenever possible
    * Rotating Task/Research Lead
    * Pairs, individuals should own a vertical slice as we break past MVP


## Proof of Concept

* We don't need React... Why?
* Virtual DOM vs traditional DOM manipulation
* React + Phaser will be difficult to manage
    * Vastly different APIs for state mgmt/DOM updates

* Lots of Frankenstein socket code -- just make sure it jives w/ Phaserfied DOM
* .then() vs async/await -> no performance difference, but try to not mix/match within the same function/module
* Express w/ Firebase? Sure! Why not?
```javascript

app.get("office", async(req, res, next) => {
   let office =  await firebase.get(officeConfig)
   res.json({office})
})

```

* Hardcoded variables (e.g, pixel height of screen) should be moved to a config.js file and injected when needed
* Can we implement better UX error handling than `alert()` blocks? e.g, Toasts!
* Arrow funcs have "Lexical This" 
* Lots of event handling callbacks. I'm sure it works, but looks a little old, janky
```javascript
function() {
    console.log(this) // will be invocation context
}

//this this
() => {
    //is this this
    console.log(this) // will be same context as outside fat arrow
}

```




## MVP Roadmap

* Multi-player
* Office-like layout, with video chat in modal over layout
* Text chat alongside video chat?
* HUD of people's names, and people currently chatting
* Only Registered (authenticated) users can join, chat
* HUD of total people in office
* Goal: One office with multiple multi-person chats simlutaneous

STRETCH GOALS
* Custom avatars
* Custom Office Layout/floors
* Whitelabel functionality
* Specialty rooms (game room, classroom, whiteboard, etc)