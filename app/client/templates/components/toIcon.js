/**
Template Controllers

@module Templates
*/

/**
A Persona to ICON.

@class [template] components_toIcon
@constructor
*/

var template;

Template['components_toIcon'].rendered = function(){	
	template = this;
	
	//TemplateVar.set(template, 'persona', {hasPersona: false, address: this.data.identity, htmlClass: this.data['class']});
};

Template['components_toIcon'].helpers({
	'persona': function(){
		console.log(this, Personas.findOne({address: this.identity}));
		
		return Personas.findOne({address: this.identity});		
	},
	'address': function(){
		return this.identity;
	},
	'htmlClass': function(){
		return this['class'];
	},
});