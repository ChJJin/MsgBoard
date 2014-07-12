MessageListView = Backbone.View.extend
	el: $('#container')
	collection: messageList

	events:
		'click #submit': 'createMsg'
		'click #next-page': 'getNextPage'

	initialize: ()->
		@input = @$('#new-msg')
		@listContainer = @$('#message-list')
		@nextPageButton = @$('#next-page')

		@listenTo(@collection, 'add', @pushOneMsg)
		@listenTo(@collection, 'reset', @pushMsgs)
		@listenTo(@collection, 'after-get-new-page', @toggleNextPageButton)

		@collection.getNextPage()

	pushOneMsg: (model)->
		msgView = new MessageView {model}
		@listContainer.append(msgView.render().el)

	pushMsgs: (msgs)->
		@collection.each @pushOneMsg, @

	toggleNextPageButton: (hasNext)->
		if hasNext 
			@nextPageButton.show()
		else
			@nextPageButton.hide()

	createMsg: ()->
		@collection.createMsg @input.val()
		@input.val('')

	getNextPage: ()->
		@collection.getNextPage()

messageListView = new MessageListView
