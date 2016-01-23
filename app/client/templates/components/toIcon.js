/**
Template Controllers

@module Templates
*/

/**
A Persona to ICON.

@class [template] components_toIcon
@constructor
*/

Template['components_toIcon'].helpers({
	'persona': function(){
		return Personas.findOne({address: this.identity});		
	},
	'address': function(){
		return this.identity;
	},
	'htmlClass': function(){
		return this['class'];
	},
	'htmlStyle': function(){
		return this.style;
	},
});