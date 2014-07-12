MessageView = Backbone.View.extend
	tagName: 'li'
	template: _.template($('#message-item-view').html())

	render: ()->
		@$el.html(@template @model.toJSON())
		@
